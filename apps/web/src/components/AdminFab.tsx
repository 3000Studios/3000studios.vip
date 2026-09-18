import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function AdminFab() {
  const { login } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/vault')) {
    return null;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const ok = await login(email, code, secret);
    setBusy(false);
    if (ok) {
      setOpen(false);
      setCode('');
      setSecret('');
      navigate('/admin');
      return;
    }
    setError('Incorrect owner credentials');
    setCode('');
  }

  return (
    <>
      <button
        type="button"
        className="adminFab"
        aria-label="Open owner admin"
        title="Owner admin"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <span className="adminFabIcon" aria-hidden="true">
          ⚙
        </span>
        <span className="adminFabLabel">Admin</span>
      </button>

      {open
        ? createPortal(
            <div
              className="adminScrim"
              role="dialog"
              aria-modal="true"
              aria-label="Owner admin access"
              onClick={() => setOpen(false)}
            >
              <form
                className="adminCodeModal"
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="modalClose"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
                <span>3000 Studios · Owner</span>
                <h2>Admin Access</h2>
                <p>Enter owner credentials to open the stream setup console.</p>
                <label>
                  Email
                  <input
                    type="email"
                    autoComplete="username"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@example.com"
                  />
                </label>
                <label>
                  Passcode
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="current-password"
                    value={code}
                    maxLength={32}
                    placeholder="••••"
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>
                <label>
                  Secret answer
                  <input
                    type="password"
                    autoComplete="off"
                    value={secret}
                    maxLength={120}
                    placeholder="••••"
                    onChange={(e) => setSecret(e.target.value)}
                  />
                </label>
                {error ? <div className="adminCodeError">{error}</div> : null}
                <button type="submit" className="adminUnlockBtn" disabled={busy}>
                  {busy ? 'Unlocking…' : 'Unlock Admin'}
                </button>
              </form>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
