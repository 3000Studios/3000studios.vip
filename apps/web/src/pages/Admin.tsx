import { useEffect, useRef, useState, type FormEvent } from 'react';
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

const customerCode =
  import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
const liveInputId =
  import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
const streamTitle = import.meta.env.VITE_STREAM_TITLE?.toString().trim() || '3000 Studios Live';
const envWhipUrl = import.meta.env.VITE_STREAM_WHIP_URL?.toString().trim() || '';

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(() => localStorage.getItem(LIVE_FLAG_KEY) === '1');
  const [publishState, setPublishState] = useState<'idle' | 'starting' | 'live' | 'error'>('idle');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [whipUrl, setWhipUrl] = useState(
    () => localStorage.getItem(WHIP_URL_STORAGE_KEY) || envWhipUrl || '',
  );
  const [showWhipHelp, setShowWhipHelp] = useState(false);

  const previewRef = useRef<HTMLVideoElement | null>(null);
  const publisherRef = useRef<WhipPublisher | null>(null);

  const isConfigured = Boolean(customerCode && liveInputId);
  const embedUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const whepUrl = isConfigured ? buildWhepUrl(customerCode, liveInputId) : null;
  const whipReady = Boolean(whipUrl.trim().includes('/webRTC/publish'));
  const broadcasting = publishState === 'live';

  useEffect(() => {
    return () => {
      void publisherRef.current?.stop();
      publisherRef.current = null;
    };
  }, []);

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
      setPublishError('Paste your Cloudflare WHIP publish URL first (see setup below).');
      setPublishState('error');
      setShowWhipHelp(true);
      return;
    }
    setPublishError(null);
    setPublishState('starting');
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

  if (!authed) {
    return (
      <div
        className="adminScrim"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(91,140,255,0.18), transparent 50%), #070b14',
        }}
      >
        <form className="adminCodeModal" onSubmit={handleUnlock} style={{ maxWidth: 420 }}>
          <span>3000 Studios · Owner Access</span>
          <h2>Admin Console</h2>
          <p style={{ color: 'rgba(203,213,225,0.72)', lineHeight: 1.55 }}>
            Enter passcode to unlock phone streaming and live controls.
          </p>
          <label>
            <span
              style={{
                display: 'block',
                marginBottom: 6,
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(203,213,225,0.7)',
              }}
            >
              Passcode
            </span>
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
          {error ? <div style={{ color: '#fecaca', fontSize: 13, fontWeight: 600 }}>{error}</div> : null}
          <button
            type="submit"
            className="cBtn primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
          >
            Unlock Admin
          </button>
          <Link
            to="/"
            style={{
              textAlign: 'center',
              color: 'rgba(148,163,184,0.7)',
              fontSize: 13,
              textDecoration: 'none',
            }}
          >
            ← Back to public site
          </Link>
        </form>
      </div>
    );
  }

  return (
    <div className="console" style={{ gridTemplateColumns: '1fr' }}>
      <div className="cMain">
        <header className="cTopbar">
          <div className="cTitle">
            <h1>Admin Console</h1>
            <span className="cTitleSub">Phone Go Live · WebRTC · Public standby preview</span>
          </div>
          <div className="cTopbarRight">
            <span className={`cPill ${publishState === 'live' || isLive ? 'live' : 'warn'}`}>
              <span className="cDot" />
              {publishState === 'live' ? 'BROADCASTING' : isLive ? 'MARKED LIVE' : 'OFFLINE'}
            </span>
            <Link to="/live" className="cBtn sm ghost" target="_blank" rel="noreferrer">
              Open Public Live
            </Link>
            <button className="cBtn sm" type="button" onClick={() => void handleLock()}>
              Lock Admin
            </button>
          </div>
        </header>

        <main className="cScroll">
          <div className="cStack">
            <section className="cHero">
              <div>
                <span className="cTag accent">Stream from your phone</span>
                <h2>{streamTitle}</h2>
                <p>
                  Left: your camera send. Right: the exact public window viewers see on{' '}
                  <strong>/live</strong> — catalog covers + STREAMING SOON until you go live.
                </p>
              </div>
              <div className="cHeroActions">
                {publishState === 'live' ? (
                  <button className="cBtn danger" type="button" onClick={() => void stopBroadcast()}>
                    End Stream
                  </button>
                ) : (
                  <button
                    className="cBtn primary"
                    type="button"
                    onClick={() => void startBroadcast()}
                    disabled={publishState === 'starting'}
                  >
                    {publishState === 'starting' ? 'Connecting…' : 'Go Live from This Phone'}
                  </button>
                )}
                <a className="cBtn ghost" href="/live" target="_blank" rel="noreferrer">
                  Verify Public Playback
                </a>
              </div>
            </section>

            <div className="cKpis">
              <div className={`cKpi ${publishState === 'live' ? 'ok' : ''}`}>
                <div className="cKpiLabel">Broadcast</div>
                <div className="cKpiValue">
                  {publishState === 'live'
                    ? 'LIVE'
                    : publishState === 'starting'
                      ? '…'
                      : publishState === 'error'
                        ? 'ERR'
                        : 'OFF'}
                </div>
                <div className="cKpiHint">Phone → Cloudflare WebRTC</div>
              </div>
              <div className={`cKpi ${whipReady ? 'ok' : 'warn'}`}>
                <div className="cKpiLabel">WHIP URL</div>
                <div className="cKpiValue">{whipReady ? 'Ready' : 'Needed'}</div>
                <div className="cKpiHint">One-time paste from dashboard</div>
              </div>
              <div className={`cKpi ${isConfigured ? 'ok' : 'warn'}`}>
                <div className="cKpiLabel">Public Player</div>
                <div className="cKpiValue">/live</div>
                <div className="cKpiHint">Standby → live auto-switch</div>
              </div>
              <div className="cKpi gold">
                <div className="cKpiLabel">Camera</div>
                <div className="cKpiValue">{facing === 'user' ? 'Front' : 'Rear'}</div>
                <div className="cKpiHint">Tap switch below</div>
              </div>
            </div>

            <section className="cCols adminStreamGrid">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Your camera (send)</h2>
                  <span className="cSub">What you are pushing to Cloudflare</span>
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
                          ? 'Requesting camera + connecting to Cloudflare…'
                          : publishState === 'error'
                            ? publishError || 'Stream error'
                            : 'Tap Go Live to start from this phone'}
                      </div>
                    ) : (
                      <div className="streamLiveBadge">● LIVE</div>
                    )}
                  </div>

                  <div className="cBtnRow">
                    {publishState === 'live' ? (
                      <button className="cBtn danger" type="button" onClick={() => void stopBroadcast()}>
                        End Stream
                      </button>
                    ) : (
                      <button
                        className="cBtn primary"
                        type="button"
                        onClick={() => void startBroadcast()}
                        disabled={publishState === 'starting'}
                      >
                        {publishState === 'starting' ? 'Connecting…' : 'Go Live from This Phone'}
                      </button>
                    )}
                    <button
                      className="cBtn ghost"
                      type="button"
                      disabled={publishState === 'live' || publishState === 'starting'}
                      onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
                    >
                      Switch to {facing === 'user' ? 'Rear' : 'Front'} Camera
                    </button>
                  </div>

                  {publishError ? (
                    <p style={{ marginTop: 12, color: '#fecaca', fontSize: 13, fontWeight: 600 }}>
                      {publishError}
                    </p>
                  ) : null}

                  <p className="cMuted" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                    Keep this tab open while live. Closing the tab or locking the phone may stop the
                    broadcast on some devices.
                  </p>
                </div>
              </div>

              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Public live window</h2>
                  <span className="cSub">Same experience as https://3000studios.vip/live</span>
                </div>
                <div className="cPanelBody">
                  <StreamFrame isLive={broadcasting} className="adminPublicPreview">
                    {broadcasting ? (
                      <div className="adminLivePublicNote">
                        <strong>You are live</strong>
                        <p>
                          Viewers on /live now receive your camera via WHEP. Open Public Live to
                          verify.
                        </p>
                        <a className="cBtn primary" href="/live" target="_blank" rel="noreferrer">
                          Open /live
                        </a>
                      </div>
                    ) : (
                      <StandbyMusicWindow compact muted />
                    )}
                  </StreamFrame>
                  <p className="cMuted" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                    Offline preview is muted here so it does not fight your mic. Public /live plays
                    audio for viewers.
                  </p>
                </div>
              </div>
            </section>

            <section className="cCols">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>One-time WHIP setup</h2>
                  <span className="cSub">Required for phone streaming</span>
                </div>
                <div className="cPanelBody">
                  <p className="cMuted" style={{ fontSize: 13, lineHeight: 1.55, marginBottom: 12 }}>
                    Cloudflare Stream dashboard → <strong>Stream → Live inputs</strong> → open your
                    input → copy the <strong>WebRTC / WHIP publish URL</strong> (ends with{' '}
                    <code>/webRTC/publish</code>). Paste it once below. It stays on this device only.
                  </p>
                  <label style={{ display: 'block', marginBottom: 8 }}>
                    <span
                      style={{
                        display: 'block',
                        marginBottom: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'rgba(203,213,225,0.7)',
                      }}
                    >
                      WHIP publish URL
                    </span>
                    <input
                      type="url"
                      value={whipUrl}
                      onChange={(e) => saveWhipUrl(e.target.value)}
                      placeholder="https://customer-….cloudflarestream.com/…/webRTC/publish"
                      style={{
                        width: '100%',
                        minHeight: 44,
                        borderRadius: 8,
                        border: '1px solid rgba(148,163,184,0.25)',
                        background: 'rgba(2,6,14,0.8)',
                        color: '#e2e8f0',
                        padding: '10px 12px',
                        fontSize: 13,
                      }}
                    />
                  </label>
                  <div className="featureList" style={{ marginTop: 12 }}>
                    <div className="featureLine">
                      <strong>1. Paste URL</strong>
                      <span>From Cloudflare Live Input → webRTC publish.</span>
                    </div>
                    <div className="featureLine">
                      <strong>2. Go Live</strong>
                      <span>Allow camera + mic when the browser asks.</span>
                    </div>
                    <div className="featureLine">
                      <strong>3. Viewers</strong>
                      <span>Open https://3000studios.vip/live — standby flips to your stream.</span>
                    </div>
                  </div>
                  <button
                    className="cBtn ghost"
                    type="button"
                    style={{ marginTop: 12 }}
                    onClick={() => setShowWhipHelp((v) => !v)}
                  >
                    {showWhipHelp ? 'Hide help' : 'Where do I find the URL?'}
                  </button>
                  {showWhipHelp ? (
                    <p className="cMuted" style={{ marginTop: 10, fontSize: 13, lineHeight: 1.55 }}>
                      Dashboard → Stream → Live inputs → select input{' '}
                      <code>{liveInputId}</code> → look for <strong>webRTC</strong> / WHIP URL. Never
                      share that secret publicly.
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Public player status</h2>
                  <span className="cSub">Same endpoints viewers use on /live</span>
                </div>
                <div className="cPanelBody">
                  <div className="featureList">
                    <div className="featureLine">
                      <strong>Public page</strong>
                      <span>https://3000studios.vip/live</span>
                    </div>
                    <div className="featureLine">
                      <strong>WHEP (phone streams)</strong>
                      <span style={{ wordBreak: 'break-all', fontSize: 12 }}>{whepUrl}</span>
                    </div>
                    <div className="featureLine">
                      <strong>HLS / iframe (OBS RTMP)</strong>
                      <span style={{ wordBreak: 'break-all', fontSize: 12 }}>{embedUrl}</span>
                    </div>
                    <div className="featureLine">
                      <strong>Live input ID</strong>
                      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                        {liveInputId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Admin Features</h2>
                <span className="cSub">Quick links</span>
              </div>
              <div className="cPanelBody">
                <div className="cTiles">
                  <Link to="/live" className="cTile">
                    <strong>Public Live</strong>
                    <span>What viewers see while you broadcast.</span>
                  </Link>
                  <Link to="/vault" className="cTile">
                    <strong>Full Vault Console</strong>
                    <span>Command center and deeper tools.</span>
                  </Link>
                  <Link to="/music" className="cTile">
                    <strong>Music Showcase</strong>
                    <span>Catalog and featured tracks.</span>
                  </Link>
                  <Link to="/" className="cTile">
                    <strong>Homepage</strong>
                    <span>Back to the public front door.</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
