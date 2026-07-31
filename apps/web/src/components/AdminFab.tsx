import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AUTH_KEY = '3000-admin-auth-v1';
const PASSCODE = '3000';

export function AdminFab() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/vault')) {
    return null;
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (code.trim() === PASSCODE) {
      sessionStorage.setItem(AUTH_KEY, '1');
      setOpen(false);
      setCode('');
      setError(null);
      navigate('/admin');
      return;
    }
    setError('Incorrect passcode');
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
        <span className="adminFabIcon">⚙</span>
        <span className="adminFabLabel">Admin</span>
      </button>

      {open ? (
        <div className="adminScrim" role="dialog" aria-modal="true" aria-label="Admin passcode">
          <form className="adminCodeModal" onSubmit={submit}>
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
            <p>Enter passcode to open the stream setup console.</p>
            <label>
              Passcode
              <input
                type="password"
                inputMode="numeric"
                autoFocus
                autoComplete="current-password"
                value={code}
                maxLength={12}
                placeholder="••••"
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(null);
                }}
              />
            </label>
            {error ? <div className="adminCodeError">{error}</div> : null}
            <button type="submit" className="adminUnlockBtn">
              Unlock Admin
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
