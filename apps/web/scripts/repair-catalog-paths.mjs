#!/usr/bin/env node
/**
 * Remap publishedSongs.generated.json `src` onto EXISTING public/media MP3s
 * (DistroKid-named or slug). Does NOT copy/duplicate files.
 *
 * Usage: node apps/web/scripts/repair-catalog-paths.mjs [--dry-run]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const mediaDir = join(webRoot, 'public/media');
const catalogPath = join(webRoot, 'src/data/publishedSongs.generated.json');
const mapPath = join(webRoot, 'src/data/mediaPathMap.generated.json');
const presentPath = join(webRoot, 'src/data/localMediaPresent.generated.json');
const dryRun = process.argv.includes('--dry-run');

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function stripArtistPrefix(filename) {
  let base = filename.replace(/\.mp3$/i, '');
  base = base.replace(/^3000\s+studios\s*[-–—_]?\s*/i, '');
  return normalize(base);
}

const TITLE_ALIASES = {
  'i always feel like': 'i-always-feel-like.mp3',
  'am i wrong': 'am-i-wrong-stp.mp3',
  'taqueesha cant never get right': "3000 Studios - Taqueesha Can't Never Get.mp3",
  'taqueesha cant never get': "3000 Studios - Taqueesha Can't Never Get.mp3",
  'tropical bass land': '3000 Studios - Tropical Bass Land.mp3',
  'built like a fart x black hole thumb mashup': '3000 Studios - Built Like a Fart.mp3',
  'after midnight blues': 'After Midnight Blues.mp3',
  '3000 studios podcast theme song': '3000 Studios - 3000 Studios Podcast Theme.mp3',
  'why do i not like my songs': '3000 Studios - Why Do I Not Like My Songs.mp3',
  'floor ya': 'Floor Ya.mp3',
  'betty boom boom': 'betty-boom-boom.mp3',
  'subwoofer pressure': 'subwoofer-pressure.mp3',
  'go the other way player': 'go-the-other-way-player.mp3',
  'not giving up tonight': 'not-giving-up-tonight.mp3',
  'quarter goblin': 'Quarter Goblin.mp3',
  'always feel like': 'always-feel-like.mp3',
  'the peepers': '3000 Studios - The Peepers.mp3',
  'click clack 3000 studios original': 'click-clack-3000-studios-original.mp3',
  'so fresh tribute': 'so-fresh-so-cosmic.mp3',
  'microwave cowboy': '3000 Studios - Microwave Cowboy.mp3',
  'code red': 'code-red.mp3',
  'die in a fire': 'lick-my-balls-jazz.mp3',
};

const mp3s = readdirSync(mediaDir).filter((f) => f.toLowerCase().endsWith('.mp3'));
const byKey = new Map();
for (const f of mp3s) {
  const key = stripArtistPrefix(f);
  if (key && !byKey.has(key)) byKey.set(key, f);
}

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const pathMap = {};
const missing = [];
const actions = [];

for (const row of catalog) {
  const nt = normalize(row.title);
  const slugFile = `${row.slug}.mp3`;
  let chosen = null;
  let how = null;

  if (TITLE_ALIASES[nt] && existsSync(join(mediaDir, TITLE_ALIASES[nt]))) {
    chosen = TITLE_ALIASES[nt];
    how = 'alias';
  } else if (existsSync(join(mediaDir, slugFile))) {
    chosen = slugFile;
    how = 'exact-slug';
  } else if (byKey.has(nt)) {
    chosen = byKey.get(nt);
    how = 'title-key';
  } else {
    const tokens = nt.split(' ').filter(Boolean);
    if (tokens.length >= 3) {
      let best = null;
      for (const [key, file] of byKey) {
        const kt = key.split(' ').filter(Boolean);
        if (kt.length && tokens.every((t) => kt.includes(t))) {
          const score = tokens.length / kt.length;
          if (score >= 0.7 && (!best || score > best.score)) best = { score, file };
        }
      }
      if (best) {
        chosen = best.file;
        how = `subset:${best.score.toFixed(2)}`;
      }
    }
  }

  if (chosen) {
    const src = `/media/${chosen}`;
    row.src = src;
    pathMap[row.slug] = src;
    actions.push({ slug: row.slug, src, how });
  } else {
    row.src = `/media/${row.slug}.mp3`;
    missing.push({
      slug: row.slug,
      title: row.title,
      src: row.src,
      todo: 'No matching MP3 on disk — do not invent; sync DistroKid master or keep Apple preview fallback',
    });
    actions.push({ slug: row.slug, action: 'missing' });
  }
}

if (!dryRun) {
  writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
  writeFileSync(mapPath, JSON.stringify(pathMap, null, 2) + '\n');
  writeFileSync(presentPath, JSON.stringify(Object.keys(pathMap).sort(), null, 2) + '\n');
}

const summary = {
  mode: 'remap-only-no-copies',
  dry_run: dryRun,
  mapped_count: Object.keys(pathMap).length,
  missing_count: missing.length,
  actions,
  missing,
};
writeFileSync(resolve(webRoot, '../../../catalog_repair_actions.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ mapped: summary.mapped_count, missing: summary.missing_count, dry_run: dryRun }, null, 2));
