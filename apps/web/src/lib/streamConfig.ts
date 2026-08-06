/**
 * Cloudflare Stream configuration for 3000 Studios VIP.
 *
 * Playback uses the hosted Stream Player (iframe).
 * Live ingest (WHIP/RTMPS) still uses the live input id separately.
 */

/** customer-*.cloudflarestream.com subdomain code */
export const STREAM_CUSTOMER_CODE =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || 'wx8j23tjjjpkb37k';

/**
 * Hosted Stream Player video / asset UID (from Stream dashboard → Embed).
 * This is what the public iframe plays.
 */
export const STREAM_PLAYER_UID =
  import.meta.env.VITE_STREAM_PLAYER_UID?.toString().trim() ||
  import.meta.env.VITE_STREAM_VIDEO_UID?.toString().trim() ||
  '3f100cf1895b63cf27b748c69c8ba10c';

/** Live input for WHIP/RTMPS publish (admin go-live). Different from player UID. */
export const STREAM_LIVE_INPUT_ID =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() ||
  '654382980fc1896d6e16b1e66a299bd6';

export function buildStreamPlayerUrl(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/iframe`;
}

export function buildStreamWatchUrl(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/watch`;
}

export function buildStreamManifestHls(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
}

/** Hosted Stream Player iframe (responsive 16:9 shell provided by StreamFrame / CSS). */
export function streamPlayerIframeSrc(opts?: {
  uid?: string;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  primaryColor?: string;
}): string {
  const base = buildStreamPlayerUrl(opts?.uid);
  const params = new URLSearchParams();
  if (opts?.autoplay) params.set('autoplay', 'true');
  if (opts?.muted) params.set('muted', 'true');
  if (opts?.controls === false) params.set('controls', 'false');
  if (opts?.primaryColor) params.set('primaryColor', opts.primaryColor.replace('#', ''));
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export const STREAM_PLAYER_URL = buildStreamPlayerUrl();
export const STREAM_PLAYER_EMBED_SRC = streamPlayerIframeSrc({
  autoplay: true,
  muted: true,
  primaryColor: 'ffd700',
});
