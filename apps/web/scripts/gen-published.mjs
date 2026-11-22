import { readFileSync, writeFileSync } from 'node:fs';

const OUTPUT_URL = new URL('../src/data/publishedSongs.generated.json', import.meta.url);

// Durability fix (2026-10-11): youtubeId values in the generated JSON are
// VERIFIED title->YouTube-ID mappings (channel catalog + oembed checked).
// The iTunes lookup cannot provide them, so carry them over by slug from
// the existing generated file instead of wiping them back to ''.
const existingYoutubeBySlug = new Map();
try {
  for (const row of JSON.parse(readFileSync(OUTPUT_URL, 'utf8'))) {
    if (row && row.slug && row.youtubeId && !existingYoutubeBySlug.has(row.slug)) {
      existingYoutubeBySlug.set(row.slug, row.youtubeId);
    }
  }
} catch {
  // No existing generated file yet — all youtubeIds start empty.
}

const res = await fetch('https://itunes.apple.com/lookup?id=6802721597&entity=song&limit=200');
const data = await res.json();
const songs = [];
const seen = new Set();
const seenSlugs = new Set();
// Fast-track removals (2026-10-29 — see vip/fast-track/REMOVALS.md):
// deep-space-hum is BROKEN (no working media of any kind) and was removed
// from the catalog; never let a regeneration re-add it from the source.
const REMOVED_SLUGS = new Set(['deep-space-hum']);
for (const row of data.results || []) {
  if (row.wrapperType !== 'track' || row.artistName !== '3000 Studios') continue;
  const title = String(row.trackName || '').trim();
  if (!title || seen.has(title.toLowerCase())) continue;
  seen.add(title.toLowerCase());
  const slug = title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  // Dedupe by slug, not just title: iTunes lists "Am I wrong" and
  // "AM I WRONG!!" as separate tracks that share the slug `am-i-wrong`.
  // First record wins, which keeps the "Am I wrong" title version.
  if (REMOVED_SLUGS.has(slug) || seenSlugs.has(slug)) continue;
  seenSlugs.add(slug);
  const art = String(row.artworkUrl100 || '').replace('100x100bb', '600x600bb');
  songs.push({
    title,
    slug,
    src: `/media/${slug}.mp3`,
    preview: row.previewUrl || '',
    cover: art,
    youtubeId: existingYoutubeBySlug.get(slug) || '',
    buy: row.trackViewUrl || 'https://distrokid.com/hyperfollow/3000studios',
    apple: row.trackViewUrl || '',
  });
}
writeFileSync(OUTPUT_URL, JSON.stringify(songs, null, 2));
console.log('wrote', songs.length);
