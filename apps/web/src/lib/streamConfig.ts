/**
 * Cloudflare Stream configuration for 3000 Studios VIP.
 *
 * Playback protocols (asset UID):
 *  - Hosted Stream Player (iframe)
 *  - HLS / DASH manifests (custom web/mobile players)
 *  - WebRTC WHEP (sub-second browser playback)
 *  - SRT / RTMPS (pro apps: OBS, ffplay, vMix — not browsers)
 *
 * Live ingest (WHIP publish / RTMPS publish) uses STREAM_LIVE_INPUT_ID separately.
 */

/** customer-*.cloudflarestream.com subdomain code */
export const STREAM_CUSTOMER_CODE =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || 'wx8j23tjjjpkb37k';

/**
 * Hosted Stream Player video / asset UID (from Stream dashboard → Embed).
 * Used for iframe, HLS, DASH, WHEP, SRT, and RTMPS playback.
 */
export const STREAM_PLAYER_UID =
  import.meta.env.VITE_STREAM_PLAYER_UID?.toString().trim() ||
  import.meta.env.VITE_STREAM_VIDEO_UID?.toString().trim() ||
  '3f100cf1895b63cf27b748c69c8ba10c';

/** Live input for WHIP/RTMPS *publish* (admin go-live). Different from player UID. */
export const STREAM_LIVE_INPUT_ID =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() ||
  '654382980fc1896d6e16b1e66a299bd6';

// ─── URL builders ─────────────────────────────────────────────

export function buildStreamPlayerUrl(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/iframe`;
}

export function buildStreamWatchUrl(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/watch`;
}

/** HLS manifest for custom web / mobile players */
export function buildStreamManifestHls(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/manifest/video.m3u8`;
}

/** DASH manifest for custom web / mobile players */
export function buildStreamManifestDash(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/manifest/video.mpd`;
}

/**
 * WebRTC WHEP playback (sub-second). Browser-capable via WHIP/WHEP clients.
 * Dashboard: …/{uid}/webRTC/play
 */
export function buildStreamWhepUrl(uid = STREAM_PLAYER_UID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${uid}/webRTC/play`;
}

/**
 * SRT playback for pro tools (ffplay, OBS, vMix). Not for browsers.
 * Prefer env override so keys can rotate without a code change.
 */
export function buildStreamSrtPlaybackUrl(uid = STREAM_PLAYER_UID): string {
  const fromEnv = import.meta.env.VITE_STREAM_SRT_PLAYBACK_URL?.toString().trim();
  if (fromEnv) return fromEnv;
  // Default from Cloudflare Stream dashboard for this asset
  return `srt://live.cloudflare.com:778?passphrase=5c0492386ba0e6cd27816862ffa224b9k${uid}&streamid=play${uid}`;
}

/** RTMPS playback server (pro tools). */
export const STREAM_RTMPS_PLAYBACK_SERVER =
  import.meta.env.VITE_STREAM_RTMPS_PLAYBACK_SERVER?.toString().trim() ||
  'rtmps://live.cloudflare.com:443/live/';

/**
 * RTMPS playback stream key for the featured asset.
 * Prefer env: VITE_STREAM_RTMPS_PLAYBACK_KEY
 */
export function buildStreamRtmpsPlaybackKey(uid = STREAM_PLAYER_UID): string {
  const fromEnv = import.meta.env.VITE_STREAM_RTMPS_PLAYBACK_KEY?.toString().trim();
  if (fromEnv) return fromEnv;
  return `82d36a917232837958c54f5e217b65e2k${uid}`;
}

/** Hosted Stream Player iframe (responsive 16:9 shell). */
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
export const STREAM_HLS_URL = buildStreamManifestHls();
export const STREAM_DASH_URL = buildStreamManifestDash();
export const STREAM_WHEP_URL = buildStreamWhepUrl();
export const STREAM_SRT_PLAYBACK_URL = buildStreamSrtPlaybackUrl();
export const STREAM_RTMPS_PLAYBACK_KEY = buildStreamRtmpsPlaybackKey();

export const STREAM_PLAYER_EMBED_SRC = streamPlayerIframeSrc({
  autoplay: true,
  muted: true,
  primaryColor: 'ffd700',
});

export type StreamProtocolEndpoint = {
  id: string;
  label: string;
  value: string;
  kind: 'url' | 'key' | 'server';
  clients: string;
  browser: boolean;
};

/** All protocol-specific playback endpoints for the featured asset. */
export function getStreamPlaybackEndpoints(uid = STREAM_PLAYER_UID): StreamProtocolEndpoint[] {
  return [
    {
      id: 'whep',
      label: 'WebRTC (WHEP) Playback URL',
      value: buildStreamWhepUrl(uid),
      kind: 'url',
      clients: 'Browser WHEP clients · low-latency WebRTC',
      browser: true,
    },
    {
      id: 'hls',
      label: 'HLS Manifest URL',
      value: buildStreamManifestHls(uid),
      kind: 'url',
      clients: 'hls.js · Safari native · ExoPlayer · AVPlayer',
      browser: true,
    },
    {
      id: 'dash',
      label: 'DASH Manifest URL',
      value: buildStreamManifestDash(uid),
      kind: 'url',
      clients: 'dash.js · Shaka · ExoPlayer',
      browser: true,
    },
    {
      id: 'srt',
      label: 'SRT Playback URL',
      value: buildStreamSrtPlaybackUrl(uid),
      kind: 'url',
      clients: 'ffplay · OBS · vMix · Wirecast (not browsers)',
      browser: false,
    },
    {
      id: 'rtmps-server',
      label: 'RTMPS Playback URL',
      value: STREAM_RTMPS_PLAYBACK_SERVER,
      kind: 'server',
      clients: 'OBS / pro tools — pair with RTMPS Playback Key',
      browser: false,
    },
    {
      id: 'rtmps-key',
      label: 'RTMPS Playback Key',
      value: buildStreamRtmpsPlaybackKey(uid),
      kind: 'key',
      clients: 'Stream key field in OBS / pro players',
      browser: false,
    },
    {
      id: 'iframe',
      label: 'Stream Player URL',
      value: buildStreamPlayerUrl(uid),
      kind: 'url',
      clients: 'Cloudflare hosted iframe embed',
      browser: true,
    },
  ];
}
