#!/usr/bin/env node
/**
 * Post-deploy smoke: GET every URL in the live sitemap.
 * Fails if any URL is not HTTP 200 (redirects count as failure).
 */
const origin = process.env.SMOKE_ORIGIN || 'https://3000studios.vip';
const sitemapUrl = process.env.SMOKE_SITEMAP || `${origin.replace(/\/$/, '')}/sitemap.xml`;

async function main() {
  const sitemapRes = await fetch(sitemapUrl, { redirect: 'manual' });
  if (sitemapRes.status !== 200) {
    throw new Error(`sitemap ${sitemapUrl} returned ${sitemapRes.status}`);
  }
  const xml = await sitemapRes.text();
  const locs = [...xml.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
  if (!locs.length) {
    throw new Error(`sitemap ${sitemapUrl} contained no <loc> entries`);
  }

  const failures = [];
  for (const loc of locs) {
    const res = await fetch(loc, { redirect: 'manual' });
    const status = res.status;
    process.stdout.write(`${status} ${loc}\n`);
    if (status !== 200) {
      const location = res.headers.get('location');
      failures.push(`${status} ${loc}${location ? ` -> ${location}` : ''}`);
    }
  }

  if (failures.length) {
    console.error(`\nSMOKE FAIL: ${failures.length}/${locs.length} URL(s) were not HTTP 200:`);
    for (const line of failures) console.error(` - ${line}`);
    process.exit(1);
  }

  console.log(`\nSMOKE OK: ${locs.length} sitemap URL(s) returned HTTP 200`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
