import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { WHIP_URL_STORAGE_KEY, WhipPublisher, validateWhipUrl } from '../lib/webrtcStream';
import { setHostLiveFlag } from '../lib/streamScene';

export function PhoneGoLive() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pubRef = useRef<WhipPublisher | null>(null);
  const [unlocked] = useState(() => sessionStorage.getItem('3000-admin-auth-v1') === '1');
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [status, setStatus] = useState<'idle' | 'live' | 'busy'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [whip, setWhip] = useState(() => localStorage.getItem(WHIP_URL_STORAGE_KEY) || '');

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

  const [micMuted, setMicMuted] = useState(false);

  function toggleMic() {
    const next = !micMuted;
    setMicMuted(next);
    const media = pubRef.current?.getMediaStream();
    media?.getAudioTracks().forEach((t) => {
      t.enabled = !next;
    });
  }

  async function endLive() {
    await pubRef.current?.stop();
    pubRef.current = null;
    setStatus('idle');
    setHostLiveFlag(false);
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: false } }));
  }

  if (!unlocked) {
    return (
      <div className="phoneGoLive phoneGoLiveLock">
        <div className="phoneGoLiveCard">
          <p>3000 Studios</p>
          <h1>Owner access required</h1>
          <p>Open the owner Go Live Console first, then return here to use your phone camera.</p>
          <Link to="/admin">Open Go Live Console</Link>
          <Link to="/">Back home</Link>
        </div>
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
        <p className={status === 'live' ? 'is-live' : ''}>
          {status === 'live'
            ? `YOU ARE LIVE ${micMuted ? '· 🔇 MIC MUTED' : '· 🎙️ SOUND ON'}`
            : 'Preview · one tap to broadcast'}
        </p>
        {error ? <p className="phoneGoLiveErr">{error}</p> : null}
        {!validateWhipUrl(whip).ok ? (
          <label className="phoneGoLiveWhip">
            <span>Cloudflare WebRTC publish URL</span>
            <input
              type="url"
              value={whip}
              onChange={(event) => {
                const value = event.target.value;
                setWhip(value);
                localStorage.setItem(WHIP_URL_STORAGE_KEY, value.trim());
              }}
              placeholder="Paste once from Cloudflare Live Inputs"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        ) : null}
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
          <button
            type="button"
            className="phoneGoLiveFlip"
            style={{ background: micMuted ? 'rgba(239, 68, 68, 0.4)' : undefined }}
            onClick={toggleMic}
          >
            {micMuted ? '🔇 Unmute' : '🎙️ Mic on'}
          </button>
        </div>
      </div>
    </div>
  );
}
