import { writeFileSync } from 'node:fs';

const res = await fetch('https://itunes.apple.com/lookup?id=6802721597&entity=song&limit=200');
const data = await res.json();
const songs = [];
const seen = new Set();
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
  const art = String(row.artworkUrl100 || '').replace('100x100bb', '600x600bb');
  songs.push({
    title,
    slug,
    src: `/media/${slug}.mp3`,
    preview: row.previewUrl || '',
    cover: art,
    youtubeId: '',
  });
}
writeFileSync(
  new URL('../src/data/publishedSongs.generated.json', import.meta.url),
  JSON.stringify(songs, null, 2),
);
console.log('wrote', songs.length);
