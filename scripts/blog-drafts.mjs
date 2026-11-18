#!/usr/bin/env node
/**
 * 3000 Studios auto blog: SEO drafts generated from the studio's own catalog.
 *
 *   node scripts/blog-drafts.mjs generate        write new drafts to the review queue
 *   node scripts/blog-drafts.mjs list            show the queue and each draft's status
 *   node scripts/blog-drafts.mjs publish <slug>  move one approved draft onto the live blog
 *
 * Nothing is published automatically. `generate` only writes JSON drafts to
 * apps/web/content/blog-drafts/ (status "draft"). `publish` inserts the draft
 * into apps/web/src/data/blogArticles.ts in the exact shape the site-meta
 * generator parses, so the new post gets its route, meta and sitemap entry
 * on the next build.
 *
 * Every draft is built only from facts already in the repo: the Payhip book
 * catalog, the podcast episode list and the Aeropocalypse game data. No
 * model, no API key, no cost.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, 'apps/web');
const QUEUE = join(WEB, 'content/blog-drafts');
const ARTICLES_TS = join(WEB, 'src/data/blogArticles.ts');
const SITE = 'https://3000studios.vip';
const AUTHOR = 'Jeremy Swain';

const read = (p) => readFileSync(p, 'utf8');

/* ------------------------------- catalog -------------------------------- */
function loadBooks() {
  const ts = read(join(WEB, 'src/data/storeBooks.ts'));
  const books = [...ts.matchAll(/^\s*(\{"title":.*\}),?\s*$/gm)].map((m) => JSON.parse(m[1]));
  const shelves = [...ts.matchAll(/\{ id: '([a-z]+)', label: '([^']+)', blurb: '([^']+)' \}/g)].map((m) => ({
    id: m[1],
    label: m[2],
    blurb: m[3],
  }));
  const price = (ts.match(/STORE_PRICE = '([^']+)'/) || [])[1] || '$9.99';
  return { books, shelves, price };
}

function loadEpisodes() {
  const ts = read(join(WEB, 'src/data/podcastEpisodes.ts'));
  const eps = [];
  const re = /n:\s*(\d+),\s*\n\s*title:\s*(['"])((?:(?!\2).)+)\2,\s*\n\s*description:\s*\n?\s*(['"])((?:\\.|(?!\4).)*)\4/g;
  for (const m of ts.matchAll(re)) {
    eps.push({ n: Number(m[1]), title: m[3], description: m[5].replace(/\\'/g, "'").replace(/\\"/g, '"') });
  }
  return eps.sort((a, b) => a.n - b.n);
}

function loadGame() {
  const ts = read(join(WEB, 'src/data/aeropocalypse.ts'));
  const block = (name) => {
    const start = ts.indexOf(`export const ${name}`);
    const end = ts.indexOf('\n];', start);
    return ts.slice(start, end);
  };
  const field = (seg, key) => (seg.match(new RegExp(`${key}:\\s*(['"])((?:\\\\.|(?!\\1).)*)\\1`)) || [])[2];
  const items = (src) => src.split(/\n  \{\n/).slice(1);
  const bosses = items(block('AERO_BOSSES')).map((seg) => ({
    name: field(seg, 'name'),
    codename: field(seg, 'codename'),
    threat: field(seg, 'threatLevel'),
    environment: field(seg, 'environment'),
    weakness: field(seg, 'weakness'),
    attack: field(seg, 'signatureAttack'),
    description: field(seg, 'description'),
    level: Number((seg.match(/level:\s*(\d+)/) || [])[1] || 0),
  }));
  const ships = items(block('AERO_SHIPS')).map((seg) => ({
    name: field(seg, 'name'),
    role: field(seg, 'role'),
    special: field(seg, 'special'),
    unlocked: field(seg, 'unlockedAt'),
    description: field(seg, 'description'),
    speed: Number((seg.match(/speed:\s*(\d+)/) || [])[1] || 0),
    armor: Number((seg.match(/armor:\s*(\d+)/) || [])[1] || 0),
    firepower: Number((seg.match(/firepower:\s*(\d+)/) || [])[1] || 0),
  }));
  return { bosses, ships };
}

/* ------------------------------ helpers --------------------------------- */
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const listSentence = (arr) =>
  arr.length <= 1 ? arr.join('') : `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}`;
const readTime = (article) => {
  const words = [article.leadParagraph, ...article.sections.flatMap((s) => [s.heading, ...s.body])]
    .join(' ')
    .split(/\s+/).length;
  return `${Math.max(3, Math.round(words / 220))} min read`;
};
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

/* ------------------------------ topics ---------------------------------- */
function shelfArticle(shelf, books, price) {
  const titles = books.map((b) => b.title);
  const year = new Date().getFullYear();
  const article = {
    slug: slugify(`${shelf.label} books from 3000 Studios Press`),
    title: `${shelf.label} Books: ${books.length} Titles from 3000 Studios Press (${year} Guide)`,
    category: 'Books',
    author: AUTHOR,
    readTime: '',
    summary: `Every ${shelf.label.toLowerCase()} title from 3000 Studios Press in one place: ${books.length} original books by ${AUTHOR}, ${price} each as EPUB and PDF.`,
    leadParagraph: `Looking for ${shelf.label.toLowerCase()} books? 3000 Studios Press publishes ${books.length} original ${shelf.label.toLowerCase()} titles written by ${AUTHOR}. ${shelf.blurb} This guide lists every one, explains what each shelf offers, and shows exactly where to buy them.`,
    sections: [
      {
        heading: `The full ${shelf.label} shelf`,
        body: chunk(titles, 6).map(
          (group, i) =>
            `${i === 0 ? 'The shelf includes' : 'It also includes'} ${listSentence(group.map((t) => `“${t}”`))}.`,
        ),
      },
      {
        heading: 'Price and formats',
        body: [
          `Every title on the shelf is ${price}. Each purchase includes both EPUB and PDF, delivered at checkout from the studio store on Payhip, so the same book works on an e-reader, a tablet, a phone or a printer.`,
          `Print editions of the wider 3000 Studios Press catalog are distributed through IngramSpark, which means bookstores and libraries can order copies through their usual channels.`,
        ],
      },
      {
        heading: 'Where to buy',
        body: [
          `Open the Books page at ${SITE}/books and tap any cover to go straight to that title's checkout. The ${shelf.label} filter on that page shows only this shelf.`,
          `New releases and chapter previews land first in the free 3000 Studios Substack newsletter.`,
        ],
      },
      {
        heading: 'Frequently asked questions',
        body: [
          `How many ${shelf.label.toLowerCase()} books does 3000 Studios Press publish? ${books.length}, all listed above.`,
          `Who writes them? Every title is written by ${AUTHOR} and published under the 3000 Studios Press imprint.`,
          `What do I get? A ${price} purchase includes the EPUB and the PDF of the book.`,
        ],
      },
    ],
    tags: [shelf.label, 'Books', '3000 Studios Press', AUTHOR, 'Ebooks'],
  };
  article.readTime = readTime(article);
  return article;
}

function bossArticle(bosses) {
  const byThreat = new Map();
  for (const b of bosses) {
    if (!byThreat.has(b.threat)) byThreat.set(b.threat, []);
    byThreat.get(b.threat).push(b);
  }
  const article = {
    slug: 'aeropocalypse-online-boss-guide-weaknesses-and-attacks',
    title: `Aeropocalypse: Online Boss Guide: All ${bosses.length} Bosses, Weaknesses and Signature Attacks`,
    category: 'Game Guides',
    author: AUTHOR,
    readTime: '',
    summary: `A complete boss guide for Aeropocalypse: Online: every one of the ${bosses.length} bosses with its battleground, weak point and signature attack.`,
    leadParagraph: `Aeropocalypse: Online is the aerial combat shooter from 3000 Studios, on Android through Google Play. Every stage ends in a boss, and every boss has a weak point. This guide lists all ${bosses.length}, grouped by threat level, so you know where to aim before the fight starts.`,
    sections: [
      ...[...byThreat.entries()].map(([threat, list]) => ({
        heading: `${threat} threat bosses`,
        body: list
          .sort((a, b) => a.level - b.level)
          .map(
            (b) =>
              `${b.name} (${b.codename}), stage ${b.level}, ${b.environment}. Weak point: ${b.weakness}. Signature attack: ${b.attack}. ${b.description}`,
          ),
      })),
      {
        heading: 'How to play',
        body: [
          `Find Aeropocalypse: Online on Google Play, and see more of the game at aeropocalypse.online and on the game page at ${SITE}/aeropocalypse.`,
        ],
      },
    ],
    tags: ['Aeropocalypse', 'Boss Guide', 'Android Games', 'Shooter', '3000 Studios'],
  };
  article.readTime = readTime(article);
  return article;
}

function shipArticle(ships) {
  const best = (k) => ships.reduce((a, b) => (b[k] > a[k] ? b : a));
  const article = {
    slug: 'aeropocalypse-online-jets-guide-every-ship-compared',
    title: `Aeropocalypse: Online Jets Guide: All ${ships.length} Ships Compared`,
    category: 'Game Guides',
    author: AUTHOR,
    readTime: '',
    summary: `Every jet in Aeropocalypse: Online compared on speed, armor and firepower, with each ship's special ability and how to unlock it.`,
    leadParagraph: `Choosing a jet changes how Aeropocalypse: Online plays. There are ${ships.length} ships, each with its own role, special ability and balance of speed, armor and firepower. Here is every one, side by side.`,
    sections: [
      {
        heading: 'Quick picks',
        body: [
          `Fastest: ${best('speed').name} (speed ${best('speed').speed}). Toughest: ${best('armor').name} (armor ${best('armor').armor}). Hardest hitting: ${best('firepower').name} (firepower ${best('firepower').firepower}).`,
        ],
      },
      {
        heading: 'Every jet',
        body: ships.map(
          (s) =>
            `${s.name}, ${s.role}. Speed ${s.speed}, armor ${s.armor}, firepower ${s.firepower}. Special: ${s.special}. Unlock: ${s.unlocked}. ${s.description}`,
        ),
      },
      {
        heading: 'Where to play',
        body: [`Aeropocalypse: Online is on Google Play. More at aeropocalypse.online and ${SITE}/aeropocalypse.`],
      },
    ],
    tags: ['Aeropocalypse', 'Jets', 'Android Games', 'Shooter', '3000 Studios'],
  };
  article.readTime = readTime(article);
  return article;
}

function podcastArticle(eps) {
  const article = {
    slug: 'follow-and-subscribe-podcast-episode-guide',
    title: `Follow and Subscribe Podcast: Episode Guide to All ${eps.length} Episodes`,
    category: 'Podcast',
    author: AUTHOR,
    readTime: '',
    summary: `Every episode of Follow and Subscribe, the 3000 Studios podcast, with a one-line guide to each and where to watch or listen.`,
    leadParagraph: `Follow and Subscribe is the 3000 Studios podcast. It has ${eps.length} episodes so far, on YouTube and Spotify, with notes on Substack. Start anywhere with this guide.`,
    sections: [
      ...chunk(eps, 10).map((group) => ({
        heading: `Episodes ${group[0].n} to ${group[group.length - 1].n}`,
        body: group.map((e) => `Episode ${e.n}: ${e.title}. ${e.description}`),
      })),
      {
        heading: 'Where to watch and listen',
        body: [`Every episode is on the podcast page at ${SITE}/podcast, on the 3000 Studios YouTube channel and on Spotify.`],
      },
    ],
    tags: ['Podcast', 'Follow and Subscribe', '3000 Studios', 'YouTube', 'Spotify'],
  };
  article.readTime = readTime(article);
  return article;
}

/* ------------------------------- queue ---------------------------------- */
function publishedSlugs() {
  return new Set([...read(ARTICLES_TS).matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]));
}
function queueFiles() {
  if (!existsSync(QUEUE)) return [];
  return readdirSync(QUEUE).filter((f) => f.endsWith('.json'));
}
const draftPath = (slug) => join(QUEUE, `${slug}.json`);

function generate() {
  mkdirSync(QUEUE, { recursive: true });
  const { books, shelves, price } = loadBooks();
  const { bosses, ships } = loadGame();
  const eps = loadEpisodes();
  const candidates = [
    ...shelves.map((s) => ({ s, list: books.filter((b) => b.cat === s.id) })).filter((x) => x.list.length >= 3).map((x) => shelfArticle(x.s, x.list, price)),
    bosses.length ? bossArticle(bosses) : null,
    // The ship guide needs the full hangar in the data file (it lists only
    // the starter jets today), so it is generated once the list is complete.
    ships.length >= 12 ? shipArticle(ships) : null,
    eps.length ? podcastArticle(eps) : null,
  ].filter(Boolean);

  const live = publishedSlugs();
  let made = 0;
  for (const a of candidates) {
    if (live.has(a.slug) || existsSync(draftPath(a.slug))) continue;
    writeFileSync(
      draftPath(a.slug),
      `${JSON.stringify({ status: 'draft', generatedAt: new Date().toISOString().slice(0, 10), article: a }, null, 2)}\n`,
    );
    made += 1;
    console.log(`draft  ${a.slug}`);
  }
  console.log(`${made} new draft(s) in apps/web/content/blog-drafts (nothing published).`);
}

function list() {
  const live = publishedSlugs();
  for (const f of queueFiles()) {
    const d = JSON.parse(read(join(QUEUE, f)));
    const state = live.has(d.article.slug) ? 'published' : d.status;
    console.log(`${state.padEnd(10)} ${d.article.slug}`);
  }
}

const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
// Titles use double quotes when they contain an apostrophe, matching the
// existing file (the meta generator accepts either quote for titles only).
const qTitle = (s) => (s.includes("'") ? `"${s.replace(/"/g, '\\"')}"` : q(s));

function toTs(a) {
  const today = new Date().toISOString().slice(0, 10);
  const sections = a.sections
    .map(
      (s) =>
        `      {\n        heading: ${q(s.heading)},\n        body: [\n${s.body.map((p) => `          ${q(p)},`).join('\n')}\n        ],\n      },`,
    )
    .join('\n');
  return `  {
    slug: ${q(a.slug)},
    title: ${qTitle(a.title)},
    category: ${q(a.category)},
    author: ${q(a.author)},
    publishedAt: ${q(today)},
    updatedAt: ${q(today)},
    readTime: ${q(a.readTime)},
    summary: ${q(a.summary)},
    leadParagraph: ${q(a.leadParagraph)},
    sections: [
${sections}
    ],
    tags: [${a.tags.map(q).join(', ')}],
  },
`;
}

function publish(slug) {
  if (!slug) throw new Error('usage: node scripts/blog-drafts.mjs publish <slug>');
  const p = draftPath(slug);
  if (!existsSync(p)) throw new Error(`no draft named ${slug}`);
  if (publishedSlugs().has(slug)) throw new Error(`${slug} is already published`);
  const d = JSON.parse(read(p));
  const ts = read(ARTICLES_TS);
  const end = ts.lastIndexOf('];');
  if (end < 0) throw new Error('could not find the end of BLOG_ARTICLES');
  writeFileSync(ARTICLES_TS, `${ts.slice(0, end)}${toTs(d.article)}${ts.slice(end)}`);
  d.status = 'published';
  d.publishedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`published ${slug}. Run npm run meta:generate (or a full build), then commit.`);
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'generate') generate();
  else if (cmd === 'list') list();
  else if (cmd === 'publish') publish(arg);
  else {
    console.log('usage: node scripts/blog-drafts.mjs <generate|list|publish <slug>>');
    process.exitCode = 1;
  }
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
