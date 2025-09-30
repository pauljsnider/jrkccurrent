/**
 * Junior Current - Advanced Flight Control Dashboard
 * Mission Control-style statistics with rich visualizations
 */

// Chart instances storage
const chartInstances = {};

// Import data
const statsData = {
    games: typeof games !== 'undefined' ? games : [],
    matchReports: typeof matchReports !== 'undefined' ? matchReports : {},
    players: typeof players !== 'undefined' ? players : []
};

/**
 * Advanced Statistics Engine
 */
class AdvancedStatsEngine {
    constructor(games, matchReports, players) {
        this.games = games;
        this.matchReports = matchReports;
        this.players = players;
    }

    getGamesBySeason(year) {
        return this.games.filter(g => {
            const gameYear = new Date(g.date).getFullYear();
            return gameYear === year && g.isPast && g.score;
        }).reverse(); // Chronological
    }

    calculateWinRate(games) {
        if (games.length === 0) return 0;
        const wins = games.filter(g => g.result === 'Win').length;
        return ((wins / games.length) * 100).toFixed(1);
    }

    calculateStreak(games) {
        if (games.length === 0) return { count: 0, type: 'None' };

        const recent = [...games].reverse(); // Most recent first
        let streak = 1;
        const currentResult = recent[0].result;

        for (let i = 1; i < recent.length; i++) {
            if (recent[i].result === currentResult) {
                streak++;
            } else {
                break;
            }
        }

        return { count: streak, type: currentResult };
    }

    calculateGoalsPerGame(games) {
        if (games.length === 0) return 0;
        const totalGoals = games.reduce((sum, game) => {
            const [goalsFor] = (game.score || '0-0').split('-').map(Number);
            return sum + (goalsFor || 0);
        }, 0);
        return (totalGoals / games.length).toFixed(1);
    }

    calculateCleanSheets(games) {
        return games.filter(game => {
            const [, goalsAgainst] = (game.score || '0-0').split('-').map(Number);
            return goalsAgainst === 0;
        }).length;
    }

    getFormGuide(games, count = 10) {
        return games.slice(-count).map(g => ({
            result: g.result,
            score: g.score,
            opponent: g.opponent,
            date: g.date
        }));
    }

    calculateMomentum(games) {
        const recent = games.slice(-5);
        let momentum = 0;

        recent.forEach((game, index) => {
            const weight = (index + 1) / recent.length; // More weight to recent games
            const [goalsFor, goalsAgainst] = (game.score || '0-0').split('-').map(Number);

            if (game.result === 'Win') momentum += 20 * weight;
            else if (game.result === 'Loss') momentum -= 15 * weight;
            else momentum += 5 * weight;

            // Goal differential impact
            momentum += (goalsFor - goalsAgainst) * 2 * weight;
        });

        return Math.max(-50, Math.min(50, momentum)); // -50 to 50 scale
    }

    getScoringData(games) {
        return games.map(g => {
            const [goalsFor, goalsAgainst] = (g.score || '0-0').split('-').map(Number);
            return {
                date: g.date,
                opponent: g.opponent,
                goalsFor: goalsFor || 0,
                goalsAgainst: goalsAgainst || 0
            };
        });
    }

    getProgressionData(games) {
        let points = 0;
        let goalDiff = 0;

        return games.map(g => {
            const [goalsFor, goalsAgainst] = (g.score || '0-0').split('-').map(Number);

            if (g.result === 'Win') points += 3;
            else if (g.result === 'Tie') points += 1;

            goalDiff += (goalsFor - goalsAgainst);

            return {
                date: g.date,
                points,
                goalDiff,
                opponent: g.opponent
            };
        });
    }

    getOpponentAnalysis(games) {
        const opponents = {};

        games.forEach(g => {
            if (!opponents[g.opponent]) {
                opponents[g.opponent] = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0 };
            }

            opponents[g.opponent].played++;
            if (g.result === 'Win') opponents[g.opponent].won++;
            else if (g.result === 'Tie') opponents[g.opponent].drawn++;
            else if (g.result === 'Loss') opponents[g.opponent].lost++;

            const [gf, ga] = (g.score || '0-0').split('-').map(Number);
            opponents[g.opponent].goalsFor += gf || 0;
            opponents[g.opponent].goalsAgainst += ga || 0;
        });

        return opponents;
    }

    analyzePlayerPerformance() {
        const playerStats = {};

        this.players.forEach(player => {
            playerStats[player.name] = {
                name: player.name,
                number: player.number,
                position: player.position,
                mentions: 0,
                goals: 0,
                assists: 0,
                saves: 0,
                motm: 0, // Player of the Match
                keywords: []
            };
        });

        Object.values(this.matchReports).forEach(report => {
            const text = report.report.toLowerCase();

            this.players.forEach(player => {
                const playerName = player.name.toLowerCase();
                const stats = playerStats[player.name];

                const regex = new RegExp(`\\b${playerName}\\b`, 'gi');
                const matches = text.match(regex);
                if (matches) stats.mentions += matches.length;

                // Detailed pattern matching with template literals fixed
                const goalPattern = new RegExp(`(goal|scored|finish|net).{0,30}${playerName}|${playerName}.{0,30}(goal|scored|finish|net)`, 'i');
                if (goalPattern.test(text)) {
                    stats.goals++;
                }

                const assistPattern = new RegExp(`(assist|setup|pass|delivered).{0,30}${playerName}|${playerName}.{0,30}(assist|setup|delivered)`, 'i');
                if (assistPattern.test(text)) {
                    stats.assists++;
                }

                const savePattern = new RegExp(`(save|stop|block).{0,30}${playerName}|${playerName}.{0,30}(save|stop|block)`, 'i');
                if (savePattern.test(text)) {
                    stats.saves++;
                }

                const motmPattern = new RegExp(`(player of the (game|match)|motm).{0,30}${playerName}`, 'i');
                if (motmPattern.test(text)) {
                    stats.motm++;
                }
            });
        });

        return Object.values(playerStats).sort((a, b) => b.mentions - a.mentions);
    }
}

/**
 * Mission Control Dashboard Renderer
 */
class MissionControlDashboard {
    constructor(engine) {
        this.engine = engine;
        this.currentSeason = 2025;
    }

    init() {
        this.updateTimestamp();
        this.renderMetricPanels();
        this.renderFormGuide();
        this.renderAllCharts();
        this.renderTables();
        this.renderAIInsights();

        // Update timestamp every minute
        setInterval(() => this.updateTimestamp(), 60000);
    }

    updateTimestamp() {
        const now = new Date();
        document.getElementById('lastUpdate').textContent =
            `Last Updated: ${now.toLocaleTimeString()} ${now.toLocaleDateString()}`;
    }

    renderMetricPanels() {
        const games = this.engine.getGamesBySeason(this.currentSeason);

        // Win Rate
        const winRate = this.engine.calculateWinRate(games);
        document.getElementById('winRate').textContent = `${winRate}%`;
        document.getElementById('winRateTrend').innerHTML =
            `<i class="fas fa-arrow-up"></i> ${games.filter(g => g.result === 'Win').length}W-${games.filter(g => g.result === 'Loss').length}L`;
        this.renderWinRateGauge(parseFloat(winRate));

        // Streak
        const streak = this.engine.calculateStreak(games);
        document.getElementById('currentStreak').textContent = streak.count;
        document.getElementById('streakType').textContent = `${streak.type} Streak`;
        this.renderStreakVisual(games);

        // Goals Per Game
        const gpg = this.engine.calculateGoalsPerGame(games);
        document.getElementById('goalsPerGame').textContent = gpg;
        document.getElementById('goalComparison').innerHTML =
            `<span class="trend-positive">▲ ${(parseFloat(gpg) * games.length).toFixed(0)} total goals</span>`;
        this.renderGoalsSparkline(games);

        // Clean Sheets
        const cleanSheets = this.engine.calculateCleanSheets(games);
        const csPct = games.length > 0 ? ((cleanSheets / games.length) * 100).toFixed(0) : 0;
        document.getElementById('cleanSheets').textContent = cleanSheets;
        document.getElementById('cleanSheetPct').textContent = `${csPct}% of games`;
        this.renderDefensiveChart(games);
    }

    renderWinRateGauge(winRate) {
        const ctx = document.getElementById('winRateGauge');
        if (!ctx) return;

        if (chartInstances.winRateGauge) chartInstances.winRateGauge.destroy();

        chartInstances.winRateGauge = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [winRate, 100 - winRate],
                    backgroundColor: ['#06d6a0', '#2d3142'],
                    borderWidth: 0
                }]
            },
            options: {
                cutout: '75%',
                plugins: { legend: { display: false } },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderStreakVisual(games) {
        const recent = games.slice(-5);
        const html = recent.map(g => {
            let icon = '';
            if (g.result === 'Win') icon = '<span class="result-icon win">W</span>';
            else if (g.result === 'Loss') icon = '<span class="result-icon loss">L</span>';
            else icon = '<span class="result-icon tie">T</span>';
            return icon;
        }).join('');

        document.getElementById('streakVisual').innerHTML = html;
    }

    renderGoalsSparkline(games) {
        const ctx = document.getElementById('goalsSparkline');
        if (!ctx) return;

        if (chartInstances.goalsSparkline) chartInstances.goalsSparkline.destroy();

        const data = games.slice(-10).map(g => {
            const [gf] = (g.score || '0-0').split('-').map(Number);
            return gf || 0;
        });

        chartInstances.goalsSparkline = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => i + 1),
                datasets: [{
                    data: data,
                    borderColor: '#06d6a0',
                    backgroundColor: 'rgba(6, 214, 160, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderDefensiveChart(games) {
        const ctx = document.getElementById('defensiveChart');
        if (!ctx) return;

        if (chartInstances.defensiveChart) chartInstances.defensiveChart.destroy();

        const data = games.slice(-10).map(g => {
            const [, ga] = (g.score || '0-0').split('-').map(Number);
            return ga || 0;
        });

        chartInstances.defensiveChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map((_, i) => i + 1),
                datasets: [{
                    data: data,
                    backgroundColor: data.map(v => v === 0 ? '#27ae60' : '#e74c3c'),
                    borderWidth: 0
                }]
            },
            options: {
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderFormGuide() {
        const games = this.engine.getGamesBySeason(this.currentSeason);
        const form = this.engine.getFormGuide(games);

        const html = form.map(g => {
            let className = 'form-box';
            if (g.result === 'Win') className += ' win';
            else if (g.result === 'Loss') className += ' loss';
            else className += ' tie';

            return `<div class="${className}" title="${g.date} vs ${g.opponent}: ${g.score}">${g.result[0]}</div>`;
        }).join('');

        document.getElementById('formGuide').innerHTML = html;

        // Momentum
        const momentum = this.engine.calculateMomentum(games);
        const momentumPct = ((momentum + 50) / 100) * 100; // Convert to 0-100 scale
        const fill = document.getElementById('momentumFill');
        fill.style.width = `${momentumPct}%`;
        fill.className = 'momentum-fill';
        if (momentum > 15) fill.classList.add('positive');
        else if (momentum < -15) fill.classList.add('negative');
        else fill.classList.add('neutral');
    }

    renderAllCharts() {
        this.renderResultsChart();
        this.renderScoringChart();
        this.renderProgressionChart();
        this.renderPlayerRadarChart();
        this.renderOpponentChart();
        this.renderGoalTimingChart();
    }

    renderResultsChart() {
        const ctx = document.getElementById('resultsChart');
        if (!ctx) return;

        if (chartInstances.resultsChart) chartInstances.resultsChart.destroy();

        const games = this.engine.getGamesBySeason(this.currentSeason);
        const wins = games.filter(g => g.result === 'Win').length;
        const losses = games.filter(g => g.result === 'Loss').length;
        const ties = games.filter(g => g.result === 'Tie').length;

        chartInstances.resultsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses', 'Ties'],
                datasets: [{
                    data: [wins, losses, ties],
                    backgroundColor: ['#27ae60', '#e74c3c', '#f39c12'],
                    borderWidth: 2,
                    borderColor: '#1a1d29'
                }]
            },
            options: {
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#fff', font: { size: 12 } }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderScoringChart() {
        const ctx = document.getElementById('scoringChart');
        if (!ctx) return;

        if (chartInstances.scoringChart) chartInstances.scoringChart.destroy();

        const games = this.engine.getGamesBySeason(this.currentSeason);
        const scoringData = this.engine.getScoringData(games);

        chartInstances.scoringChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: scoringData.map(d => d.opponent.substring(0, 10)),
                datasets: [
                    {
                        label: 'Goals For',
                        data: scoringData.map(d => d.goalsFor),
                        borderColor: '#06d6a0',
                        backgroundColor: 'rgba(6, 214, 160, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Goals Against',
                        data: scoringData.map(d => d.goalsAgainst),
                        borderColor: '#ef476f',
                        backgroundColor: 'rgba(239, 71, 111, 0.2)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff', maxRotation: 45 },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderProgressionChart() {
        const ctx = document.getElementById('progressionChart');
        if (!ctx) return;

        if (chartInstances.progressionChart) chartInstances.progressionChart.destroy();

        const games = this.engine.getGamesBySeason(this.currentSeason);
        const progression = this.engine.getProgressionData(games);

        chartInstances.progressionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: progression.map(d => d.opponent.substring(0, 8)),
                datasets: [
                    {
                        label: 'Cumulative Points',
                        data: progression.map(d => d.points),
                        borderColor: '#06d6a0',
                        backgroundColor: 'rgba(6, 214, 160, 0.1)',
                        yAxisID: 'y',
                        borderWidth: 3,
                        tension: 0.3
                    },
                    {
                        label: 'Goal Differential',
                        data: progression.map(d => d.goalDiff),
                        borderColor: '#ffd60a',
                        backgroundColor: 'rgba(255, 214, 10, 0.1)',
                        yAxisID: 'y1',
                        borderWidth: 3,
                        tension: 0.3
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 12 } }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                        title: { display: true, text: 'Points', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        title: { display: true, text: 'Goal Diff', color: '#fff' },
                        ticks: { color: '#fff' },
                        grid: { display: false }
                    },
                    x: {
                        ticks: { color: '#fff', maxRotation: 45 },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderPlayerRadarChart() {
        const ctx = document.getElementById('playerRadarChart');
        if (!ctx) return;

        const players = this.engine.analyzePlayerPerformance().slice(0, 10);

        // Populate select
        const select = document.getElementById('playerSelect');
        select.innerHTML = '<option value="">Top 5 Players</option>' +
            players.map((p, i) => `<option value="${i}">${p.number} - ${p.name}</option>`).join('');

        this.renderPlayerRadar(players.slice(0, 5));

        select.addEventListener('change', (e) => {
            if (e.target.value === '') {
                this.renderPlayerRadar(players.slice(0, 5));
            } else {
                this.renderPlayerRadar([players[e.target.value]]);
            }
        });
    }

    renderPlayerRadar(players) {
        const ctx = document.getElementById('playerRadarChart');
        if (chartInstances.playerRadarChart) chartInstances.playerRadarChart.destroy();

        const maxValues = {
            mentions: Math.max(...players.map(p => p.mentions), 1),
            goals: Math.max(...players.map(p => p.goals), 1),
            assists: Math.max(...players.map(p => p.assists), 1),
            saves: Math.max(...players.map(p => p.saves), 1),
            motm: Math.max(...players.map(p => p.motm), 1)
        };

        const datasets = players.map((p, i) => ({
            label: p.number,
            data: [
                (p.mentions / maxValues.mentions) * 100,
                (p.goals / maxValues.goals) * 100,
                (p.assists / maxValues.assists) * 100,
                (p.saves / maxValues.saves) * 100,
                (p.motm / maxValues.motm) * 100
            ],
            backgroundColor: `rgba(${[
                '6, 214, 160',
                '239, 71, 111',
                '255, 214, 10',
                '118, 93, 255',
                '255, 159, 64'
            ][i]}, 0.2)`,
            borderColor: `rgba(${[
                '6, 214, 160',
                '239, 71, 111',
                '255, 214, 10',
                '118, 93, 255',
                '255, 159, 64'
            ][i]}, 1)`,
            borderWidth: 2
        }));

        chartInstances.playerRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Impact', 'Goals', 'Assists', 'Saves', 'POTM'],
                datasets: datasets
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 11 } }
                    }
                },
                scales: {
                    r: {
                        ticks: { color: '#fff', backdropColor: 'transparent' },
                        grid: { color: 'rgba(255,255,255,0.2)' },
                        pointLabels: { color: '#fff' }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderOpponentChart() {
        const ctx = document.getElementById('opponentChart');
        if (!ctx) return;

        if (chartInstances.opponentChart) chartInstances.opponentChart.destroy();

        const games = this.engine.getGamesBySeason(this.currentSeason);
        const opponents = this.engine.getOpponentAnalysis(games);

        const labels = Object.keys(opponents);
        const winData = labels.map(opp => opponents[opp].won);
        const drawData = labels.map(opp => opponents[opp].drawn);
        const lossData = labels.map(opp => opponents[opp].lost);

        chartInstances.opponentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Wins',
                        data: winData,
                        backgroundColor: '#27ae60'
                    },
                    {
                        label: 'Draws',
                        data: drawData,
                        backgroundColor: '#f39c12'
                    },
                    {
                        label: 'Losses',
                        data: lossData,
                        backgroundColor: '#e74c3c'
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderGoalTimingChart() {
        const ctx = document.getElementById('goalTimingChart');
        if (!ctx) return;

        if (chartInstances.goalTimingChart) chartInstances.goalTimingChart.destroy();

        // Simulated data (would need actual minute-by-minute data)
        const periods = ['0-15min', '15-30min', '30-45min', 'HT', '45-60min', '60-75min', '75-90min'];
        const goalsFor = [4, 3, 5, 0, 6, 4, 8];
        const goalsAgainst = [2, 4, 3, 0, 3, 5, 4];

        chartInstances.goalTimingChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: periods,
                datasets: [
                    {
                        label: 'Goals Scored',
                        data: goalsFor,
                        backgroundColor: '#06d6a0'
                    },
                    {
                        label: 'Goals Conceded',
                        data: goalsAgainst,
                        backgroundColor: '#ef476f'
                    }
                ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: { color: '#fff', font: { size: 12 } }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                },
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }

    renderTables() {
        this.renderPlayerStatsTable();
        this.renderGameLogTable();
    }

    renderPlayerStatsTable() {
        const players = this.engine.analyzePlayerPerformance();
        const html = `
            <table class="mission-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>POS</th>
                        <th>IMPACT</th>
                        <th>G</th>
                        <th>A</th>
                        <th>S</th>
                        <th>POTM</th>
                    </tr>
                </thead>
                <tbody>
                    ${players.slice(0, 12).map(p => `
                        <tr>
                            <td><strong>${p.number}</strong></td>
                            <td><span class="position-badge">${p.position.substring(0, 3)}</span></td>
                            <td><div class="impact-bar"><div style="width:${Math.min(100, p.mentions * 5)}%"></div></div></td>
                            <td><strong>${p.goals}</strong></td>
                            <td><strong>${p.assists}</strong></td>
                            <td><strong>${p.saves}</strong></td>
                            <td><strong>${p.motm}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('playerStatsTable').innerHTML = html;
    }

    renderGameLogTable() {
        const games = this.engine.getGamesBySeason(this.currentSeason).slice(-10).reverse();
        const html = `
            <table class="mission-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Opponent</th>
                        <th>Result</th>
                        <th>Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${games.map(g => `
                        <tr class="result-${g.result?.toLowerCase()}">
                            <td>${g.date}</td>
                            <td>${g.opponent}</td>
                            <td><span class="result-badge ${g.result?.toLowerCase()}">${g.result}</span></td>
                            <td><strong>${g.score}</strong></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        document.getElementById('gameLogTable').innerHTML = html;
    }

    renderAIInsights() {
        const games = this.engine.getGamesBySeason(this.currentSeason);
        const players = this.engine.analyzePlayerPerformance();

        const insights = [
            {
                icon: 'trophy',
                title: 'Season Performance',
                text: `Through ${games.length} games, the team has shown ${games.filter(g => g.result === 'Win').length > games.length / 2 ? 'strong' : 'improving'} performance with a ${this.engine.calculateWinRate(games)}% win rate.`
            },
            {
                icon: 'star',
                title: 'Top Contributor',
                text: `${players[0].number} leads the team with ${players[0].mentions} key contributions and ${players[0].goals} goals.`
            },
            {
                icon: 'chart-line',
                title: 'Momentum Analysis',
                text: `Team momentum is ${this.engine.calculateMomentum(games) > 15 ? 'strongly positive' : this.engine.calculateMomentum(games) < -15 ? 'negative' : 'neutral'} based on recent form.`
            },
            {
                icon: 'futbol',
                title: 'Offensive Power',
                text: `Averaging ${this.engine.calculateGoalsPerGame(games)} goals per game with ${this.engine.calculateCleanSheets(games)} clean sheets defensively.`
            }
        ];

        const html = insights.map(insight => `
            <div class="insight-card">
                <i class="fas fa-${insight.icon}"></i>
                <h4>${insight.title}</h4>
                <p>${insight.text}</p>
            </div>
        `).join('');

        document.getElementById('aiInsights').innerHTML = html;
    }
}

// Initialize Mission Control Dashboard
function initMissionControl() {
    const engine = new AdvancedStatsEngine(statsData.games, statsData.matchReports, statsData.players);
    const dashboard = new MissionControlDashboard(engine);
    dashboard.init();

    // Season toggle buttons
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            dashboard.currentSeason = parseInt(this.dataset.season);
            dashboard.renderMetricPanels();
            dashboard.renderFormGuide();
            dashboard.renderAllCharts();
        });
    });
}

document.addEventListener('DOMContentLoaded', initMissionControl);