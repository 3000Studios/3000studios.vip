import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Broadcast, CameraRotate, Microphone, MicrophoneSlash } from '@phosphor-icons/react';
import { WHIP_URL_STORAGE_KEY, WhipPublisher, validateWhipUrl } from '../lib/webrtcStream';
import { setHostLiveFlag } from '../lib/streamScene';
import { publishServerLiveFlag } from '../lib/streamLiveDetect';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { useAuth } from '../lib/auth';
import '../v2/go-live.css';

export function PhoneGoLive() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pubRef = useRef<WhipPublisher | null>(null);
  const { isAuthenticated } = useAuth();
  const unlocked = isAuthenticated;
  const [facing, setFacing] = useState<'user' | 'environment'>('user');
  const [status, setStatus] = useState<'idle' | 'live' | 'busy'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [whip, setWhip] = useState(() => localStorage.getItem(WHIP_URL_STORAGE_KEY) || '');

  useEffect(() => {
    return () => {
      void pubRef.current?.stop();
      setHostLiveFlag(false);
      void publishServerLiveFlag(false);
    };
  }, []);

  // Server heartbeat while live so any viewer device sees the flag.
  useEffect(() => {
    if (status !== 'live') return undefined;
    void publishServerLiveFlag(true);
    const id = window.setInterval(() => {
      void publishServerLiveFlag(true);
    }, 15_000);
    return () => window.clearInterval(id);
  }, [status]);

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
      void publishServerLiveFlag(true);
      window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: true } }));
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Could not go live');
      setHostLiveFlag(false);
      void publishServerLiveFlag(false);
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
    void publishServerLiveFlag(false);
    window.dispatchEvent(new CustomEvent('3000-host-live', { detail: { live: false } }));
  }

  if (!unlocked) {
    return (
      <PublicLayoutV2 wallpaper="beams">
        <div className="v2-card v2-golive-lock">
          <span className="v2-kicker">3000 Studios</span>
          <h1>
            Owner access <span className="v2-grad-text">required</span>
          </h1>
          <p>Open the owner Go Live Console first, then return here to use your phone camera.</p>
          <div className="v2-golive-lock-links">
            <Link className="v2-btn" to="/admin">
              Open Go Live Console
            </Link>
            <Link className="v2-btn v2-btn--ghost" to="/">
              Back home
            </Link>
          </div>
        </div>
      </PublicLayoutV2>
    );
  }

  return (
    <PublicLayoutV2 wallpaper="beams">
      <div className="v2-golive">
        <header className="v2-golive-bar">
          <Link to="/">Home</Link>
          <strong>Phone Go Live</strong>
          <Link to="/#live" target="_blank" rel="noreferrer">
            Viewers
          </Link>
        </header>
        <video ref={videoRef} className="v2-golive-video" playsInline muted autoPlay />
        <div className="v2-golive-dock">
          <p className={`v2-golive-status ${status === 'live' ? 'is-live' : ''}`}>
            {status === 'live'
              ? `YOU ARE LIVE ${micMuted ? '· 🔇 MIC MUTED' : '· 🎙️ SOUND ON'}`
              : 'Preview · one tap to broadcast'}
          </p>
          {error ? <p className="v2-golive-err">{error}</p> : null}
          {!validateWhipUrl(whip).ok ? (
            <label className="v2-golive-whip">
              <span>Cloudflare WebRTC publish URL</span>
              <input
                className="v2-input"
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
          <div className="v2-golive-actions">
            {status === 'live' ? (
              <button type="button" className="v2-golive-stop" onClick={() => void endLive()}>
                End live
              </button>
            ) : (
              <button
                type="button"
                className="v2-golive-go"
                disabled={status === 'busy'}
                onClick={() => void goLive()}
              >
                <Broadcast size={20} weight="fill" style={{ verticalAlign: '-4px', marginRight: 8 }} />
                {status === 'busy' ? 'Connecting…' : 'Go Live'}
              </button>
            )}
            <button
              type="button"
              className="v2-golive-side"
              onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
            >
              <CameraRotate size={18} weight="fill" style={{ verticalAlign: '-3px', marginRight: 6 }} />
              Flip camera
            </button>
            <button
              type="button"
              className="v2-golive-side"
              style={micMuted ? { borderColor: 'rgba(255, 77, 77, 0.55)', color: '#ff8080' } : undefined}
              onClick={toggleMic}
            >
              {micMuted ? (
                <>
                  <MicrophoneSlash size={18} weight="fill" style={{ verticalAlign: '-3px', marginRight: 6 }} />
                  Unmute
                </>
              ) : (
                <>
                  <Microphone size={18} weight="fill" style={{ verticalAlign: '-3px', marginRight: 6 }} />
                  Mic on
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </PublicLayoutV2>
  );
}
