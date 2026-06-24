import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LockFieldBackdrop } from '../components/LockFieldBackdrop';

type TrailPoint = {
  id: number;
  x: number;
  y: number;
};

function playBreachSound() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const now = ctx.currentTime;

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(920, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 1.45);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.22, now + 0.035);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
  filter.connect(master);
  master.connect(ctx.destination);

  [39, 66, 91, 144, 233, 377].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq, now + index * 0.025);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq * 0.34), now + 1.05);
    gain.gain.setValueAtTime(0.0001, now + index * 0.025);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.08 + index * 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.15 + index * 0.03);
    osc.connect(gain);
    gain.connect(filter);
    osc.start(now + index * 0.025);
    osc.stop(now + 1.35 + index * 0.03);
  });

  window.setTimeout(() => void ctx.close(), 1800);
}

function createMatrixRows(rows: number, columns: number) {
  const glyphs = '01ZX3000STUDIOSVIPACCESSDENIEDNULLROOT';
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, col) => glyphs[(row * 11 + col * 7) % glyphs.length]).join(''),
  );
}

function CursorTrail() {
  const [points, setPoints] = useState<TrailPoint[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    function addPoint(event: globalThis.PointerEvent) {
      const point = { id: nextId.current++, x: event.clientX, y: event.clientY };
      setPoints((current) => [...current.slice(-15), point]);
      window.setTimeout(() => {
        setPoints((current) => current.filter((item) => item.id !== point.id));
      }, 580);
    }

    window.addEventListener('pointermove', addPoint, { passive: true });
    return () => window.removeEventListener('pointermove', addPoint);
  }, []);

  return (
    <div className="cursorTrail" aria-hidden="true">
      {points.map((point, index) => (
        <span
          key={point.id}
          style={
            {
              '--trail-x': `${point.x}px`,
              '--trail-y': `${point.y}px`,
              '--trail-scale': 1 + index * 0.05,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ownerUsername } = useAuth();
  const [introVisible, setIntroVisible] = useState(() => localStorage.getItem('studio-vip-intro-seen') !== '1');
  const [decoyUser, setDecoyUser] = useState('');
  const [decoyPass, setDecoyPass] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(20);
  const [countdownActive, setCountdownActive] = useState(false);
  const [ownerUser, setOwnerUser] = useState(ownerUsername);
  const [ownerPass, setOwnerPass] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [lockdown, setLockdown] = useState(false);
  const [rickrollOpen, setRickrollOpen] = useState(false);
  const [ownerGateOpen, setOwnerGateOpen] = useState(false);
  const [jCount, setJCount] = useState(0);
  const decoyCompleted = useRef(false);
  const sealTaps = useRef(0);
  const tapReset = useRef<number | null>(null);
  const matrixRows = useMemo(() => createMatrixRows(34, 56), []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'j') return;

      setJCount((current) => {
        const next = current + 1;
        if (next >= 5) {
          setOwnerGateOpen(true);
          setOwnerError('');
          return 0;
        }
        return next;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (jCount === 0) return;
    const timer = window.setTimeout(() => setJCount(0), 2400);
    return () => window.clearTimeout(timer);
  }, [jCount]);

  useEffect(() => {
    if (!lockdown) return;
    const timer = window.setTimeout(() => setLockdown(false), 3400);
    return () => window.clearTimeout(timer);
  }, [lockdown]);

  useEffect(() => {
    if (!countdownActive || rickrollOpen) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (!decoyCompleted.current) {
            decoyCompleted.current = true;
            window.setTimeout(() => {
              triggerLockdown();
              setRickrollOpen(true);
            }, 0);
          }
          return 0;
        }

        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [countdownActive, rickrollOpen]);

  function skipIntro() {
    localStorage.setItem('studio-vip-intro-seen', '1');
    setIntroVisible(false);
  }

  function triggerLockdown() {
    setLockdown(true);
    playBreachSound();
  }

  function startDecoyCountdown() {
    if (!countdownActive) {
      setSecondsLeft(20);
      decoyCompleted.current = false;
      setCountdownActive(true);
    }
  }

  function handleDecoySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startDecoyCountdown();
    triggerLockdown();
    setRickrollOpen(true);
  }

  function handleOwnerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = login(ownerUser, ownerPass, secretAnswer);
    if (!ok) {
      setOwnerPass('');
      setSecretAnswer('');
      setOwnerError('Owner verification failed.');
      triggerLockdown();
      return;
    }

    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  }

  function handleSealTap() {
    sealTaps.current += 1;
    if (tapReset.current) window.clearTimeout(tapReset.current);
    tapReset.current = window.setTimeout(() => {
      sealTaps.current = 0;
    }, 2200);

    if (sealTaps.current >= 10) {
      sealTaps.current = 0;
      setOwnerGateOpen(true);
      setOwnerError('');
    }
  }

  function updateSpotlight(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--px', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    event.currentTarget.style.setProperty('--py', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }

  return (
    <main className={`vipConcept ${lockdown ? 'lockdown' : ''}`} onPointerMove={updateSpotlight}>
      <LockFieldBackdrop />
      <CursorTrail />
      <div className="vipGrid" aria-hidden="true" />
      <div className="vipNebula" aria-hidden="true" />

      {introVisible ? (
        <button className="vipIntro" type="button" onClick={skipIntro}>
          <span className="vipIntroMark">3K</span>
          <span>3000 Studios perimeter loading</span>
          <small>Tap anywhere to continue</small>
        </button>
      ) : null}

      <header className="vipHeader">
        <button className="vipBrand" type="button" onClick={handleSealTap} aria-label="Studio seal">
          <span className="vipBrandMark">3K</span>
          <span>3000 Studios VIP</span>
        </button>
        <nav className="vipNav" aria-label="Public links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <a
          className="vipSponsor"
          href="https://open.spotify.com/"
          target="_blank"
          rel="noreferrer"
          aria-label="Spotify sponsorship link"
        >
          <span className="spotifyMark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Spotify</span>
        </a>
        <button className="vipCircuitButton" type="button" onClick={handleSealTap} aria-label="Owner seal">
          <span />
        </button>
      </header>

      {lockdown ? (
        <div className="matrixOverlay" aria-hidden="true">
          <div className="skullRain">
            {Array.from({ length: 16 }, (_, index) => (
              <span key={index}>SKULL</span>
            ))}
          </div>
          {matrixRows.map((row, index) => (
            <div key={index}>{row}</div>
          ))}
          <strong>ACCESS DENIED</strong>
        </div>
      ) : null}

      <section className="vipHero" aria-label="3000 Studios VIP access">
        <div className="vipCopy">
          <h1>3000 Studios VIP</h1>
          <p>
            A private owner access interface wrapped in a public decoy gate. The visible terminal is
            not the real entrance.
          </p>

          <div className="vipSignals" aria-label="Access status">
            <div>
              <strong>{countdownActive ? secondsLeft : 20}s</strong>
              <span>decoy timer</span>
            </div>
            <div>
              <strong>{jCount}/5</strong>
              <span>silent key sequence</span>
            </div>
            <div>
              <strong>{isAuthenticated ? 'open' : 'sealed'}</strong>
              <span>owner vault</span>
            </div>
          </div>
        </div>

        <form className="vipDecoyPanel" onSubmit={handleDecoySubmit}>
          <div className="vipPanelHead">
            <span className="vipSiren">!</span>
            <div>
              <h2>Public login</h2>
              <p>This entrance always fails.</p>
            </div>
          </div>

          <label className="vipField">
            <span>Display name</span>
            <input
              autoComplete="off"
              value={decoyUser}
              placeholder="Type anything"
              onChange={(event) => {
                setDecoyUser(event.target.value);
                if (event.target.value) startDecoyCountdown();
              }}
            />
          </label>
          <label className="vipField">
            <span>Access code</span>
            <input
              autoComplete="off"
              value={decoyPass}
              placeholder="This door is fake"
              type="password"
              onChange={(event) => {
                setDecoyPass(event.target.value);
                if (event.target.value) startDecoyCountdown();
              }}
            />
          </label>

          <div className="vipCountdown" role="status" aria-live="polite">
            <strong>{countdownActive ? `${secondsLeft}s` : '20s'}</strong>
            <span>You have less than 20 seconds to input the correct code, or you get Rick Astley.</span>
          </div>

          <button className="vipPrimary" type="submit">
            Attempt entry
          </button>
        </form>
      </section>

      <footer className="vipFooter">
        <button type="button" onClick={handleSealTap}>
          Copyright 3000 Studios
        </button>
        <span>Public login is intentionally non-functional.</span>
      </footer>

      {ownerGateOpen ? (
        <section className="vipModalScrim" aria-label="Owner login" role="dialog" aria-modal="true">
          <form className="vipOwnerModal" onSubmit={handleOwnerSubmit}>
            <button
              className="vipClose"
              type="button"
              onClick={() => setOwnerGateOpen(false)}
              aria-label="Close owner login"
            >
              x
            </button>
            <div className="vipPanelHead">
              <span className="vipSiren secure">3K</span>
              <div>
                <h2>Owner gateway</h2>
                <p>Enter the protected owner credentials to open the dashboard.</p>
              </div>
            </div>
            <label className="vipField">
              <span>Owner email</span>
              <input autoComplete="username" value={ownerUser} onChange={(event) => setOwnerUser(event.target.value)} />
            </label>
            <label className="vipField">
              <span>Passcode</span>
              <input
                autoComplete="current-password"
                type="password"
                value={ownerPass}
                onChange={(event) => setOwnerPass(event.target.value)}
              />
            </label>
            <label className="vipField">
              <span>Secret answer</span>
              <input
                autoComplete="off"
                type="password"
                value={secretAnswer}
                onChange={(event) => setSecretAnswer(event.target.value)}
              />
            </label>
            {ownerError ? <p className="vipError">{ownerError}</p> : null}
            <button className="vipPrimary" type="submit">
              Open dashboard
            </button>
          </form>
        </section>
      ) : null}

      {rickrollOpen ? (
        <section className="vipModalScrim" aria-label="Decoy result" role="dialog" aria-modal="true">
          <div className="vipRickroll">
            <button
              className="vipClose"
              type="button"
              onClick={() => setRickrollOpen(false)}
              aria-label="Close decoy result"
            >
              x
            </button>
            <h2>Wrong entrance.</h2>
            <p>The public screen never unlocks 3000 Studios VIP.</p>
            <iframe
              title="Rick Astley result"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&playsinline=1"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      ) : null}
    </main>
  );
}
