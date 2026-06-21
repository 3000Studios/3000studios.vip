import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { LockFieldBackdrop } from '../components/LockFieldBackdrop';

type TrailPoint = {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
};

function playBreachSound() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  const distortion = ctx.createWaveShaper();
  const now = ctx.currentTime;

  distortion.curve = Float32Array.from({ length: 768 }, (_, i) => {
    const x = (i * 2) / 767 - 1;
    return Math.tanh(x * 11);
  });
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(920, now);
  filter.frequency.exponentialRampToValueAtTime(120, now + 1.45);
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.24, now + 0.035);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

  distortion.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);

  [39, 66, 91, 144, 233, 377, 611].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 3 === 0 ? 'square' : index % 2 === 0 ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.025);
    osc.frequency.exponentialRampToValueAtTime(Math.max(24, freq * 0.36), now + 1.1);
    gain.gain.setValueAtTime(0.0001, now + index * 0.025);
    gain.gain.exponentialRampToValueAtTime(0.18 / Math.max(1, index * 0.5), now + 0.07 + index * 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.22 + index * 0.03);
    osc.connect(gain);
    gain.connect(distortion);
    osc.start(now + index * 0.025);
    osc.stop(now + 1.45 + index * 0.03);
  });

  window.setTimeout(() => void ctx.close(), 1900);
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
    let cleanupTimer = 0;

    function addPoint(event: globalThis.PointerEvent) {
      const id = nextId.current++;
      setPoints((current) => [
        ...current.slice(-17),
        {
          id,
          x: event.clientX,
          y: event.clientY,
          size: 10 + ((id * 7) % 20),
          hue: (id * 29) % 360,
        },
      ]);
      window.clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(() => setPoints([]), 700);
    }

    window.addEventListener('pointermove', addPoint, { passive: true });
    return () => {
      window.removeEventListener('pointermove', addPoint);
      window.clearTimeout(cleanupTimer);
    };
  }, []);

  return (
    <div className="cursorTrail" aria-hidden="true">
      {points.map((point, index) => (
        <span
          key={point.id}
          style={{
            '--trail-x': `${point.x}px`,
            '--trail-y': `${point.y}px`,
            '--trail-size': `${point.size}px`,
            '--trail-hue': `${point.hue}`,
            '--trail-age': `${index}`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ownerUsername } = useAuth();
  const [decoyUser, setDecoyUser] = useState('');
  const [decoyPass, setDecoyPass] = useState('');
  const [ownerUser, setOwnerUser] = useState(ownerUsername);
  const [ownerPass, setOwnerPass] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [error, setError] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [lockdown, setLockdown] = useState(false);
  const [ownerGateOpen, setOwnerGateOpen] = useState(false);
  const sealTaps = useRef(0);
  const tapReset = useRef<number | null>(null);
  const matrixRows = useMemo(() => createMatrixRows(36, 54), []);

  useEffect(() => {
    if (!lockdown) return;
    const timer = window.setTimeout(() => setLockdown(false), 3400);
    return () => window.clearTimeout(timer);
  }, [lockdown]);

  function triggerLockdown(message: string) {
    setError(message);
    setOwnerError('');
    setLockdown(true);
    playBreachSound();
  }

  function handleDecoySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDecoyUser('');
    setDecoyPass('');
    triggerLockdown('ACCESS DENIED. Public credential surface is a monitored decoy.');
  }

  function handleOwnerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = login(ownerUser, ownerPass, secretAnswer);
    if (!ok) {
      setOwnerPass('');
      setSecretAnswer('');
      setOwnerError('Owner verification failed.');
      triggerLockdown('OWNER CHECK FAILED. Matrix countermeasure active.');
      return;
    }

    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  }

  function handleSealTap() {
    sealTaps.current += 1;
    if (tapReset.current) {
      window.clearTimeout(tapReset.current);
    }
    tapReset.current = window.setTimeout(() => {
      sealTaps.current = 0;
    }, 2200);

    if (sealTaps.current >= 10) {
      sealTaps.current = 0;
      setOwnerGateOpen(true);
      setError('');
      setOwnerError('');
    }
  }

  function updateSpotlight(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--px', `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
    event.currentTarget.style.setProperty('--py', `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
  }

  return (
    <div className={`landing lockLanding ${lockdown ? 'lockdown' : ''}`} onPointerMove={updateSpotlight}>
      <section className="lockStage">
        <LockFieldBackdrop />
        <CursorTrail />
        <div className="lockAurora" />
        <div className="lockNoise" />
        <div className="lockTicker" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
        {lockdown ? (
          <div className="matrixOverlay" aria-hidden="true">
            <div className="skullRain">
              {Array.from({ length: 16 }, (_, index) => (
                <span key={index}>☠</span>
              ))}
            </div>
            {matrixRows.map((row, index) => (
              <div key={index}>{row}</div>
            ))}
            <strong>ACCESS DENIED</strong>
          </div>
        ) : null}
        <motion.div
          className="lockShell"
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="lockHalo" />
          <div className="lockCore">
            <div className="lockRing lockRingOuter" />
            <div className="lockRing lockRingMid" />
            <div className="lockRing lockRingInner" />
            <div className="lockBody">
              <div className="lockBrandOrb">
                <span>3K</span>
              </div>
              <div className="lockPanel">
                <div className="eyebrow">Synthetic Public Gate</div>
                <h1>3000 Studios</h1>
                <p className="lead lockLead">
                  This screen is a decoy terminal. Owner access is hidden behind the studio seal.
                </p>
                <form className="lockForm" onSubmit={handleDecoySubmit}>
                  <label className="field">
                    <span>Username</span>
                    <input
                      className="input"
                      autoComplete="off"
                      value={decoyUser}
                      onChange={(event) => setDecoyUser(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Access Code</span>
                    <input
                      className="input"
                      autoComplete="off"
                      type="password"
                      value={decoyPass}
                      onChange={(event) => setDecoyPass(event.target.value)}
                    />
                  </label>
                  <button className="btn primary wide" type="submit">
                    Enter System
                  </button>
                  <div className="passcodePulse">Decoy channel armed</div>
                  {error ? <div className="errorBox inline">{error}</div> : null}
                </form>
                {isAuthenticated ? (
                  <button className="btn" onClick={() => navigate('/vault')} type="button">
                    Open Vault
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>

        {ownerGateOpen ? (
          <div className="ownerModalBackdrop" role="presentation">
            <motion.form
              className="ownerModal"
              onSubmit={handleOwnerSubmit}
              initial={{ opacity: 0, y: 20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.28 }}
              aria-label="Owner entry"
            >
              <button className="ownerClose" type="button" onClick={() => setOwnerGateOpen(false)} aria-label="Close owner entry">
                x
              </button>
              <span className="eyebrow">Owner Entry</span>
              <h2>Vault challenge</h2>
              <label className="field">
                <span>Owner Username</span>
                <input
                  className="input"
                  autoComplete="username"
                  value={ownerUser}
                  onChange={(event) => setOwnerUser(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Password / Code</span>
                <input
                  className="input"
                  autoComplete="current-password"
                  type="password"
                  value={ownerPass}
                  onChange={(event) => setOwnerPass(event.target.value)}
                />
              </label>
              <label className="field">
                <span>Secret Question</span>
                <input
                  className="input"
                  autoComplete="off"
                  value={secretAnswer}
                  onChange={(event) => setSecretAnswer(event.target.value)}
                  placeholder="Answer"
                />
              </label>
              {ownerError ? <div className="errorBox inline">{ownerError}</div> : null}
              <button className="btn primary wide" type="submit">
                Unlock Real Vault
              </button>
            </motion.form>
          </div>
        ) : null}

        <footer className="lockFooter">
          <div className="lockFooterCopy">
            <span
              className="lockSeal"
              role="button"
              tabIndex={0}
              aria-label="Studio seal"
              onClick={handleSealTap}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSealTap();
                }
              }}
            >
              ©
            </span>{' '}
            {new Date().getFullYear()} 3000 Studios. All rights reserved.
          </div>
        </footer>
      </section>
    </div>
  );
}
