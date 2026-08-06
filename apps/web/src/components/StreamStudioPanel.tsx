import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LENS_FILTERS,
  PREMADE_OVERLAYS,
  StreamStudio,
  listCameras,
  type LensFilterId,
  type OverlayId,
} from '../lib/streamStudio';
import { WhipPublisher, describeCameraError, validateWhipUrl } from '../lib/webrtcStream';

type Props = {
  whipUrl: string;
  whipReady: boolean;
  liveInputId?: string;
  onLiveChange?: (live: boolean) => void;
  onError?: (msg: string | null) => void;
};

export function StreamStudioPanel({ whipUrl, whipReady, liveInputId, onLiveChange, onError }: Props) {
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
  const [permHint, setPermHint] = useState(false);

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

  const refreshCameraList = useCallback(async () => {
    const cams = await listCameras();
    setCameras(cams);
    setCameraId((prev) => {
      if (prev && cams.some((c) => c.deviceId === prev)) return prev;
      return cams[0]?.deviceId || '';
    });
  }, []);

  const startPreview = useCallback(
    async (deviceId?: string) => {
      setError(null);
      onError?.(null);
      setPermHint(false);
      try {
        const studio = ensureStudio();
        studio.setFilter(filter);
        studio.overlays = new Set(overlays);
        studio.lowerThirdTitle = lowerTitle;
        studio.lowerThirdSub = lowerSub;
        await studio.openCamera(deviceId || cameraId || undefined, 'user');
        studio.start();
        mountCanvas();
        // Labels only appear after permission
        await refreshCameraList();
        setStatus((s) => (s === 'live' ? 'live' : 'preview'));
      } catch (err) {
        const msg = describeCameraError(err);
        setError(msg);
        onError?.(msg);
        setStatus('error');
        setPermHint(true);
      }
    },
    [cameraId, ensureStudio, filter, overlays, lowerTitle, lowerSub, mountCanvas, onError, refreshCameraList],
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
      const out = studioRef.current.getOutputStream(30, true);
      const v = out.getVideoTracks()[0];
      if (v) await publisherRef.current.replaceVideoTrack(v);
    }
  }

  async function goLive() {
    const check = validateWhipUrl(whipUrl, liveInputId);
    if (!check.ok) {
      setError(check.reason);
      onError?.(check.reason);
      setStatus('error');
      return;
    }
    if (!whipReady) {
      const msg = 'Paste a valid WHIP publish URL (…/<SECRET>/webRTC/publish) in the Phone path section first.';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      return;
    }

    setStatus('starting');
    setError(null);
    onError?.(null);

    try {
      // End any previous WHIP session cleanly
      await publisherRef.current?.stop();
      publisherRef.current = null;

      const studio = ensureStudio();
      // Always ensure camera is open before WHIP — do not rely on idle preview window
      await studio.openCamera(cameraId || undefined, 'user');
      studio.start();
      mountCanvas();
      studio.setFilter(filter);
      studio.overlays = new Set(overlays);
      studio.lowerThirdTitle = lowerTitle;
      studio.lowerThirdSub = lowerSub;

      // Give the canvas a couple frames so captureStream is not black
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const out = studio.getOutputStream(30, true);
      if (!out.getVideoTracks().length) {
        throw new Error('Canvas has no video track. Allow camera, then try Go Live again.');
      }

      const publisher = new WhipPublisher(check.endpoint);
      publisherRef.current = publisher;
      // This POSTs application/sdp to Cloudflare WHIP (the WebRTC handshake)
      await publisher.startWithStream(out);

      setStatus('live');
      onLiveChange?.(true);
      await refreshCameraList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not go live';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      onLiveChange?.(false);
      await publisherRef.current?.stop();
      publisherRef.current = null;
      // Keep local preview if possible
      void startPreview(cameraId);
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
        {status === 'live' ? <div className="streamLiveBadge">● LIVE · WHIP</div> : null}
        {status === 'starting' ? <div className="adminCameraOverlay">Connecting WHIP (POST SDP)…</div> : null}
        {status === 'idle' || (status === 'error' && !mountRef.current?.firstChild) ? (
          <div className="adminCameraOverlay">{error || 'Starting camera preview…'}</div>
        ) : null}
      </div>

      <div className="studioControls">
        {permHint ? (
          <div className="studioPermBanner">
            <strong>Camera access needed</strong>
            <p>
              Allow <em>Camera</em> and <em>Microphone</em> for this site (Logi C615 or Integrated Camera). Then tap
              Allow &amp; preview.
            </p>
            <button type="button" className="cBtn primary" onClick={() => void startPreview(cameraId)}>
              Allow &amp; preview
            </button>
          </div>
        ) : null}

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
              {status === 'starting' ? 'WHIP connecting…' : 'Go Live with looks'}
            </button>
          )}
        </div>

        {error ? <p className="adminError">{error}</p> : null}
        <p className="cMuted studioHelp">
          <strong>Do not wait for the right-hand “viewers” window while offline</strong> — that panel only goes live
          after WHIP succeeds. Flow: allow camera → set filters/overlays → paste correct WHIP URL →{' '}
          <strong>Go Live with looks</strong> (sends POST application/sdp to Cloudflare).
        </p>
      </div>
    </div>
  );
}
