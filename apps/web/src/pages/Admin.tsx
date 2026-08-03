import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  WhipPublisher,
  WHIP_URL_STORAGE_KEY,
  STREAM_MODE_KEY,
  buildWhepUrl,
} from '../lib/webrtcStream';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';

const ADMIN_PASSCODE = '3000';
const AUTH_KEY = '3000-admin-auth-v1';
const LIVE_FLAG_KEY = '3000-stream-live-v1';

const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '6502a441fdad0df6eebf3270a569c1ab';

const OBS_SERVER = 'rtmps://live.cloudflare.com:443/live/';
const CF_LIVE_INPUTS_URL = 'https://dash.cloudflare.com/?to=/:account/stream/inputs';
const PUBLIC_LIVE_URL = 'https://3000studios.vip/live';

const customerCode =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
const liveInputId =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
const streamTitle = import.meta.env.VITE_STREAM_TITLE?.toString().trim() || '3000 Studios Live';
const envWhipUrl = import.meta.env.VITE_STREAM_WHIP_URL?.toString().trim() || '';

type DeviceKind = 'phone' | 'laptop';
type CamStatus = 'unknown' | 'checking' | 'ready' | 'denied' | 'missing';
type PathMode = 'phone' | 'laptop';

function detectDevice(): DeviceKind {
  if (typeof navigator === 'undefined') return 'laptop';
  const ua = navigator.userAgent || '';
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const narrow = typeof window !== 'undefined' && window.innerWidth < 900;
  if (mobileUa || (coarse && narrow)) return 'phone';
  return 'laptop';
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [device, setDevice] = useState<DeviceKind>(() => detectDevice());
  const [path, setPath] = useState<PathMode>(() => (detectDevice() === 'phone' ? 'phone' : 'laptop'));
  const [camStatus, setCamStatus] = useState<CamStatus>('unknown');
  const [camLabel, setCamLabel] = useState('—');
  const [micLabel, setMicLabel] = useState('—');
  const [copied, setCopied] = useState<string | null>(null);

  const [isLive, setIsLive] = useState(() => localStorage.getItem(LIVE_FLAG_KEY) === '1');
  const [publishState, setPublishState] = useState<'idle' | 'starting' | 'live' | 'error'>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [whipUrl, setWhipUrl] = useState(
    () => localStorage.getItem(WHIP_URL_STORAGE_KEY) || envWhipUrl || '',
  );

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const publisherRef = useRef<WhipPublisher | null>(null);
  const probeStreamRef = useRef<MediaStream | null>(null);

  const isConfigured = Boolean(customerCode && liveInputId);
  const embedUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const whepUrl = isConfigured ? buildWhepUrl(customerCode, liveInputId) : null;
  const whipReady = Boolean(whipUrl.trim().includes('/webRTC/publish'));
  const broadcasting = publishState === 'live';

  const refreshDevice = useCallback(() => {
    const d = detectDevice();
    setDevice(d);
  }, []);

  const stopProbe = useCallback(() => {
    probeStreamRef.current?.getTracks().forEach((t) => t.stop());
    probeStreamRef.current = null;
  }, []);

  const scanDevices = useCallback(async () => {
    setCamStatus('checking');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCamStatus('missing');
        setCamLabel('No camera API');
        setMicLabel('No mic API');
        return;
      }

      // Permission probe (stops right after labels are readable)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      probeStreamRef.current = stream;

      if (previewRef.current && publishState !== 'live') {
        previewRef.current.srcObject = stream;
        void previewRef.current.play().catch(() => undefined);
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      setCamLabel(cams[0]?.label || `${cams.length} camera(s)`);
      setMicLabel(mics[0]?.label || `${mics.length} mic(s)`);
      setCamStatus(cams.length ? 'ready' : 'missing');

      // Keep preview on for admin convenience; tracks stay open until Go Live replaces them
    } catch (err) {
      const name = err instanceof Error ? err.name : '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setCamStatus('denied');
        setCamLabel('Permission denied');
        setMicLabel('Permission denied');
      } else {
        setCamStatus('missing');
        setCamLabel('Not found');
        setMicLabel('Not found');
      }
    }
  }, [facing, publishState]);

  useEffect(() => {
    refreshDevice();
    const onResize = () => refreshDevice();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      void publisherRef.current?.stop();
      publisherRef.current = null;
      stopProbe();
    };
  }, [refreshDevice, stopProbe]);

  useEffect(() => {
    if (!authed) return;
    void scanDevices();
  }, [authed, scanDevices]);

  async function handleCopy(label: string, value: string) {
    const ok = await copyText(value);
    if (ok) {
      setCopied(label);
      window.setTimeout(() => setCopied(null), 1600);
    }
  }

  function handleUnlock(e: FormEvent) {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem(AUTH_KEY, '1');
      setAuthed(true);
      setError(null);
      setPasscode('');
    } else {
      setError('Incorrect passcode. Try again.');
      setPasscode('');
    }
  }

  async function handleLock() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    await stopBroadcast();
    stopProbe();
  }

  function saveWhipUrl(value: string) {
    setWhipUrl(value);
    localStorage.setItem(WHIP_URL_STORAGE_KEY, value.trim());
  }

  function setLiveFlag(next: boolean) {
    setIsLive(next);
    localStorage.setItem(LIVE_FLAG_KEY, next ? '1' : '0');
    localStorage.setItem(STREAM_MODE_KEY, next ? 'webrtc' : 'off');
  }

  async function startBroadcast() {
    if (!whipReady) {
      setPublishError('Paste your Cloudflare WHIP publish URL first (Phone path below).');
      setPublishState('error');
      setPath('phone');
      return;
    }
    setPublishError(null);
    setPublishState('starting');
    stopProbe();
    try {
      const publisher = new WhipPublisher(whipUrl.trim());
      publisherRef.current = publisher;
      if (!previewRef.current) throw new Error('Preview video not ready');
      await publisher.start(previewRef.current, facing);
      setPublishState('live');
      setLiveFlag(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not start stream';
      setPublishError(msg);
      setPublishState('error');
      setLiveFlag(false);
      await publisherRef.current?.stop();
      publisherRef.current = null;
    }
  }

  async function stopBroadcast() {
    await publisherRef.current?.stop();
    publisherRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    setPublishState('idle');
    setPublishError(null);
    setLiveFlag(false);
  }

  const deviceBadge = useMemo(() => {
    if (device === 'phone') return '📱 Phone detected';
    return '💻 Laptop / desktop detected';
  }, [device]);

  const camBadge = useMemo(() => {
    if (camStatus === 'ready') return 'Camera ready';
    if (camStatus === 'checking') return 'Checking camera…';
    if (camStatus === 'denied') return 'Camera blocked';
    if (camStatus === 'missing') return 'No camera';
    return 'Camera unknown';
  }, [camStatus]);

  if (!authed) {
    return (
      <div className="adminScrim adminEasyShell">
        <form className="adminCodeModal" onSubmit={handleUnlock}>
          <span>3000 Studios · Owner Access</span>
          <h2>Go Live Console</h2>
          <p>Unlock once — then this page tells you exactly what to use on phone or laptop.</p>
          <label>
            <span>Passcode</span>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              autoFocus
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError(null);
              }}
              placeholder="Enter passcode"
              maxLength={12}
            />
          </label>
          {error ? <div className="adminError">{error}</div> : null}
          <button type="submit" className="cBtn primary" style={{ width: '100%' }}>
            Unlock
          </button>
          <Link to="/" className="adminBackLink">
            ← Back to public site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="console adminEasyShell" style={{ gridTemplateColumns: '1fr' }}>
      <div className="cMain">
        <header className="cTopbar">
          <div className="cTitle">
            <h1>Go Live</h1>
            <span className="cTitleSub">One dashboard · phone or laptop · auto-detect</span>
          </div>
          <div className="cTopbarRight">
            <span className={`cPill ${broadcasting || isLive ? 'live' : 'warn'}`}>
              <span className="cDot" />
              {broadcasting ? 'BROADCASTING' : isLive ? 'MARKED LIVE' : 'OFFLINE'}
            </span>
            <Link to="/live" className="cBtn sm ghost" target="_blank" rel="noreferrer">
              Public /live
            </Link>
            <button className="cBtn sm" type="button" onClick={() => void handleLock()}>
              Lock
            </button>
          </div>
        </header>

        <main className="cScroll">
          <div className="cStack">
            {/* Status strip */}
            <section className="easyStatusStrip">
              <div className={`easyChip ${device === 'phone' ? 'ok' : 'info'}`}>{deviceBadge}</div>
              <div
                className={`easyChip ${
                  camStatus === 'ready' ? 'ok' : camStatus === 'denied' ? 'bad' : 'warn'
                }`}
              >
                {camBadge}
              </div>
              <div className={`easyChip ${whipReady ? 'ok' : 'warn'}`}>
                Phone WHIP: {whipReady ? 'saved' : 'needed once'}
              </div>
              <div className="easyChip info">Viewers: {PUBLIC_LIVE_URL}</div>
            </section>

            {/* Path picker */}
            <section className="cPanel easyPathPanel">
              <div className="cPanelHead">
                <h2>How are you going live?</h2>
                <span className="cSub">We detected {device}. You can switch anytime.</span>
              </div>
              <div className="cPanelBody">
                <div className="easyPathTabs">
                  <button
                    type="button"
                    className={`easyPathTab ${path === 'phone' ? 'active' : ''}`}
                    onClick={() => setPath('phone')}
                  >
                    📱 Phone (this browser)
                    <small>Fastest · no OBS · uses camera on this device</small>
                  </button>
                  <button
                    type="button"
                    className={`easyPathTab ${path === 'laptop' ? 'active' : ''}`}
                    onClick={() => setPath('laptop')}
                  >
                    💻 Laptop / desktop (OBS)
                    <small>Best quality · scenes · overlays · mic mixer</small>
                  </button>
                </div>

                {path === 'phone' ? (
                  <div className="easyGuide">
                    <h3>Phone path — 3 steps</h3>
                    <ol className="easySteps">
                      <li>
                        <strong>Software:</strong> just this browser (Safari / Chrome). No app install.
                      </li>
                      <li>
                        <strong>One-time field:</strong> paste WHIP publish URL from Cloudflare (ends
                        with <code>/webRTC/publish</code>).
                      </li>
                      <li>
                        <strong>Go Live</strong> → allow camera + mic → keep this tab open.
                      </li>
                    </ol>

                    <label className="easyField">
                      <span>WHIP publish URL (secret — stays on this device)</span>
                      <input
                        type="url"
                        value={whipUrl}
                        onChange={(e) => saveWhipUrl(e.target.value)}
                        placeholder="https://customer-….cloudflarestream.com/…/webRTC/publish"
                      />
                    </label>
                    <div className="easyBtnRow">
                      <a
                        className="cBtn ghost"
                        href={CF_LIVE_INPUTS_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open Cloudflare Live Inputs
                      </a>
                      <button
                        type="button"
                        className="cBtn ghost"
                        onClick={() => void scanDevices()}
                      >
                        Re-check camera
                      </button>
                      {broadcasting ? (
                        <button
                          type="button"
                          className="cBtn danger"
                          onClick={() => void stopBroadcast()}
                        >
                          End Stream
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="cBtn primary"
                          disabled={publishState === 'starting'}
                          onClick={() => void startBroadcast()}
                        >
                          {publishState === 'starting' ? 'Connecting…' : 'Go Live from this device'}
                        </button>
                      )}
                    </div>
                    {publishError ? <p className="adminError">{publishError}</p> : null}
                    <p className="cMuted easyHint">
                      Find WHIP: Cloudflare → Stream → Live inputs → open input{' '}
                      <code>{liveInputId}</code> → WebRTC / WHIP publish URL.
                    </p>
                  </div>
                ) : (
                  <div className="easyGuide">
                    <h3>Laptop path — OBS (copy these exact fields)</h3>
                    <ol className="easySteps">
                      <li>
                        <strong>Software:</strong>{' '}
                        <a href="https://obsproject.com/download" target="_blank" rel="noreferrer">
                          OBS Studio (free)
                        </a>
                        {' '}— install once on this computer.
                      </li>
                      <li>
                        <strong>OBS → Settings → Stream</strong>
                      </li>
                      <li>
                        <strong>Service:</strong> Custom…
                      </li>
                      <li>
                        <strong>Server + Stream Key</strong> below → Start Streaming.
                      </li>
                    </ol>

                    <div className="easyCopyGrid">
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">OBS field: Service</span>
                        <code>Custom...</code>
                      </div>
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">OBS field: Server</span>
                        <code>{OBS_SERVER}</code>
                        <button
                          type="button"
                          className="cBtn sm ghost"
                          onClick={() => void handleCopy('server', OBS_SERVER)}
                        >
                          {copied === 'server' ? 'Copied' : 'Copy server'}
                        </button>
                      </div>
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">OBS field: Stream Key</span>
                        <code>From Cloudflare Live Input (secret)</code>
                        <a
                          className="cBtn sm primary"
                          href={CF_LIVE_INPUTS_URL}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Get stream key
                        </a>
                      </div>
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">Live input ID (reference)</span>
                        <code>{liveInputId}</code>
                        <button
                          type="button"
                          className="cBtn sm ghost"
                          onClick={() => void handleCopy('input', liveInputId)}
                        >
                          {copied === 'input' ? 'Copied' : 'Copy ID'}
                        </button>
                      </div>
                    </div>

                    <div className="easyObsTips">
                      <strong>OBS Output tips (fast + stable)</strong>
                      <ul>
                        <li>Rate Control: <strong>CBR</strong></li>
                        <li>Bitrate: under <strong>12000 Kbps</strong> (4500–6000 is fine for 1080p)</li>
                        <li>Keyframe interval: <strong>2 seconds</strong></li>
                        <li>Audio: <strong>AAC</strong></li>
                        <li>Cloudflare recording mode on this input must be <strong>automatic</strong></li>
                      </ul>
                    </div>

                    <div className="easyBtnRow">
                      <a
                        className="cBtn primary"
                        href={PUBLIC_LIVE_URL}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open public /live to verify
                      </a>
                      <a
                        className="cBtn ghost"
                        href="https://obsproject.com/download"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download OBS
                      </a>
                    </div>
                    <p className="cMuted easyHint">
                      Do not run phone Go Live and OBS on the same live input at the same time.
                      Pick one path per broadcast.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Camera + public preview */}
            <section className="cCols adminStreamGrid">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Camera on this device</h2>
                  <span className="cSub">
                    {camLabel} · Mic: {micLabel}
                  </span>
                </div>
                <div className="cPanelBody">
                  <div className="adminCameraFrame">
                    <video
                      ref={previewRef}
                      muted
                      playsInline
                      autoPlay
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {publishState !== 'live' ? (
                      <div className="adminCameraOverlay">
                        {publishState === 'starting'
                          ? 'Connecting camera to Cloudflare…'
                          : camStatus === 'denied'
                            ? 'Allow camera + mic in browser settings, then Re-check'
                            : camStatus === 'ready'
                              ? path === 'phone'
                                ? 'Camera ready — use Phone path → Go Live'
                                : 'Camera seen here · for laptop use OBS on this PC'
                              : 'Tap Re-check camera'}
                      </div>
                    ) : (
                      <div className="streamLiveBadge">● LIVE</div>
                    )}
                  </div>

                  <div className="cBtnRow">
                    <button type="button" className="cBtn ghost" onClick={() => void scanDevices()}>
                      Re-check camera
                    </button>
                    <button
                      type="button"
                      className="cBtn ghost"
                      disabled={broadcasting || publishState === 'starting'}
                      onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
                    >
                      Switch to {facing === 'user' ? 'Rear' : 'Front'} camera
                    </button>
                    {path === 'phone' ? (
                      broadcasting ? (
                        <button
                          type="button"
                          className="cBtn danger"
                          onClick={() => void stopBroadcast()}
                        >
                          End Stream
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="cBtn primary"
                          disabled={publishState === 'starting'}
                          onClick={() => void startBroadcast()}
                        >
                          {publishState === 'starting' ? 'Connecting…' : 'Go Live'}
                        </button>
                      )
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>What viewers see</h2>
                  <span className="cSub">{PUBLIC_LIVE_URL}</span>
                </div>
                <div className="cPanelBody">
                  <StreamFrame isLive={broadcasting} className="adminPublicPreview">
                    {broadcasting ? (
                      <div className="adminLivePublicNote">
                        <strong>You are live</strong>
                        <p>Viewers on /live should see your feed. Open the public page to confirm.</p>
                        <a className="cBtn primary" href="/live" target="_blank" rel="noreferrer">
                          Open /live
                        </a>
                      </div>
                    ) : (
                      <StandbyMusicWindow compact muted />
                    )}
                  </StreamFrame>
                  <p className="cMuted" style={{ marginTop: 12, fontSize: 13 }}>
                    Offline = catalog + STREAMING SOON. Online = your camera or OBS feed.
                  </p>
                </div>
              </div>
            </section>

            {/* Cheat sheet */}
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Quick cheat sheet</h2>
                <span className="cSub">Everything in one place</span>
              </div>
              <div className="cPanelBody">
                <div className="easyCheatGrid">
                  <div>
                    <strong>Phone software</strong>
                    <span>This browser only</span>
                  </div>
                  <div>
                    <strong>Phone field</strong>
                    <span>WHIP URL ending in /webRTC/publish</span>
                  </div>
                  <div>
                    <strong>Laptop software</strong>
                    <span>OBS Studio</span>
                  </div>
                  <div>
                    <strong>OBS Service</strong>
                    <span>Custom...</span>
                  </div>
                  <div>
                    <strong>OBS Server</strong>
                    <span>{OBS_SERVER}</span>
                  </div>
                  <div>
                    <strong>OBS Stream Key</strong>
                    <span>Cloudflare Live Input → Stream Key</span>
                  </div>
                  <div>
                    <strong>Public page</strong>
                    <span>{PUBLIC_LIVE_URL}</span>
                  </div>
                  <div>
                    <strong>Live input ID</strong>
                    <span>{liveInputId}</span>
                  </div>
                </div>
                {embedUrl ? (
                  <p className="cMuted" style={{ marginTop: 12, fontSize: 12, wordBreak: 'break-all' }}>
                    HLS embed (OBS path): {embedUrl}
                    {whepUrl ? (
                      <>
                        <br />
                        WHEP (phone path): {whepUrl}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
