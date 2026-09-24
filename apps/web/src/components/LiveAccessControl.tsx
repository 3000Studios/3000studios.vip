import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';

type AccessState = {
  protected: boolean;
  rememberViewer: boolean;
  updatedAt: string;
};

export function LiveAccessControl() {
  const { token } = useAuth();
  const [state, setState] = useState<AccessState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');

  const refresh = useCallback(async () => {
    const response = await fetch('/api/live-access', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load live access state.');
    const data = (await response.json()) as AccessState;
    setState(data);
  }, []);

  useEffect(() => {
    // State is populated asynchronously from the durable edge setting.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh().catch(() => setMessage('Live access controls are temporarily unavailable.'));
  }, [refresh]);

  async function update(changes: Record<string, unknown>, success: string) {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/live-access', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: JSON.stringify(changes),
      });
      const data = (await response.json()) as AccessState & { error?: string };
      if (!response.ok) throw new Error(data.error || 'Update failed');
      setState(data);
      setMessage(success);
    } catch {
      setMessage('The setting could not be saved. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function changeCode(event: React.FormEvent) {
    event.preventDefault();
    if (newCode.length < 4 || newCode.length > 64) {
      setMessage('Use an access code between 4 and 64 characters.');
      return;
    }
    if (newCode !== confirmCode) {
      setMessage('The two access code entries do not match.');
      return;
    }
    await update({ code: newCode }, 'Access code changed. Existing viewer sessions were locked.');
    setNewCode('');
    setConfirmCode('');
  }

  const isProtected = state?.protected ?? true;

  return (
    <section className="cPanel liveAccessPanel" aria-labelledby="live-access-title">
      <div className="cPanelHead liveAccessHead">
        <div>
          <span className="adminEyebrow">LIVE STREAM ACCESS</span>
          <h2 id="live-access-title">Viewer access</h2>
        </div>
        <strong className={`liveAccessStatus ${isProtected ? 'protected' : 'public'}`}>
          {isProtected ? 'PASSWORD PROTECTED' : 'PUBLIC'}
        </strong>
      </div>
      <div className="cPanelBody liveAccessBody">
        <div className="liveAccessPrimary">
          <div>
            <h3>Password Protection</h3>
            <p className="cMuted">
              Changes apply while the stream is running. The broadcast itself is not restarted.
            </p>
          </div>
          <button
            type="button"
            className={`liveAccessToggle ${isProtected ? 'on' : 'off'}`}
            role="switch"
            aria-checked={isProtected}
            disabled={busy || !state}
            onClick={() =>
              void update(
                { protected: !isProtected },
                !isProtected
                  ? 'Password protection is ON. Existing viewer sessions were locked.'
                  : 'The live stream is now PUBLIC.',
              )
            }
          >
            <span aria-hidden="true" /> {isProtected ? 'ON' : 'OFF'}
          </button>
        </div>

        <label className="liveAccessRemember">
          <input
            type="checkbox"
            checked={state?.rememberViewer ?? false}
            disabled={busy || !state}
            onChange={(event) =>
              void update(
                { rememberViewer: event.target.checked },
                event.target.checked
                  ? 'Authorized viewers can now be remembered for 30 days.'
                  : 'Viewer access will now end when the browser session ends.',
              )
            }
          />
          <span>
            <strong>Remember Authorized Viewer</strong>
            <small>Keep an authorized viewer signed in for up to 30 days on that device.</small>
          </span>
        </label>

        <div className="liveAccessActions">
          <button
            type="button"
            className="cBtn liveAccessLock"
            disabled={busy || !state || !isProtected}
            onClick={() =>
              void update(
                { revoke: true },
                'Stream locked. All existing viewer sessions are invalid.',
              )
            }
          >
            Lock Stream Now
          </button>
          <span className="cMuted">Available while password protection is ON.</span>
        </div>

        <details className="liveAccessCode">
          <summary>Change Access Code</summary>
          <form onSubmit={changeCode}>
            <label>
              <span>New code</span>
              <input
                type="password"
                value={newCode}
                onChange={(event) => setNewCode(event.target.value)}
                minLength={4}
                maxLength={64}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              <span>Confirm new code</span>
              <input
                type="password"
                value={confirmCode}
                onChange={(event) => setConfirmCode(event.target.value)}
                minLength={4}
                maxLength={64}
                autoComplete="new-password"
                required
              />
            </label>
            <button className="cBtn primary" type="submit" disabled={busy}>
              Save New Access Code
            </button>
          </form>
        </details>
        {message ? (
          <p className="liveAccessMessage" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
