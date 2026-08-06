import { rolloutSongs, type CatalogSong } from './music';

export interface Song {
  id: string;
  slug: string;
  title: string;
  artist: string;
  description: string;
  fullAudio: string;
  previewAudio?: string;
  coverImage: string;
  duration: string;
  genre: string;
  vibe: string;
  unlockType: 'daily' | 'vip' | 'unlocked';
  wallpaper: string;
  palette: CatalogSong['palette'];
}

function toSong(track: CatalogSong): Song {
  return {
    id: track.id,
    slug: track.slug,
    title: track.title,
    artist: '3000 Studios',
    description: track.description,
    fullAudio: track.src,
    previewAudio: track.src,
    coverImage: track.cover,
    duration: '—',
    genre: '3000 Studios Original',
    vibe: 'VIP · Sound-reactive · Catalog',
    unlockType: 'unlocked',
    wallpaper: track.wallpaper,
    palette: track.palette,
  };
}

export const songs: Song[] = rolloutSongs.map(toSong);

export const getSongBySlug = (slug: string) => songs.find((s) => s.slug === slug);
