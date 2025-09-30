/**
 * Junior Current - Statistics Dashboard
 * Advanced analytics and AI-powered insights
 */

// Import data from schedule.js (assumes it's loaded first)
const statsData = {
    games: typeof games !== 'undefined' ? games : [],
    matchReports: typeof matchReports !== 'undefined' ? matchReports : {},
    players: typeof players !== 'undefined' ? players : []
};

/**
 * Statistics Engine - Process and aggregate data
 */
class StatsEngine {
    constructor(games, matchReports, players) {
        this.games = games;
        this.matchReports = matchReports;
        this.players = players;
    }

    /**
     * Get games filtered by season
     */
    getGamesBySeason(seasonYear) {
        return this.games.filter(game => {
            const gameYear = new Date(game.date).getFullYear();
            return gameYear === seasonYear && game.isPast && game.score;
        });
    }

    /**
     * Calculate season record
     */
    getSeasonRecord(games) {
        const record = { wins: 0, losses: 0, ties: 0, goalsFor: 0, goalsAgainst: 0 };

        games.forEach(game => {
            if (game.result === 'Win') record.wins++;
            else if (game.result === 'Loss') record.losses++;
            else if (game.result === 'Tie') record.ties++;

            if (game.score) {
                const [goalsFor, goalsAgainst] = game.score.split('-').map(Number);
                if (!isNaN(goalsFor)) record.goalsFor += goalsFor;
                if (!isNaN(goalsAgainst)) record.goalsAgainst += goalsAgainst;
            }
        });

        record.winRate = games.length > 0 ? ((record.wins / games.length) * 100).toFixed(1) : 0;
        record.goalDiff = record.goalsFor - record.goalsAgainst;

        return record;
    }

    /**
     * Get scoring trends over time
     */
    getScoringTrends(games) {
        return games.map(game => {
            const [goalsFor, goalsAgainst] = (game.score || '0-0').split('-').map(Number);
            return {
                date: game.date,
                opponent: game.opponent,
                goalsFor: goalsFor || 0,
                goalsAgainst: goalsAgainst || 0,
                result: game.result
            };
        }).reverse(); // Chronological order
    }

    /**
     * Extract player mentions from match reports
     */
    analyzePlayerPerformance() {
        const playerStats = {};

        this.players.forEach(player => {
            playerStats[player.name] = {
                name: player.name,
                position: player.position,
                mentions: 0,
                goals: 0,
                assists: 0,
                saves: 0,
                keywords: []
            };
        });

        Object.values(this.matchReports).forEach(report => {
            const text = report.report.toLowerCase();

            this.players.forEach(player => {
                const playerName = player.name.toLowerCase();
                const stats = playerStats[player.name];

                // Count mentions
                const regex = new RegExp(`\\b${playerName}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) stats.mentions += matches.length;

                // Simple keyword detection
                const playerContext = text.split(playerName);
                playerContext.forEach(segment => {
                    const words = segment.toLowerCase().split(/\s+/).slice(0, 20);
                    if (words.some(w => ['goal', 'scored', 'finish', 'net'].includes(w))) stats.goals++;
                    if (words.some(w => ['assist', 'setup', 'pass'].includes(w))) stats.assists++;
                    if (words.some(w => ['save', 'stop', 'block'].includes(w))) stats.saves++;

                    // Positive keywords
                    const positive = ['outstanding', 'excellent', 'brilliant', 'impressive', 'clutch', 'stellar'];
                    positive.forEach(keyword => {
                        if (words.includes(keyword)) {
                            if (!stats.keywords.includes(keyword)) stats.keywords.push(keyword);
                        }
                    });
                });
            });
        });

        return Object.values(playerStats)
            .sort((a, b) => b.mentions - a.mentions);
    }

    /**
     * Compare seasons
     */
    compareSeasons(season1Games, season2Games) {
        const s1 = this.getSeasonRecord(season1Games);
        const s2 = this.getSeasonRecord(season2Games);

        return {
            season1: s1,
            season2: s2,
            improvements: {
                wins: s2.wins - s1.wins,
                winRate: (parseFloat(s2.winRate) - parseFloat(s1.winRate)).toFixed(1),
                goalsFor: s2.goalsFor - s1.goalsFor,
                goalDiff: s2.goalDiff - s1.goalDiff
            }
        };
    }

    /**
     * AI-Powered Game Recap Generator
     */
    generateGameRecap(gameDate) {
        const report = this.matchReports[gameDate];
        if (!report) return null;

        const game = this.games.find(g => g.date === gameDate);
        if (!game) return null;

        // Extract key statistics
        const [goalsFor, goalsAgainst] = (game.score || '0-0').split('-').map(Number);
        const reportText = report.report.toLowerCase();

        // Extract player highlights (mentioned with positive context)
        const highlights = this.players
            .map(player => {
                const name = player.name.toLowerCase();
                const mentions = (reportText.match(new RegExp(`\\b${name}\\b`, 'gi')) || []).length;

                // Check for goal-related mentions
                const goalKeywords = ['goal', 'scored', 'finish', 'net'];
                const hasGoal = goalKeywords.some(keyword => {
                    const pattern = new RegExp(`${name}[^.]*${keyword}`, 'i');
                    return pattern.test(reportText);
                });

                return { name: player.name, mentions, hasGoal };
            })
            .filter(p => p.mentions > 2)
            .sort((a, b) => b.mentions - a.mentions)
            .slice(0, 3);

        // Generate AI-style summary
        const sentiment = game.result === 'Win' ? 'victory' : game.result === 'Loss' ? 'defeat' : 'draw';
        const scoreLine = `${goalsFor}-${goalsAgainst}`;

        let summary = `The Junior Current ${game.result === 'Win' ? 'secured a' : 'fought in a'} ${scoreLine} ${sentiment} against ${game.opponent}. `;

        if (highlights.length > 0) {
            const topPlayer = highlights[0];
            summary += `${topPlayer.name} was instrumental in the match with ${topPlayer.mentions} key contributions. `;

            if (highlights.length > 1) {
                const others = highlights.slice(1).map(p => p.name).join(' and ');
                summary += `Strong performances also came from ${others}. `;
            }
        }

        // Add context based on score
        if (goalsFor > goalsAgainst + 2) {
            summary += `The team dominated with an impressive offensive display.`;
        } else if (goalsFor < goalsAgainst) {
            summary += `Despite the loss, the team showed resilience and determination.`;
        } else if (goalsFor === goalsAgainst) {
            summary += `Both teams battled evenly in a closely contested match.`;
        }

        return {
            date: gameDate,
            opponent: game.opponent,
            result: game.result,
            score: game.score,
            summary,
            highlights: highlights.map(h => h.name),
            fullReport: report.report
        };
    }
}

/**
 * Dashboard Renderer
 */
class DashboardRenderer {
    constructor(statsEngine) {
        this.engine = statsEngine;
    }

    /**
     * Render season overview cards
     */
    renderSeasonOverview() {
        const season2025 = this.engine.getGamesBySeason(2025);
        const season2024 = this.engine.getGamesBySeason(2024);

        const record2025 = this.engine.getSeasonRecord(season2025);
        const record2024 = this.engine.getSeasonRecord(season2024);

        const container = document.getElementById('seasonOverview');
        if (!container) return;

        container.innerHTML = `
            <div class="stat-card">
                <h3>2025 Season</h3>
                <div class="stat-value">${record2025.wins}-${record2025.losses}-${record2025.ties}</div>
                <div class="stat-label">Record</div>
                <div class="stat-detail">${record2025.winRate}% Win Rate</div>
            </div>
            <div class="stat-card">
                <h3>Goals Scored</h3>
                <div class="stat-value">${record2025.goalsFor}</div>
                <div class="stat-label">Total Goals</div>
                <div class="stat-detail">Goal Diff: ${record2025.goalDiff > 0 ? '+' : ''}${record2025.goalDiff}</div>
            </div>
            <div class="stat-card">
                <h3>2024 Season</h3>
                <div class="stat-value">${record2024.wins}-${record2024.losses}-${record2024.ties}</div>
                <div class="stat-label">Record</div>
                <div class="stat-detail">${record2024.winRate}% Win Rate</div>
            </div>
        `;
    }

    /**
     * Render scoring trends chart
     */
    renderScoringTrends() {
        const games = this.engine.getGamesBySeason(2025);
        const trends = this.engine.getScoringTrends(games);

        const container = document.getElementById('scoringTrends');
        if (!container) return;

        let chartHTML = '<div class="chart-container"><div class="chart-bars">';

        trends.forEach((game, index) => {
            const maxHeight = 100;
            const heightFor = (game.goalsFor / 8) * maxHeight;
            const heightAgainst = (game.goalsAgainst / 8) * maxHeight;

            chartHTML += `
                <div class="chart-bar-group" title="${game.opponent}: ${game.goalsFor}-${game.goalsAgainst}">
                    <div class="bar-pair">
                        <div class="chart-bar scored" style="height: ${heightFor}%">
                            <span class="bar-value">${game.goalsFor}</span>
                        </div>
                        <div class="chart-bar conceded" style="height: ${heightAgainst}%">
                            <span class="bar-value">${game.goalsAgainst}</span>
                        </div>
                    </div>
                    <div class="chart-label">${game.opponent.substring(0, 8)}</div>
                </div>
            `;
        });

        chartHTML += '</div></div>';
        chartHTML += `
            <div class="chart-legend">
                <span><span class="legend-color scored"></span> Goals Scored</span>
                <span><span class="legend-color conceded"></span> Goals Conceded</span>
            </div>
        `;

        container.innerHTML = chartHTML;
    }

    /**
     * Render player performance table
     */
    renderPlayerPerformance() {
        const players = this.engine.analyzePlayerPerformance();
        const container = document.getElementById('playerPerformance');
        if (!container) return;

        let tableHTML = `
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Position</th>
                        <th>Mentions</th>
                        <th>Goals</th>
                        <th>Assists</th>
                        <th>Highlights</th>
                    </tr>
                </thead>
                <tbody>
        `;

        players.forEach(player => {
            const keywords = player.keywords.length > 0
                ? player.keywords.slice(0, 2).map(k => `<span class="keyword-badge">${k}</span>`).join('')
                : '<span class="keyword-badge">-</span>';

            tableHTML += `
                <tr>
                    <td><strong>${player.name}</strong></td>
                    <td>${player.position}</td>
                    <td>${player.mentions}</td>
                    <td>${player.goals}</td>
                    <td>${player.assists}</td>
                    <td>${keywords}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }

    /**
     * Render season comparison
     */
    renderSeasonComparison() {
        const season2025 = this.engine.getGamesBySeason(2025);
        const season2024 = this.engine.getGamesBySeason(2024);
        const comparison = this.engine.compareSeasons(season2024, season2025);

        const container = document.getElementById('seasonComparison');
        if (!container) return;

        const formatChange = (value, suffix = '') => {
            const num = parseFloat(value);
            if (num > 0) return `<span class="positive">+${value}${suffix}</span>`;
            if (num < 0) return `<span class="negative">${value}${suffix}</span>`;
            return `${value}${suffix}`;
        };

        container.innerHTML = `
            <div class="comparison-grid">
                <div class="comparison-card">
                    <h4>2024 Season</h4>
                    <div class="comparison-stat">${comparison.season1.wins}-${comparison.season1.losses}-${comparison.season1.ties}</div>
                    <div class="comparison-label">${comparison.season1.winRate}% Win Rate</div>
                </div>
                <div class="comparison-arrow">
                    <i class="fas fa-arrow-right"></i>
                    <div class="improvement-text">
                        ${formatChange(comparison.improvements.wins, ' wins')}<br>
                        ${formatChange(comparison.improvements.winRate, '%')} win rate
                    </div>
                </div>
                <div class="comparison-card">
                    <h4>2025 Season</h4>
                    <div class="comparison-stat">${comparison.season2.wins}-${comparison.season2.losses}-${comparison.season2.ties}</div>
                    <div class="comparison-label">${comparison.season2.winRate}% Win Rate</div>
                </div>
            </div>
            <div class="comparison-details">
                <div class="detail-item">
                    <span>Goals Scored</span>
                    <span>${comparison.season1.goalsFor} → ${comparison.season2.goalsFor} ${formatChange(comparison.improvements.goalsFor)}</span>
                </div>
                <div class="detail-item">
                    <span>Goal Differential</span>
                    <span>${comparison.season1.goalDiff} → ${comparison.season2.goalDiff} ${formatChange(comparison.improvements.goalDiff)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Render AI game recaps
     */
    renderGameRecaps() {
        const container = document.getElementById('gameRecaps');
        if (!container) return;

        // Get recent games
        const recentGames = this.engine.games
            .filter(g => g.isPast && g.score && this.engine.matchReports[g.date])
            .slice(0, 5);

        let recapsHTML = '';

        recentGames.forEach(game => {
            const recap = this.engine.generateGameRecap(game.date);
            if (!recap) return;

            const resultClass = recap.result === 'Win' ? 'win' : recap.result === 'Loss' ? 'loss' : 'tie';

            recapsHTML += `
                <div class="recap-card ${resultClass}">
                    <div class="recap-header">
                        <h4>${recap.date} vs ${recap.opponent}</h4>
                        <span class="recap-score">${recap.result} ${recap.score}</span>
                    </div>
                    <p class="recap-summary">${recap.summary}</p>
                    <div class="recap-highlights">
                        <strong>Key Players:</strong> ${recap.highlights.join(', ')}
                    </div>
                    <button class="btn-secondary" onclick="showFullRecap('${recap.date}')">View Full Report</button>
                </div>
            `;
        });

        container.innerHTML = recapsHTML || '<p>No recent game recaps available.</p>';
    }

    /**
     * Render all dashboard components
     */
    renderDashboard() {
        this.renderSeasonOverview();
        this.renderScoringTrends();
        this.renderPlayerPerformance();
        this.renderSeasonComparison();
        this.renderGameRecaps();
    }
}

// Initialize dashboard
function initStatsDashboard() {
    const engine = new StatsEngine(statsData.games, statsData.matchReports, statsData.players);
    const dashboard = new DashboardRenderer(engine);
    dashboard.renderDashboard();

    // Store globally for modal functions
    window.statsEngine = engine;
}

// Show full recap in modal
function showFullRecap(gameDate) {
    const recap = window.statsEngine?.generateGameRecap(gameDate);
    if (!recap) return;

    // Reuse existing match report modal or create new one
    if (typeof showMatchReport === 'function') {
        showMatchReport(gameDate);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initStatsDashboard);