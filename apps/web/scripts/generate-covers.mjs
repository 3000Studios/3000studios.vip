/**
 * Generate unique SVG album covers for every catalog track.
 * Uses existing photos when a mapping is provided; otherwise paints
 * a generative metallic-gold / neon abstract cover with the title.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.resolve(__dirname, '../public/media');
const coversDir = path.join(mediaDir, 'covers');
fs.mkdirSync(coversDir, { recursive: true });

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h, s, l) {
  return `hsl(${h % 360} ${s}% ${l}%)`;
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapTitle(title, max = 18) {
  const words = title.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > max && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 4);
}

function makeSvg(slug, title, rank) {
  const h = hash(slug + title);
  const hueA = h % 360;
  const hueB = (h >>> 8) % 360;
  const hueC = (h >>> 16) % 360;
  const mode = h % 5;
  const lines = wrapTitle(title);
  const shapes = [];

  for (let i = 0; i < 8; i++) {
    const seed = hash(`${slug}-${i}`);
    const x = (seed % 90) + 5;
    const y = ((seed >>> 7) % 90) + 5;
    const r = 18 + (seed % 90);
    const op = 0.12 + ((seed >>> 14) % 30) / 100;
    shapes.push(
      `<circle cx="${x}%" cy="${y}%" r="${r}" fill="${hsl(hueA + i * 28, 80, 55)}" opacity="${op.toFixed(2)}" />`,
    );
  }

  if (mode === 0) {
    shapes.push(
      `<rect x="8%" y="18%" width="84%" height="12%" rx="6" fill="${hsl(hueB, 90, 58)}" opacity="0.35" transform="rotate(-8 256 256)" />`,
    );
  } else if (mode === 1) {
    shapes.push(
      `<polygon points="256,40 470,430 42,430" fill="${hsl(hueC, 85, 50)}" opacity="0.22" />`,
    );
  } else if (mode === 2) {
    for (let i = 0; i < 12; i++) {
      shapes.push(
        `<rect x="${40 + i * 36}" y="${120 + (i % 3) * 40}" width="18" height="${80 + i * 18}" rx="9" fill="${hsl(hueA + i * 12, 75, 60)}" opacity="0.45" />`,
      );
    }
  } else if (mode === 3) {
    shapes.push(
      `<path d="M40,320 C140,120 360,120 470,320 S360,460 256,400 S40,460 40,320 Z" fill="${hsl(hueB, 70, 48)}" opacity="0.3" />`,
    );
  } else {
    shapes.push(
      `<circle cx="50%" cy="45%" r="120" fill="none" stroke="${hsl(hueC, 90, 62)}" stroke-width="14" opacity="0.55" />`,
      `<circle cx="50%" cy="45%" r="70" fill="none" stroke="#ffd700" stroke-width="6" opacity="0.7" />`,
    );
  }

  const textYs = lines.map((_, i) => 68 + i * 7);
  const textNodes = lines
    .map(
      (line, i) =>
        `<text x="50%" y="${textYs[i]}%" text-anchor="middle" font-family="Arial Black, Impact, sans-serif" font-size="${i === 0 ? 28 : 22}" fill="#fff8e7" stroke="rgba(0,0,0,0.55)" stroke-width="1.2" paint-order="stroke">${escapeXml(line)}</text>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="${hsl(hueA, 85, 42)}"/>
      <stop offset="55%" stop-color="${hsl(hueB, 70, 18)}"/>
      <stop offset="100%" stop-color="#050505"/>
    </radialGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffd700"/>
      <stop offset="100%" stop-color="#f0a500"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  ${shapes.join('\n  ')}
  <rect x="18" y="18" width="476" height="476" rx="28" fill="none" stroke="url(#gold)" stroke-width="3" opacity="0.75"/>
  <text x="50%" y="12%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" letter-spacing="4" fill="#ffd700" opacity="0.9">3000 STUDIOS</text>
  ${textNodes}
  <text x="50%" y="92%" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="rgba(255,215,0,0.75)" letter-spacing="3">#${String(rank).padStart(2, '0')} · VIP CATALOG</text>
</svg>`;
}

/** Existing photo art mapped by catalog slug */
const photoMap = {
  'always-late': null,
  'betty-boom-boom': 'Betty Boom Boom.jpg',
  'do-ya-think-my-shits-messy': 'Do you think my shits messy.jpg',
  'figgity-fa-kit': 'Figgity Fuck it.jpg',
  'fix-your-lane': 'Fix your lane.jpg',
  'i-always-feel-like': 'I always feel like.jpg',
  'i-always-feel-like-someones': 'Always Feel like.jpg',
  'i-grind-big-hustle': 'I grind big Hustle.jpg',
  'just-do-you-boo': 'Just do you boo.jpg',
  'late-night-porkchops-paige': 'late night pork chops.jpg',
  'lets-hear-it-for-king-j': 'Lets here it for king J.jpg',
  'oooo-weee': 'Ooo wee.jpg',
  'outkast-3000-studios-style': 'Outkast 3000 Studios.jpg',
  'ride-smooth': 'Ride Smooth.jpg',
  'so-fresh-so-cosmic': 'So fresh so cosmis.jpg',
  'waynes-world': 'waynes World.jpg',
  'waynes-world-laid-back-weezy-mix': 'waynes world 2.jpg',
  'wi-fi-fridge': 'wifi fridge.jpg',
  'lick-my-balls-jazz': 'lick-my-balls-jazz-cover.jpg',
  'lick-my-balls-remix': 'lick-my-balls-remix-cover.jpg',
};

// Catalog mirrors apps/web/src/data/music.ts rollout + feature
const catalog = [
  { slug: 'lick-my-balls-jazz', title: 'Lick My Balls Jazz Edition', rank: 1 },
  { slug: 'lick-my-balls-remix', title: 'Lick My Balls Remix', rank: 2 },
  { slug: 'always-late', title: 'Always Late', rank: 3 },
  { slug: 'am-i-wrong-good', title: 'Am I Wrong Good', rank: 4 },
  { slug: 'am-i-wrong-stp', title: 'Am I Wrong STP', rank: 5 },
  { slug: 'betty-boom-boom', title: 'Betty Boom Boom', rank: 6 },
  { slug: 'click-clack-3000-studios-original', title: 'Click Clack', rank: 7 },
  { slug: 'clogged-up-toilet-blues', title: 'Clogged Up Toilet Blues', rank: 8 },
  { slug: 'code-red', title: 'CODE RED', rank: 9 },
  { slug: 'dad', title: 'DAD', rank: 10 },
  { slug: 'do-ya-think-my-shits-messy', title: "Do Ya Think My Shit's Messy", rank: 11 },
  { slug: 'everlong-pretender', title: 'Everlong Pretender', rank: 12 },
  { slug: 'figgity-fa-kit', title: 'FIGGITY FA KIT', rank: 13 },
  { slug: 'fix-your-lane', title: 'Fix Your Lane', rank: 14 },
  { slug: 'fuck-redlights', title: 'Fuck Redlights', rank: 15 },
  { slug: 'go-the-other-way-player', title: 'Go the Other Way, Player', rank: 16 },
  { slug: 'i-always-feel-like-someones', title: "I Always Feel Like Someone's", rank: 17 },
  { slug: 'i-always-feel-like', title: 'I Always Feel Like', rank: 18 },
  { slug: 'i-bet-you-crooner', title: 'I Bet You Crooner', rank: 19 },
  { slug: 'i-grind-big-hustle', title: 'I Grind Big Hustle', rank: 20 },
  { slug: 'just-do-you-boo', title: 'Just Do You Boo', rank: 21 },
  { slug: 'late-night-porkchops-paige', title: 'Late Night Porkchops & Paige', rank: 22 },
  { slug: 'let-me-be', title: 'LET ME BE!!', rank: 23 },
  { slug: 'lets-hear-it-for-king-j', title: 'Lets Hear It For King J', rank: 24 },
  { slug: 'make-em-say-uhh-bathroom-edition', title: 'Make Em Say Uhh Bathroom', rank: 25 },
  { slug: 'meltdown-miestro', title: 'Meltdown Miestro', rank: 26 },
  { slug: 'my-neck-remix', title: 'My Neck Remix', rank: 27 },
  { slug: 'oooo-weee', title: 'OOoo Weee', rank: 28 },
  { slug: 'outkast-3000-studios-style', title: 'OUTKAST 3000 Style', rank: 29 },
  { slug: 'ride-smooth', title: 'Ride Smooth', rank: 30 },
  { slug: 'simp-bitch', title: 'Simp Bitch', rank: 31 },
  { slug: 'so-fresh-so-cosmic', title: 'So Fresh, So Cosmic', rank: 32 },
  { slug: 'squash-that-mother', title: 'Squash That Mother', rank: 33 },
  { slug: 'subwoofer-pressure-2', title: 'SUBWOOFER PRESSURE 2', rank: 34 },
  { slug: 'subwoofer-pressure', title: 'SUBWOOFER PRESSURE', rank: 35 },
  { slug: 'sunset-and-bliss-jnp', title: 'Sunset and Bliss (JnP)', rank: 36 },
  { slug: 'the-opera-v1', title: 'The Opera v1', rank: 37 },
  { slug: 'waynes-world-laid-back-weezy-mix', title: 'Waynes World Weezy Mix', rank: 38 },
  { slug: 'waynes-world', title: 'Waynes World', rank: 39 },
  { slug: 'wi-fi-fridge', title: 'Wi-Fi Fridge', rank: 40 },
];

const WALLPAPER_VARIANTS = [
  'spiral',
  'vortex',
  'electric',
  'blackhole',
  'pulse',
  'goldwave',
  'nebula',
  'chrome',
  'aurora',
  'inferno',
  'glitch',
  'ocean',
];

const mapOut = {};

for (const song of catalog) {
  const outSvg = path.join(coversDir, `${song.slug}.svg`);
  fs.writeFileSync(outSvg, makeSvg(song.slug, song.title, song.rank), 'utf8');

  let coverPath = `/media/covers/${song.slug}.svg`;
  const photo = photoMap[song.slug];
  if (photo) {
    const src = path.join(mediaDir, photo);
    if (fs.existsSync(src)) {
      const safe = `${song.slug}.jpg`;
      const dest = path.join(coversDir, safe);
      try {
        fs.copyFileSync(src, dest);
        coverPath = `/media/covers/${safe}`;
      } catch {
        // keep SVG
      }
    }
  }

  const h = hash(song.slug);
  mapOut[song.slug] = {
    cover: coverPath,
    palette: {
      a: `hsl(${h % 360} 80% 55%)`,
      b: `hsl(${(h >>> 8) % 360} 75% 48%)`,
      c: `hsl(${(h >>> 16) % 360} 70% 42%)`,
      gold: '#ffd700',
    },
    wallpaper: WALLPAPER_VARIANTS[h % WALLPAPER_VARIANTS.length],
  };
  console.log('cover', song.slug, '->', coverPath);
}

fs.writeFileSync(
  path.resolve(__dirname, '../src/data/coverMap.json'),
  JSON.stringify(mapOut, null, 2),
  'utf8',
);
console.log('Wrote coverMap.json +', catalog.length, 'covers');
