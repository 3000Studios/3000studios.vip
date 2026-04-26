import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

const challengePrompts = [
  'Security calibration phrase',
  'Vault resonance code',
  'Citadel challenge response',
  'Owner override sequence',
  'Night access verification',
];

export function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, ownerEmail } = useAuth();
  const [email] = useState(ownerEmail);
  const [passcode, setPasscode] = useState('');
  const [decoyUser, setDecoyUser] = useState('');
  const [decoyPass, setDecoyPass] = useState('');
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengePrompt, setChallengePrompt] = useState(challengePrompts[0]);
  const [error, setError] = useState('');
  const [lockdown, setLockdown] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [realLoginReady, setRealLoginReady] = useState(false);
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

  function triggerLockdown(message: string) {
    setError(message);
    setLockdown(true);
  }

  function handleDecoySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDecoyUser('');
    setDecoyPass('');
    triggerLockdown('Decoy access rejected. Use the hidden owner entry to reach the real vault.');
  }

  function handleChallengeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const ok = challengeAnswer.trim() === '5555';
    if (!ok) {
      triggerLockdown('Challenge failed. Private access remains sealed.');
      return;
    }
    setChallengeAnswer('');
    setShowChallenge(false);
    setRealLoginReady(true);
    setError('');
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = login(email, passcode);
    if (!ok) {
      triggerLockdown('Access denied. This private system is monitored and requires approved credentials.');
      return;
    }
    const next = (location.state as { next?: string } | null)?.next ?? '/vault';
    navigate(next);
  };

  function openChallenge() {
    const nextPrompt = challengePrompts[Math.floor(Math.random() * challengePrompts.length)];
    setChallengePrompt(nextPrompt);
    setChallengeAnswer('');
    setShowChallenge(true);
    setError('');
  }

  return (
    <div className={`landing lockLanding ${lockdown ? 'lockdown' : ''}`}>
      <section className="lockStage">
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
                <h1>3000 Studios Master Lock</h1>
                <p className="lead lockLead">
                  Owner-only webmaster hub. The public face is a sealed lock. The real control
                  plane stays behind the hidden owner path and approved credentials.
                </p>
                <form className="lockForm" onSubmit={handleDecoySubmit}>
                  <label className="field">
                    <span>User Name</span>
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
                    Attempt Access
                  </button>
                  <button className="btn ghost wide" onClick={openChallenge} type="button">
                    Owner Entry
                  </button>
                  <div className="passcodePulse">
                    Animated lock engaged • public fields are decoy-only
                  </div>
                  {error ? <div className="errorBox inline">{error}</div> : null}
                </form>
                {showChallenge ? (
                  <form className="lockForm realGate" onSubmit={handleChallengeSubmit}>
                    <div className="gateHeader">Hidden Access Question</div>
                    <label className="field">
                      <span>{challengePrompt}</span>
                      <input
                        className="input"
                        autoFocus
                        value={challengeAnswer}
                        onChange={(event) => setChallengeAnswer(event.target.value)}
                        placeholder="Enter response"
                      />
                    </label>
                    <button className="btn primary wide" type="submit">
                      Validate Owner Trigger
                    </button>
                  </form>
                ) : null}
                {realLoginReady ? (
                  <form className="lockForm realGate" onSubmit={handleSubmit}>
                    <div className="gateHeader">Real Login</div>
                    <label className="field">
                      <span>Email</span>
                      <input className="input" autoComplete="username" readOnly value={email} />
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
                    <button className="btn primary wide" type="submit">
                      Unlock Vault
                    </button>
                    <div className="passcodePulse">
                      Familiar device lock engaged • passcode length {deferredPasscode.length}
                    </div>
                  </form>
                ) : null}
                <div className="lockMeta">
                  <span>Private monitored system • owner mailbox: {ownerEmail}</span>
                  <span>Cloudflare Access remains the required production edge gate.</span>
                  <span>The hidden control dot sits at the bottom center.</span>
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
        <button
          aria-label="Owner entry trigger"
          className="ownerDot"
          onClick={openChallenge}
          type="button"
        >
          ☻
        </button>
      </section>
    </div>
  );
}
