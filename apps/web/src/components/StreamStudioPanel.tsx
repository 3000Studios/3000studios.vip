import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LENS_FILTERS,
  PREMADE_OVERLAYS,
  StreamStudio,
  listCameras,
  type CameraRotation,
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

type MediaPermission = 'prompt' | 'granted' | 'denied' | 'unsupported';

type PermissionSnapshot = {
  camera: MediaPermission;
  microphone: MediaPermission;
};

const INITIAL_PERMISSIONS: PermissionSnapshot = { camera: 'prompt', microphone: 'prompt' };

const ROTATIONS: { value: CameraRotation; label: string }[] = [
  { value: 0, label: '0°' },
  { value: 90, label: '90°' },
  { value: 180, label: '180°' },
  { value: 270, label: '270°' },
];

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
  const [rotation, setRotation] = useState<CameraRotation>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [status, setStatus] = useState<'idle' | 'preview' | 'starting' | 'live' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [permHint, setPermHint] = useState(false);
  const [hasCanvas, setHasCanvas] = useState(false);
  const [permissions, setPermissions] = useState<PermissionSnapshot>(INITIAL_PERMISSIONS);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const canRequestMedia =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && window.isSecureContext;

  const refreshPermissions = useCallback(async () => {
    if (!navigator.permissions?.query) {
      setPermissions({ camera: 'unsupported', microphone: 'unsupported' });
      return;
    }

    const read = async (name: 'camera' | 'microphone'): Promise<MediaPermission> => {
      try {
        const result = await navigator.permissions.query({ name } as PermissionDescriptor);
        return result.state;
      } catch {
        return 'unsupported';
      }
    };

    const [camera, microphone] = await Promise.all([read('camera'), read('microphone')]);
    setPermissions({ camera, microphone });
  }, []);

  const applyFraming = useCallback((studio: StreamStudio) => {
    studio.setCameraFraming({ rotation, flipH, flipV, zoom, panX, panY });
  }, [rotation, flipH, flipV, zoom, panX, panY]);

  const ensureStudio = useCallback(() => {
    if (!studioRef.current) {
      studioRef.current = new StreamStudio({
        filter,
        overlays,
        lowerThirdTitle: lowerTitle,
        lowerThirdSub: lowerSub,
        rotation,
        flipH,
        flipV,
        zoom,
        panX,
        panY,
      });
    }
    return studioRef.current;
  }, [filter, overlays, lowerTitle, lowerSub, rotation, flipH, flipV, zoom, panX, panY]);

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
      setHasCanvas(true);
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
      if (!canRequestMedia) {
        const msg = 'Camera needs HTTPS. Stay on https://3000studios.vip/admin.';
        setError(msg);
        onError?.(msg);
        setStatus('error');
        return false;
      }

      setCheckingAccess(true);
      setError(null);
      onError?.(null);
      setPermHint(false);
      try {
        const studio = ensureStudio();
        studio.setFilter(filter);
        studio.overlays = new Set(overlays);
        studio.lowerThirdTitle = lowerTitle;
        studio.lowerThirdSub = lowerSub;
        applyFraming(studio);
        await studio.openCamera(deviceId || cameraId || undefined, 'user');
        const preview = studio.getOutputStream(30, true);
        const cameraTrack = preview.getVideoTracks()[0];
        const microphoneTrack = preview.getAudioTracks()[0];
        if (!cameraTrack || cameraTrack.readyState !== 'live') {
          throw new Error('Camera did not start. Tap Allow on the browser prompt.');
        }
        if (!microphoneTrack || microphoneTrack.readyState !== 'live') {
          throw new Error('Microphone did not start. Allow mic, then tap Access camera again.');
        }
        studio.start();
        mountCanvas();
        await refreshCameraList();
        await refreshPermissions();
        setStatus((s) => (s === 'live' ? 'live' : 'preview'));
        return true;
      } catch (err) {
        const msg = describeCameraError(err);
        setError(msg);
        onError?.(msg);
        setStatus('error');
        setPermHint(true);
        await refreshPermissions();
        return false;
      } finally {
        setCheckingAccess(false);
      }
    },
    [
      cameraId,
      ensureStudio,
      filter,
      overlays,
      lowerTitle,
      lowerSub,
      applyFraming,
      mountCanvas,
      onError,
      canRequestMedia,
      refreshCameraList,
      refreshPermissions,
    ],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshPermissions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshPermissions]);

  useEffect(() => {
    return () => {
      void publisherRef.current?.stop();
      publisherRef.current = null;
      studioRef.current?.stop();
      studioRef.current = null;
      setHasCanvas(false);
    };
  }, []);

  useEffect(() => {
    const studio = studioRef.current;
    if (!studio) return;
    studio.setFilter(filter);
    studio.overlays = new Set(overlays);
    studio.lowerThirdTitle = lowerTitle;
    studio.lowerThirdSub = lowerSub;
    applyFraming(studio);
  }, [filter, overlays, lowerTitle, lowerSub, applyFraming]);

  const permissionSummary =
    permissions.camera === 'granted' && permissions.microphone === 'granted'
      ? 'Camera and mic ready'
      : permissions.camera === 'denied' || permissions.microphone === 'denied'
        ? 'Browser is blocking camera or mic — tap the lock icon and Allow'
        : 'Tap Access camera, then Allow';

  function toggleOverlay(id: OverlayId) {
    setOverlays((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function resetFraming() {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setZoom(1);
    setPanX(0);
    setPanY(0);
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
    if (!check.ok || !whipReady) {
      const reason = !check.ok ? check.reason : 'Stream path is not ready yet.';
      setError(reason);
      onError?.(reason);
      setStatus('error');
      return;
    }

    setStatus('starting');
    setError(null);
    onError?.(null);

    try {
      await publisherRef.current?.stop();
      publisherRef.current = null;

      const studio = ensureStudio();
      await studio.openCamera(cameraId || undefined, 'user');
      studio.start();
      mountCanvas();
      studio.setFilter(filter);
      studio.overlays = new Set(overlays);
      studio.lowerThirdTitle = lowerTitle;
      studio.lowerThirdSub = lowerSub;
      applyFraming(studio);

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const out = studio.getOutputStream(30, true);
      if (!out.getVideoTracks().length) {
        throw new Error('No camera picture yet. Tap Access camera first.');
      }

      const publisher = new WhipPublisher(check.endpoint);
      publisherRef.current = publisher;
      await publisher.startWithStream(out);

      setStatus('live');
      onLiveChange?.(true);
      window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: true } }));
      await refreshCameraList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not go live';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      onLiveChange?.(false);
      await publisherRef.current?.stop();
      publisherRef.current = null;
      void startPreview(cameraId);
    }
  }

  async function endLive() {
    await publisherRef.current?.stop();
    publisherRef.current = null;
    setStatus('preview');
    onLiveChange?.(false);
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: false } }));
  }

  return (
    <div className="studioPanel">
      <div className="adminCameraFrame studioPreviewFrame">
        <div ref={mountRef} className="studioCanvasMount" />
        {status === 'live' ? <div className="streamLiveBadge">● LIVE</div> : null}
        {status === 'starting' ? <div className="adminCameraOverlay">Going live…</div> : null}
        {status === 'idle' || (status === 'error' && !hasCanvas) ? (
          <div className="adminCameraOverlay">{error || 'Tap Access camera'}</div>
        ) : null}
        <div className="studioFramingBadge" aria-hidden="true">
          {rotation}° · {zoom.toFixed(1)}x
          {flipH ? ' · ↔' : ''}
          {flipV ? ' · ↕' : ''}
        </div>
      </div>

      <div className="studioControls">
        {status !== 'live' && !hasCanvas ? (
          <section className="studioPermissionStep" aria-live="polite">
            <strong>Access camera</strong>
            <p>Allow camera + mic when the phone asks. Then pick a look and hit Go Live.</p>
            <p className="cMuted" role="status">
              {permissionSummary}
            </p>
            <button
              type="button"
              className="cBtn primary"
              disabled={!canRequestMedia || checkingAccess}
              onClick={() => void startPreview(cameraId)}
            >
              {!canRequestMedia
                ? 'Open https://3000studios.vip/admin'
                : checkingAccess
                  ? 'Opening camera…'
                  : 'Access camera'}
            </button>
          </section>
        ) : null}
        {permHint ? (
          <div className="studioPermBanner">
            <strong>Camera blocked</strong>
            <p>Tap the lock in the browser address bar → allow Camera and Microphone → try again.</p>
            <button type="button" className="cBtn primary" disabled={checkingAccess} onClick={() => void startPreview(cameraId)}>
              {checkingAccess ? 'Opening camera…' : 'Access camera'}
            </button>
          </div>
        ) : null}

        <label className="easyField">
          <span>Camera</span>
          <select value={cameraId} onChange={(e) => void switchCamera(e.target.value)} className="studioSelect">
            {cameras.length === 0 ? <option value="">Default camera</option> : null}
            {cameras.map((c, i) => (
              <option key={c.deviceId} value={c.deviceId}>
                {c.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </label>

        <div className="studioBlock">
          <span className="studioBlockLabel">Rotate & crop</span>
          <div className="studioChipRow">
            {ROTATIONS.map((r) => (
              <button key={r.value} type="button" className={`studioChip ${rotation === r.value ? 'active' : ''}`} onClick={() => setRotation(r.value)}>
                {r.label}
              </button>
            ))}
            <button type="button" className={`studioChip ${flipH ? 'active' : ''}`} onClick={() => setFlipH((v) => !v)}>
              Flip H
            </button>
            <button type="button" className={`studioChip ${flipV ? 'active' : ''}`} onClick={() => setFlipV((v) => !v)}>
              Flip V
            </button>
            <button type="button" className="studioChip" onClick={resetFraming}>
              Reset frame
            </button>
          </div>
          <div className="studioSliders">
            <label className="studioSlider">
              <span>Zoom {zoom.toFixed(2)}×</span>
              <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            </label>
            <label className="studioSlider">
              <span>Pan X</span>
              <input type="range" min={-1} max={1} step={0.02} value={panX} disabled={zoom <= 1.01} onChange={(e) => setPanX(Number(e.target.value))} />
            </label>
            <label className="studioSlider">
              <span>Pan Y</span>
              <input type="range" min={-1} max={1} step={0.02} value={panY} disabled={zoom <= 1.01} onChange={(e) => setPanY(Number(e.target.value))} />
            </label>
          </div>
        </div>

        <div className="studioBlock">
          <span className="studioBlockLabel">Filters</span>
          <div className="studioChipRow">
            {LENS_FILTERS.map((f) => (
              <button key={f.id} type="button" className={`studioChip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="studioBlock">
          <span className="studioBlockLabel">Overlays</span>
          <div className="studioChipRow">
            {PREMADE_OVERLAYS.map((o) => (
              <button key={o.id} type="button" className={`studioChip ${overlays.includes(o.id) ? 'active' : ''}`} onClick={() => toggleOverlay(o.id)} title={o.hint}>
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
            {hasCanvas ? 'Refresh camera' : 'Access camera'}
          </button>
          {status === 'live' ? (
            <button type="button" className="cBtn danger" onClick={() => void endLive()}>
              End live
            </button>
          ) : (
            <button type="button" className="cBtn primary" disabled={status === 'starting' || !whipReady} onClick={() => void goLive()}>
              {status === 'starting' ? 'Going live…' : 'Go Live'}
            </button>
          )}
        </div>

        {error ? <p className="adminError">{error}</p> : null}
        <p className="cMuted studioHelp">
          Access camera → pick filter / overlay → Go Live. Viewers see it on /live.
        </p>
      </div>
    </div>
  );
}
