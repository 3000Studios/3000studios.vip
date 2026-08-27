/**
 * Cloudflare Stream configuration for 3000 Studios VIP.
 *
 * Playback protocols:
 *  - Hosted Stream Player (iframe)
 *  - HLS / DASH manifests (custom web/mobile players)
 *  - WebRTC WHEP (sub-second browser playback from the live input)
 *  - SRT / RTMPS (pro apps: OBS, ffplay, vMix — not browsers)
 *
 * Publish (browser ultra-low latency):
 *  - WebRTC WHIP publish URL (secret path — for admin /phone studio only)
 *
 * Live input id is used for WHIP publish and WHEP browser playback.
 */

/** customer-*.cloudflarestream.com subdomain code */
export const STREAM_CUSTOMER_CODE =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || 'wx8j23tjjjpkb37k';

/**
 * Hosted Stream Player video / asset UID (from Stream dashboard → Embed).
 * Used for iframe, HLS, DASH, SRT, and RTMPS playback.
 */
export const STREAM_PLAYER_UID =
  import.meta.env.VITE_STREAM_PLAYER_UID?.toString().trim() ||
  import.meta.env.VITE_STREAM_VIDEO_UID?.toString().trim() ||
  '3e4ea5b57e0ce5cc54fd519ba2b7ae7d';

/** Live input for WHIP/RTMPS publish and WHEP playback (phone + admin). */
export const STREAM_LIVE_INPUT_ID =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() ||
  '3e4ea5b57e0ce5cc54fd519ba2b7ae7d';

/**
 * Browser ultra-low latency **publish** (WHIP).
 * Secret is embedded in the path (not the public asset UID alone).
 * Dashboard → Stream → WebRTC (WHIP) URL.
 * Override with VITE_STREAM_WHIP_URL if keys rotate.
 */
export const STREAM_WHIP_PUBLISH_URL =
  import.meta.env.VITE_STREAM_WHIP_URL?.toString().trim() ||
  'https://customer-wx8j23tjjjpkb37k.cloudflarestream.com/aec35a431bd94081d29586ba38b83e25k3e4ea5b57e0ce5cc54fd519ba2b7ae7d/webRTC/publish';

/** OBS / encoder stream key for the same live input. */
export const STREAM_RTMPS_PUBLISH_KEY =
  import.meta.env.VITE_STREAM_RTMPS_PUBLISH_KEY?.toString().trim() ||
  '75c893f2c0aedfe17eb91d2761a54d45k3e4ea5b57e0ce5cc54fd519ba2b7ae7d';

// ─── URL builders ─────────────────────────────

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
 * WebRTC WHEP playback (sub-second). Use the live input id, not the hosted player asset UID.
 * Dashboard: …/{liveInputId}/webRTC/play
 */
export function buildStreamWhepUrl(liveInputId = STREAM_LIVE_INPUT_ID, customer = STREAM_CUSTOMER_CODE): string {
  return `https://customer-${customer}.cloudflarestream.com/${liveInputId}/webRTC/play`;
}

/**
 * SRT playback for pro tools (ffplay, OBS, vMix). Not for browsers.
 * Prefer env override so keys can rotate without a code change.
 */
export function buildStreamSrtPlaybackUrl(uid = STREAM_PLAYER_UID): string {
  const fromEnv = import.meta.env.VITE_STREAM_SRT_PLAYBACK_URL?.toString().trim();
  if (fromEnv) return fromEnv;
  void uid;
  return '';
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
  void uid;
  return '';
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
export const STREAM_WHEP_URL = buildStreamWhepUrl(STREAM_LIVE_INPUT_ID);
export const STREAM_SRT_PLAYBACK_URL = buildStreamSrtPlaybackUrl();
export const STREAM_RTMPS_PLAYBACK_KEY = buildStreamRtmpsPlaybackKey();
export const STREAM_WHIP_URL = STREAM_WHIP_PUBLISH_URL;

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

/** All protocol-specific playback endpoints for the featured asset and live input. */
export function getStreamPlaybackEndpoints(uid = STREAM_PLAYER_UID): StreamProtocolEndpoint[] {
  return [
    {
      id: 'whep',
      label: 'WebRTC (WHEP) Playback URL',
      value: STREAM_WHEP_URL,
      kind: 'url',
      clients: 'Browser WHEP clients · low-latency WebRTC from the live input',
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
