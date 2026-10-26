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

/* ------------------------------ static routes ----------------------------- */
const mainTs = read(join(WEB, 'src/main.tsx'));
const titled = new Map();
for (const m of mainTs.matchAll(
  /path:\s*'([^']+)'[\s\S]{0,700}?title="([^"]+)"[\s\S]{0,300}?description="([^"]+)"/g,
)) {
  // Dynamic segments and the catch-all have no <Titled> of their own; without
  // this filter the regex would steal the NEXT route's meta for them.
  if (m[1].includes(':') || m[1].includes('*') || m[1] === '/privacy-policy') continue;
  titled.set(m[1], { title: m[2], description: m[3] });
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
const NOINDEX_PATHS = ['/command-deck', '/go-live', '/admin', '/agent', '/vault'];
const NOINDEX_TITLES = {
  '/command-deck': { title: brand('Command Deck'), description: 'Owner dashboard — content stats and unlock payment controls.' },
  '/go-live': { title: brand('Go Live'), description: 'Start a 3000 Studios live broadcast from your phone.' },
  '/admin': { title: brand('Admin'), description: '3000 Studios admin.' },
  '/agent': { title: brand('Agent Command Center'), description: '3000 Studios agent command center.' },
  '/vault': { title: brand('Vault'), description: '3000 Studios operator console.' },
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
  if (routes[path]) routes[path] = { ...routes[path], noindex: true, noads: true };
  const song = path.match(/^\/song\/(.+)$/);
  if (song && songMeta[song[1]]) songMeta[song[1]] = { ...songMeta[song[1]], noindex: true, noads: true };
  const blog = path.match(/^\/blog\/(.+)$/);
  if (blog && blogMeta[blog[1]]) blogMeta[blog[1]] = { ...blogMeta[blog[1]], noindex: true, noads: true };
}

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
> videos, broadcasts live shows, and develops Thunder Dome: AeroStrike, a
> top-down arena shooter game. Every song on the site streams free in full;
> official downloads are $0.99.

## Key pages

- [Home — Official Music & Live Stage](${ORIGIN}/): The full catalog, live stage, official videos, and VIP visuals.
- [Music Vault](${ORIGIN}/music): Stream every official 3000 Studios release free.
- [Video Vault](${ORIGIN}/video): Official music videos and Thunder Dome cinematics.
- [Live Stage](${ORIGIN}/live): Watch 3000 Studios live broadcasts.
- [Podcast](${ORIGIN}/podcast): The 3000 Studios Podcast — every episode.
- [Beat Packs](${ORIGIN}/beats): License 3000 Studios instrumentals and bundles.
- [Thunder Dome](${ORIGIN}/thunder-dome): Thunder Dome: AeroStrike — the top-down arena shooter with 24 bosses.
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
