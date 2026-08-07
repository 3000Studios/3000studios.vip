/** Shared stream scene: standby copy, text style, custom overlay layers. */

export const STREAM_SCENE_KEY = '3000-stream-scene-v2';
export const STREAM_SCENE_CHANNEL = '3000-stream-scene';
export const STREAM_LIVE_FLAG_KEY = '3000-stream-live-v1';
export const STREAM_MODE_KEY = '3000-stream-mode-v1';

export type OverlayLayerType = 'css' | 'html' | 'image' | 'iframe' | 'ticker';

export type StreamOverlayLayer = {
  id: string;
  name: string;
  type: OverlayLayerType;
  /** CSS rules, HTML snippet, image URL, or iframe URL */
  content: string;
  x: number; // % 0-100
  y: number;
  w: number; // %
  h: number;
  zIndex: number;
  opacity: number;
  visible: boolean;
  /** free-form style attribute */
  style?: string;
};

export type StandbyTextStyle = {
  text: string;
  subtext: string;
  ticker: string;
  fontFamily: string;
  fontSize: number; // px at 1080p scale
  fontWeight: number;
  color: string;
  subColor: string;
  textShadow: string;
  letterSpacing: string;
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  align: 'left' | 'center' | 'right';
  x: number; // %
  y: number;
  customCss: string;
};

export type StreamScene = {
  version: 2;
  updatedAt: string;
  standby: StandbyTextStyle;
  layers: StreamOverlayLayer[];
  /** soft music under standby */
  standbyMusic: boolean;
};

export const DEFAULT_SCENE: StreamScene = {
  version: 2,
  updatedAt: new Date().toISOString(),
  standbyMusic: true,
  standby: {
    text: 'Stream will be live soon',
    subtext: '3000 Studios · hang tight',
    ticker: '3000 STUDIOS · LIVE SOON · 3000STUDIOS.VIP · ',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 42,
    fontWeight: 800,
    color: '#ffd700',
    subColor: 'rgba(244,239,231,0.82)',
    textShadow: '0 4px 28px rgba(255,215,0,0.35)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    align: 'center',
    x: 50,
    y: 72,
    customCss: '',
  },
  layers: [],
};

export function loadStreamScene(): StreamScene {
  try {
    const raw = localStorage.getItem(STREAM_SCENE_KEY);
    if (!raw) return structuredClone(DEFAULT_SCENE);
    const parsed = JSON.parse(raw) as StreamScene;
    return {
      ...DEFAULT_SCENE,
      ...parsed,
      standby: { ...DEFAULT_SCENE.standby, ...parsed.standby },
      layers: Array.isArray(parsed.layers) ? parsed.layers : [],
    };
  } catch {
    return structuredClone(DEFAULT_SCENE);
  }
}

export function saveStreamScene(scene: StreamScene) {
  const next = { ...scene, version: 2 as const, updatedAt: new Date().toISOString() };
  localStorage.setItem(STREAM_SCENE_KEY, JSON.stringify(next));
  try {
    const ch = new BroadcastChannel(STREAM_SCENE_CHANNEL);
    ch.postMessage({ type: 'scene', scene: next });
    ch.close();
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent('3000-stream-scene', { detail: next }));
  } catch {
    /* ignore */
  }
  return next;
}

export function subscribeStreamScene(cb: (scene: StreamScene) => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STREAM_SCENE_KEY && e.newValue) {
      try {
        cb(JSON.parse(e.newValue) as StreamScene);
      } catch {
        /* ignore */
      }
    }
  };
  const onCustom = (e: Event) => {
    cb((e as CustomEvent).detail as StreamScene);
  };
  let ch: BroadcastChannel | null = null;
  try {
    ch = new BroadcastChannel(STREAM_SCENE_CHANNEL);
    ch.onmessage = (ev) => {
      if (ev.data?.type === 'scene' && ev.data.scene) cb(ev.data.scene as StreamScene);
    };
  } catch {
    /* ignore */
  }
  window.addEventListener('storage', onStorage);
  window.addEventListener('3000-stream-scene', onCustom);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener('3000-stream-scene', onCustom);
    ch?.close();
  };
}

export function newOverlayLayer(partial?: Partial<StreamOverlayLayer>): StreamOverlayLayer {
  return {
    id: crypto.randomUUID(),
    name: partial?.name || 'Overlay',
    type: partial?.type || 'css',
    content: partial?.content || '/* your CSS or HTML */\n.my-fx { animation: pulse 2s infinite; }',
    x: partial?.x ?? 10,
    y: partial?.y ?? 10,
    w: partial?.w ?? 40,
    h: partial?.h ?? 20,
    zIndex: partial?.zIndex ?? 10,
    opacity: partial?.opacity ?? 1,
    visible: partial?.visible ?? true,
    style: partial?.style || '',
  };
}

export function setHostLiveFlag(live: boolean) {
  localStorage.setItem(STREAM_LIVE_FLAG_KEY, live ? '1' : '0');
  localStorage.setItem(STREAM_MODE_KEY, live ? 'webrtc' : 'off');
  // Also mirror legacy key used elsewhere
  try {
    localStorage.setItem('3000-stream-live-v1', live ? '1' : '0');
  } catch {
    /* ignore */
  }
  try {
    const ch = new BroadcastChannel(STREAM_SCENE_CHANNEL);
    ch.postMessage({ type: 'live', live });
    ch.close();
  } catch {
    /* ignore */
  }
  try {
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live } }));
  } catch {
    /* ignore */
  }
}

export function readHostLiveFlag(): boolean {
  return localStorage.getItem(STREAM_LIVE_FLAG_KEY) === '1';
}
