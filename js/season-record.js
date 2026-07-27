/**
 * Homepage season summary derived from the same merged archive + AllPlays
 * schedule used by the schedule page.
 */

(function () {
    'use strict';

    function setCount(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = String(value);
    }

    function appendIcon(parent, className) {
        const icon = document.createElement('i');
        icon.className = `fas ${className}`;
        icon.setAttribute('aria-hidden', 'true');
        parent.appendChild(icon);
    }

    function createMatchReportLink(game) {
        const reports = window.matchReports || {};
        const reportKey = game.reportKey || game.date;
        if (!reports[reportKey] || typeof window.showMatchReport !== 'function') return null;
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'match-report-link';
        link.textContent = '📰 Match Report';
        link.addEventListener('click', (event) => {
            event.preventDefault();
            window.showMatchReport(reportKey);
        });
        return link;
    }

    function createLegacyLink(label, url, onDark = false) {
        if (!url) return null;
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = `legacy-game-link${onDark ? ' legacy-game-link-on-dark' : ''}`;
        link.textContent = label;
        return link;
    }

    function appendLegacyGameLinks(container, game, includeReplay = false) {
        const dataClient = window.JRKC_PUBLIC_DATA;
        if (!dataClient || !game.apiGameId) return;
        const gameLink = createLegacyLink('Game', dataClient.buildLegacyGameUrl(game.apiGameId));
        if (gameLink) container.appendChild(gameLink);
        if (includeReplay) {
            const replayLink = createLegacyLink('Replay', dataClient.buildLegacyReplayUrl(game.apiGameId));
            if (replayLink) container.appendChild(replayLink);
        }
    }

    function renderRecentGames(recentGames) {
        const container = document.getElementById('recent-games-list');
        if (!container) return;
        container.replaceChildren();
        if (!recentGames.length) {
            const empty = document.createElement('p');
            empty.className = 'no-games';
            empty.textContent = 'No completed games in this season yet.';
            container.appendChild(empty);
            return;
        }

        recentGames.forEach((game) => {
            const item = document.createElement('article');
            item.className = `game-item ${(game.result || 'pending').toLowerCase()}`;
            const date = document.createElement('div');
            date.className = 'game-date';
            date.textContent = game.date;

            const details = document.createElement('div');
            details.className = 'game-details';
            const opponent = document.createElement('div');
            opponent.className = 'game-opponent';
            opponent.textContent = `vs ${game.opponent}`;
            const result = document.createElement('div');
            result.className = 'game-result';
            appendIcon(
                result,
                game.result === 'Win'
                    ? 'fa-trophy'
                    : game.result === 'Loss'
                        ? 'fa-times-circle'
                        : game.result === 'Tie'
                            ? 'fa-handshake'
                            : 'fa-clock'
            );
            result.append(` ${game.result && game.score ? `${game.result} ${game.score}` : game.result || 'Final'}`);
            details.append(opponent, result);

            const links = document.createElement('div');
            links.className = 'game-links legacy-game-links';
            const reportLink = createMatchReportLink(game);
            if (reportLink) {
                links.appendChild(reportLink);
            }
            appendLegacyGameLinks(links, game, game.status === 'completed');
            if (links.children.length) details.appendChild(links);
            item.append(date, details);
            container.appendChild(item);
        });
    }

    function renderNextGame(game, dataClient) {
        const container = document.getElementById('next-game-info');
        if (!container) return;
        container.replaceChildren();
        if (!game) {
            const empty = document.createElement('p');
            empty.className = 'no-games';
            empty.textContent = 'No upcoming games scheduled.';
            container.appendChild(empty);
            return;
        }

        const startsAt = dataClient.getGameDate(game);
        const isToday = startsAt &&
            dataClient.formatCentralDate(startsAt) === dataClient.formatCentralDate(new Date());
        const card = document.createElement('article');
        card.className = `next-game-card${isToday ? ' today' : ''}`;
        const header = document.createElement('div');
        header.className = 'game-header';
        const date = document.createElement('div');
        date.className = 'game-date';
        date.textContent = `${game.date}${game.time ? ` at ${game.time}` : ''}`;
        if (isToday) {
            const badge = document.createElement('span');
            badge.className = 'today-badge';
            badge.textContent = 'TODAY';
            date.append(' ', badge);
        }
        header.appendChild(date);

        const opponent = document.createElement('div');
        opponent.className = 'game-opponent';
        opponent.textContent = `vs ${game.opponent}`;
        const location = document.createElement('div');
        location.className = 'game-location';
        appendIcon(location, 'fa-map-marker-alt');
        location.append(` ${game.location || 'Location TBD'}`);
        card.append(header, opponent, location);
        if (game.apiGameId) {
            const link = createLegacyLink(
                'View Game on AllPlays',
                dataClient.buildLegacyGameUrl(game.apiGameId),
                true
            );
            if (link) card.appendChild(link);
        }
        container.appendChild(card);
    }

    function updateRecord() {
        const dataClient = window.JRKC_PUBLIC_DATA;
        if (!dataClient || !Array.isArray(window.games)) return;
        try {
            const summary = dataClient.deriveSeasonSummary(window.games);
            setCount('wins-count', summary.wins);
            setCount('ties-count', summary.ties);
            setCount('losses-count', summary.losses);
            setCount('remaining-count', summary.remaining);
            const subtitle = document.querySelector('.season-subtitle');
            if (subtitle) subtitle.textContent = `${summary.label} • KC Current Inspired`;
            renderRecentGames(summary.recentGames);
            renderNextGame(summary.nextGame, dataClient);
        } catch (error) {
            console.error('Failed to update season record:', error);
        }
    }

    window.addEventListener('jrkc:schedule-updated', updateRecord);
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateRecord);
    } else {
        updateRecord();
    }
})();
