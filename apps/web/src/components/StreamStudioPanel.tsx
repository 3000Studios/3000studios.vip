import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LENS_FILTERS,
  PREMADE_OVERLAYS,
  StreamStudio,
  listCameras,
  listMicrophones,
  type CameraRotation,
  type LensFilterId,
  type OverlayId,
} from '../lib/streamStudio';
import { WhipPublisher, describeCameraError, validateWhipUrl } from '../lib/webrtcStream';
import { publishServerLiveFlag } from '../lib/streamLiveDetect';
import { StreamSceneEditor } from './StreamSceneEditor';

type Props = {
  whipUrl: string;
  whipReady: boolean;
  liveInputId?: string;
  onLiveChange?: (live: boolean) => void;
  onError?: (msg: string | null) => void;
};

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
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  const [micId, setMicId] = useState(() => localStorage.getItem('3000-stream-mic-id-v1') || '');
  const [micMuted, setMicMuted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasAudioTrack, setHasAudioTrack] = useState(false);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
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
  const [hasCanvas, setHasCanvas] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);

  const canRequestMedia =
    typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

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
      studioRef.current.setOnAudioTrackChange((track) => {
        setHasAudioTrack(true);
        if (publisherRef.current) {
          void publisherRef.current.replaceAudioTrack(track);
        }
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

  const refreshDeviceLists = useCallback(async () => {
    try {
      const [cams, audioInputs] = await Promise.all([listCameras(), listMicrophones()]);
      setCameras(cams);
      setCameraId((prev) => {
        if (prev && cams.some((c) => c.deviceId === prev)) return prev;
        return cams[0]?.deviceId || '';
      });
      setMics(audioInputs);
      setMicId((prev) => {
        if (prev && audioInputs.some((m) => m.deviceId === prev)) return prev;
        const saved = localStorage.getItem('3000-stream-mic-id-v1');
        if (saved && audioInputs.some((m) => m.deviceId === saved)) return saved;
        return audioInputs[0]?.deviceId || '';
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const studio = studioRef.current;
    if (!studio) return;
    const unsub = studio.subscribeAudioLevel((lvl) => {
      setAudioLevel(lvl);
    });
    return () => unsub();
  }, [hasCanvas]);

  const startPreview = useCallback(
    async (deviceId?: string, facingMode?: 'user' | 'environment', audioDeviceId?: string) => {
      if (!canRequestMedia) {
        const msg = 'Open this page in Safari or Chrome on https://3000studios.vip/admin and tap Access camera.';
        setError(msg);
        onError?.(msg);
        setStatus('error');
        return false;
      }

      setCheckingAccess(true);
      setError(null);
      onError?.(null);
      try {
        const studio = ensureStudio();
        studio.setFilter(filter);
        studio.overlays = new Set(overlays);
        studio.lowerThirdTitle = lowerTitle;
        studio.lowerThirdSub = lowerSub;
        applyFraming(studio);
        await studio.openCamera(
          deviceId || cameraId || undefined,
          facingMode || facing,
          audioDeviceId || micId || undefined,
        );
        const preview = studio.getOutputStream(30, true);
        const cameraTrack = preview.getVideoTracks()[0];
        if (!cameraTrack || cameraTrack.readyState === 'ended') {
          throw new Error('Camera did not start. Tap Allow when the phone asks.');
        }
        setHasAudioTrack(studio.hasAudioTrack());
        studio.start();
        mountCanvas();
        await refreshDeviceLists();
        setStatus((s) => (s === 'live' ? 'live' : 'preview'));
        return true;
      } catch (err) {
        const msg = describeCameraError(err);
        setError(msg);
        onError?.(msg);
        setStatus('error');
        return false;
      } finally {
        setCheckingAccess(false);
      }
    },
    [
      cameraId,
      micId,
      facing,
      ensureStudio,
      filter,
      overlays,
      lowerTitle,
      lowerSub,
      applyFraming,
      mountCanvas,
      onError,
      canRequestMedia,
      refreshDeviceLists,
    ],
  );

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

  useEffect(() => {
    if (status !== 'live') return;
    void publishServerLiveFlag(true);
    const id = window.setInterval(() => {
      void publishServerLiveFlag(true);
    }, 15000);
    return () => window.clearInterval(id);
  }, [status]);

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
    await startPreview(id, facing, micId);
    if (status === 'live' && publisherRef.current && studioRef.current) {
      const out = studioRef.current.getOutputStream(30);
      const v = out.getVideoTracks()[0];
      if (v) await publisherRef.current.replaceVideoTrack(v);
    }
  }

  async function switchMicrophone(id: string) {
    setMicId(id);
    localStorage.setItem('3000-stream-mic-id-v1', id);
    if (!studioRef.current) return;
    try {
      const track = await studioRef.current.openMicrophone(id || undefined);
      if (track) {
        setHasAudioTrack(true);
        if (status === 'live' && publisherRef.current) {
          await publisherRef.current.replaceAudioTrack(track);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Microphone switch failed';
      setError(msg);
      onError?.(msg);
    }
  }

  function toggleMic() {
    const next = !micMuted;
    setMicMuted(next);
    studioRef.current?.setMicrophoneEnabled(!next);
  }

  async function flipFacing() {
    const next = facing === 'user' ? 'environment' : 'user';
    setFacing(next);
    setCameraId('');
    await startPreview(undefined, next, micId);
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
      await studio.openCamera(cameraId || undefined, facing, micId || undefined);
      studio.start();
      mountCanvas();
      studio.setFilter(filter);
      studio.overlays = new Set(overlays);
      studio.lowerThirdTitle = lowerTitle;
      studio.lowerThirdSub = lowerSub;
      applyFraming(studio);

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const out = studio.getOutputStream(30, false);
      if (!out.getVideoTracks().length) {
        throw new Error('No camera picture yet. Tap Access camera first.');
      }

      // Verify and guarantee microphone track is present
      if (!out.getAudioTracks().length) {
        try {
          const track = await studio.openMicrophone(micId || undefined);
          if (track) out.addTrack(track);
        } catch (mErr) {
          console.warn('Microphone ensure error:', mErr);
        }
      }

      if (!out.getAudioTracks().length) {
        throw new Error(
          'Microphone audio track missing. Please allow microphone access or choose a microphone above so your stream has sound.',
        );
      }

      const publisher = new WhipPublisher(check.endpoint);
      publisherRef.current = publisher;
      await publisher.startWithStream(out);

      setStatus('live');
      setHasAudioTrack(true);
      onLiveChange?.(true);
      void publishServerLiveFlag(true);
      window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: true } }));
      await refreshDeviceLists();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not go live';
      setError(msg);
      onError?.(msg);
      setStatus('error');
      onLiveChange?.(false);
      void publishServerLiveFlag(false);
      await publisherRef.current?.stop();
      publisherRef.current = null;
      void startPreview(cameraId, facing, micId);
    }
  }

  async function endLive() {
    await publisherRef.current?.stop();
    publisherRef.current = null;
    setStatus('preview');
    onLiveChange?.(false);
    void publishServerLiveFlag(false);
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: false } }));
  }

  const frameOverlays = PREMADE_OVERLAYS.filter((o) => o.group === 'frame' || o.group === 'fx');
  const infoOverlays = PREMADE_OVERLAYS.filter((o) => o.group === 'info');

  return (
    <div className="studioPanel prodStudio">
      <div className="prodStudioPreview">
        <div className="adminCameraFrame studioPreviewFrame">
          <div ref={mountRef} className="studioCanvasMount" />
          {status === 'live' ? <div className="streamLiveBadge">● LIVE · WHIP</div> : null}
          {hasCanvas ? (
            <div
              className={`studioMicIndicator ${micMuted ? 'is-muted' : audioLevel > 5 ? 'is-active' : 'is-listening'}`}
              title={micMuted ? 'Microphone muted' : audioLevel > 5 ? 'Sound detected' : 'Microphone ready'}
            >
              {micMuted ? '🔇 MIC MUTED' : audioLevel > 5 ? '🎙️ SOUND ON' : '🎙️ MIC READY'}
            </div>
          ) : null}
          {status === 'starting' ? <div className="adminCameraOverlay">Connecting WHIP (POST SDP)…</div> : null}
          {status === 'idle' || (status === 'error' && !hasCanvas) ? (
            <div className="adminCameraOverlay">{error || 'Starting camera preview…'}</div>
          ) : null}
          <div className="studioFramingBadge" aria-hidden="true">
            {rotation}° · {zoom.toFixed(1)}x
            {flipH ? ' · ↔' : ''}
            {flipV ? ' · ↕' : ''}
          </div>
        </div>
        <div className="prodStudioLiveBar">
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
          <button type="button" className="cBtn ghost" onClick={() => void startPreview(cameraId, facing, micId)}>
            {hasCanvas ? 'Refresh preview' : 'Retry access'}
          </button>
        </div>
      </div>

      <div className="studioControls prodStudioDock">
        {status !== 'live' && !hasCanvas ? (
          <section className="studioPermissionStep" aria-live="polite">
            <span>Step 1 of 3</span>
            <strong>Allow camera and microphone</strong>
            <p>
              This opens Chrome’s permission prompt for <em>3000studios.vip</em>. Choose <strong>Allow</strong>, then
              your preview starts automatically with camera and microphone active.
            </p>
            <p className="cMuted" role="status">
              {canRequestMedia ? 'Camera & microphone access is available in this browser.' : 'Use HTTPS Chrome or Safari to access the camera.'}
            </p>
            <button
              type="button"
              className="cBtn primary"
              disabled={!canRequestMedia || checkingAccess}
              onClick={() => void startPreview(cameraId, facing, micId)}
            >
              {!canRequestMedia
                ? 'Use https://3000studios.vip/admin'
                : checkingAccess
                  ? 'Opening camera & mic…'
                  : hasCanvas
                    ? 'Refresh camera & mic'
                    : 'Access camera & microphone'}
            </button>
            <button type="button" className="cBtn ghost" disabled={checkingAccess} onClick={() => void flipFacing()}>
              {facing === 'user' ? 'Use rear camera' : 'Use front camera'}
            </button>
          </section>
        ) : null}

        <details className="studioAccord" open>
          <summary>Microphone &amp; Sound</summary>
          <div className="studioAudioControls">
            <label className="easyField">
              <span>Microphone device</span>
              <select
                value={micId}
                onChange={(e) => void switchMicrophone(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="studioSelect"
              >
                {mics.length === 0 ? <option value="">Default microphone</option> : null}
                {mics.map((m, i) => (
                  <option key={m.deviceId} value={m.deviceId}>
                    {m.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>

            <div className="studioAudioMeterBox">
              <div className="studioAudioMeterHead">
                <span className="studioAudioMeterLabel">Live volume</span>
                <span
                  className={`studioAudioMeterStatus ${
                    micMuted ? 'muted' : audioLevel > 5 ? 'active' : hasAudioTrack ? 'idle' : 'error'
                  }`}
                >
                  {micMuted
                    ? '🔇 Muted'
                    : audioLevel > 5
                      ? '🟢 Sound detected'
                      : hasAudioTrack
                        ? '⚪ Mic ready (speak to test)'
                        : '🔴 No mic track'}
                </span>
              </div>
              <div
                className="studioAudioMeterTrack"
                aria-label="Microphone volume meter"
                role="progressbar"
                aria-valuenow={audioLevel}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={`studioAudioMeterFill ${micMuted ? 'is-muted' : ''}`}
                  style={{ width: `${micMuted ? 0 : Math.max(2, audioLevel)}%` }}
                />
              </div>
              <div className="studioAudioActions">
                <button
                  type="button"
                  className={`cBtn sm ${micMuted ? 'danger' : 'ghost'}`}
                  onClick={toggleMic}
                >
                  {micMuted ? '🔇 Unmute mic' : '🎙️ Mute mic'}
                </button>
                <button
                  type="button"
                  className="cBtn sm ghost"
                  onClick={() => void refreshDeviceLists()}
                >
                  Refresh devices
                </button>
              </div>
            </div>

            {!hasAudioTrack && hasCanvas && (
              <p className="adminError" style={{ marginTop: 8 }}>
                No active microphone sound track! Click the lock icon in the address bar → allow Microphone for 3000studios.vip, then select your mic above.
              </p>
            )}
          </div>
        </details>

        <details className="studioAccord">
          <summary>Camera &amp; layout</summary>
          <label className="easyField">
            <span>Camera</span>
            <select
              value={cameraId}
              onChange={(e) => void switchCamera(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
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
        </details>

        <details className="studioAccord">
          <summary>Crop, rotate &amp; size</summary>
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
          <p className="cMuted" style={{ fontSize: 11, margin: '6px 0 0' }}>
            Zoom in to crop, then pan. Rotation and flips are burned into the WHIP feed viewers receive.
          </p>
        </details>

        <details className="studioAccord">
          <summary>Filters &amp; looks</summary>
          <div className="studioChipRow">
            {LENS_FILTERS.map((f) => (
              <button key={f.id} type="button" className={`studioChip ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
        </details>

        <details className="studioAccord">
          <summary>Animated frames &amp; overlays</summary>
          <span className="studioBlockLabel">Graphics</span>
          <div className="studioChipRow">
            {infoOverlays.map((o) => (
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
          <span className="studioBlockLabel">Frames</span>
          <div className="studioChipRow">
            {frameOverlays.map((o) => (
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
        </details>

        <details className="studioAccord">
          <summary>Standby, branding &amp; custom layers</summary>
          <StreamSceneEditor />
        </details>

        {error ? <p className="adminError">{error}</p> : null}
        <p className="cMuted studioHelp">
          Preview stays on screen while you change looks. Framing + overlays are burned into the WHIP stream.
        </p>
      </div>
    </div>
  );
}
