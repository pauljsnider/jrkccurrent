const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const test = require('node:test');

const root = join(__dirname, '..');
const read = (path) => readFileSync(join(root, path), 'utf8');

test('team photo is published on the homepage and About page', () => {
    const home = read('index.html');
    const about = read('about.html');
    for (const html of [home, about]) {
        assert.match(html, /Images\/team-photo-2026\.webp/);
        assert.match(html, /css\/team-photo\.css/);
    }
    assert.match(home, /class="hero team-photo-hero"/);
    assert.match(about, /class="about-team-photo"/);
});

test('team photo is a valid, optimized WebP image', () => {
    const photo = readFileSync(join(root, 'Images', 'team-photo-2026.webp'));
    assert.equal(photo.toString('ascii', 0, 4), 'RIFF');
    assert.equal(photo.toString('ascii', 8, 12), 'WEBP');
    assert.ok(photo.length > 10000 && photo.length < 250000);
});
