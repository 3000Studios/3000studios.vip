import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ownerEmail } = useAuth();
  const [email, setEmail] = useState(ownerEmail);
  const [passcode, setPasscode] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [error, setError] = useState('');
  const [lockdown, setLockdown] = useState(false);
  const deferredPasscode = useDeferredValue(passcode);
  const matrixRows = useMemo(
    () =>
      Array.from({ length: 24 }, (_, row) =>
        Array.from({ length: 42 }, (_, col) => ((row * 7 + col * 13) % 2 === 0 ? '1' : '0')).join(' '),
      ),
    [],
  );

  useEffect(() => {
    if (!lockdown) return;
    const timer = window.setTimeout(() => setLockdown(false), 2600);
    return () => window.clearTimeout(timer);
  }, [lockdown]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(email, passcode, secretAnswer);
    if (!ok) {
      setError('Access denied. This private system is monitored and requires approved credentials.');
      setLockdown(true);
      return;
    }

    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  };

  return (
    <div className={`landing lockLanding ${lockdown ? 'lockdown' : ''}`}>
      <section className="lockStage">
        <div className="lockAurora" />
        <div className="lockNoise" />
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
                <h1>3000 Studios Master Lock</h1>
                <p className="lead lockLead">
                  Owner-only webmaster hub. Activity is reviewed for access control, and the vault
                  requires approved credentials and trusted protections.
                </p>
                <form className="lockForm" onSubmit={handleSubmit}>
                  <label className="field">
                    <span>Email</span>
                    <input
                      className="input"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Passcode</span>
                    <input
                      className="input"
                      autoComplete="current-password"
                      type="password"
                      value={passcode}
                      onChange={(event) => setPasscode(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Secret Question: First Dog</span>
                    <input
                      className="input"
                      value={secretAnswer}
                      onChange={(event) => setSecretAnswer(event.target.value)}
                      placeholder="Answer required"
                    />
                  </label>
                  <button className="btn primary wide" type="submit">
                    Unlock Vault
                  </button>
                  <div className="passcodePulse">
                    Familiar device lock engaged • passcode length {deferredPasscode.length}
                  </div>
                  {error ? <div className="errorBox inline">{error}</div> : null}
                </form>
                <div className="lockMeta">
                  <span>Email 2FA target: {ownerEmail}</span>
                  <span>SMS target: +1 404 640 7734</span>
                  <span>Edge hardening recommended through Cloudflare Access.</span>
                </div>
                {isAuthenticated ? (
                  <button className="btn" onClick={() => navigate('/vault')} type="button">
                    Open Vault
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
