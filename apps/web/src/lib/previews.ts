import previewManifestGenerated from '../data/previewManifest.generated.json';
import { isApplePreviewSrc } from '../data/music';

const MANIFEST = previewManifestGenerated as Record<string, string>;

/** Public path of the track's 1-minute preview video, when one was produced. */
export function previewPathFor(slug: string): string | null {
  return MANIFEST[slug] ?? null;
}

export function hasPreview(slug: string): boolean {
  return Boolean(MANIFEST[slug]);
}

/**
 * What the on-site player may actually play for a song (music model flip,
 * Boss order 2026-10-27): the produced 1-minute preview video when one
 * exists, else the label's own Apple preview clip when the catalog already
 * carries one, else NOTHING — full-track masters are no longer public, so
 * an unpreviewed local master must fail honestly instead of streaming.
 * Returns the src plus which kind it is so the UI can label it truthfully.
 */
export function previewSourceForSong(song: {
  slug: string;
  src: string;
}): { src: string; kind: 'video-preview' | 'apple-preview' } | null {
  const video = MANIFEST[song.slug];
  if (video) return { src: video, kind: 'video-preview' };
  if (isApplePreviewSrc(song.src)) return { src: song.src, kind: 'apple-preview' };
  return null;
}
