/**
 * Compute and update the home page record (wins/losses/remaining)
 * using the canonical schedule data in window.games from js/schedule.js
 */

(function () {
  function parseDate(d, t) {
    // Accepts like "Aug 24, 2025" and optional time like "2:15 PM"
    const stamp = t && typeof t === 'string' && t.trim().length > 0 ? `${d} ${t}` : d;
    const dt = new Date(stamp);
    return isNaN(dt) ? null : dt;
  }

  function detectSeason(games) {
    // Prefer upcoming games to infer current season year/month
    // Prefer upcoming games by actual date
    const now = new Date();
    const upcoming = games.filter(g => {
      const dt = parseDate(g.date, g.time);
      return dt && dt > now;
    }).sort((a, b) => (parseDate(a.date, a.time) - parseDate(b.date, b.time)));
    if (upcoming.length > 0) {
      const d = parseDate(upcoming[0].date);
      if (d) return { year: d.getFullYear(), type: d.getMonth() >= 7 ? 'fall' : 'spring' };
    }

    // Fallback: use most recent past game
    const past = games.filter(g => {
      const dt = parseDate(g.date, g.time);
      return dt && dt <= new Date();
    }).sort((a, b) => {
      const da = parseDate(a.date, a.time) || new Date(0);
      const db = parseDate(b.date, b.time) || new Date(0);
      return db - da;
    });
    if (past.length > 0) {
      const d = parseDate(past[0].date);
      if (d) return { year: d.getFullYear(), type: d.getMonth() >= 7 ? 'fall' : 'spring' };
    }

    // Last resort: current year, assume fall/spring by month
    return { year: now.getFullYear(), type: now.getMonth() >= 7 ? 'fall' : 'spring' };
  }

  function inSeason(d, season) {
    if (!d) return false;
    if (d.getFullYear() !== season.year) return false;
    const m = d.getMonth(); // 0-based
    return season.type === 'fall' ? m >= 7 : m <= 5;
  }

  function updateRecord() {
    try {
      if (!Array.isArray(window.games)) return; // schedule.js not loaded

      const season = detectSeason(window.games);

      const now = new Date();
      const pastThisSeason = window.games.filter(g => {
        const dt = parseDate(g.date, g.time);
        return dt && g.isPast && inSeason(dt, season) && !g.isExhibition;
      });

      const upcomingThisSeason = window.games.filter(g => {
        const dt = parseDate(g.date, g.time);
        return dt && !g.isPast && inSeason(dt, season) && !g.isExhibition;
      });

      const wins = pastThisSeason.filter(g => g.result === 'Win').length;
      const losses = pastThisSeason.filter(g => g.result === 'Loss').length;
      const remaining = upcomingThisSeason.length;

      // Debug logging
      console.log('Current date:', now);
      console.log('Season detected:', season);
      console.log('All games:', window.games.map(g => ({date: g.date, result: g.result, opponent: g.opponent, isPast: g.isPast})));
      console.log('Past games this season:', pastThisSeason.map(g => ({date: g.date, result: g.result, opponent: g.opponent})));
      console.log('Calculated: wins:', wins, 'losses:', losses, 'remaining:', remaining);

      const winsEl = document.getElementById('wins-count');
      const lossesEl = document.getElementById('losses-count');
      const remainingEl = document.getElementById('remaining-count');

      if (winsEl) winsEl.textContent = wins;
      if (lossesEl) lossesEl.textContent = losses;
      if (remainingEl) remainingEl.textContent = remaining;
      
      // Update recent games section
      updateRecentGames(pastThisSeason, season);
      
      // Update next game section
      updateNextGame(upcomingThisSeason, season);
      
    } catch (e) {
      console.error('Failed to update season record:', e);
    }
  }

  function updateRecentGames(pastGames, season) {
    const recentGamesEl = document.getElementById('recent-games-list');
    if (!recentGamesEl) return;
    
    // Get the 3 most recent games
    const recentGames = pastGames
      .sort((a, b) => {
        const da = parseDate(a.date, a.time) || new Date(0);
        const db = parseDate(b.date, b.time) || new Date(0);
        return db - da; // newest first
      })
      .slice(0, 3);
    
    if (recentGames.length === 0) {
      recentGamesEl.innerHTML = '<p class="no-games">No recent games this season.</p>';
      return;
    }
    
    const gamesHtml = recentGames.map(game => {
      const resultClass = game.result ? game.result.toLowerCase() : 'pending';
      const resultIcon = game.result === 'Win' ? 'fa-trophy' : 
                        game.result === 'Loss' ? 'fa-times-circle' : 
                        'fa-clock';
      const hasReport = typeof matchReports !== 'undefined' && matchReports && matchReports[game.date];
      const reportLink = hasReport ? 
        `<a href="#" class="match-report-link" onclick="showMatchReport('${game.date}'); return false;">📰 Match Report</a>` : '';
      const gameDate = parseDate(game.date, game.time);
      const formattedDate = gameDate ? 
        `${gameDate.toLocaleDateString('en-US', { weekday: 'short' })}, ${gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` :
        game.date;
      
      return `
        <div class="game-item ${resultClass}">
          <div class="game-date">${formattedDate}</div>
          <div class="game-details">
            <div class="game-opponent">vs ${game.opponent}</div>
            <div class="game-result">
              <i class="fas ${resultIcon}"></i>
              ${game.result && game.score ? `${game.result} ${game.score}` : 'Pending'}
            </div>
            ${reportLink ? `<div class="game-links">${reportLink}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    recentGamesEl.innerHTML = gamesHtml;
  }

  function updateNextGame(upcomingGames, season) {
    const nextGameEl = document.getElementById('next-game-info');
    if (!nextGameEl) return;
    
    // Get the next upcoming game
    const nextGame = upcomingGames
      .sort((a, b) => {
        const da = parseDate(a.date, a.time) || new Date(0);
        const db = parseDate(b.date, b.time) || new Date(0);
        return da - db; // earliest first
      })[0];
    
    if (!nextGame) {
      nextGameEl.innerHTML = '<p class="no-games">No upcoming games scheduled.</p>';
      return;
    }
    
    const gameDate = parseDate(nextGame.date, nextGame.time);
    const isToday = gameDate && gameDate.toDateString() === new Date().toDateString();

    let dateLine = nextGame.date;
    if (gameDate) {
      const weekday = gameDate.toLocaleDateString('en-US', { weekday: 'long' });
      const fullDate = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (nextGame.time) {
        const time = gameDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        dateLine = `${weekday}, ${fullDate} at ${time}`;
      } else {
        dateLine = `${weekday}, ${fullDate}`;
      }
    } else if (nextGame.time) {
      dateLine = `${nextGame.date} at ${nextGame.time}`;
    }

    nextGameEl.innerHTML = `
      <div class="next-game-card ${isToday ? 'today' : ''}">
        <div class="game-header">
          <div class="game-date">
            ${dateLine}
            ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
          </div>
        </div>
        <div class="game-opponent">vs ${nextGame.opponent}</div>
        <div class="game-location">
          <i class="fas fa-map-marker-alt"></i>
          ${nextGame.location || 'Location TBD'}
        </div>
      </div>
    `;
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateRecord);
  } else {
    updateRecord();
  }
})();
