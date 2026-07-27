const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const siteRoot = join(__dirname, '..');
const publicData = require('../js/allplays-public-data.js');

test('uses versioned public APIs and exposes legacy AllPlays destinations', () => {
    assert.equal(publicData.config.teamId, 'vulKI10em7YQ0W28AKnu');
    assert.match(publicData.config.rosterUrl, /publicTeamRosterV1/);
    assert.match(publicData.config.gamesUrl, /publicTeamGamesV1/);
    assert.match(publicData.config.gamesUrl, /from=2026-01-01/);
    assert.match(publicData.config.calendarUrl, /publicTeamGamesIcs/);
    assert.equal(
        publicData.config.legacyTeamUrl,
        'https://allplays.ai/team.html?teamId=vulKI10em7YQ0W28AKnu'
    );
    assert.equal(
        publicData.config.legacyRosterUrl,
        'https://allplays.ai/edit-roster.html?teamId=vulKI10em7YQ0W28AKnu'
    );
    assert.equal(
        publicData.config.legacyScheduleUrl,
        'https://allplays.ai/edit-schedule.html?teamId=vulKI10em7YQ0W28AKnu'
    );
    assert.equal(publicData.config.legacySignInUrl, 'https://allplays.ai/login.html');
    assert.equal(publicData.config.manageTeamUrl, undefined);
    assert.equal(publicData.config.signInUrl, undefined);
});

test('builds encoded legacy game and replay links only for valid game ids', () => {
    assert.equal(
        publicData.buildLegacyGameUrl('game 1/blue'),
        'https://allplays.ai/game.html?teamId=vulKI10em7YQ0W28AKnu&gameId=game%201%2Fblue'
    );
    assert.equal(
        publicData.buildLegacyReplayUrl('game 1/blue'),
        'https://allplays.ai/live-game.html?teamId=vulKI10em7YQ0W28AKnu&gameId=game%201%2Fblue&replay=true'
    );
    assert.equal(publicData.buildLegacyGameUrl(''), null);
    assert.equal(publicData.buildLegacyReplayUrl(null), null);
});

test('normalizes public roster players without accepting unsafe photos', () => {
    assert.deepEqual(publicData.normalizeApiPlayer({
        id: 'player-1',
        name: ' Charlotte ',
        number: 12,
        photoUrl: 'javascript:alert(1)',
        parentEmail: 'private@example.com'
    }), {
        id: 'player-1',
        name: 'Charlotte',
        number: '12',
        photoUrl: null,
        position: null
    });
});

test('normalizes all live games including the published test match in Central time', () => {
    const game = publicData.normalizeApiGame({
        id: 'test-game',
        startsAt: '2026-07-31T15:00:00.000Z',
        opponent: 'test',
        location: 'Field 1',
        status: 'scheduled',
        countsTowardSeasonRecord: true
    }, new Date('2026-07-26T12:00:00.000Z'));

    assert.equal(game.apiGameId, 'test-game');
    assert.equal(game.opponent, 'test');
    assert.equal(game.date, 'Jul 31, 2026');
    assert.equal(game.time, '10:00 AM');
    assert.equal(game.isPast, false);
});

test('archive owns pre-2026 matches and AllPlays owns 2026 onward', () => {
    const merged = publicData.mergeArchivedAndLiveGames([
        { date: 'Oct 19, 2025', opponent: 'Storm', time: '10:30 AM' },
        { date: 'Jan 10, 2026', opponent: 'stale manual game', time: '10:30 AM' }
    ], [
        {
            id: 'live-2026',
            startsAt: '2026-01-10T16:30:00.000Z',
            opponent: 'Live opponent',
            status: 'scheduled'
        }
    ]);

    assert.deepEqual(merged.map((game) => game.opponent), ['Storm', 'Live opponent']);
    assert.deepEqual(merged.map((game) => game.source), ['archive', 'allplays']);
});

test('current season summary follows the nearest upcoming season and excludes cancelled/friendly games', () => {
    const summary = publicData.deriveSeasonSummary([
        publicData.normalizeApiGame({
            id: 'spring-win',
            startsAt: '2026-05-01T20:00:00.000Z',
            opponent: 'A',
            status: 'completed',
            teamScore: 2,
            opponentScore: 1,
            result: 'win'
        }),
        publicData.normalizeApiGame({
            id: 'summer-next',
            startsAt: '2026-07-31T20:00:00.000Z',
            opponent: 'B',
            status: 'scheduled'
        }),
        publicData.normalizeApiGame({
            id: 'summer-cancelled',
            startsAt: '2026-07-30T20:00:00.000Z',
            opponent: 'C',
            status: 'cancelled'
        }),
        publicData.normalizeApiGame({
            id: 'summer-friendly',
            startsAt: '2026-07-29T20:00:00.000Z',
            opponent: 'D',
            status: 'scheduled',
            countsTowardSeasonRecord: false
        })
    ], new Date('2026-07-26T12:00:00.000Z'));

    assert.equal(summary.label, 'Summer 2026');
    assert.equal(summary.remaining, 1);
    assert.equal(summary.nextGame.opponent, 'B');
    assert.deepEqual(
        { wins: summary.wins, ties: summary.ties, losses: summary.losses },
        { wins: 0, ties: 0, losses: 0 }
    );
});

test('the complete 40-match 2023-2025 archive remains embedded', () => {
    const source = readFileSync(join(siteRoot, 'js', 'schedule.js'), 'utf8');
    const archiveSource = source.slice(0, source.indexOf('// Expose games for other pages'));
    const context = {};
    vm.runInNewContext(`${archiveSource}\nglobalThis.__archive = games;`, context);

    assert.equal(context.__archive.length, 40);
    assert.equal(context.__archive.every((game) => /\b202[3-5]\b/.test(game.date)), true);
    assert.equal(context.__archive.some((game) => game.date === 'Oct 19, 2025'), true);
    assert.equal(context.__archive.some((game) => game.date === 'Aug 26, 2023'), true);
});
