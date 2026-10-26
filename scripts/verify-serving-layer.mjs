#!/usr/bin/env node
/**
 * Crew A — serving-layer verification harness (no Workers runtime needed).
 *
 * Feeds sample requests through the SAME pure functions the Pages Functions
 * middleware calls (apps/web/functions/lib/route-meta.ts) using the real
 * apps/web/index.html as the SPA shell stand-in, and prints before/after
 * title + canonical + status per route. Also cross-checks the generated
 * sitemap against the route table so the two can never drift apart.
 *
 * Usage: node scripts/verify-serving-layer.mjs   (npm run verify:serving)
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WEB = join(ROOT, 'apps', 'web');

// The functions sources use bundler-style extensionless imports (wrangler
// resolves them at deploy). Teach Node's loader the same trick, harness-only.
import { register } from 'node:module';
register(
  'data:text/javascript,' +
    encodeURIComponent(
      `export async function resolve(spec, ctx, next) {
         try { return await next(spec, ctx); }
         catch (e) { if (spec.startsWith('.')) return next(spec + '.ts', ctx); throw e; }
       }`,
    ),
);

const {
  redirectFor,
  resolveRouteMeta,
  transformHtmlResponse,
  injectHead,
} = await import(join(WEB, 'functions/lib/route-meta.ts'));

const shell = readFileSync(join(WEB, 'index.html'), 'utf8');
const pick = (html, re) => (html.match(re) || [])[1] || '(none)';
const titleOf = (html) => pick(html, /<title>([^<]*)<\/title>/i);
const canonicalOf = (html) => pick(html, /<link rel="canonical" href="([^"]*)"/i);

let failures = 0;
function check(label, cond, detail = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!cond) failures += 1;
}

console.log('BEFORE (shell as served today for every route):');
console.log(`  title:     ${titleOf(shell)}`);
console.log(`  canonical: ${canonicalOf(shell)}\n`);

const samples = [
  '/',
  '/song/code-red',
  '/shop',
  '/thunder-dome',
  '/contact',
  '/blog/how-3000-studios-uses-ai-to-build-faster',
  '/this-should-404',
  '/song/not-a-real-song',
  '/vault/settings',
  '/command-deck',
];
console.log('AFTER (through transformHtmlResponse):');
for (const path of samples) {
  const url = new URL(`https://3000studios.vip${path}`);
  const out = transformHtmlResponse({ url, status: 200, html: shell });
  console.log(
    `  ${path}\n    status=${out.status} title="${titleOf(out.html)}"\n    canonical=${canonicalOf(out.html)}`,
  );
}

console.log('');
check('homepage keeps brand title + apex canonical', (() => {
  const out = transformHtmlResponse({ url: new URL('https://3000studios.vip/'), status: 200, html: shell });
  return out.status === 200 && titleOf(out.html).includes('Official Music & Live Stage') && canonicalOf(out.html) === 'https://3000studios.vip/';
})());
check('song title is single-branded (no "3000 Studios - X — 3000 Studios VIP")', (() => {
  const out = transformHtmlResponse({ url: new URL('https://3000studios.vip/song/code-red'), status: 200, html: shell });
  const t = titleOf(out.html);
  return t === 'Code Red — 3000 Studios VIP' && canonicalOf(out.html) === 'https://3000studios.vip/song/code-red';
})(), titleOf(transformHtmlResponse({ url: new URL('https://3000studios.vip/song/code-red'), status: 200, html: shell }).html));
check('song page carries MusicRecording JSON-LD with ISO duration', (() => {
  const out = transformHtmlResponse({ url: new URL('https://3000studios.vip/song/code-red'), status: 200, html: shell });
  const m = out.html.match(/<script type="application\/ld\+json">(\{"@context":"https:\/\/schema\.org","@type":"MusicRecording"[\s\S]*?)<\/script>/);
  if (!m) return false;
  const ld = JSON.parse(m[1]);
  return ld.name === 'Code Red' && ld.duration === 'PT4M45S' && ld.byArtist?.name === '3000 Studios';
})());
check('/contact has its own title + description', (() => {
  const meta = resolveRouteMeta('/contact');
  return Boolean(meta) && meta.title.startsWith('Contact') && meta.description.includes('Book 3000 Studios');
})());
check('unknown path -> real 404 + noindex + friendly title', (() => {
  const out = transformHtmlResponse({ url: new URL('https://3000studios.vip/this-should-404'), status: 200, html: shell });
  return out.status === 404 && out.noindex && titleOf(out.html).startsWith('Page not found');
})());
check('unknown song slug -> 404 (no soft-404)', (() => {
  const out = transformHtmlResponse({ url: new URL('https://3000studios.vip/song/not-a-real-song'), status: 200, html: shell });
  return out.status === 404;
})());
check('www -> 301 apex, path + query preserved', (() => {
  const r = redirectFor(new URL('https://www.3000studios.vip/song/code-red?utm=share'));
  return r?.status === 301 && r.location === 'https://3000studios.vip/song/code-red?utm=share';
})());
check('apex is not redirected', redirectFor(new URL('https://3000studios.vip/shop')) === null);
check('owner surfaces resolve but are noindex', (() => {
  const cd = resolveRouteMeta('/command-deck');
  const vault = resolveRouteMeta('/vault/settings');
  return Boolean(cd?.noindex) && Boolean(vault?.noindex);
})());
check('explicit-route mechanism: noindex + adsense meta stripped', (() => {
  const meta = { title: 'X — 3000 Studios VIP', description: 'd', noindex: true, noads: true };
  const out = injectHead(shell, meta, '/song/x');
  return out.includes('name="robots" content="noindex, nofollow"') && !out.includes('google-adsense-account');
})());

/* Sitemap <-> route table consistency */
const sitemap = readFileSync(join(WEB, 'public/sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check(`sitemap lists ${locs.length} URLs (was 23)`, locs.length > 70);
check('every sitemap URL resolves to a known indexable route', locs.every((loc) => {
  const path = new URL(loc).pathname;
  const meta = resolveRouteMeta(path);
  return Boolean(meta) && !meta.noindex;
}), `${locs.length} URLs checked`);
check('no sitemap URL is a duplicate', new Set(locs).size === locs.length);

console.log(failures ? `\n${failures} CHECK(S) FAILED` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
