import { STREAM_CUSTOMER_CODE, STREAM_PLAYER_UID } from './streamConfig';
import { readHostLiveFlag, STREAM_SCENE_CHANNEL } from './streamScene';

export type LiveDetectState = {
  live: boolean;
  source: 'lifecycle' | 'host-flag' | 'unknown';
};

/** Cloudflare Stream input/video lifecycle */
export async function fetchStreamLifecycle(
  uid = STREAM_PLAYER_UID,
  customer = STREAM_CUSTOMER_CODE,
): Promise<boolean | null> {
  try {
    const res = await fetch(`https://customer-${customer}.cloudflarestream.com/${uid}/lifecycle`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { live?: boolean; status?: string };
    if (typeof data.live === 'boolean') return data.live;
    if (data.status === 'connected' || data.status === 'live') return true;
    if (data.status === 'disconnected') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Prefer Cloudflare lifecycle; fall back to same-browser host flag (admin Go Live).
 */
export async function detectIsLive(): Promise<LiveDetectState> {
  const life = await fetchStreamLifecycle();
  if (life === true) return { live: true, source: 'lifecycle' };
  if (life === false) {
    // Host may still be flagging live before CF flips lifecycle
    if (readHostLiveFlag()) return { live: true, source: 'host-flag' };
    return { live: false, source: 'lifecycle' };
  }
  if (readHostLiveFlag()) return { live: true, source: 'host-flag' };
  return { live: false, source: 'unknown' };
}

export function subscribeHostLive(cb: (live: boolean) => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === '3000-stream-live-v1') cb(e.newValue === '1');
  };
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(STREAM_SCENE_CHANNEL);
    ch.onmessage = (ev) => {
      if (ev.data?.type === 'live') cb(Boolean(ev.data.live));
    };
  } catch {
    /* ignore */
  }
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('storage', onStorage);
    ch?.close();
  };
}
