import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LENS_FILTERS,
  PREMADE_OVERLAYS,
  StreamStudio,
  listCameras,
  type LensFilterId,
  type OverlayId,
} from '../lib/streamStudio';
import { WhipPublisher } from '../lib/webrtcStream';

type Props = {
  whipUrl: string;
  whipReady: boolean;
  onLiveChange?: (live: boolean) => void;
  onError?: (msg: string | null) => void;
};

export function StreamStudioPanel({ whipUrl, whipReady, onLiveChange, onError }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const studioRef = useRef<StreamStudio | null>(null);
  const publisherRef = useRef<WhipPublisher | null>(null);

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState('');
  const [filter, setFilter] = useState<LensFilterId>('warmGold');
  const [overlays, setOverlays] = useState<OverlayId[]>(['liveBadge', 'watermark', 'lowerThird']);
  const [lowerTitle, setLowerTitle] = useState('3000 Studios');
  const [lowerSub, setLowerSub] = useState('Live · VIP broadcast');
  const [status, setStatus] = useState<'idle' | 'preview' | 'starting' | 'live' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const ensureStudio = useCallback(() => {
    if (!studioRef.current) {
      studioRef.current = new StreamStudio({
        filter,
        overlays,
        lowerThirdTitle: lowerTitle,
        lowerThirdSub: lowerSub,
      });
    }
    return studioRef.current;
  }, [filter, overlays, lowerTitle, lowerSub]);

  const mountCanvas = useCallback(() => {
    const studio = ensureStudio();
    const canvas = studio.getCanvas();
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.objectFit = 'cover';
    canvas.style.display = 'block';
    if (mountRef.current && mountRef.current.firstChild !== canvas) {
      mountRef.current.innerHTML = '';
      mountRef.current.appendChild(canvas);
    }
  }, [ensureStudio]);

  const startPreview = useCallback(
    async (deviceId?: string) => {
      setError(null);
      onError?.(null);
      try {
        const studio = ensureStudio();
        studio.setFilter(filter);
        studio.overlays = new Set(overlays);
        studio.lowerThirdTitle = lowerTitle;
        studio.lowerThirdSub = lowerSub;
        await studio.openCamera(deviceId || cameraId || undefined, 'user');
        studio.start();
        mountCanvas();
        const cams = await listCameras();
        setCameras(cams);
        if (!cameraId && cams[0]?.deviceId) setCameraId(cams[0].deviceId);
        setStatus((s) => (s === 'live' ? 'live' : 'preview'));
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Camera failed';
        setError(msg);
        onError?.(msg);
        setStatus('error');
      }
    },
    [cameraId, ensureStudio, filter, overlays, lowerTitle, lowerSub, mountCanvas, onError],
  );

  useEffect(() => {
    void startPreview();
    return () => {
      void publisherRef.current?.stop();
      publisherRef.current = null;
      studioRef.current?.stop();
      studioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const studio = studioRef.current;
    if (!studio) return;
    studio.setFilter(filter);
    studio.overlays = new Set(overlays);
    studio.lowerThirdTitle = lowerTitle;
    studio.lowerThirdSub = lowerSub;
  }, [filter, overlays, lowerTitle, lowerSub]);

  function toggleOverlay(id: OverlayId) {
    setOverlays((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function switchCamera(id: string) {
    setCameraId(id);
    await startPreview(id);
    if (status === 'live' && publisherRef.current && studioRef.current) {
      const out = studioRef.current.getOutputStream();
      const v = out.getVideoTracks()[0];
      if (v) await publisherRef.current.replaceVideoTrack(v);
    }
  }

  async function goLive() {
    if (!whipReady) {
      const msg = 'Paste WHIP publish URL in the Phone path section first.';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      return;
    }
    setStatus('starting');
    setError(null);
    onError?.(null);
    try {
      const studio = ensureStudio();
      if (status !== 'preview' && status !== 'live') {
        await studio.openCamera(cameraId || undefined, 'user');
        studio.start();
        mountCanvas();
      }
      studio.setFilter(filter);
      studio.overlays = new Set(overlays);
      const out = studio.getOutputStream(30);
      const publisher = new WhipPublisher(whipUrl.trim());
      publisherRef.current = publisher;
      await publisher.startWithStream(out);
      setStatus('live');
      onLiveChange?.(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not go live';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      onLiveChange?.(false);
      await publisherRef.current?.stop();
      publisherRef.current = null;
    }
  }

  async function endLive() {
    await publisherRef.current?.stop();
    publisherRef.current = null;
    setStatus('preview');
    onLiveChange?.(false);
  }

  return (
    <div className="studioPanel">
      <div className="adminCameraFrame studioPreviewFrame">
        <div ref={mountRef} className="studioCanvasMount" />
        {status === 'live' ? <div className="streamLiveBadge">● LIVE</div> : null}
        {status === 'idle' || status === 'error' ? (
          <div className="adminCameraOverlay">{error || 'Starting camera preview…'}</div>
        ) : null}
      </div>

      <div className="studioControls">
        <label className="easyField">
          <span>Camera</span>
          <select
            value={cameraId}
            onChange={(e) => void switchCamera(e.target.value)}
            className="studioSelect"
          >
            {cameras.length === 0 ? <option value="">Default camera</option> : null}
            {cameras.map((c, i) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </label>

        <div className="studioBlock">
          <span className="studioBlockLabel">Lens filters</span>
          <div className="studioChipRow">
            {LENS_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`studioChip ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="studioBlock">
          <span className="studioBlockLabel">Premade overlays</span>
          <div className="studioChipRow">
            {PREMADE_OVERLAYS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`studioChip ${overlays.includes(o.id) ? 'active' : ''}`}
                onClick={() => toggleOverlay(o.id)}
                title={o.hint}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {overlays.includes('lowerThird') ? (
          <div className="studioLowerFields">
            <label className="easyField">
              <span>Lower third title</span>
              <input value={lowerTitle} onChange={(e) => setLowerTitle(e.target.value)} />
            </label>
            <label className="easyField">
              <span>Lower third subtitle</span>
              <input value={lowerSub} onChange={(e) => setLowerSub(e.target.value)} />
            </label>
          </div>
        ) : null}

        <div className="cBtnRow">
          <button type="button" className="cBtn ghost" onClick={() => void startPreview(cameraId)}>
            Refresh preview
          </button>
          {status === 'live' ? (
            <button type="button" className="cBtn danger" onClick={() => void endLive()}>
              End Stream
            </button>
          ) : (
            <button
              type="button"
              className="cBtn primary"
              disabled={status === 'starting'}
              onClick={() => void goLive()}
            >
              {status === 'starting' ? 'Connecting…' : 'Go Live with looks'}
            </button>
          )}
        </div>

        {error ? <p className="adminError">{error}</p> : null}
        <p className="cMuted" style={{ fontSize: 12, marginTop: 8 }}>
          Filters + overlays are burned into the stream viewers receive. Switch camera anytime;
          while live it hot-swaps the video track.
        </p>
      </div>
    </div>
  );
}
