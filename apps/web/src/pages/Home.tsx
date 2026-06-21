import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { LockFieldBackdrop } from '../components/LockFieldBackdrop';

function playBreachSound() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  const distortion = ctx.createWaveShaper();
  const now = ctx.currentTime;

  distortion.curve = Float32Array.from({ length: 512 }, (_, i) => {
    const x = (i * 2) / 511 - 1;
    return Math.tanh(x * 7);
  });

  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.2, now + 0.04);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
  distortion.connect(master);
  master.connect(ctx.destination);

  [72, 111, 159, 233, 377].forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(freq, now + index * 0.035);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.52, now + 0.75);
    gain.gain.setValueAtTime(0.0001, now + index * 0.035);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.05 + index * 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.92 + index * 0.04);
    osc.connect(gain);
    gain.connect(distortion);
    osc.start(now + index * 0.035);
    osc.stop(now + 1.05 + index * 0.04);
  });

  window.setTimeout(() => void ctx.close(), 1600);
}

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enterOwnerGate, isAuthenticated } = useAuth();
  const [decoyUser, setDecoyUser] = useState('');
  const [decoyPass, setDecoyPass] = useState('');
  const [error, setError] = useState('');
  const [lockdown, setLockdown] = useState(false);
  const lastSealTap = useRef(0);
  const matrixRows = useMemo(
    () =>
      Array.from({ length: 34 }, (_, row) =>
        Array.from({ length: 58 }, (_, col) =>
          ['0', '1', 'A', 'X', '7', '#'][(row * 7 + col * 13) % 6],
        ).join(' '),
      ),
    [],
  );

  useEffect(() => {
    if (!lockdown) return;
    const timer = window.setTimeout(() => setLockdown(false), 2600);
    return () => window.clearTimeout(timer);
  }, [lockdown]);

  function triggerLockdown(message: string) {
    setError(message);
    setLockdown(true);
    playBreachSound();
  }

  function handleDecoySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDecoyUser('');
    setDecoyPass('');
    triggerLockdown('Trace denied. Public credential surface is a monitored decoy.');
  }

  function handleSealTap() {
    const now = window.performance.now();
    if (now - lastSealTap.current < 700) {
      return;
    }
    lastSealTap.current = now;
    enterOwnerGate();
    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  }

  return (
    <div className={`landing lockLanding ${lockdown ? 'lockdown' : ''}`}>
      <section className="lockStage">
        <LockFieldBackdrop />
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
            {matrixRows.map((row, index) => (
              <div key={index}>{row}</div>
            ))}
          </div>
        ) : null}
        <motion.div
          className="lockShell"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="lockHalo" />
          <div className="lockCore">
            <div className="lockRing lockRingOuter" />
            <div className="lockRing lockRingMid" />
            <div className="lockRing lockRingInner" />
            <div className="lockBody">
              <div className="lockShackle" />
              <div className="lockPanel">
                <div className="eyebrow">Private System</div>
                <h1>3000 Studios</h1>
                <p className="lead lockLead">
                  Owner-only command gate. This surface is sealed for the public internet.
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
                    <span>Passcode</span>
                    <input
                      className="input"
                      autoComplete="off"
                      type="password"
                      value={decoyPass}
                      onChange={(event) => setDecoyPass(event.target.value)}
                    />
                  </label>
                  <button className="btn primary wide" type="submit">
                    Login
                  </button>
                  <div className="passcodePulse">
                    Encrypted session required
                  </div>
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
