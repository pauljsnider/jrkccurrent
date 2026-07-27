import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const writeChanges = process.argv.includes('--write');
const assets = {
    'css/styles.css': ['index.html', 'schedule.html', 'roster.html'],
    'js/allplays-public-data.js': ['index.html', 'schedule.html', 'roster.html'],
    'js/schedule.js': ['index.html', 'schedule.html'],
    'js/season-record.js': ['index.html'],
    'css/player-cards.css': ['roster.html'],
    'js/roster.js': ['roster.html']
};

function gitBlobVersion(contents) {
    return createHash('sha1')
        .update(`blob ${contents.length}\0`)
        .update(contents)
        .digest('hex')
        .slice(0, 8);
}

const pageUpdates = new Map();

for (const [asset, pages] of Object.entries(assets)) {
    const contents = await readFile(path.join(siteRoot, asset));
    const versionedAsset = `${asset}?v=${gitBlobVersion(contents)}`;
    const escapedAsset = asset.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const assetPattern = new RegExp(`${escapedAsset}(?:\\?v=[a-f0-9]+)?`, 'g');

    for (const page of pages) {
        const current = pageUpdates.get(page) ?? await readFile(path.join(siteRoot, page), 'utf8');
        pageUpdates.set(page, current.replace(assetPattern, versionedAsset));
    }
}

for (const [page, updated] of pageUpdates) {
    const pagePath = path.join(siteRoot, page);
    const current = await readFile(pagePath, 'utf8');
    if (updated === current) continue;
    if (writeChanges) {
        await writeFile(pagePath, updated);
        console.log(`Updated ${page}`);
    } else {
        console.error(`${page} has stale asset versions. Run npm run version:assets.`);
        process.exitCode = 1;
    }
}
