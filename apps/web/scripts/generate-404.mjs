// Emits dist/404.html from the built SPA shell (run after `vite build`,
// i.e. the `build` script in apps/web/package.json).
//
// Why: while no 404.html exists, Cloudflare Pages' asset server answers
// every unmatched path with /index.html and HTTP 200 (a soft-404 — crawlers
// are shown the homepage shell for dead URLs), and the old `/*` catch-all
// in public/_redirects cannot fix it: Pages' validator ignores splat ->
// /index.html rules as infinite loops. With this file present, Pages serves
// it with a genuine 404 status for unmatched paths. It is the app shell
// (so React still boots and renders its own NotFound route) carrying
// crawlable not-found content inside #root for no-JS visitors — React
// replaces #root's children when it mounts.
//
// Same fix pattern as the fleet soft-404 sweep 2026-10-27 (findmerates
// commit 9ded7f4, pondco 59906cf, tmack48 59dfb60, referrals ce865e5,
// voicetowebsite e99897b). Deterministic, non-interactive, Node-only.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = path.join(repoRoot, "dist");
const shellPath = path.join(distRoot, "index.html");

const shell = fs.readFileSync(shellPath, "utf8");

const NOT_FOUND_TITLE = "Page Not Found | 3000 Studios VIP";
const NOT_FOUND_DESCRIPTION =
  "That page could not be found. 3000 Studios VIP — official music and live stage: music, videos, live broadcasts, books and podcasts.";

let html = shell
  .replace(/<title>[\s\S]*?<\/title>/i, `<title>${NOT_FOUND_TITLE}</title>`)
  .replace(
    /(<meta[^>]*name="description"[^>]*content=")[^"]*(")/i,
    `$1${NOT_FOUND_DESCRIPTION}$2`,
  )
  // A 404 page must not pose as a real page: drop the canonical and og:url,
  // retitle the social cards, and mark the page noindex.
  .replace(/\s*<link rel="canonical"[^>]*>/gi, "")
  .replace(/\s*<meta property="og:url"[^>]*>/gi, "")
  .replace(
    /(<meta property="og:title" content=")[^"]*(")/i,
    `$1${NOT_FOUND_TITLE}$2`,
  )
  .replace(
    /(<meta name="twitter:title" content=")[^"]*(")/i,
    `$1${NOT_FOUND_TITLE}$2`,
  )
  .replace(
    /(<meta property="og:description" content=")[^"]*(")/i,
    `$1${NOT_FOUND_DESCRIPTION}$2`,
  )
  .replace(
    /(<meta name="twitter:description" content=")[^"]*(")/i,
    `$1${NOT_FOUND_DESCRIPTION}$2`,
  );

// The shell may or may not carry a robots meta — replace it if present,
// otherwise insert noindex right after the description meta (or <title>).
if (/<meta[^>]*name="robots"[^>]*>/i.test(html)) {
  html = html.replace(
    /<meta[^>]*name="robots"[^>]*>/i,
    '<meta name="robots" content="noindex, follow" />',
  );
} else if (/<meta[^>]*name="description"[^>]*>/i.test(html)) {
  html = html.replace(
    /(<meta[^>]*name="description"[^>]*>)/i,
    '$1\n    <meta name="robots" content="noindex, follow" />',
  );
} else {
  html = html.replace(
    /(<title>[\s\S]*?<\/title>)/i,
    '$1\n    <meta name="robots" content="noindex, follow" />',
  );
}

// Crawlable not-found content, inside #root so React replaces it on mount.
// The shell's #root holds a static home shell (#home-shell); swap it for
// the not-found block. If that shape ever changes, fall back to inserting
// right after the opening #root div.
const inner = `<main>
      <h1>Page not found</h1>
      <p>The page you were looking for doesn&apos;t exist or has moved. Try one of these instead:</p>
      <p><a href="/">Home</a> &middot; <a href="/music">Music</a> &middot; <a href="/video">Video</a> &middot; <a href="/live">Live</a> &middot; <a href="/books">Books</a> &middot; <a href="/podcast">Podcast</a></p>
    </main>`;
if (!/<div id="root">/.test(html)) {
  throw new Error("generate-404: could not find the #root div in dist/index.html");
}
if (/<div id="home-shell"[\s\S]*?<\/div>\s*<\/div>/.test(html)) {
  html = html.replace(/<div id="home-shell"[\s\S]*?<\/div>\s*<\/div>/, inner);
} else {
  html = html.replace(/(<div id="root">)/, `$1\n      ${inner}`);
}

fs.writeFileSync(path.join(distRoot, "404.html"), html);
console.log("generate-404: wrote dist/404.html");
