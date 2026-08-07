import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  WHIP_URL_STORAGE_KEY,
  STREAM_MODE_KEY,
  buildWhepUrl,
  validateWhipUrl,
} from '../lib/webrtcStream';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';
import { StreamStudioPanel } from '../components/StreamStudioPanel';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import {
  STREAM_CUSTOMER_CODE,
  STREAM_LIVE_INPUT_ID,
  STREAM_PLAYER_UID,
  STREAM_PLAYER_URL,
  STREAM_WHIP_PUBLISH_URL,
  STREAM_WHEP_URL,
} from '../lib/streamConfig';

const ADMIN_PASSCODE = '3000';
const AUTH_KEY = '3000-admin-auth-v1';
const LIVE_FLAG_KEY = '3000-stream-live-v1';

const OBS_SERVER = 'rtmps://live.cloudflare.com:443/live/';
const CF_LIVE_INPUTS_URL = 'https://dash.cloudflare.com/?to=/:account/stream/inputs';
const PUBLIC_LIVE_URL = 'https://3000studios.vip/live';

const customerCode = STREAM_CUSTOMER_CODE;
const liveInputId = STREAM_LIVE_INPUT_ID;

/** Prefer valid stored URL; otherwise use dashboard WHIP publish default. */
function loadInitialWhipUrl(): string {
  try {
    const stored = localStorage.getItem(WHIP_URL_STORAGE_KEY)?.trim() || '';
    if (stored) {
      const check = validateWhipUrl(stored, liveInputId);
      if (check.ok) return stored;
    }
  } catch {
    /* ignore */
  }
  return STREAM_WHIP_PUBLISH_URL;
}

type DeviceKind = 'phone' | 'laptop';
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
  const [copied, setCopied] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(() => localStorage.getItem(LIVE_FLAG_KEY) === '1');
  const [broadcasting, setBroadcasting] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [whipUrl, setWhipUrl] = useState(() => loadInitialWhipUrl());

  const isConfigured = Boolean(customerCode && liveInputId);
  const whepUrl = STREAM_WHEP_URL || (isConfigured ? buildWhepUrl(customerCode, STREAM_PLAYER_UID) : null);
  const whipCheck = validateWhipUrl(whipUrl, liveInputId);
  const whipReady = whipCheck.ok;

  // Persist default WHIP once so Go Live works without manual paste
  useEffect(() => {
    if (whipReady && whipUrl) {
      try {
        localStorage.setItem(WHIP_URL_STORAGE_KEY, whipUrl.trim());
      } catch {
        /* ignore */
      }
    }
  }, [whipReady, whipUrl]);

  const refreshDevice = useCallback(() => setDevice(detectDevice()), []);

  useEffect(() => {
    refreshDevice();
    const onResize = () => refreshDevice();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [refreshDevice]);

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

  function handleLock() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    setBroadcasting(false);
    localStorage.setItem(LIVE_FLAG_KEY, '0');
    localStorage.setItem(STREAM_MODE_KEY, 'off');
  }

  function saveWhipUrl(value: string) {
    setWhipUrl(value);
    localStorage.setItem(WHIP_URL_STORAGE_KEY, value.trim());
  }

  function onStudioLive(live: boolean) {
    setBroadcasting(live);
    setIsLive(live);
    localStorage.setItem(LIVE_FLAG_KEY, live ? '1' : '0');
    localStorage.setItem(STREAM_MODE_KEY, live ? 'webrtc' : 'off');
  }

  const deviceBadge = useMemo(
    () => (device === 'phone' ? '📱 Phone detected' : '💻 Laptop / desktop detected'),
    [device],
  );

  if (!authed) {
    return (
      <div className="adminScrim adminEasyShell">
        <form className="adminCodeModal" onSubmit={handleUnlock}>
          <span>3000 Studios · Owner Access</span>
          <h2>Go Live Console</h2>
          <p>Unlock once — phone studio with filters/overlays, or laptop OBS fields.</p>
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
            <span className="cTitleSub">Camera · overlays · lens filters · OBS fields</span>
          </div>
          <div className="cTopbarRight">
            <span className={`cPill ${broadcasting || isLive ? 'live' : 'warn'}`}>
              <span className="cDot" />
              {broadcasting ? 'BROADCASTING' : isLive ? 'MARKED LIVE' : 'OFFLINE'}
            </span>
            <Link to="/live" className="cBtn sm ghost" target="_blank" rel="noreferrer">
              Public /live
            </Link>
            <button className="cBtn sm" type="button" onClick={handleLock}>
              Lock
            </button>
          </div>
        </header>

        <main className="cScroll">
          <div className="cStack">
            <section className="easyStatusStrip">
              <div className={`easyChip ${device === 'phone' ? 'ok' : 'info'}`}>{deviceBadge}</div>
              <div className={`easyChip ${whipReady ? 'ok' : 'warn'}`}>
                WHIP: {whipReady ? 'ready · ultra low latency' : whipUrl.trim() ? 'invalid URL' : 'needed once'}
              </div>
              <div className="easyChip info">Viewers: {PUBLIC_LIVE_URL}</div>
            </section>

            {whipReady && !broadcasting ? (
              <section className="cPanel easyWhipReadyBanner">
                <div className="cPanelBody">
                  <strong>Browser WHIP is ready</strong>
                  <p>
                    Ultra-low-latency WebRTC publish is configured. Open <em>Phone studio</em>, allow camera/mic,
                    then press <strong>Go Live with looks</strong> in Stream studio. Viewers watch on{' '}
                    <a href={PUBLIC_LIVE_URL} target="_blank" rel="noreferrer">
                      /live
                    </a>{' '}
                    (WHEP / HLS / Stream Player).
                  </p>
                  <div className="easyBtnRow">
                    <button type="button" className="cBtn primary" onClick={() => setPath('phone')}>
                      Open phone studio
                    </button>
                    <a className="cBtn ghost" href={PUBLIC_LIVE_URL} target="_blank" rel="noreferrer">
                      Open viewer /live
                    </a>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="cPanel easyPathPanel">
              <div className="cPanelHead">
                <h2>How are you going live?</h2>
                <span className="cSub">Detected {device}. Switch anytime.</span>
              </div>
              <div className="cPanelBody">
                <div className="easyPathTabs">
                  <button
                    type="button"
                    className={`easyPathTab ${path === 'phone' ? 'active' : ''}`}
                    onClick={() => setPath('phone')}
                  >
                    📱 Phone studio
                    <small>Camera switch · overlays · lens filters · Go Live</small>
                  </button>
                  <button
                    type="button"
                    className={`easyPathTab ${path === 'laptop' ? 'active' : ''}`}
                    onClick={() => setPath('laptop')}
                  >
                    💻 Laptop (OBS)
                    <small>Copy server + stream key · scenes in OBS</small>
                  </button>
                </div>

                {path === 'phone' ? (
                  <div className="easyGuide">
                    <h3>Browser ultra-low latency (WHIP)</h3>
                    <ol className="easySteps">
                      <li>
                        Best for browser publishing — WebRTC WHIP is preloaded from your Stream dashboard URL
                        (secret path, not the public asset UID alone).
                      </li>
                      <li>Allow Camera + Mic when prompted (Logi C615 or Integrated Camera).</li>
                      <li>
                        Pick looks in the studio, then <strong>Go Live with looks</strong> — POSTs the SDP offer to
                        WHIP. Viewers use WHEP / HLS / Stream Player on /live.
                      </li>
                    </ol>
                    <label className="easyField">
                      <span>WebRTC (WHIP) publish URL</span>
                      <input
                        type="url"
                        value={whipUrl}
                        onChange={(e) => saveWhipUrl(e.target.value)}
                        placeholder={STREAM_WHIP_PUBLISH_URL}
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </label>
                    {whipUrl.trim() ? (
                      <p className={whipReady ? 'easyWhipOk' : 'adminError'}>
                        {whipReady
                          ? whipCheck.ok
                            ? whipCheck.hint || 'WHIP ready — ultra low latency browser publish.'
                            : 'WHIP URL ready.'
                          : !whipCheck.ok
                            ? whipCheck.reason
                            : 'Invalid WHIP URL'}
                      </p>
                    ) : null}
                    <div className="easyBtnRow">
                      <button
                        type="button"
                        className="cBtn sm ghost"
                        onClick={() => saveWhipUrl(STREAM_WHIP_PUBLISH_URL)}
                      >
                        Reset to dashboard WHIP
                      </button>
                      <button
                        type="button"
                        className="cBtn sm ghost"
                        onClick={() => void handleCopy('whip', whipUrl || STREAM_WHIP_PUBLISH_URL)}
                      >
                        {copied === 'whip' ? 'Copied WHIP' : 'Copy WHIP'}
                      </button>
                      {whepUrl ? (
                        <button
                          type="button"
                          className="cBtn sm ghost"
                          onClick={() => void handleCopy('whep', whepUrl)}
                          title="Viewer WHEP URL (not for Go Live)"
                        >
                          {copied === 'whep' ? 'Copied WHEP' : 'Copy WHEP (viewers)'}
                        </button>
                      ) : null}
                      <a className="cBtn ghost" href={CF_LIVE_INPUTS_URL} target="_blank" rel="noreferrer">
                        Cloudflare Live Inputs
                      </a>
                      <a
                        className="cBtn ghost"
                        href="https://developers.cloudflare.com/stream/webrtc-beta/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Learn more · WebRTC
                      </a>
                    </div>
                    {studioError ? <p className="adminError">{studioError}</p> : null}
                  </div>
                ) : (
                  <div className="easyGuide">
                    <h3>Laptop path — OBS (manual, skip the wizard)</h3>
                    <ol className="easySteps">
                      <li>
                        Install{' '}
                        <a href="https://obsproject.com/download" target="_blank" rel="noreferrer">
                          OBS Studio
                        </a>
                      </li>
                      <li>Settings → Stream → Service: <strong>Custom...</strong></li>
                      <li>Paste Server + Stream Key below → Start Streaming</li>
                    </ol>
                    <div className="easyCopyGrid">
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">OBS Server</span>
                        <code>{OBS_SERVER}</code>
                        <button
                          type="button"
                          className="cBtn sm ghost"
                          onClick={() => void handleCopy('server', OBS_SERVER)}
                        >
                          {copied === 'server' ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="easyCopyCard">
                        <span className="easyCopyLabel">OBS Stream Key</span>
                        <code>Cloudflare → RTMPS Key</code>
                        <a className="cBtn sm primary" href={CF_LIVE_INPUTS_URL} target="_blank" rel="noreferrer">
                          Get key
                        </a>
                      </div>
                    </div>
                    <p className="cMuted easyHint">
                      Skip Auto-Configuration Wizard — it fails on custom RTMPS. Use manual fields.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="cCols adminStreamGrid">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Stream studio</h2>
                  <span className="cSub">Camera · premade overlays · lens filters</span>
                </div>
                <div className="cPanelBody">
                  <StreamStudioPanel
                    whipUrl={whipUrl}
                    whipReady={whipReady}
                    liveInputId={liveInputId}
                    onLiveChange={onStudioLive}
                    onError={setStudioError}
                  />
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
                        <strong>You are live (WHIP)</strong>
                        <p>
                          Public site uses the Cloudflare hosted Stream Player. Open /live for the embed viewers see.
                        </p>
                        <a className="cBtn primary" href="/live" target="_blank" rel="noreferrer">
                          Open /live
                        </a>
                      </div>
                    ) : (
                      <div className="adminStandbyWrap">
                        <p className="adminStandbyNote" style={{ marginBottom: 10 }}>
                          Public Cloudflare Stream Player (what viewers get on /live &amp; /video):
                        </p>
                        <CloudflareStreamPlayer title="Public Stream Player preview" muted autoplay />
                        <p className="adminStandbyNote">
                          Player UID <code>{STREAM_PLAYER_UID}</code> ·{' '}
                          <a href={STREAM_PLAYER_URL} target="_blank" rel="noreferrer">
                            Open player URL
                          </a>
                          . Camera preview is on the left — press <strong>Go Live with looks</strong> to publish.
                        </p>
                        <StandbyMusicWindow compact muted />
                      </div>
                    )}
                  </StreamFrame>
                </div>
              </div>
            </section>

            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Cheat sheet</h2>
                <span className="cSub">One place</span>
              </div>
              <div className="cPanelBody">
                <div className="easyCheatGrid">
                  <div>
                    <strong>Phone</strong>
                    <span>Studio below · WHIP URL · Go Live with looks</span>
                  </div>
                  <div>
                    <strong>Laptop</strong>
                    <span>OBS Custom · {OBS_SERVER}</span>
                  </div>
                  <div>
                    <strong>Overlays</strong>
                    <span>LIVE · watermark · lower third · gold frame · VIP · ticker</span>
                  </div>
                  <div>
                    <strong>Filters</strong>
                    <span>Clean · Cinematic · Noir · Warm Gold · Cool Blue · Vintage · Vivid · Soft</span>
                  </div>
                  <div>
                    <strong>Public</strong>
                    <span>{PUBLIC_LIVE_URL}</span>
                  </div>
                  <div>
                    <strong>Live input</strong>
                    <span>{liveInputId}</span>
                  </div>
                </div>
                <p className="cMuted" style={{ marginTop: 12, fontSize: 12, wordBreak: 'break-all' }}>
                  Stream Player: {STREAM_PLAYER_URL}
                  {whepUrl ? (
                    <>
                      <br />
                      WHEP: {whepUrl}
                    </>
                  ) : null}
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
