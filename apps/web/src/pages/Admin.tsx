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

const ADMIN_PASSCODE = '3000';
const AUTH_KEY = '3000-admin-auth-v1';
const LIVE_FLAG_KEY = '3000-stream-live-v1';

const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '654382980fc1896d6e16b1e66a299bd6';

const OBS_SERVER = 'rtmps://live.cloudflare.com:443/live/';
const CF_LIVE_INPUTS_URL = 'https://dash.cloudflare.com/?to=/:account/stream/inputs';
const PUBLIC_LIVE_URL = 'https://3000studios.vip/live';

const customerCode =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
const liveInputId =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
const envWhipUrl = import.meta.env.VITE_STREAM_WHIP_URL?.toString().trim() || '';

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
  const [whipUrl, setWhipUrl] = useState(
    () => localStorage.getItem(WHIP_URL_STORAGE_KEY) || envWhipUrl || '',
  );

  const isConfigured = Boolean(customerCode && liveInputId);
  const embedUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const whepUrl = isConfigured ? buildWhepUrl(customerCode, liveInputId) : null;
  const whipCheck = validateWhipUrl(whipUrl, liveInputId);
  const whipReady = whipCheck.ok;

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
                Phone WHIP: {whipReady ? 'ready' : whipUrl.trim() ? 'invalid URL' : 'needed once'}
              </div>
              <div className="easyChip info">Viewers: {PUBLIC_LIVE_URL}</div>
            </section>

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
                    <h3>Browser / phone studio (WHIP)</h3>
                    <ol className="easySteps">
                      <li>
                        In Cloudflare → Live Inputs → input <code>{liveInputId.slice(0, 8)}…</code> → copy{' '}
                        <strong>WebRTC publish URL</strong> (<code>webRTC.url</code>).
                      </li>
                      <li>
                        It must look like{' '}
                        <code>https://customer-…cloudflarestream.com/&lt;SECRET&gt;/webRTC/publish</code> — the
                        secret is <em>not</em> the live input id.
                      </li>
                      <li>Allow Camera + Mic when prompted (Logi C615 or Integrated Camera).</li>
                      <li>
                        Pick looks below, then <strong>Go Live with looks</strong> — that sends the WHIP{' '}
                        <code>POST</code> (SDP). Ignore the offline viewer panel until it says live.
                      </li>
                    </ol>
                    <label className="easyField">
                      <span>WHIP publish URL (secret — stays on this device only)</span>
                      <input
                        type="url"
                        value={whipUrl}
                        onChange={(e) => saveWhipUrl(e.target.value)}
                        placeholder="https://customer-….cloudflarestream.com/<SECRET>/webRTC/publish"
                        spellCheck={false}
                        autoComplete="off"
                      />
                    </label>
                    {whipUrl.trim() ? (
                      <p className={whipReady ? 'easyWhipOk' : 'adminError'}>
                        {whipReady
                          ? whipCheck.ok
                            ? whipCheck.hint
                            : 'WHIP URL ready.'
                          : !whipCheck.ok
                            ? whipCheck.reason
                            : 'Invalid WHIP URL'}
                      </p>
                    ) : (
                      <p className="cMuted easyHint">
                        405 errors almost always mean the wrong URL was pasted (input id, /play, or iframe). Use the
                        full secret publish link from the dashboard. No separate Bearer header is required when the
                        secret is in the path.
                      </p>
                    )}
                    <div className="easyBtnRow">
                      <a className="cBtn ghost" href={CF_LIVE_INPUTS_URL} target="_blank" rel="noreferrer">
                        Open Cloudflare Live Inputs
                      </a>
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
                          Viewers should use the WebRTC player on /live (WHEP). HLS iframe may stay idle during
                          WebRTC beta.
                        </p>
                        <a className="cBtn primary" href="/live" target="_blank" rel="noreferrer">
                          Open /live
                        </a>
                      </div>
                    ) : (
                      <div className="adminStandbyWrap">
                        <StandbyMusicWindow compact muted />
                        <p className="adminStandbyNote">
                          Offline on purpose until you press <strong>Go Live with looks</strong>. This panel is not
                          the camera preview — use Stream studio on the left.
                        </p>
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
                {embedUrl ? (
                  <p className="cMuted" style={{ marginTop: 12, fontSize: 12, wordBreak: 'break-all' }}>
                    HLS: {embedUrl}
                    {whepUrl ? (
                      <>
                        <br />
                        WHEP: {whepUrl}
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
