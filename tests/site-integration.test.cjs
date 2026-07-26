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

test('public pages link team management to AllPlays and schedule exposes calendar subscription', () => {
    ['index.html', 'roster.html', 'schedule.html', 'awards.html', 'coaches.html', 'about.html']
        .forEach((page) => {
            const html = read(page);
            assert.match(html, /https:\/\/allplays\.ai\/app\/#\/teams\/vulKI10em7YQ0W28AKnu/);
            assert.doesNotMatch(html, /href="login\.html">Login/);
        });
    assert.match(read('schedule.html'), /publicTeamGamesIcs\?teamId=vulKI10em7YQ0W28AKnu/);
});

test('legacy login/admin pages redirect to real AllPlays authentication and management', () => {
    assert.match(read('login.html'), /window\.location\.replace\('https:\/\/allplays\.ai\/app\/#\/auth'\)/);
    assert.match(read('admin.html'), /window\.location\.replace\('https:\/\/allplays\.ai\/app\/#\/teams\/vulKI10em7YQ0W28AKnu'\)/);
    assert.equal(existsSync(join(siteRoot, 'js', 'auth.js')), false);
    assert.equal(existsSync(join(siteRoot, 'js', 'admin.js')), false);
    assert.doesNotMatch(read('login.html'), /demo123|admin@juniorcurrent\.com/);
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
