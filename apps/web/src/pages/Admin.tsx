import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

const ADMIN_PASSCODE = '3000';
const AUTH_KEY = '3000-admin-auth-v1';
const LIVE_FLAG_KEY = '3000-stream-live-v1';

const customerCode = import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim();
const liveInputId = import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim();
const streamTitle = import.meta.env.VITE_STREAM_TITLE?.toString().trim() || '3000 Studios Live';

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(() => localStorage.getItem(LIVE_FLAG_KEY) === '1');
  const [previewState, setPreviewState] = useState<'idle' | 'starting' | 'ready' | 'blocked'>('idle');
  const previewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isConfigured = Boolean(customerCode && liveInputId);
  const embedUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const hlsUrl = isConfigured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/manifest/video.m3u8`
    : null;

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
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

  function handleLock() {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthed(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    setPreviewState('idle');
  }

  function toggleLive() {
    const next = !isLive;
    setIsLive(next);
    localStorage.setItem(LIVE_FLAG_KEY, next ? '1' : '0');
  }

  async function startStudioPreview() {
    setPreviewState('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        await previewRef.current.play();
      }
      setPreviewState('ready');
    } catch {
      setPreviewState('blocked');
    }
  }

  function stopPreview() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    setPreviewState('idle');
  }

  if (!authed) {
    return (
      <div className="adminScrim" style={{ background: 'radial-gradient(ellipse at 50% 20%, rgba(91,140,255,0.18), transparent 50%), #070b14' }}>
        <form className="adminCodeModal" onSubmit={handleUnlock} style={{ maxWidth: 420 }}>
          <span>3000 Studios · Owner Access</span>
          <h2>Admin Console</h2>
          <p style={{ color: 'rgba(203,213,225,0.72)', lineHeight: 1.55 }}>
            Enter the owner passcode to unlock streaming setup, live controls, and private admin tools.
          </p>
          <label>
            <span style={{ display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 600, color: 'rgba(203,213,225,0.7)' }}>
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
          {error ? (
            <div style={{ color: '#fecaca', fontSize: 13, fontWeight: 600 }}>{error}</div>
          ) : null}
          <button type="submit" className="cBtn primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Unlock Admin
          </button>
          <Link to="/" style={{ textAlign: 'center', color: 'rgba(148,163,184,0.7)', fontSize: 13, textDecoration: 'none' }}>
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
            <span className="cTitleSub">Streaming · Controls · Owner tools · Passcode gated</span>
          </div>
          <div className="cTopbarRight">
            <span className={`cPill ${isLive ? 'live' : 'warn'}`}>
              <span className="cDot" />
              {isLive ? 'MARKED LIVE' : 'OFFLINE'}
            </span>
            <span className={`cPill ${isConfigured ? 'ok' : 'warn'}`}>
              <span className="cDot" />
              {isConfigured ? 'Stream configured' : 'Setup needed'}
            </span>
            <Link to="/live" className="cBtn sm ghost" target="_blank" rel="noreferrer">
              Open Public Live
            </Link>
            <button className="cBtn sm" type="button" onClick={handleLock}>
              Lock Admin
            </button>
          </div>
        </header>

        <main className="cScroll">
          <div className="cStack">
            <section className="cHero">
              <div>
                <span className="cTag accent">Owner Stream Desk</span>
                <h2>{streamTitle}</h2>
                <p>
                  Set up your broadcast here. Start the camera preview, follow the OBS checklist, mark the stream live,
                  then verify playback on the public <strong>/live</strong> page. Ingest keys stay in OBS + Cloudflare only.
                </p>
              </div>
              <div className="cHeroActions">
                <button
                  className={`cBtn ${isLive ? 'danger' : 'primary'}`}
                  type="button"
                  onClick={toggleLive}
                >
                  {isLive ? 'End Live Flag' : 'Mark Stream Live'}
                </button>
                <a className="cBtn ghost" href="/live" target="_blank" rel="noreferrer">
                  Verify Public Playback
                </a>
              </div>
            </section>

            <div className="cKpis">
              <div className={`cKpi ${isLive ? 'ok' : ''}`}>
                <div className="cKpiLabel">Broadcast Flag</div>
                <div className="cKpiValue">{isLive ? 'LIVE' : 'OFF'}</div>
                <div className="cKpiHint">Owner-marked status</div>
              </div>
              <div className={`cKpi ${isConfigured ? 'ok' : 'warn'}`}>
                <div className="cKpiLabel">Cloudflare Stream</div>
                <div className="cKpiValue">{isConfigured ? 'Ready' : 'Pending'}</div>
                <div className="cKpiHint">{isConfigured ? 'Env vars present' : 'Add customer code + live input'}</div>
              </div>
              <div className={`cKpi ${previewState === 'ready' ? 'ok' : ''}`}>
                <div className="cKpiLabel">Camera Preview</div>
                <div className="cKpiValue">
                  {previewState === 'ready' ? 'On' : previewState === 'blocked' ? 'Blocked' : 'Idle'}
                </div>
                <div className="cKpiHint">Local device check</div>
              </div>
              <div className="cKpi gold">
                <div className="cKpiLabel">Public Page</div>
                <div className="cKpiValue">/live</div>
                <div className="cKpiHint">Auto-plays when ingest is active</div>
              </div>
            </div>

            <section className="cCols">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Studio Camera Preview</h2>
                  <span className="cSub">Confirm camera + mic before OBS</span>
                </div>
                <div className="cPanelBody">
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '16 / 9',
                      borderRadius: 12,
                      overflow: 'hidden',
                      background: '#0a0f1a',
                      border: '1px solid rgba(148,163,184,0.18)',
                      marginBottom: 14,
                    }}
                  >
                    <video
                      ref={previewRef}
                      muted
                      playsInline
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {previewState !== 'ready' ? (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'rgba(203,213,225,0.55)',
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        {previewState === 'starting'
                          ? 'Starting camera…'
                          : previewState === 'blocked'
                            ? 'Permission blocked'
                            : 'Camera preview offline'}
                      </div>
                    ) : null}
                  </div>
                  <div className="cBtnRow">
                    <button className="cBtn primary" type="button" onClick={startStudioPreview}>
                      Start Camera Preview
                    </button>
                    <button className="cBtn ghost" type="button" onClick={stopPreview} disabled={previewState === 'idle'}>
                      Stop Preview
                    </button>
                  </div>
                  <p className="cMuted" style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5 }}>
                    Browser preview only confirms this device. Production broadcast still uses OBS → Cloudflare Stream
                    with the private stream key.
                  </p>
                </div>
              </div>

              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Go-Live Checklist</h2>
                  <span className="cSub">No stream keys are shown here</span>
                </div>
                <div className="cPanelBody">
                  <div className="featureList">
                    <div className="featureLine">
                      <strong>1. Open OBS</strong>
                      <span>Select the 3000 Studios scene. Verify camera, audio meters, overlays.</span>
                    </div>
                    <div className="featureLine">
                      <strong>2. Start Streaming</strong>
                      <span>OBS pushes to Cloudflare Stream using the private live-input key.</span>
                    </div>
                    <div className="featureLine">
                      <strong>3. Mark Live</strong>
                      <span>Use the button above so the admin console shows LIVE status.</span>
                    </div>
                    <div className="featureLine">
                      <strong>4. Verify Public</strong>
                      <span>Open /live — Cloudflare player plays the broadcast when ingest is active.</span>
                    </div>
                  </div>
                  <div className="cBtnRow" style={{ marginTop: 16 }}>
                    <button className={`cBtn ${isLive ? 'danger' : 'primary'}`} type="button" onClick={toggleLive}>
                      {isLive ? 'End Live Flag' : 'Mark Stream Live'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Live Player (Admin View)</h2>
                <span className="cSub">Same Cloudflare Stream embed that powers the public /live page</span>
              </div>
              <div className="cPanelBody">
                {embedUrl ? (
                  <div
                    style={{
                      position: 'relative',
                      aspectRatio: '16 / 9',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '1px solid rgba(148,163,184,0.18)',
                      background: '#000',
                    }}
                  >
                    <iframe
                      title={streamTitle}
                      src={embedUrl}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="cEmpty">
                    <strong>Cloudflare Stream is not configured yet.</strong>
                    <br />
                    Add <code>VITE_STREAM_CUSTOMER_CODE</code> and <code>VITE_STREAM_LIVE_INPUT_ID</code> in Cloudflare
                    Pages environment variables after creating the live input. Then redeploy.
                  </div>
                )}
              </div>
            </section>

            <section className="cCols">
              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>OBS Ingest</h2>
                  <span className="cSub">Keep the key outside this site</span>
                </div>
                <div className="cPanelBody">
                  <div className="featureList">
                    <div className="featureLine">
                      <strong>Server</strong>
                      <span>rtmps://live.cloudflare.com:443/live/</span>
                    </div>
                    <div className="featureLine">
                      <strong>Stream key</strong>
                      <span>Cloudflare Stream Live Input key only — never commit it.</span>
                    </div>
                    <div className="featureLine">
                      <strong>Recommended</strong>
                      <span>CBR · AAC · 2s keyframe · B-frames 0 for lower latency.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cPanel">
                <div className="cPanelHead">
                  <h2>Phone / Remote Playback</h2>
                  <span className="cSub">Private paths</span>
                </div>
                <div className="cPanelBody">
                  <div className="featureList">
                    <div className="featureLine">
                      <strong>Public path</strong>
                      <span>https://3000studios.vip/live</span>
                    </div>
                    <div className="featureLine">
                      <strong>HLS</strong>
                      <span style={{ wordBreak: 'break-all' }}>{hlsUrl || 'Available after Stream env vars are set.'}</span>
                    </div>
                    <div className="featureLine">
                      <strong>Admin</strong>
                      <span>This page — passcode protected.</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Admin Features</h2>
                <span className="cSub">Quick access to the rest of the control plane</span>
              </div>
              <div className="cPanelBody">
                <div className="cTiles">
                  <Link to="/vault" className="cTile">
                    <strong>Full Vault Console</strong>
                    <span>Command center, fleet health, ops, deeper stream vault (owner auth).</span>
                  </Link>
                  <Link to="/vault/stream" className="cTile">
                    <strong>Stream Vault</strong>
                    <span>Alternate protected stream desk inside the vault shell.</span>
                  </Link>
                  <Link to="/music" className="cTile">
                    <strong>Music Showcase</strong>
                    <span>Public catalog and featured tracks.</span>
                  </Link>
                  <Link to="/blog" className="cTile">
                    <strong>SEO Blog</strong>
                    <span>Search-ready editorial for music, video, and live growth.</span>
                  </Link>
                  <Link to="/" className="cTile">
                    <strong>Public Homepage</strong>
                    <span>Return to the VIP front door.</span>
                  </Link>
                  <a href="mailto:Mr.jwswain@gmail.com?subject=3000%20Studios%20admin" className="cTile">
                    <strong>Owner Email</strong>
                    <span>Direct contact for sponsorships, licensing, and ops.</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
