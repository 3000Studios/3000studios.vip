/**
 * Crew A — serving-layer route meta (1000x fix program, 2026-10-26).
 *
 * The SPA serves one index.html shell for every route, so crawlers and link
 * previews used to see the homepage title/canonical everywhere. This module
 * is the pure logic the Pages Functions middleware uses to fix that at the
 * edge:
 *   - per-route <title>, meta description, self-referencing canonical,
 *     OG/Twitter tags (from the generated route->meta map)
 *   - MusicRecording JSON-LD on /song/* routes
 *   - real HTTP 404 status for unknown paths (the SPA still renders its
 *     friendly "This track skipped" page client-side)
 *   - www -> apex 301 and Crew B redirect-contract 301s
 *   - noindex + AdSense-meta suppression on Crew B explicit-flagged routes
 *
 * The data lives in route-meta.generated.ts (scripts/generate-site-meta.mjs).
 * Everything here is pure and unit-testable without a Workers runtime.
 */
import {
  BLOG_ROUTES,
  KNOWN_PREFIXES,
  ROUTE_REDIRECTS,
  SONG_ROUTES,
  STATIC_ROUTES,
  type RouteMetaEntry,
} from './route-meta.generated';

export const APEX_HOST = '3000studios.vip';
export const WWW_HOST = 'www.3000studios.vip';
export const ORIGIN = `https://${APEX_HOST}`;
export const DEFAULT_OG_IMAGE = `${ORIGIN}/media/official-3000-studios-profile.png`;

export const NOT_FOUND_META: RouteMetaEntry = {
  title: 'Page not found — 3000 Studios VIP',
  description:
    'The page you are looking for does not exist. Head back to the 3000 Studios stage.',
  noindex: true,
};

export function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1);
  return pathname || '/';
}

/** True when the path is a direct static-file request (own head, pass through). */
export function isFilePath(pathname: string): boolean {
  const last = pathname.split('/').pop() || '';
  return last.includes('.');
}

/**
 * Resolve the meta for a request path.
 * Returns null for unknown paths (caller serves the shell with a 404).
 */
export function resolveRouteMeta(pathname: string): RouteMetaEntry | null {
  const path = normalizePath(pathname);
  const exact = STATIC_ROUTES[path];
  if (exact) return exact;

  const song = path.match(/^\/song\/([^/]+)$/);
  if (song) return SONG_ROUTES[song[1]] ?? null;

  const blog = path.match(/^\/blog\/([^/]+)$/);
  if (blog) return BLOG_ROUTES[blog[1]] ?? null;

  if (KNOWN_PREFIXES.some((p) => path.startsWith(p))) {
    return STATIC_ROUTES['/vault'] ?? null;
  }
  return null;
}

export function isKnownRoute(pathname: string): boolean {
  return resolveRouteMeta(pathname) !== null;
}

/**
 * Pre-flight redirect decision (runs before the downstream chain):
 * www -> apex 301 (same path + query), then the Crew B redirects contract.
 * Returns the Location to redirect to, or null.
 */
export function redirectFor(url: URL): { status: 301; location: string } | null {
  if (url.hostname === WWW_HOST) {
    const target = new URL(url.toString());
    target.hostname = APEX_HOST;
    return { status: 301, location: target.toString() };
  }
  const dest = ROUTE_REDIRECTS[normalizePath(url.pathname)];
  if (dest) {
    const target = new URL(dest, ORIGIN);
    target.search = url.search;
    return { status: 301, location: target.toString() };
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isoDuration(mmss: string): string | null {
  const m = mmss.match(/^(\d+):(\d{2})$/);
  if (!m) return null;
  return `PT${Number(m[1])}M${Number(m[2])}S`;
}

/** MusicRecording JSON-LD for a song meta entry (null when not a song). */
export function songJsonLd(meta: RouteMetaEntry, canonical: string): string | null {
  const song = meta.song;
  if (!song) return null;
  const duration = isoDuration(song.duration);
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: canonical,
    byArtist: { '@type': 'MusicGroup', name: '3000 Studios' },
    inAlbum: { '@type': 'MusicAlbum', name: '3000 Studios Singles' },
  };
  if (song.cover.startsWith('https://')) ld.image = song.cover;
  if (duration) ld.duration = duration;
  if (song.apple.startsWith('https://')) ld.sameAs = [song.apple];
  if (song.youtubeId) {
    ld.video = {
      '@type': 'VideoObject',
      name: `${song.title} — official video`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${song.youtubeId}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`,
    };
  }
  return JSON.stringify(ld);
}

function setMetaTag(
  html: string,
  attr: 'name' | 'property',
  key: string,
  content: string,
): string {
  const re = new RegExp(
    `<meta\\s+${attr}="${key.replace(/[:]/g, '\\:')}"\\s+content="[^"]*"\\s*/?>`,
    'i',
  );
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

function setCanonical(html: string, href: string): string {
  const re = /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i;
  const tag = `<link rel="canonical" href="${escapeHtml(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace(/<\/head>/i, `    ${tag}\n  </head>`);
}

/**
 * Rewrite the served shell's <head> for one route. Pure string surgery on
 * the tags index.html is known to carry; missing tags are inserted.
 */
export function injectHead(html: string, meta: RouteMetaEntry, canonicalPath: string): string {
  const canonical = canonicalPath === '/' ? `${ORIGIN}/` : `${ORIGIN}${canonicalPath}`;
  const image = meta.image || DEFAULT_OG_IMAGE;
  let out = html;

  // Title is element text, not an attribute: escape only < > (the shell
  // itself ships a raw & in "Music & Live Stage").
  const titleText = meta.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>${titleText}</title>`);
  out = setMetaTag(out, 'name', 'description', meta.description);
  out = setCanonical(out, canonical);
  out = setMetaTag(out, 'property', 'og:title', meta.title);
  out = setMetaTag(out, 'property', 'og:description', meta.description);
  out = setMetaTag(out, 'property', 'og:url', canonical);
  out = setMetaTag(out, 'property', 'og:image', image);
  if (meta.type) out = setMetaTag(out, 'property', 'og:type', meta.type);
  out = setMetaTag(out, 'name', 'twitter:title', meta.title);
  out = setMetaTag(out, 'name', 'twitter:description', meta.description);
  out = setMetaTag(out, 'name', 'twitter:image', image);

  if (meta.noindex) {
    out = setMetaTag(out, 'name', 'robots', 'noindex, nofollow');
  }
  if (meta.noads) {
    // AdSense risk removal at the serving layer: the publisher meta for the
    // account is stripped on explicit routes so no ad unit can bind there.
    out = out.replace(
      /\s*<meta\s+name="google-adsense-account"\s+content="[^"]*"\s*\/?>/i,
      '',
    );
  }

  const ld = songJsonLd(meta, canonical);
  if (ld) {
    out = out.replace(
      /<\/head>/i,
      `    <script type="application/ld+json">${ld}</script>\n  </head>`,
    );
  }
  return out;
}

export type HtmlTransformResult = {
  status: number;
  html: string;
  noindex: boolean;
};

/**
 * Full post-response decision for an HTML page response: known route ->
 * injected head, same status; unknown route -> injected 404 head + real 404.
 */
export function transformHtmlResponse(input: {
  url: URL;
  status: number;
  html: string;
}): HtmlTransformResult {
  const path = normalizePath(input.url.pathname);
  const meta = resolveRouteMeta(input.url.pathname);
  if (!meta) {
    return { status: 404, html: injectHead(input.html, NOT_FOUND_META, path), noindex: true };
  }
  return {
    status: input.status,
    html: injectHead(input.html, meta, path),
    noindex: Boolean(meta.noindex),
  };
}
