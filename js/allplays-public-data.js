(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }
    if (root) {
        root.JRKC_PUBLIC_DATA = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const TEAM_ID = 'vulKI10em7YQ0W28AKnu';
    const FUNCTIONS_ORIGIN = 'https://us-central1-game-flow-c6311.cloudfunctions.net';
    const TIME_ZONE = 'America/Chicago';
    const LIVE_DATA_START = '2026-01-01T00:00:00.000Z';
    const REQUEST_TIMEOUT_MS = 8000;
    const config = Object.freeze({
        teamId: TEAM_ID,
        rosterUrl: `${FUNCTIONS_ORIGIN}/publicTeamRosterV1?teamId=${encodeURIComponent(TEAM_ID)}`,
        gamesUrl: `${FUNCTIONS_ORIGIN}/publicTeamGamesV1?teamId=${encodeURIComponent(TEAM_ID)}&from=2026-01-01&limit=500`,
        calendarUrl: `${FUNCTIONS_ORIGIN}/publicTeamGamesIcs?teamId=${encodeURIComponent(TEAM_ID)}`,
        manageTeamUrl: `https://allplays.ai/app/#/teams/${encodeURIComponent(TEAM_ID)}`,
        signInUrl: 'https://allplays.ai/app/#/auth',
        timeZone: TIME_ZONE,
        liveDataStart: LIVE_DATA_START
    });

    let rosterRequest;
    let gamesRequest;

    function cleanText(value, fallback = '') {
        return typeof value === 'string' || typeof value === 'number'
            ? String(value).replace(/\s+/g, ' ').trim()
            : fallback;
    }

    function validHttpUrl(value) {
        const text = cleanText(value);
        if (!text) return null;
        try {
            const url = new URL(text);
            return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
        } catch (error) {
            return null;
        }
    }

    function asDate(value) {
        if (!value) return null;
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatCentralDate(value) {
        const date = asDate(value);
        return date
            ? new Intl.DateTimeFormat('en-US', {
                timeZone: TIME_ZONE,
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }).format(date)
            : '';
    }

    function formatCentralTime(value) {
        const date = asDate(value);
        return date
            ? new Intl.DateTimeFormat('en-US', {
                timeZone: TIME_ZONE,
                hour: 'numeric',
                minute: '2-digit'
            }).format(date)
            : '';
    }

    function normalizeResult(value) {
        const normalized = cleanText(value).toLowerCase();
        if (normalized === 'win') return 'Win';
        if (normalized === 'loss') return 'Loss';
        if (normalized === 'tie' || normalized === 'draw') return 'Tie';
        return '';
    }

    function normalizeApiPlayer(player) {
        if (!player || typeof player !== 'object') return null;
        const id = cleanText(player.id);
        const name = cleanText(player.name);
        if (!id || !name) return null;
        return {
            id,
            name,
            number: cleanText(player.number),
            photoUrl: validHttpUrl(player.photoUrl),
            position: cleanText(player.position) || null
        };
    }

    function normalizeApiGame(game, now = new Date()) {
        if (!game || typeof game !== 'object') return null;
        const id = cleanText(game.id);
        const start = asDate(game.startsAt);
        if (!id || !start) return null;
        const status = cleanText(game.status, 'scheduled').toLowerCase();
        const teamScore = Number.isFinite(Number(game.teamScore)) && game.teamScore !== null
            ? Number(game.teamScore)
            : null;
        const opponentScore = Number.isFinite(Number(game.opponentScore)) && game.opponentScore !== null
            ? Number(game.opponentScore)
            : null;
        const result = normalizeResult(game.result);
        const competitionType = cleanText(game.competitionType).toLowerCase();
        const isExhibition = game.countsTowardSeasonRecord === false ||
            competitionType === 'friendly' ||
            competitionType === 'exhibition';
        const score = teamScore !== null && opponentScore !== null
            ? `${teamScore}-${opponentScore}`
            : '';

        return {
            id: `allplays:${id}`,
            apiGameId: id,
            reportKey: `allplays:${id}`,
            startsAt: start.toISOString(),
            date: formatCentralDate(start),
            time: formatCentralTime(start),
            opponent: cleanText(game.opponent, 'TBD') || 'TBD',
            location: cleanText(game.location, 'Location TBD') || 'Location TBD',
            result,
            score,
            status,
            isExhibition,
            countsTowardSeasonRecord: game.countsTowardSeasonRecord !== false,
            isPast: status === 'completed' || start < asDate(now),
            seasonLabel: cleanText(game.seasonLabel) || null,
            competitionType: competitionType || null,
            summary: cleanText(game.summary) || null,
            videoUrl: validHttpUrl(game.videoUrl),
            source: 'allplays'
        };
    }

    function getGameDate(game) {
        if (game && game.startsAt) return asDate(game.startsAt);
        if (!game || !game.date) return null;
        return asDate(`${game.date}${game.time ? ` ${game.time}` : ' 12:00 PM'}`);
    }

    function mergeArchivedAndLiveGames(legacyGames, apiGames, now = new Date()) {
        const boundary = asDate(LIVE_DATA_START);
        const archive = Array.isArray(legacyGames)
            ? legacyGames.filter((game) => {
                const date = getGameDate(game);
                return !date || date < boundary;
            }).map((game, index) => ({
                ...game,
                id: game.id || `archive:${index}:${cleanText(game.date)}`,
                reportKey: game.reportKey || cleanText(game.date),
                source: 'archive'
            }))
            : [];
        const live = Array.isArray(apiGames)
            ? apiGames.map((game) => normalizeApiGame(game, now)).filter(Boolean)
            : [];
        const uniqueLive = [...new Map(live.map((game) => [game.apiGameId, game])).values()];
        return [...archive, ...uniqueLive];
    }

    function deriveDateSeason(date) {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: TIME_ZONE,
            year: 'numeric',
            month: 'numeric'
        }).formatToParts(date);
        const year = Number(parts.find((part) => part.type === 'year')?.value);
        const month = Number(parts.find((part) => part.type === 'month')?.value);
        const name = month <= 2 ? 'Winter' : month <= 5 ? 'Spring' : month <= 7 ? 'Summer' : 'Fall';
        return { key: `${name.toLowerCase()}-${year}`, label: `${name} ${year}` };
    }

    function getGameSeason(game) {
        const label = cleanText(game && game.seasonLabel);
        if (label) return { key: `label:${label.toLowerCase()}`, label };
        const date = getGameDate(game);
        return date ? deriveDateSeason(date) : null;
    }

    function deriveSeasonSummary(games, now = new Date()) {
        const current = asDate(now) || new Date();
        const eligible = (Array.isArray(games) ? games : [])
            .map((game) => ({ game, date: getGameDate(game), season: getGameSeason(game) }))
            .filter((entry) => entry.date && entry.season && !entry.game.isExhibition &&
                entry.game.countsTowardSeasonRecord !== false && entry.game.status !== 'cancelled');
        const upcoming = eligible
            .filter((entry) => entry.date >= current && entry.game.status !== 'completed')
            .sort((left, right) => left.date - right.date);
        const completed = eligible
            .filter((entry) => entry.game.result && (entry.game.status === 'completed' || entry.date < current))
            .sort((left, right) => right.date - left.date);
        const fallback = eligible.slice().sort((left, right) => right.date - left.date);
        const anchor = upcoming[0] || completed[0] || fallback[0] || null;
        if (!anchor) {
            const season = deriveDateSeason(current);
            return {
                label: season.label,
                wins: 0,
                ties: 0,
                losses: 0,
                remaining: 0,
                recentGames: [],
                nextGame: null
            };
        }

        const seasonGames = eligible.filter((entry) => entry.season.key === anchor.season.key);
        const seasonCompleted = seasonGames
            .filter((entry) => entry.game.result && (entry.game.status === 'completed' || entry.date < current))
            .sort((left, right) => right.date - left.date);
        const seasonUpcoming = seasonGames
            .filter((entry) => entry.date >= current && entry.game.status !== 'completed')
            .sort((left, right) => left.date - right.date);
        return {
            label: anchor.season.label,
            wins: seasonCompleted.filter((entry) => entry.game.result === 'Win').length,
            ties: seasonCompleted.filter((entry) => entry.game.result === 'Tie').length,
            losses: seasonCompleted.filter((entry) => entry.game.result === 'Loss').length,
            remaining: seasonUpcoming.length,
            recentGames: seasonCompleted.slice(0, 3).map((entry) => entry.game),
            nextGame: seasonUpcoming[0]?.game || null
        };
    }

    async function fetchJson(url, options = {}) {
        const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
        if (!fetchImpl) throw new Error('Live data is unavailable in this browser.');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);
        try {
            const response = await fetchImpl(url, {
                method: 'GET',
                headers: { Accept: 'application/json' },
                signal: controller.signal
            });
            if (!response.ok) {
                throw new Error(`Live data request failed (${response.status}).`);
            }
            return await response.json();
        } catch (error) {
            if (error && error.name === 'AbortError') {
                throw new Error('Live data request timed out.');
            }
            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    async function loadRoster(options = {}) {
        if (!rosterRequest || options.force === true) {
            rosterRequest = fetchJson(config.rosterUrl, options)
                .then((payload) => {
                    if (payload?.version !== 1 || !Array.isArray(payload.players)) {
                        throw new Error('The roster service returned an unexpected response.');
                    }
                    return {
                        ...payload,
                        players: payload.players.map(normalizeApiPlayer).filter(Boolean)
                    };
                })
                .catch((error) => {
                    rosterRequest = null;
                    throw error;
                });
        }
        return rosterRequest;
    }

    async function loadGames(options = {}) {
        if (!gamesRequest || options.force === true) {
            gamesRequest = fetchJson(config.gamesUrl, options)
                .then((payload) => {
                    if (payload?.version !== 1 || !Array.isArray(payload.games)) {
                        throw new Error('The schedule service returned an unexpected response.');
                    }
                    return payload;
                })
                .catch((error) => {
                    gamesRequest = null;
                    throw error;
                });
        }
        return gamesRequest;
    }

    return Object.freeze({
        config,
        cleanText,
        deriveSeasonSummary,
        fetchJson,
        formatCentralDate,
        formatCentralTime,
        getGameDate,
        getGameSeason,
        loadGames,
        loadRoster,
        mergeArchivedAndLiveGames,
        normalizeApiGame,
        normalizeApiPlayer,
        validHttpUrl
    });
});
