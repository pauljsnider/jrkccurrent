const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const siteRoot = join(__dirname, '..');
const read = (path) => readFileSync(join(siteRoot, path), 'utf8');

test('roster, schedule, and homepage load the shared public data client before consumers', () => {
    const pages = {
        'roster.html': 'js/roster.js',
        'schedule.html': 'js/schedule.js',
        'index.html': 'js/schedule.js'
    };
    Object.entries(pages).forEach(([page, consumer]) => {
        const html = read(page);
        assert.ok(html.indexOf('js/allplays-public-data.js') > 0, `${page} loads the shared client`);
        assert.ok(html.indexOf('js/allplays-public-data.js') < html.indexOf(consumer), `${page} loads it first`);
    });
});

test('public pages link to the legacy AllPlays team without app management links', () => {
    ['index.html', 'roster.html', 'schedule.html', 'awards.html', 'coaches.html', 'about.html']
        .forEach((page) => {
            const html = read(page);
            assert.match(html, /https:\/\/allplays\.ai\/team\.html\?teamId=vulKI10em7YQ0W28AKnu/);
            assert.doesNotMatch(html, /https:\/\/allplays\.ai\/app\/#\/teams/);
            assert.doesNotMatch(html, /Manage (?:Team|in AllPlays)/);
            assert.doesNotMatch(html, /href="login\.html">Login/);
        });
    ['index.html', 'roster.html', 'schedule.html'].forEach((page) => {
        const html = read(page);
        assert.match(html, /https:\/\/allplays\.ai\/edit-roster\.html\?teamId=vulKI10em7YQ0W28AKnu/);
        assert.match(html, /https:\/\/allplays\.ai\/edit-schedule\.html\?teamId=vulKI10em7YQ0W28AKnu/);
    });
    assert.match(read('schedule.html'), /publicTeamGamesIcs\?teamId=vulKI10em7YQ0W28AKnu/);
});

test('legacy login/admin pages redirect to legacy AllPlays authentication and management', () => {
    assert.match(read('login.html'), /window\.location\.replace\('https:\/\/allplays\.ai\/login\.html'\)/);
    assert.match(read('admin.html'), /window\.location\.replace\('https:\/\/allplays\.ai\/edit-team\.html\?teamId=vulKI10em7YQ0W28AKnu'\)/);
    assert.equal(existsSync(join(siteRoot, 'js', 'auth.js')), false);
    assert.equal(existsSync(join(siteRoot, 'js', 'admin.js')), false);
    assert.doesNotMatch(read('login.html'), /demo123|admin@juniorcurrent\.com/);
});

test('live games expose legacy game and replay links without archive-count status copy', () => {
    const scheduleSource = read('js/schedule.js');
    const homeSource = read('js/season-record.js');
    assert.match(scheduleSource, /buildLegacyGameUrl/);
    assert.match(scheduleSource, /buildLegacyReplayUrl/);
    assert.match(homeSource, /buildLegacyGameUrl/);
    assert.match(homeSource, /buildLegacyReplayUrl/);
    assert.doesNotMatch(scheduleSource, /live \$\{payload\.games\.length\}/);
    assert.doesNotMatch(scheduleSource, /archive preserved/);
});

test('retired TeamSnap updater is absent and archive instructions point to AllPlays', () => {
    assert.equal(existsSync(join(siteRoot, 'update_schedule.sh')), false);
    const instructions = read('FALL2025_SCHEDULE_INSTRUCTIONS.md');
    assert.match(instructions, /TeamSnap is no longer a live website integration/);
    assert.match(instructions, /AllPlays/);
    assert.doesNotMatch(instructions, /ical-cdn\.teamsnap\.com/);
});

test('historical analytics stays pinned to an explicitly archived roster', () => {
    const html = read('stat-tracker/stats.html');
    assert.match(html, /js\/stats-legacy-roster\.js/);
    assert.doesNotMatch(html, /js\/roster\.js/);
    assert.match(read('js/stats-legacy-roster.js'), /Historical 2025 roster/);
});
