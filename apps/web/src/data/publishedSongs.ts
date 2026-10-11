import generated from './publishedSongs.generated.json';
import mediaPathMap from './mediaPathMap.generated.json';
import { officialReleaseVideos } from './officialReleases';
import { rolloutSongs, type CatalogSong } from './music';

const MEDIA_MAP = mediaPathMap as Record<string, string>;

function encodeMediaPath(path: string): string {
  if (!path.startsWith('/media/')) return path;
  return '/media/' + encodeURIComponent(path.slice('/media/'.length));
}

export type PublishedSong = {
  title: string;
  slug: string;
  src: string;
  preview: string;
  cover: string;
  youtubeId?: string;
  buy?: string;
  apple?: string;
};

function norm(s: string) {
  return s.toLowerCase().replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function youtubeFor(title: string) {
  const n = norm(title);
  const hit = officialReleaseVideos.find((v) => norm(v.title) === n || n.includes(norm(v.title)) || norm(v.title).includes(n));
  return hit?.videoId;
}

/**
 * Guard (2026-10-11 bug fix): a song with an empty/missing/invalid YouTube ID
 * must never reach a player or a "Watch on YouTube" link — embed/watch URLs
 * built from an empty ID are dead. Only a real 11-char YouTube ID survives;
 * anything else becomes `undefined`, and renderers already gate on truthiness.
 */
export function validYoutubeId(id: string | undefined | null): string | undefined {
  return typeof id === 'string' && /^[\w-]{11}$/.test(id.trim()) ? id.trim() : undefined;
}

function localSrc(title: string, slug: string) {
  if (MEDIA_MAP[slug]) return encodeMediaPath(MEDIA_MAP[slug]);
  const fromRollout = rolloutSongs.find((s) => s.slug === slug || norm(s.title) === norm(title));
  return fromRollout?.src;
}

export const publishedSongs: PublishedSong[] = (generated as PublishedSong[]).map((row) => ({
  ...row,
  src: localSrc(row.title, row.slug) || row.preview || row.src,
  youtubeId: validYoutubeId(youtubeFor(row.title)) || validYoutubeId(row.youtubeId),
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
