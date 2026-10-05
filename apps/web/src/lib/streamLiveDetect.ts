import { STREAM_CUSTOMER_CODE, STREAM_LIVE_INPUT_ID, STREAM_PLAYER_UID } from './streamConfig';
import { readHostLiveFlag, STREAM_LIVE_FLAG_KEY, STREAM_SCENE_CHANNEL } from './streamScene';
import { getOwnerToken } from './auth';

export type LiveDetectState = {
  live: boolean;
  source: 'lifecycle' | 'host-flag' | 'server-flag' | 'unknown';
  raw?: unknown;
};

/** Server-side live flag (D1-backed, heartbeat TTL). Cross-device: any viewer sees it. */
export async function fetchServerLiveFlag(): Promise<boolean | null> {
  try {
    const res = await fetch('/api/live-flag', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; live?: unknown };
    if (data?.ok !== true) return null;
    return data.live === true;
  } catch {
    return null;
  }
}

/**
 * Assert/clear the server-side live flag. Fire-and-forget: a failing flag
 * endpoint must never break the broadcast itself.
 */
export async function publishServerLiveFlag(live: boolean): Promise<void> {
  try {
    const token = getOwnerToken();
    await fetch('/api/live-flag', {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ live }),
    });
  } catch {
    /* non-fatal */
  }
}

export async function fetchStreamLifecycle(
  uid: string,
  customer = STREAM_CUSTOMER_CODE,
): Promise<{ live: boolean | null; raw?: unknown }> {
  try {
    const res = await fetch(`https://customer-${customer}.cloudflarestream.com/${uid}/lifecycle`, {
      cache: 'no-store',
      mode: 'cors',
    });
    if (!res.ok) return { live: null };
    const data = (await res.json()) as {
      live?: boolean;
      status?: string;
      videoUID?: string | null;
      isInput?: boolean;
    };
    if (typeof data.live === 'boolean') return { live: data.live, raw: data };
    if (data.status === 'connected' || data.status === 'live' || data.status === 'connected_and_live') {
      return { live: true, raw: data };
    }
    if (data.status === 'disconnected' || data.status === 'idle') return { live: false, raw: data };
    return { live: null, raw: data };
  } catch {
    return { live: null };
  }
}

export async function detectIsLive(): Promise<LiveDetectState> {
  if (readHostLiveFlag()) {
    return { live: true, source: 'host-flag' };
  }

  const server = await fetchServerLiveFlag();
  if (server === true) return { live: true, source: 'server-flag' };

  const [asset, input] = await Promise.all([
    fetchStreamLifecycle(STREAM_PLAYER_UID),
    fetchStreamLifecycle(STREAM_LIVE_INPUT_ID),
  ]);

  if (asset.live === true || input.live === true) {
    return { live: true, source: 'lifecycle', raw: { asset: asset.raw, input: input.raw } };
  }
  if (asset.live === false && input.live === false && server === false) {
    return { live: false, source: 'lifecycle', raw: { asset: asset.raw, input: input.raw } };
  }
  return { live: false, source: 'unknown', raw: { asset: asset.raw, input: input.raw, server } };
}

export function subscribeHostLive(cb: (live: boolean) => void): () => void {
  let last = readHostLiveFlag();

  const emit = (live: boolean) => {
    if (live === last) return;
    last = live;
    cb(live);
  };

  const onStorage = (e: StorageEvent) => {
    if (e.key === STREAM_LIVE_FLAG_KEY || e.key === '3000-stream-live-v1') {
      emit(e.newValue === '1');
    }
  };

  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(STREAM_SCENE_CHANNEL);
    ch.onmessage = (ev) => {
      if (ev.data?.type === 'live') emit(Boolean(ev.data.live));
    };
  } catch {
    /* ignore */
  }

  const poll = window.setInterval(() => {
    emit(readHostLiveFlag());
  }, 1000);

  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.clearInterval(poll);
    ch?.close();
  };
}
