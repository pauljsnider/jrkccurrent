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
        return dt && dt <= now && inSeason(dt, season) && !g.isExhibition;
      });

      const upcomingThisSeason = window.games.filter(g => {
        const dt = parseDate(g.date, g.time);
        return dt && dt > now && inSeason(dt, season) && !g.isExhibition;
      });

      const wins = pastThisSeason.filter(g => g.result === 'Win').length;
      const losses = pastThisSeason.filter(g => g.result === 'Loss').length;
      const remaining = upcomingThisSeason.length;

      const winsEl = document.getElementById('wins-count');
      const lossesEl = document.getElementById('losses-count');
      const remainingEl = document.getElementById('remaining-count');

      if (winsEl) winsEl.textContent = `${wins} ${wins === 1 ? 'Win' : 'Wins'}`;
      if (lossesEl) lossesEl.textContent = `${losses} ${losses === 1 ? 'Loss' : 'Losses'}`;
      if (remainingEl) remainingEl.textContent = `${remaining} More ${remaining === 1 ? 'Game' : 'Games'}`;
    } catch (e) {
      console.error('Failed to update season record:', e);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateRecord);
  } else {
    updateRecord();
  }
})();
