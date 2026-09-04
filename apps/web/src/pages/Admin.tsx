import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  WHIP_URL_STORAGE_KEY,
  validateWhipUrl,
} from '../lib/webrtcStream';
import { StreamStudioPanel } from '../components/StreamStudioPanel';
import {
  STREAM_CUSTOMER_CODE,
  STREAM_LIVE_INPUT_ID,
  STREAM_WHIP_PUBLISH_URL,
} from '../lib/streamConfig';
import { readHostLiveFlag, setHostLiveFlag } from '../lib/streamScene';
import { publishServerLiveFlag } from '../lib/streamLiveDetect';
import { AdminObservability } from '../components/AdminObservability';
import { MarketingAdvisor } from '../components/MarketingAdvisor';
import '../styles/discover.css';

const ADMIN_PASSCODE = '3000';
const AUTH_KEY = '3000-admin-auth-v1';
const PUBLIC_LIVE_URL = 'https://3000studios.vip/live';
const NOTES_KEY = '3000-admin-rundown';
const SESS_KEY = '3000-admin-sessions';

type SessionMark = { ts: number; live: boolean };

const customerCode = STREAM_CUSTOMER_CODE;
const liveInputId = STREAM_LIVE_INPUT_ID;

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

function detectDevice(): DeviceKind {
  if (typeof navigator === 'undefined') return 'laptop';
  const ua = navigator.userAgent || '';
  const mobileUa = /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const narrow = typeof window !== 'undefined' && window.innerWidth < 900;
  if (mobileUa || (coarse && narrow)) return 'phone';
  return 'laptop';
}

export function Admin() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(AUTH_KEY) === '1');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceKind>(() => detectDevice());
  const [isLive, setIsLive] = useState(() => readHostLiveFlag());
  const [broadcasting, setBroadcasting] = useState(false);
  const [studioError, setStudioError] = useState<string | null>(null);
  const [whipUrl, setWhipUrl] = useState(() => loadInitialWhipUrl());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notes, setNotes] = useState(() => {
    try {
      return localStorage.getItem(NOTES_KEY) || '';
    } catch {
      return '';
    }
  });
  const [copied, setCopied] = useState('');
  const [sessions, setSessions] = useState<SessionMark[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SESS_KEY) || '[]') as SessionMark[];
    } catch {
      return [];
    }
  });
  const [liveFlag, setLiveFlag] = useState<{ live?: boolean; ts?: number } | null>(null);

  const whipCheck = validateWhipUrl(whipUrl, liveInputId);
  const whipReady = whipCheck.ok;

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
    const initial = window.setTimeout(refreshDevice, 0);
    window.addEventListener('resize', refreshDevice);
    return () => {
      window.clearTimeout(initial);
      window.removeEventListener('resize', refreshDevice);
    };
  }, [refreshDevice]);

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
    setHostLiveFlag(false);
    void publishServerLiveFlag(false);
  }

  function onStudioLive(live: boolean) {
    setBroadcasting(live);
    setIsLive(live);
    setHostLiveFlag(live);
    void publishServerLiveFlag(live);
    const next = [{ ts: Date.now(), live }, ...sessions].slice(0, 12);
    setSessions(next);
    localStorage.setItem(SESS_KEY, JSON.stringify(next));
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  }

  function refreshLiveFlag() {
    void fetch('/api/live-flag')
      .then((r) => r.json())
      .then(setLiveFlag)
      .catch(() => setLiveFlag(null));
  }

  useEffect(() => {
    refreshLiveFlag();
    const id = window.setInterval(refreshLiveFlag, 12000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!broadcasting) return undefined;
    setHostLiveFlag(true);
    void publishServerLiveFlag(true);
    const id = window.setInterval(() => {
      setHostLiveFlag(true);
      void publishServerLiveFlag(true);
    }, 10_000);
    return () => window.clearInterval(id);
  }, [broadcasting]);

  const deviceBadge = useMemo(
    () => (device === 'phone' ? 'Phone ready' : 'Laptop ready'),
    [device],
  );

  if (!authed) {
    return (
      <div className="adminScrim adminEasyShell">
        <form className="adminCodeModal" onSubmit={handleUnlock}>
          <span>3000 Studios · Owner Access</span>
          <h2>Go Live Console</h2>
          <p>Unlock, access camera, pick a look, hit Go Live. Viewers watch /live.</p>
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
          <button type="submit" className="cBtn primary" style={{ width: '100%' }}>Unlock</button>
          <Link to="/" className="adminBackLink">← Back to public site</Link>
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
            <span className="cTitleSub">Camera · filter · overlay · Go Live</span>
          </div>
          <div className="cTopbarRight">
            <span className={`cPill ${broadcasting || isLive ? 'live' : 'warn'}`}>
              <span className="cDot" />
              {broadcasting || isLive ? 'LIVE' : 'OFFLINE'}
            </span>
            <Link to="/live" className="cBtn sm ghost" target="_blank" rel="noreferrer">Public /live</Link>
            <button className="cBtn sm" type="button" onClick={handleLock}>Lock</button>
          </div>
        </header>
        <main className="cScroll">
          <div className="cStack">
            <section className="easyStatusStrip">
              <div className={`easyChip ${device === 'phone' ? 'ok' : 'info'}`}>{deviceBadge}</div>
              <div className={`easyChip ${whipReady ? 'ok' : 'warn'}`}>{whipReady ? 'Stream ready' : 'Stream path missing'}</div>
              <div className={`easyChip ${liveFlag?.live || broadcasting ? 'ok' : 'info'}`}>
                Flag: {liveFlag?.live || broadcasting ? 'ON AIR' : 'offline'}
              </div>
              <button type="button" className="easyChip info" onClick={refreshLiveFlag}>Refresh flag</button>
            </section>
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Quick actions</h2>
                <span className="cSub">Copy, preview, phone go-live</span>
              </div>
              <div className="cPanelBody adminQuickGrid">
                <button type="button" className="cBtn sm" onClick={() => copyText('live', PUBLIC_LIVE_URL)}>
                  {copied === 'live' ? 'Copied /live' : 'Copy /live URL'}
                </button>
                <button type="button" className="cBtn sm ghost" onClick={() => copyText('inquiry', 'Team@3000studios.vip')}>
                  {copied === 'inquiry' ? 'Copied email' : 'Copy inquiry email'}
                </button>
                <Link className="cBtn sm ghost" to="/go-live">Phone Go Live</Link>
                <Link className="cBtn sm ghost" to="/music">Music deck</Link>
                <Link className="cBtn sm ghost" to="/video">Videos</Link>
                <a className="cBtn sm ghost" href={PUBLIC_LIVE_URL} target="_blank" rel="noreferrer">Open public player</a>
              </div>
            </section>
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Run of show</h2>
                <span className="cSub">Local notes for this browser</span>
              </div>
              <div className="cPanelBody">
                <textarea
                  className="adminNoteBox"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    localStorage.setItem(NOTES_KEY, e.target.value);
                  }}
                  placeholder="Set list, overlays, sponsor reads, camera notes…"
                />
                <p className="cMuted" style={{ marginTop: 10 }}>
                  Last session marks:{' '}
                  {sessions.length === 0
                    ? 'none yet'
                    : sessions.slice(0, 4).map((s) => `${s.live ? 'LIVE' : 'OFF'} ${new Date(s.ts).toLocaleTimeString()}`).join(' · ')}
                </p>
              </div>
            </section>
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Public preview</h2>
                <span className="cSub">What viewers see on /live</span>
              </div>
              <div className="cPanelBody">
                <iframe className="adminPreviewFrame" title="Public live preview" src="/live" />
              </div>
            </section>
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Studio</h2>
                <span className="cSub">Access camera → set the look → Go Live</span>
              </div>
              <div className="cPanelBody">
                <StreamStudioPanel whipUrl={whipUrl} whipReady={whipReady} liveInputId={liveInputId} onLiveChange={onStudioLive} onError={setStudioError} />
                {studioError ? <p className="adminError">{studioError}</p> : null}
                <p className="adminStandbyNote" style={{ marginTop: 10 }}>
                  {broadcasting ? 'You are live on /live.' : 'Viewers stay on standby until you hit Go Live.'}{' '}
                  <a href={PUBLIC_LIVE_URL} target="_blank" rel="noreferrer">Open /live</a>
                </p>
              </div>
            </section>
            <MarketingAdvisor />
            <AdminObservability />
            <section className="cPanel">
              <div className="cPanelHead">
                <h2>Advanced</h2>
                <span className="cSub">OBS / keys stay hidden. Phone Go Live does not need this.</span>
              </div>
              <div className="cPanelBody">
                <button type="button" className="cBtn ghost" onClick={() => setShowAdvanced((v) => !v)}>
                  {showAdvanced ? 'Hide backend keys' : 'Show backend keys'}
                </button>
                {showAdvanced ? (
                  <div className="easyGuide" style={{ marginTop: 16 }}>
                    <p className="cMuted">Built-in WHIP path is already wired. Only change this if Cloudflare rotated keys.</p>
                    <label className="easyField">
                      <span>WHIP publish URL</span>
                      <input type="url" value={whipUrl} onChange={(e) => { setWhipUrl(e.target.value); localStorage.setItem(WHIP_URL_STORAGE_KEY, e.target.value.trim()); }} spellCheck={false} autoComplete="off" />
                    </label>
                    {STREAM_WHIP_PUBLISH_URL ? (
                      <button type="button" className="cBtn sm ghost" onClick={() => { setWhipUrl(STREAM_WHIP_PUBLISH_URL); localStorage.setItem(WHIP_URL_STORAGE_KEY, STREAM_WHIP_PUBLISH_URL); }}>Reset built-in stream URL</button>
                    ) : null}
                    <p className="cMuted" style={{ marginTop: 12 }}>Customer: {customerCode}</p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
