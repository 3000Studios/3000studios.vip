import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { STREAM_WHIP_PUBLISH_URL } from '../lib/streamConfig';
import { WhipPublisher, validateWhipUrl } from '../lib/webrtcStream';
import { setHostLiveFlag } from '../lib/streamScene';

const PASS = '3000';

export function PhoneGoLive() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pubRef = useRef<WhipPublisher | null>(null);
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('3000-admin-auth-v1') === '1');
  const [code, setCode] = useState('');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [status, setStatus] = useState<'idle' | 'live' | 'busy'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [whip, setWhip] = useState(STREAM_WHIP_PUBLISH_URL);

  useEffect(() => {
    if (!unlocked) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/stream-config', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ passcode: PASS }),
        });
        const data = (await res.json()) as { ok?: boolean; whipUrl?: string };
        if (!cancelled && data.whipUrl) setWhip(data.whipUrl);
      } catch {
        /* baked WHIP still works */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [unlocked]);

  useEffect(() => {
    return () => {
      void pubRef.current?.stop();
      setHostLiveFlag(false);
    };
  }, []);

  async function goLive() {
    const el = videoRef.current;
    if (!el) return;
    const check = validateWhipUrl(whip);
    if (!check.ok) {
      setError(check.reason);
      return;
    }
    setError(null);
    setStatus('busy');
    try {
      await pubRef.current?.stop();
      const pub = new WhipPublisher(check.endpoint);
      pubRef.current = pub;
      await pub.start(el, facing);
      setStatus('live');
      setHostLiveFlag(true);
      window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: true } }));
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Could not go live');
      setHostLiveFlag(false);
    }
  }

  async function endLive() {
    await pubRef.current?.stop();
    pubRef.current = null;
    setStatus('idle');
    setHostLiveFlag(false);
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: false } }));
  }

  function unlock(e: FormEvent) {
    e.preventDefault();
    if (code.trim() !== PASS) {
      setError('Wrong passcode');
      return;
    }
    sessionStorage.setItem('3000-admin-auth-v1', '1');
    setUnlocked(true);
    setError(null);
  }

  if (!unlocked) {
    return (
      <div className="phoneGoLive phoneGoLiveLock">
        <form className="phoneGoLiveCard" onSubmit={unlock}>
          <p>3000 Studios</p>
          <h1>Go live from your phone</h1>
          <input
            type="password"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Passcode"
            autoFocus
          />
          {error ? <p className="phoneGoLiveErr">{error}</p> : null}
          <button type="submit">Unlock</button>
          <Link to="/">Back home</Link>
        </form>
      </div>
    );
  }

  return (
    <div className="phoneGoLive">
      <header className="phoneGoLiveBar">
        <Link to="/">Home</Link>
        <strong>Phone Go Live</strong>
        <Link to="/live" target="_blank" rel="noreferrer">
          Viewers
        </Link>
      </header>
      <video ref={videoRef} className="phoneGoLiveVideo" playsInline muted autoPlay />
      <div className="phoneGoLiveDock">
        <p className={status === 'live' ? 'is-live' : ''}>{status === 'live' ? 'YOU ARE LIVE' : 'Preview · one tap to broadcast'}</p>
        {error ? <p className="phoneGoLiveErr">{error}</p> : null}
        <div className="phoneGoLiveActions">
          {status === 'live' ? (
            <button type="button" className="phoneGoLiveStop" onClick={() => void endLive()}>
              End live
            </button>
          ) : (
            <button type="button" className="phoneGoLiveStart" disabled={status === 'busy'} onClick={() => void goLive()}>
              {status === 'busy' ? 'Connecting…' : 'Go Live'}
            </button>
          )}
          <button
            type="button"
            className="phoneGoLiveFlip"
            onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
          >
            Flip camera
          </button>
        </div>
      </div>
    </div>
  );
}
