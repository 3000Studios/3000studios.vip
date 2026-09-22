import coverMap from './coverMap.json';
import publishedGenerated from './publishedSongs.generated.json';
import mediaPathMap from './mediaPathMap.generated.json';

export type SongPalette = {
  a: string;
  b: string;
  c: string;
  gold: string;
};

export type CatalogSong = {
  rank: number;
  id: string;
  slug: string;
  title: string;
  description: string;
  src: string;
  cover: string;
  palette: SongPalette;
  wallpaper: string;
  youtubeId?: string;
};

/** slug → real /media/*.mp3 path (remap-only; filled by repair-catalog-paths). */
const MEDIA_MAP = mediaPathMap as Record<string, string>;

/** Encode spaces/apostrophes in DistroKid filenames for audio element src. */
function encodeMediaPath(path: string): string {
  if (!path.startsWith('/media/')) return path;
  return '/media/' + encodeURIComponent(path.slice('/media/'.length));
}

function resolvePlaybackSrc(
  release: { slug: string; src: string; preview?: string },
  existing?: CatalogSong,
): string {
  const mapped = MEDIA_MAP[release.slug] || (existing ? MEDIA_MAP[existing.slug] : undefined);
  if (mapped) return encodeMediaPath(mapped);
  // No local master — Apple preview is honest fallback; missing files logged in catalog audit.
  return release.preview || release.src || existing?.src || '';
}

/** True when playback URL is an Apple Music / iTunes preview clip (not a local master). */
export function isApplePreviewSrc(src: string | undefined | null): boolean {
  if (!src) return false;
  return /itunes\.apple\.com|audio-ssl\.itunes\.apple\.com|mzstatic\.com/i.test(src);
}

export function playbackKind(src: string | undefined | null): 'local' | 'apple-preview' | 'missing' {
  if (!src) return 'missing';
  if (isApplePreviewSrc(src)) return 'apple-preview';
  if (src.startsWith('/media/') || src.startsWith('/assets/')) return 'local';
  if (src.startsWith('http')) return 'apple-preview';
  return 'missing';
}



const YOUTUBE_BY_SLUG: Record<string, string> = {
  'not-giving-up-tonight': 'tIY1WU9N_RU',
};
