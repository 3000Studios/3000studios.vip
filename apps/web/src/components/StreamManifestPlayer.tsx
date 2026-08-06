import { useEffect, useRef, useState } from 'react';
import {
  STREAM_DASH_URL,
  STREAM_HLS_URL,
  STREAM_PLAYER_UID,
  buildStreamManifestDash,
  buildStreamManifestHls,
} from '../lib/streamConfig';

export type ManifestMode = 'hls' | 'dash';

type Props = {
  uid?: string;
  mode?: ManifestMode;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
  title?: string;
  onStatus?: (status: 'loading' | 'ready' | 'error' | 'playing' | 'paused') => void;
};

type HlsLike = {
  destroy: () => void;
  loadSource: (url: string) => void;
  attachMedia: (media: HTMLMediaElement) => void;
  startLoad: () => void;
  recoverMediaError: () => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
};

type DashPlayerLike = {
  initialize: (el: HTMLMediaElement, url: string, autoplay: boolean) => void;
  reset: () => void;
  updateSettings: (s: unknown) => void;
  on: (event: string, cb: (e: unknown) => void) => void;
};

type HlsErrorData = {
  fatal?: boolean;
  type?: string;
  details?: string;
};

/**
 * Bring-your-own Cloudflare Stream player using HLS / DASH manifests.
 * Libraries are loaded on demand so the main bundle stays light.
 * - Safari / iOS: native HLS when possible
 * - Chrome / Firefox / Edge: hls.js
 * - DASH: dash.js
 */
export function StreamManifestPlayer({
  uid = STREAM_PLAYER_UID,
  mode = 'hls',
  className = '',
  autoplay = true,
  muted = true,
  title = '3000 Studios Stream',
  onStatus,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<HlsLike | null>(null);
  const dashRef = useRef<DashPlayerLike | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [engine, setEngine] = useState('…');

  const hlsUrl = buildStreamManifestHls(uid);
  const dashUrl = buildStreamManifestDash(uid);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    setError(null);
    onStatus?.('loading');

    const teardown = () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (dashRef.current) {
        try {
          dashRef.current.reset();
        } catch {
          /* ignore */
        }
        dashRef.current = null;
      }
      video.removeAttribute('src');
      video.load();
    };

    teardown();

    const markReady = () => {
      if (cancelled) return;
      onStatus?.('ready');
      if (autoplay) {
        void video.play().then(() => onStatus?.('playing')).catch(() => onStatus?.('paused'));
      }
    };

    const markError = (msg: string) => {
      if (cancelled) return;
      setError(msg);
      onStatus?.('error');
    };

    void (async () => {
      try {
        if (mode === 'dash') {
          setEngine('dash.js');
          const dashMod = await import('dashjs');
          if (cancelled) return;
          const MediaPlayer = dashMod.MediaPlayer || (dashMod as unknown as { default: typeof dashMod }).default?.MediaPlayer;
          if (!MediaPlayer) throw new Error('dash.js MediaPlayer not available');
          const player = MediaPlayer().create() as unknown as DashPlayerLike;
          dashRef.current = player;
          player.updateSettings({
            streaming: {
              delay: { liveDelayFragmentCount: 4 },
              buffer: { fastSwitchEnabled: true },
            },
          });
          player.initialize(video, dashUrl, autoplay);
          // dash event names differ by version — soft-ready after init
          window.setTimeout(markReady, 800);
          return;
        }

        // HLS
        const hlsMod = await import('hls.js');
        if (cancelled) return;
        const Hls = hlsMod.default;
        const canNative = Boolean(video.canPlayType('application/vnd.apple.mpegurl'));

        if (Hls.isSupported()) {
          setEngine('hls.js');
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90,
          }) as unknown as HlsLike & {
            on: (e: string | number, cb: (event: unknown, data: HlsErrorData) => void) => void;
          };
          hlsRef.current = hls;
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => markReady());
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            const err = data as HlsErrorData;
            if (!err?.fatal) return;
            if (err.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
              return;
            }
            if (err.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            markError(err.details || 'HLS fatal error');
            hls.destroy();
          });
        } else if (canNative) {
          setEngine('native HLS');
          video.src = hlsUrl;
          video.addEventListener('loadedmetadata', markReady, { once: true });
          video.addEventListener('error', () => markError('Native HLS failed to load the manifest'), {
            once: true,
          });
        } else {
          setEngine('unsupported');
          markError('This browser cannot play HLS. Try Safari, or switch to DASH / Stream Player.');
        }
      } catch (err) {
        markError(err instanceof Error ? err.message : 'Player failed to load');
      }
    })();

    const onPlay = () => onStatus?.('playing');
    const onPause = () => onStatus?.('paused');
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      cancelled = true;
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      teardown();
    };
  }, [mode, hlsUrl, dashUrl, autoplay, onStatus]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  return (
    <div className={`cfManifestPlayer ${className}`.trim()}>
      <video
        ref={videoRef}
        className="cfManifestVideo"
        controls
        playsInline
        autoPlay={autoplay}
        muted={muted}
        title={title}
      />
      <div className="cfManifestMeta" aria-hidden="true">
        <span>{mode.toUpperCase()}</span>
        <span>{engine}</span>
      </div>
      {error ? <p className="cfManifestError">{error}</p> : null}
      <div className="cfManifestLinks">
        <a href={mode === 'dash' ? dashUrl : hlsUrl} target="_blank" rel="noreferrer">
          Open {mode.toUpperCase()} manifest
        </a>
      </div>
    </div>
  );
}

export function ManifestUrlList({ uid = STREAM_PLAYER_UID }: { uid?: string }) {
  const hls = buildStreamManifestHls(uid);
  const dash = buildStreamManifestDash(uid);
  return (
    <ul className="streamMetaList">
      <li>
        <strong>HLS Manifest URL</strong>
        <a href={hls} target="_blank" rel="noreferrer">
          {hls}
        </a>
        <code className="streamMetaHint">Web: hls.js · Safari native · Mobile: ExoPlayer / AVPlayer</code>
      </li>
      <li>
        <strong>DASH Manifest URL</strong>
        <a href={dash} target="_blank" rel="noreferrer">
          {dash}
        </a>
        <code className="streamMetaHint">Web: dash.js / Shaka · Mobile: ExoPlayer</code>
      </li>
      <li>
        <strong>Site defaults</strong>
        <code>
          {STREAM_HLS_URL === hls ? 'HLS ✓' : 'HLS'} · {STREAM_DASH_URL === dash ? 'DASH ✓' : 'DASH'}
        </code>
      </li>
    </ul>
  );
}
