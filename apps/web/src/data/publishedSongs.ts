import generated from './publishedSongs.generated.json';
import { officialReleaseVideos } from './officialReleases';
import { rolloutSongs, type CatalogSong } from './music';

export type PublishedSong = {
  title: string;
  slug: string;
  src: string;
  preview: string;
  cover: string;
  youtubeId?: string;
};

function norm(s: string) {
  return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function youtubeFor(title: string) {
  const n = norm(title);
  const hit = officialReleaseVideos.find((v) => norm(v.title) === n || n.includes(norm(v.title)) || norm(v.title).includes(n));
  return hit?.videoId;
}

function localSrc(title: string, slug: string) {
  const fromRollout = rolloutSongs.find((s) => s.slug === slug || norm(s.title) === norm(title));
  return fromRollout?.src;
}

export const publishedSongs: PublishedSong[] = (generated as PublishedSong[]).map((row) => ({
  ...row,
  src: localSrc(row.title, row.slug) || row.src,
  youtubeId: youtubeFor(row.title) || row.youtubeId,
}));

export function publishedToCatalog(song: PublishedSong): CatalogSong {
  const existing = rolloutSongs.find((s) => s.slug === song.slug || s.title === song.title);
  if (existing) return existing;
  return {
    rank: 0,
    id: song.slug,
    slug: song.slug,
    title: song.title,
    description: 'DistroKid live · 3000 Studios',
    src: song.preview || song.src,
    cover: song.cover,
    palette: { a: '#2d3042', b: '#efefef', c: '#ffffff', gold: '#d4af37' },
    wallpaper: 'spiral',
    youtubeId: song.youtubeId,
  };
}
