#!/usr/bin/env node
/**
 * Crew A (serving layer) — site meta generator.
 *
 * Derives the route -> meta map for 3000studios.vip from the real app sources
 * and writes:
 *   - apps/web/functions/lib/route-meta.generated.ts  (consumed by the Pages
 *     Functions middleware for per-route head injection, 404s, redirects)
 *   - apps/web/public/sitemap.xml                     (all indexable routes)
 *   - apps/web/public/llms.txt                        (real studio llms.txt)
 *
 * Sources of truth (read-only here; owned by other crews):
 *   - apps/web/src/main.tsx                 (router + <Titled> meta)
 *   - apps/web/src/data/publishedSongs.generated.json  (song catalog)
 *   - apps/web/src/data/officialReleases.generated.json + officialReleases.ts
 *                                           (video id / duration per song)
 *   - apps/web/src/data/blogArticles.ts     (blog posts)
 * Crew B contracts (optional; re-run this generator after they land):
 *   - apps/web/src/data/explicit-routes.json  -> routes get noindex + no ads
 *     and are excluded from the sitemap.
 *   - apps/web/src/data/redirects.json        -> {from,to} pairs become 301s
 *     in the middleware and the loser slugs leave the sitemap.
 *
 * Usage: node scripts/generate-site-meta.mjs [--check]
 *   --check  fail if the generated files are stale (do not write).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, 'apps', 'web');
const ORIGIN = 'https://3000studios.vip';
const SITE = '3000 Studios VIP';
const DEFAULT_OG_IMAGE = `${ORIGIN}/media/official-3000-studios-profile.png`;

const read = (p) => readFileSync(p, 'utf8');
const normTitle = (s) =>
  (s || '').toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

/* ---------------------------------- songs --------------------------------- */
const published = JSON.parse(read(join(WEB, 'src/data/publishedSongs.generated.json')));
const officialGenerated = JSON.parse(
  read(join(WEB, 'src/data/officialReleases.generated.json')),
);
const officialTs = read(join(WEB, 'src/data/officialReleases.ts'));

const videoByTitle = new Map();
for (const v of officialGenerated) {
  if (v && v.title && v.videoId) videoByTitle.set(normTitle(v.title), v);
}
for (const m of officialTs.matchAll(
  /\{\s*title:\s*(['"])((?:(?!\1).)+)\1,\s*videoId:\s*'([^']+)',\s*release:\s*'([^']+)',\s*duration:\s*'([^']+)'\s*\}/g,
)) {
  const [, , title, videoId, release, duration] = m;
  videoByTitle.set(normTitle(title), { title, videoId, release, duration });
}

const songs = [];
const seenSlugs = new Set();
for (const row of published) {
  if (!row || !row.slug || seenSlugs.has(row.slug)) continue; // first wins (Crew B dedupes data)
  seenSlugs.add(row.slug);
  const video =
    videoByTitle.get(normTitle(row.title)) ||
    videoByTitle.get(normTitle(row.slug.replace(/-/g, ' ')));
  // Two catalog rows store the slug as their title ("code-red", "snukit").
  // Prefer the official release title; otherwise humanize the slug. The data
  // fix itself is Crew B's — this only keeps served titles human-readable.
  let title = row.title;
  if (title === row.slug) {
    const official = video?.title;
    title =
      official && official !== row.title && !official.includes('-')
        ? official
        : row.slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
  songs.push({
    slug: row.slug,
    title,
    cover: row.cover || '',
    apple: row.apple || row.buy || '',
    youtubeId: (row.youtubeId || video?.videoId || '').trim(),
    duration: video?.duration || '',
  });
}
songs.sort((a, b) => a.slug.localeCompare(b.slug));

/* ---------------------------------- blog ---------------------------------- */
const blogTs = read(join(WEB, 'src/data/blogArticles.ts'));
const articles = [];
for (const m of blogTs.matchAll(
  /slug:\s*'([^']+)',\s*\n\s*title:\s*(['"])((?:(?!\2).)+)\2,[\s\S]{0,400}?summary:\s*'((?:[^'\\]|\\.)*)'/g,
)) {
  articles.push({ slug: m[1], title: m[3], summary: m[4].replace(/\\'/g, "'") });
}
// Full article bodies (lead + sections) so each /blog/<slug> route can serve
// its complete text to crawlers and no-JS readers, not just its summary.
const unesc = (s) => s.replace(/\\'/g, "'").replace(/\\"/g, '"');
const slugIdx = [...blogTs.matchAll(/slug:\s*'([^']+)'/g)];
for (let i = 0; i < slugIdx.length; i++) {
  const art = articles.find((a) => a.slug === slugIdx[i][1]);
  if (!art) continue;
  const seg = blogTs.slice(slugIdx[i].index, i + 1 < slugIdx.length ? slugIdx[i + 1].index : undefined);
  const lead = seg.match(/leadParagraph:\s*'((?:[^'\\]|\\.)*)'/);
  if (lead) art.leadParagraph = unesc(lead[1]);
  art.sections = [];
  for (const sm of seg.matchAll(/heading:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*body:\s*\[([\s\S]*?)\n\s*\]/g)) {
    const body = [...sm[2].matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((b) => unesc(b[1]));
    art.sections.push({ heading: unesc(sm[1]), body });
  }
}

/* ------------------------------ static routes ----------------------------- */
const mainTs = read(join(WEB, 'src/main.tsx'));
const titled = new Map();
// Segment-scoped extraction: split the router table at each `path:` so a
// route's <Titled> meta is only ever read from its OWN route block. The old
// single-regex scan let a route with no <Titled> nearby (or a dynamic route)
// swallow the NEXT route's meta across the window — which silently dropped
// /music, /sponsors and /privacy from the served route table (live 404 +
// noindex on two revenue pages; fixed 2026-10-27, business audit P0-4/P0-3).
for (const segment of mainTs.split(/(?=path:\s*')/)) {
  const pm = segment.match(/^path:\s*'([^']+)'/);
  if (!pm) continue;
  const path = pm[1];
  // Only absolute top-level routes belong in the served table; relative
  // paths are nested children of protected layouts (e.g. the vault's).
  // Dynamic segments and the catch-all have no <Titled> meta of their own;
  // '/privacy-policy' is a <Navigate> alias of '/privacy', not a page.
  if (!path.startsWith('/') || path.includes(':') || path.includes('*') || path === '/privacy-policy') continue;
  const tm = segment.match(/title="([^"]+)"[\s\S]{0,300}?description="([^"]+)"/);
  if (tm) titled.set(path, { title: tm[1], description: tm[2] });
}

const brand = (t) => (t === SITE || t.endsWith(`— ${SITE}`) ? t : `${t} — ${SITE}`);

// Hand-authored meta for routes whose pages set no <Titled> meta in main.tsx
// (copy mirrors the pages themselves: AboutPage, ContactPage, LegalPage,
// v3 HomePage, NotFoundPage).
const HAND = {
  '/': {
    title: '3000 Studios VIP — Official Music & Live Stage',
    description:
      '3000 Studios — original music, cinematic videos, and live broadcasts from Acworth, Georgia. New singles weekly, on all platforms.',
  },
  '/about': {
    title: brand('About'),
    description:
      '3000 Studios is an independent, AI-driven music and media studio in Acworth, Georgia — original music, cinematic video, games, and live broadcasts.',
  },
  '/contact': {
    title: brand('Contact'),
    description:
      'Book 3000 Studios — sync licenses, music features, live stream bookings, brand sponsorships, and press. Reach Jeremy Swain directly.',
  },
  '/terms': {
    title: brand('Terms Of Use'),
    description:
      'Terms of use for 3000studios.vip — lawful use, community behavior, and content rules for 3000 Studios music, video, and media.',
  },
  '/copyright': {
    title: brand('Copyright & DMCA'),
    description:
      'Copyright and DMCA policy for 3000 Studios — ownership of original music, video, and graphics, plus takedown and licensing requests.',
  },
  '/cookies': {
    title: brand('Cookie Notice'),
    description:
      'Cookie notice for 3000studios.vip — how 3000 Studios uses necessary storage, analytics, and advertising cookies.',
  },
  '/disclaimer': {
    title: brand('Legal Disclaimer'),
    description:
      'Legal disclaimer for 3000 Studios — the site provides music, media, and entertainment information, not professional advice.',
  },
};

// Routes that exist but must never be indexed (owner/protected surfaces).
const NOINDEX_PATHS = ['/command-deck', '/go-live', '/admin', '/agent', '/vault', '/office'];
const NOINDEX_TITLES = {
  '/command-deck': { title: brand('Command Deck'), description: 'Owner dashboard — content stats and unlock payment controls.' },
  '/go-live': { title: brand('Go Live'), description: 'Start a 3000 Studios live broadcast from your phone.' },
  '/admin': { title: brand('Admin'), description: '3000 Studios admin.' },
  '/agent': { title: brand('Agent Command Center'), description: '3000 Studios agent command center.' },
  '/vault': { title: brand('Vault'), description: '3000 Studios operator console.' },
  '/office': { title: brand('The Office'), description: "Owner's office — private live window." },
};

/* --------------------------- crew B contracts ----------------------------- */
function readJsonIfExists(name) {
  const p = join(WEB, 'src/data', name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(read(p));
  } catch {
    return null;
  }
}

const explicitRaw = readJsonIfExists('explicit-routes.json');
const explicitRoutes = new Set();
if (Array.isArray(explicitRaw)) {
  for (const r of explicitRaw) explicitRoutes.add(typeof r === 'string' ? r : r?.route || r?.path || '');
} else if (explicitRaw && typeof explicitRaw === 'object') {
  for (const r of explicitRaw.routes || explicitRaw.explicit || []) {
    explicitRoutes.add(typeof r === 'string' ? r : r?.route || r?.path || '');
  }
}
explicitRoutes.delete('');
const hasExplicitFile = explicitRaw !== null;
// Privacy routes ride along in explicit-routes.json because the app-side
// ad gate (explicitAdsGate) reads that one file — ads stay OFF on legal
// pages. But a privacy policy must stay INDEXABLE: the AdSense site
// standard and app-store review both require a crawlable policy, so for
// these routes the explicit flag means no-ads ONLY, never noindex.
const PRIVACY_ROUTES = new Set([
  '/privacy',
  '/aeropocalypse/privacy',
  '/thunder-dome/privacy',
  '/thunderdome-privacy',
]);

const redirectsRaw = readJsonIfExists('redirects.json');
const redirects = {};
if (Array.isArray(redirectsRaw)) {
  for (const r of redirectsRaw) {
    if (r && r.from && r.to) redirects[r.from] = r.to;
  }
} else if (redirectsRaw && typeof redirectsRaw === 'object') {
  for (const [from, to] of Object.entries(redirectsRaw)) {
    if (typeof to === 'string') redirects[from] = to;
  }
}

/* ------------------------------- route table ------------------------------ */
const routes = {}; // path -> meta (static, exact)
function addStatic(path, meta) {
  routes[path] = meta;
}
for (const [path, meta] of Object.entries(HAND)) addStatic(path, meta);
for (const [path, meta] of titled) {
  if (NOINDEX_PATHS.includes(path)) continue;
  if (!routes[path]) addStatic(path, { title: brand(meta.title), description: meta.description });
}
for (const path of NOINDEX_PATHS) {
  addStatic(path, { ...(NOINDEX_TITLES[path] || { title: brand(path), description: '' }), noindex: true });
}

const songMeta = {};
for (const s of songs) {
  const path = `/song/${s.slug}`;
  if (redirects[path]) continue; // loser slug: middleware 301s it, not a page
  songMeta[s.slug] = {
    title: `${s.title} — ${SITE}`,
    description: `Listen to "${s.title}" by 3000 Studios — official music, video, and streaming links.`,
    image: s.cover.startsWith('https://') ? s.cover : DEFAULT_OG_IMAGE,
    type: 'music.song',
    song: {
      title: s.title,
      slug: s.slug,
      cover: s.cover,
      apple: s.apple,
      youtubeId: s.youtubeId,
      duration: s.duration,
    },
  };
}

const blogMeta = {};
for (const a of articles) {
  blogMeta[a.slug] = {
    title: brand(a.title),
    description: a.summary,
    type: 'article',
  };
}

for (const path of explicitRoutes) {
  if (routes[path]) {
    routes[path] = PRIVACY_ROUTES.has(path)
      ? { ...routes[path], noads: true }
      : { ...routes[path], noindex: true, noads: true };
  }
  const song = path.match(/^\/song\/(.+)$/);
  if (song && songMeta[song[1]]) songMeta[song[1]] = { ...songMeta[song[1]], noindex: true, noads: true };
  const blog = path.match(/^\/blog\/(.+)$/);
  if (blog && blogMeta[blog[1]]) blogMeta[blog[1]] = { ...blogMeta[blog[1]], noindex: true, noads: true };
}

/* ------------------------- completeness gate ------------------------------ */
// Every public router path MUST land in the served route table. If a route
// is added to main.tsx without meta (or extraction regresses), fail the
// build loudly instead of shipping a live 404 + noindex like /music and
// /sponsors had. Dynamic segments and the /privacy-policy alias are exempt.
{
  const routerPaths = [...mainTs.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
  const missing = routerPaths.filter(
    (p) =>
      p.startsWith('/') &&
      !p.includes(':') &&
      !p.includes('*') &&
      p !== '/privacy-policy' &&
      !routes[p],
  );
  if (missing.length) {
    console.error(
      `generate-site-meta: router paths missing from the route table: ${missing.join(', ')}\n` +
        'Add <Titled> meta in main.tsx or a HAND entry in this generator, then re-run.',
    );
    process.exit(1);
  }
}

/* --------------------- crawlable body content (2026-11-07) -------------------
 * AdSense "low value content" fix: the SPA shell's <body> is empty without
 * JavaScript, so reviewers and crawlers saw no substance on any page. The
 * Pages middleware now injects this real per-route body content — built
 * here from the same source data the app renders — into the shell's #root.
 * The React app replaces it on boot for JavaScript visitors; crawlers and
 * no-JS readers get the full text. Copy mirrors the pages themselves.
 */
const escHtml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
const POLICY_NAV =
  '<nav aria-label="Site information"><p>' +
  '<a href="/privacy">Privacy Policy</a> · <a href="/terms">Terms</a> · ' +
  '<a href="/about">About</a> · <a href="/contact">Contact</a> · ' +
  '<a href="/books">Books</a> · <a href="/podcast">Podcast</a> · ' +
  '<a href="/music">Music</a></p></nav>';
const wrapMain = (inner) => `<main>\n${inner}\n${POLICY_NAV}\n</main>`;

/* Podcast episodes — parsed from the same catalog the /podcast page renders. */
const podTs = read(join(WEB, 'src/data/podcastEpisodes.ts'));
const podEpisodes = [];
for (const m of podTs.matchAll(
  /\{\s*n: (\d+),\s*title: '((?:[^'\\]|\\.)*)',\s*description:\s*'((?:[^'\\]|\\.)*)',\s*youtubeId: '([^']+)',(?:\s*spotifyUrl: '([^']+)',)?/g,
)) {
  podEpisodes.push({
    n: Number(m[1]),
    title: m[2].replace(/\\'/g, "'"),
    description: m[3].replace(/\\'/g, "'"),
    youtubeId: m[4],
    spotifyUrl: m[5] || '',
  });
}
podEpisodes.sort((a, b) => a.n - b.n);

/* Books — the array literal in src/data/books.ts is plain JSON syntax. */
const booksTs = read(join(WEB, 'src/data/books.ts'));
let books = [];
{
  const start = booksTs.indexOf('export const BOOKS: BookEntry[] =');
  const open = booksTs.indexOf('= [', start) + 2;
  let depth = 0;
  let end = -1;
  for (let i = open; i < booksTs.length; i++) {
    if (booksTs[i] === '[') depth++;
    else if (booksTs[i] === ']') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (start >= 0 && end > open) books = JSON.parse(booksTs.slice(open, end + 1));
}

/* Aeropocalypse bosses — parsed from the game's real roster data. */
const tdTs = read(join(WEB, 'src/data/aeropocalypse.ts'));
const bosses = [];
for (const m of tdTs.matchAll(
  /\{\s*id: (\d+),\s*name: '((?:[^'\\]|\\.)*)',\s*codename: '([^']+)',\s*level: (\d+),\s*threatLevel: '([^']+)',\s*environment: '((?:[^'\\]|\\.)*)',\s*weakness: '((?:[^'\\]|\\.)*)',\s*signatureAttack: '((?:[^'\\]|\\.)*)',\s*description: '((?:[^'\\]|\\.)*)',/g,
)) {
  bosses.push({
    name: m[2].replace(/\\'/g, "'"),
    codename: m[3],
    level: Number(m[4]),
    threatLevel: m[5],
    environment: m[6].replace(/\\'/g, "'"),
    signatureAttack: m[8].replace(/\\'/g, "'"),
    description: m[9].replace(/\\'/g, "'"),
  });
}
bosses.sort((a, b) => a.level - b.level);

/* -------------------- shop / beats / apps / projects data -------------------- */
const parseItems = (file, re) => {
  try {
    return [...read(join(WEB, file)).matchAll(re)];
  } catch {
    return [];
  }
};
const merchItems = parseItems(
  'src/data/merch.ts',
  /title:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*priceCents:\s*(\d+),[\s\S]{0,200}?blurb:\s*'((?:[^'\\]|\\.)*)',[\s\S]{0,300}?stripe:\s*'([^']+)'/g,
).map((m) => ({ title: unesc(m[1]), price: `$${(Number(m[2]) / 100).toFixed(2)}`, blurb: unesc(m[3]), stripe: m[4] }));
const beatItems = parseItems(
  'src/data/beats.ts',
  /title:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*handle:\s*'([^']+)',\s*\n\s*priceCents:\s*(\d+),[\s\S]{0,120}?blurb:\s*'((?:[^'\\]|\\.)*)'/g,
).map((m) => ({ title: unesc(m[1]), handle: m[2], price: `$${(Number(m[3]) / 100).toFixed(2)}`, blurb: unesc(m[4]) }));
const studioApps = parseItems(
  'src/data/appsData.ts',
  /name:\s*'((?:[^'\\]|\\.)*)',[\s\S]{0,300}?tagline:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*description:\s*'((?:[^'\\]|\\.)*)'/g,
).map((m) => ({ name: unesc(m[1]), tagline: unesc(m[2]), description: unesc(m[3]) }));
const studioProjects = parseItems(
  'src/data/projectsData.ts',
  /title:\s*'((?:[^'\\]|\\.)*)',[\s\S]{0,200}?summary:\s*'((?:[^'\\]|\\.)*)',\s*\n\s*story:\s*'((?:[^'\\]|\\.)*)'/g,
).map((m) => ({ title: unesc(m[1]), summary: unesc(m[2]), story: unesc(m[3]) }));

const routeContent = {};

routeContent['/'] = wrapMain(
  `<h1>3000 Studios VIP — Official Music &amp; Live Stage</h1>
<p>3000 Studios is an independent music and media studio in Acworth, Georgia, run by Jeremy Swain — original music, cinematic video, the Follow and Subscribe podcast, books from 3000 Studios Press, and the game AEROPOCALYPSE: ONLINE. New singles weekly, on all platforms.</p>
<h2>Music Vault</h2>
<p>${songs.length} published songs. Every track previews free for one minute on this site; full songs stream on Apple Music, Spotify, and every major platform. <a href="/music">Browse the Music Vault</a>.</p>
<h2>Follow and Subscribe — The 3000 Studios Podcast</h2>
<p>${podEpisodes.length} episodes with hosts Follow and Subscribe: the day's biggest story, tech talk, a featured 3000 Studios song, and a surprise caller in every episode. <a href="/podcast">Watch and listen to every episode</a>.</p>
<h2>Books — 3000 Studios Press</h2>
<p>Books by Jeremy Swain: fiction, mystery, cookbooks, and creator guides. Ebooks are sold direct from the studio store; print editions are distributed through IngramSpark. <a href="/books">Browse the books</a>.</p>
<h2>AEROPOCALYPSE: ONLINE</h2>
<p>An arcade flight combat game — 25 stages and 25 boss encounters, in closed testing on Google Play. <a href="/aeropocalypse">Enter the cinematic theater and join the launch list</a>.</p>
<h2>More from the studio</h2>
<p><a href="/video">Official videos</a> · <a href="/blog">Blog and studio notes</a> · <a href="/live">Live broadcasts</a> · <a href="/beats">Beat packs for license</a> · <a href="/about">About the studio</a></p>`,
);

routeContent['/podcast'] = wrapMain(
  `<h1>Follow and Subscribe — The 3000 Studios Podcast</h1>
<p>Follow and Subscribe is the 3000 Studios podcast, hosted by Follow and Subscribe. Every episode opens with the day and the weather in Acworth, Georgia, takes on the biggest story going, talks tech, features a 3000 Studios song, and takes a surprise call — then signs off the same way every time: stay mentally happy, and mentally healthy. Watch free on YouTube or listen on Spotify.</p>
<p>Show pages: <a href="https://www.youtube.com/@3000Studio">YouTube — @3000Studio</a> · <a href="https://open.spotify.com/show/033SHVotmOb7vSOUOOcmFI">Spotify — 3000 Studios Podcast</a> · <a href="https://3000studios.substack.com">Substack — 3000 Studios</a></p>` +
    podEpisodes
      .map(
        (ep) => `
<article>
<h2>Ep. ${ep.n} — ${escHtml(ep.title)}</h2>
<p>${escHtml(ep.description)}</p>
<p><a href="https://www.youtube.com/watch?v=${ep.youtubeId}">Watch on YouTube</a>${
          ep.spotifyUrl ? ` · <a href="${ep.spotifyUrl}">Listen on Spotify</a>` : ''
        }</p>
</article>`,
      )
      .join(''),
);

routeContent['/books'] = wrapMain(
  `<h1>Books — 3000 Studios Press</h1>
<p>Books by Jeremy Swain, published under the 3000 Studios Press imprint. The ebooks below are sold direct from the studio store on Payhip — $9.99 each, EPUB + PDF delivered at checkout: <a href="https://payhip.com/3000Studios">payhip.com/3000Studios</a>. Print editions are distributed through IngramSpark to bookstores and libraries worldwide.</p>` +
    books
      .map(
        (b) => `
<article>
<h2>${escHtml(b.title)}</h2>
<p><em>${escHtml(b.subtitle)}</em></p>
<p>${escHtml(b.categories)}</p>
<p>${escHtml(b.description)}</p>
<p><a href="https://payhip.com/3000Studios">Buy the ebook — $9.99</a> · EPUB + PDF · by Jeremy Swain · 3000 Studios Press</p>
</article>`,
      )
      .join('') +
    `
<h2>More ways to read</h2>
<p>Grow the Channel, Compounding Content, and The Twelve Cookies of Christmas are also published on Leanpub. The wider 3000 Studios Press catalog — 44 published titles across fiction, mystery, cookbooks, and creator guides — is distributed in print through IngramSpark, so bookstores and libraries can order copies through their usual channels. Selected ebooks also appear on Kobo and XinXii.</p>`,
);

routeContent['/about'] = wrapMain(
  `<h1>About 3000 Studios</h1>
<p>Independent AI-driven music production, cinematic video, games, and creator media — from Acworth, Georgia to every screen on earth.</p>
<h2>Built Different</h2>
<p>3000 Studios is an independent music production label and creator media brand founded by Jeremy Swain. Every release begins in the studio: original songwriting, cutting-edge AI production assistance, and meticulous human arrangement, vocal production, mixing, and mastering.</p>
<p>The catalog is distributed globally across Spotify, Apple Music, YouTube, and all major platforms via DistroKid. Songs play as 1-minute previews right here, full tracks live on the streaming platforms, and the official videos play free via YouTube.</p>
<p>Beyond music: Aeropocalypse, a ${bosses.length}-boss arcade combat game; a growing apps lab; books from 3000 Studios Press; the Follow and Subscribe podcast; and a live broadcast stage. One studio, every medium.</p>
<p>The catalog today: ${songs.length} released tracks, ${podEpisodes.length} podcast episodes, ${books.length} books in the studio store, and ${articles.length} published blog articles.</p>`,
);

routeContent['/contact'] = wrapMain(
  `<h1>Book the Studio — Contact 3000 Studios</h1>
<p>Sync licenses, music features, live stream bookings, brand sponsorships, and press — reach Jeremy Swain directly.</p>
<p>3000 Studios is an independent music and media label run by Jeremy Swain out of Acworth, Georgia. Every message from the contact page lands in the studio inbox — pick the route that fits and include your timeline so the reply can be specific.</p>
<h2>Booking, sync &amp; press</h2>
<p>Email <a href="mailto:mr.jwswain@gmail.com">mr.jwswain@gmail.com</a> directly, or use the contact form on this page. For team and VIP list matters, write to <a href="mailto:Team@3000studios.vip">Team@3000studios.vip</a>.</p>
<h2>Looking for something specific?</h2>
<p>Song and video requests go through <a href="/requests">Requests</a>; homepage sponsorship slots are on <a href="/sponsors">Sponsors</a>; beat packs and licensing live on <a href="/beats">Beat Packs</a>; books are on the <a href="/books">Books</a> page; and merch is in the <a href="/shop">Shop</a>.</p>`,
);

routeContent['/music'] = wrapMain(
  `<h1>Music Vault — 3000 Studios</h1>
<p>The 3000 Studios catalog: ${songs.length} published songs. Every track previews free for one minute on this site; full tracks stream on Apple Music, Spotify, and every major platform.</p>
<ul>
${songs
  .map(
    (s) =>
      `<li><a href="/song/${s.slug}">${escHtml(s.title)}</a>${s.duration ? ` — ${escHtml(s.duration)}` : ''}</li>`,
  )
  .join('\n')}
</ul>`,
);

routeContent['/blog'] = wrapMain(
  `<h1>Blog — 3000 Studios</h1>
<p>News, stories, and studio notes from 3000 Studios.</p>` +
    articles
      .map(
        (a) => `
<article>
<h2><a href="/blog/${a.slug}">${escHtml(a.title)}</a></h2>
<p>${escHtml(a.summary)}</p>
</article>`,
      )
      .join(''),
);

routeContent['/aeropocalypse'] = wrapMain(
  `<h1>AEROPOCALYPSE: ONLINE</h1>
<p>AEROPOCALYPSE: ONLINE by 3000 Studios is an arcade flight combat game — 25 stages, 25 boss encounters, 15 jets, 19 weapons, 32 paint schemes, and a 30-track soundtrack — currently in closed testing on Google Play and launching soon. The full cinematic premieres in the theater on the game page; meet the full roster below and join the launch list.</p>
<h2>The boss roster</h2>` +
    bosses
      .map(
        (b) => `
<article>
<h3>Level ${b.level} — ${escHtml(b.name)} (${escHtml(b.codename)})</h3>
<p>Threat class ${escHtml(b.threatLevel)} · ${escHtml(b.environment)} · Signature attack: ${escHtml(b.signatureAttack)}</p>
<p>${escHtml(b.description)}</p>
</article>`,
      )
      .join(''),
);

// Full blog article bodies — the complete text of every post, served in the
// prerendered shell so a review (human or automated) sees the real article.
for (const a of articles) {
  if (!a.sections || a.sections.length === 0) continue;
  routeContent[`/blog/${a.slug}`] = wrapMain(
    `<h1>${escHtml(a.title)}</h1>
<p>${escHtml(a.leadParagraph || a.summary)}</p>` +
      a.sections
        .map(
          (sec) => `
<h2>${escHtml(sec.heading)}</h2>
${sec.body.map((p) => `<p>${escHtml(p)}</p>`).join('\n')}`,
        )
        .join('') +
      `
<p><a href="/blog">More from the 3000 Studios blog</a></p>`,
  );
}

routeContent['/shop'] = wrapMain(
  `<h1>Shop — 3000 Studios VIP</h1>
<p>The official 3000 Studios shop: signature merch, Vault passes with stem downloads, and the homepage sponsor slot. Every item checks out through Stripe; prices are in USD and exactly what the product cards on this page show.</p>` +
    merchItems
      .map(
        (it) => `
<article>
<h2>${escHtml(it.title)} — ${it.price}</h2>
<p>${escHtml(it.blurb)}</p>
<p><a href="${it.stripe}">Buy with Stripe</a></p>
</article>`,
      )
      .join('') +
    `
<h2>Books and beats</h2>
<p>Books by Jeremy Swain are sold on the <a href="/books">Books</a> page through Payhip, and instrumental beat packs live on <a href="/beats">Beat Packs</a>. Payment card details are entered on the payment provider's own page — 3000 Studios never sees or stores your card number, as set out in the <a href="/privacy">Privacy Policy</a>.</p>`,
);

routeContent['/beats'] = wrapMain(
  `<h1>Beat Packs — 3000 Studios VIP</h1>
<p>License-ready instrumentals from the 3000 Studios catalog. Each beat is the instrumental of a released 3000 Studios track, delivered as an instant MP3 download after checkout through the studio storefront at boughtitonline.com. Buy single beats, or take the complete bundle and save.</p>` +
    beatItems
      .map(
        (b) => `
<article>
<h2>${escHtml(b.title)} — ${b.price}</h2>
<p>${escHtml(b.blurb)}</p>
<p><a href="https://boughtitonline.com/products/${b.handle}">Buy the instrumental</a></p>
</article>`,
      )
      .join('') +
    `
<article>
<h2>3000 Studios Complete Instrumental Bundle (16 Tracks) — $49.00</h2>
<p>Every instrumental in the catalog. One download. One price — $49.00 against $112.00 bought individually.</p>
<p><a href="https://boughtitonline.com/products/3000-studios-complete-instrumental-bundle-16-tracks">Buy the bundle</a></p>
</article>
<h2>Licensing questions</h2>
<p>For sync licensing, exclusives, and custom production, contact the studio through the <a href="/contact">Contact</a> page before purchasing so the right license can be written for your project.</p>`,
);

routeContent['/video'] = wrapMain(
  `<h1>Video Vault — 3000 Studios VIP</h1>
<p>Official 3000 Studios music videos and Aeropocalypse cinematics — free to watch via YouTube, right here on the site.</p>
<h2>Music videos</h2>
<p>Every single from the ${songs.length}-song catalog gets an official video on the 3000 Studios YouTube channel. Watch the videos here, then stream the full tracks on Apple Music, Spotify, and every major platform — the songs themselves live in the <a href="/music">Music Vault</a>.</p>
<h2>Aeropocalypse cinematics</h2>
<p>The opening, mid-game, and finale cinematics from AEROPOCALYPSE: ONLINE, the studio's 25-boss arcade flight combat game, screen in the vault alongside the music videos. Meet the full boss roster on the <a href="/aeropocalypse">Aeropocalypse page</a>.</p>
<h2>Live broadcasts</h2>
<p>Studio sessions, release drops, and game streams broadcast from the <a href="/live">Live stage</a> and are archived to the same YouTube channel.</p>`,
);

routeContent['/apps'] = wrapMain(
  `<h1>Apps — 3000 Studios VIP</h1>
<p>Apps and interactive projects from 3000 Studios: production audio tools, the Aeropocalypse game engine, and the studio's own web platform — designed, built, and maintained in-house in Acworth, Georgia.</p>` +
    studioApps
      .map(
        (a) => `
<article>
<h2>${escHtml(a.name)}</h2>
<p><em>${escHtml(a.tagline)}</em></p>
<p>${escHtml(a.description)}</p>
</article>`,
      )
      .join('') +
    `
<p>Engineering notes on how these apps are built are published on the <a href="/blog">studio blog</a>.</p>`,
);

routeContent['/projects'] = wrapMain(
  `<h1>Projects — 3000 Studios VIP</h1>
<p>Studio projects from 3000 Studios — music, video, software, and games. Each project page entry below is a real shipped or in-production build, with the story of how it was made.</p>` +
    studioProjects
      .map(
        (p) => `
<article>
<h2>${escHtml(p.title)}</h2>
<p>${escHtml(p.summary)}</p>
<p>${escHtml(p.story)}</p>
</article>`,
      )
      .join(''),
);

routeContent['/sponsors'] = wrapMain(
  `<h1>Sponsor 3000 Studios</h1>
<p>Put your brand in front of engaged music fans, independent creators, and live stream audiences worldwide. Sponsorships are sold in fixed packages with Stripe checkout — no auctions and no hidden tiers.</p>
<article>
<h2>Featured Music Video Sponsor — $99 / month</h2>
<p>Logo and brand placement on 3000studios.vip for 30 days, a pinned sponsor shoutout in video descriptions and live streams, a direct link to your site or product, and instant Stripe activation. The same slot is listed in the <a href="/shop">Shop</a> as the Homepage sponsor slot.</p>
</article>
<article>
<h2>Live Stream Presenting Partner — $250 / drop</h2>
<p>Top banner and overlay on all live stream broadcasts, a custom visual ticker and verbal host acknowledgments, a dedicated sponsor segment during live drop events, and social media cross-promotion on TikTok and Instagram.</p>
</article>
<article>
<h2>Title Sponsor &amp; Custom Sync — Custom Deal</h2>
<p>Exclusive brand co-release across platform releases, custom song composition and soundtrack licensing, worldwide sync rights for ads, film, and gaming, and direct producer access with multi-channel distribution. Written by direct agreement — start through the <a href="/contact">Contact</a> page.</p>
</article>`,
);

routeContent['/requests'] = wrapMain(
  `<h1>Requests — 3000 Studios VIP</h1>
<p>Request a song, video, or cover from 3000 Studios. Pitch your ideas for the next 3000 Studios track, and upvote the concepts you want to hear produced and mastered.</p>
<h2>How requests work</h2>
<p>Listeners submit song ideas, cover requests, and video concepts through the request board on this page. The studio reads every submission, and the most-upvoted concepts go into the production queue alongside the weekly release schedule. Winning requests are produced as full 3000 Studios tracks and released on all platforms, with the requester credited in the release notes.</p>
<h2>What makes a strong request</h2>
<p>A clear title or hook, the mood or genre you hear in your head, and a line about why this song should exist. Requests for covers are produced only where licensing allows; original concepts always take priority in the queue.</p>
<p>For booking, sync, and press instead of song requests, use the <a href="/contact">Contact</a> page.</p>`,
);

routeContent['/community'] = wrapMain(
  `<h1>Community — 3000 Studios VIP</h1>
<p>The 3000 Studios community — requests, discussions, and fans. Talk music, production, and upcoming video drops, and connect with 3000 Studios fans worldwide.</p>
<h2>Where the community lives</h2>
<p>Day to day, the community gathers around the weekly single drops, the Follow and Subscribe podcast episodes, and the live broadcast chat. Song and video concepts are pitched and voted on through the <a href="/requests">Requests</a> board, episode discussion follows each release on the <a href="/podcast">Podcast</a> page, and live sessions run from the <a href="/live">Live stage</a>.</p>
<h2>House rules</h2>
<p>Keep it about the music and the work: no spam, no harassment, and no posting other people's personal information. Community spaces are moderated under the site's <a href="/terms">Terms of Use</a>, and the <a href="/privacy">Privacy Policy</a> explains what data the site itself collects (very little — preferences stay on your own device).</p>`,
);

routeContent['/live'] = wrapMain(
  `<h1>Live Command — 3000 Studios VIP</h1>
<p>Watch 3000 Studios live — broadcast deck, schedule, and chat. The live stage carries studio sessions, new-single drop parties, Aeropocalypse gameplay, and podcast recordings, streamed directly from the studio in Acworth, Georgia.</p>
<h2>What broadcasts here</h2>
<p>Live broadcasts are announced on this page and on the studio's social channels before they start. Between broadcasts, the stage shows the current schedule and the most recent sessions; every broadcast is archived to the 3000 Studios YouTube channel and linked from the <a href="/video">Video Vault</a>.</p>
<h2>Podcast, live</h2>
<p>Follow and Subscribe — the 3000 Studios podcast — records in front of the live audience on this stage. Finished episodes, with show notes and Spotify links, live on the <a href="/podcast">Podcast</a> page.</p>`,
);

routeContent['/vip'] = wrapMain(
  `<h1>VIP Pass — 3000 Studios VIP</h1>
<p>The VIP Pass unlocks the full 3000 Studios vault on this site: stem downloads for the catalog, full-length video access, and member-only drops — on top of everything that is already free here (one-minute previews of every song, all official videos via YouTube, every podcast episode, and the full blog).</p>
<h2>Plans</h2>
<p>Vault monthly is $3.99 for 31 days of VIP Pass and stem downloads; Vault yearly is $19.99 for 365 days. Both plans are sold in the <a href="/shop">Shop</a> and check out through Stripe. There is no auto-renew trap in the studio's own terms: a pass simply runs for the days purchased.</p>
<h2>Stems</h2>
<p>Stem downloads split released tracks into their component parts for licensed remixing and study. Licensing for anything beyond personal use is arranged through the <a href="/contact">Contact</a> page, and beat licensing for full instrumentals lives on <a href="/beats">Beat Packs</a>.</p>`,
);

const routeContentTs = `// GENERATED by scripts/generate-site-meta.mjs — do not edit by hand.
// Real per-route body content injected into the SPA shell by the Pages
// middleware (functions/lib/route-meta.ts) so crawlers and no-JS readers
// see the substance of each page. Sources: src/data/podcastEpisodes.ts,
// src/data/books.ts, src/data/aeropocalypse.ts, src/data/publishedSongs.generated.json,
// src/data/blogArticles.ts, and the public pages' own copy.
// Re-run: npm run meta:generate (also runs as part of the web prebuild).

export const ROUTE_CONTENT: Record<string, string> = ${JSON.stringify(routeContent, null, 2)};
`;

/* --------------------------------- outputs -------------------------------- */
const generatedTs = `// GENERATED by scripts/generate-site-meta.mjs — do not edit by hand.
// Sources: apps/web/src/main.tsx, src/data/publishedSongs.generated.json,
// src/data/officialReleases.*, src/data/blogArticles.ts${
  hasExplicitFile ? ', src/data/explicit-routes.json' : ''
}${Object.keys(redirects).length ? ', src/data/redirects.json' : ''}.
// Re-run: npm run meta:generate (also runs as part of the web prebuild).

export type SongMetaEntry = {
  title: string;
  slug: string;
  cover: string;
  apple: string;
  youtubeId: string;
  duration: string;
};

export type RouteMetaEntry = {
  title: string;
  description: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  noads?: boolean;
  song?: SongMetaEntry;
};

export const STATIC_ROUTES: Record<string, RouteMetaEntry> = ${JSON.stringify(routes, null, 2)};

export const SONG_ROUTES: Record<string, RouteMetaEntry> = ${JSON.stringify(songMeta, null, 2)};

export const BLOG_ROUTES: Record<string, RouteMetaEntry> = ${JSON.stringify(blogMeta, null, 2)};

/** Crew B redirects contract: loser path -> canonical path (301 at the edge). */
export const ROUTE_REDIRECTS: Record<string, string> = ${JSON.stringify(redirects, null, 2)};

/** Prefixes that are real app routes (protected SPA surfaces). */
export const KNOWN_PREFIXES: string[] = ['/vault/'];
`;

const indexable = [
  ...Object.entries(routes).filter(([, m]) => !m.noindex).map(([p]) => p),
  ...Object.entries(songMeta).filter(([, m]) => !m.noindex).map(([slug]) => `/song/${slug}`),
  ...Object.entries(blogMeta).filter(([, m]) => !m.noindex).map(([slug]) => `/blog/${slug}`),
].sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)));

const priority = (p) =>
  p === '/' ? '1.0' : p.startsWith('/song/') ? '0.7' : p.startsWith('/blog/') ? '0.8' : '0.6';
const freq = (p) => (p === '/blog' ? 'daily' : p.startsWith('/blog/') ? 'monthly' : 'weekly');
const sitemapXml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<!-- Generated by scripts/generate-site-meta.mjs from the real route table. Do not edit by hand. -->\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  indexable
    .map(
      (p) =>
        `  <url><loc>${ORIGIN}${p === '/' ? '/' : p}</loc><changefreq>${freq(p)}</changefreq><priority>${priority(p)}</priority></url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

const llmsTxt = `# 3000 Studios VIP

> 3000 Studios is an independent, AI-driven music and media studio based in
> Acworth, Georgia, run by Jeremy Swain. The studio releases original music
> (new singles weekly, streaming on every platform), produces cinematic music
> videos, broadcasts live shows, and develops AEROPOCALYPSE: ONLINE, an
> arcade flight combat game. Every song previews free for one minute
> on the site; full songs stream on Apple Music, Spotify, and Amazon.

## Key pages

- [Home — Official Music & Live Stage](${ORIGIN}/): The full catalog, live stage, official videos, and VIP visuals.
- [Music Vault](${ORIGIN}/music): Stream every official 3000 Studios release free.
- [Video Vault](${ORIGIN}/video): Official music videos and Aeropocalypse cinematics.
- [Live Stage](${ORIGIN}/live): Watch 3000 Studios live broadcasts.
- [Podcast](${ORIGIN}/podcast): The 3000 Studios Podcast — every episode.
- [Books](${ORIGIN}/books): Books by Jeremy Swain from 3000 Studios Press — ebooks in the studio store, print through IngramSpark.
- [Beat Packs](${ORIGIN}/beats): License 3000 Studios instrumentals and bundles.
- [AEROPOCALYPSE: ONLINE](${ORIGIN}/aeropocalypse): AEROPOCALYPSE: ONLINE — the arcade flight combat game with 25 stages and 25 bosses.
- [Shop](${ORIGIN}/shop): Merch, singles, and studio services.
- [Blog](${ORIGIN}/blog): News, stories, and studio notes.
- [Community Requests](${ORIGIN}/requests): Request a song, video, or cover.
- [About](${ORIGIN}/about): The studio story.
- [Contact](${ORIGIN}/contact): Booking, sync licensing, sponsorships, and press.

## Catalog

- ${songs.length} published songs, each with its own page under ${ORIGIN}/song/<slug>
  (for example [Code Red](${ORIGIN}/song/code-red)).
- Full index of indexable pages: ${ORIGIN}/sitemap.xml

## Contact

- Email: mr.jwswain@gmail.com
- YouTube: https://www.youtube.com/@3000Studio
- Spotify: https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik
`;

const outputs = new Map([
  [join(WEB, 'functions/lib/route-meta.generated.ts'), generatedTs],
  [join(WEB, 'functions/lib/route-content.generated.ts'), routeContentTs],
  [join(WEB, 'public/sitemap.xml'), sitemapXml],
  [join(WEB, 'public/llms.txt'), llmsTxt],
]);

const checkOnly = process.argv.includes('--check');
let stale = false;
for (const [path, content] of outputs) {
  const current = existsSync(path) ? read(path) : null;
  if (current !== content) {
    if (checkOnly) {
      console.error(`STALE: ${path}`);
      stale = true;
    } else {
      writeFileSync(path, content);
      console.log(`wrote ${path.replace(ROOT + '/', '')}`);
    }
  }
}
if (checkOnly && stale) process.exit(1);

console.log(
  `routes: ${Object.keys(routes).length} static, ${Object.keys(songMeta).length} songs, ` +
    `${Object.keys(blogMeta).length} blog posts, ${indexable.length} in sitemap, ` +
    `${Object.keys(redirects).length} redirects, explicit file: ${hasExplicitFile ? 'yes' : 'ABSENT'}`,
);
