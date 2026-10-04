import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChartBar,
  CurrencyDollar,
  Trash,
  ArrowLeft,
} from '@phosphor-icons/react';
import { PublicLayout } from './Home';
import { publishedSongs } from '../data/publishedSongs';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS } from '../data/videoCatalog';
import { THUNDER_BOSSES } from '../data/thunderDome';
import {
  clearUnlocks,
  isLivePayments,
  readUnlocks,
  readUnlockSettings,
  writeUnlockSettings,
} from '../lib/unlockPayments';

/* ============================================================================
   COMMAND DECK — owner dashboard.
   ----------------------------------------------------------------------------
   SECURITY NOTE: the PIN gate below is CLIENT-SIDE OBSCURITY ONLY, not real
   security. The PIN value is visible in the shipped JavaScript bundle to
   anyone who opens devtools. It keeps casual visitors out of the dashboard
   UI, nothing more. Real admin protection requires server-side auth
   (Cloudflare Access, Firebase Auth custom claims, or similar) before this
   page ever guards anything sensitive.
   ========================================================================== */

// Client-side gate only — see SECURITY NOTE above.
const DECK_PIN = '5555';
const SESSION_KEY = 'nn-command-deck';

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [digits, setDigits] = useState('');
  const [error, setError] = useState(false);

  const press = (d: string) => {
    if (digits.length >= 4) return;
    const next = digits + d;
    setDigits(next);
    if (next.length === 4) {
      if (next === DECK_PIN) {
        sessionStorage.setItem(SESSION_KEY, '1');
        onUnlock();
      } else {
        setError(true);
        window.setTimeout(() => {
          setDigits('');
          setError(false);
        }, 600);
      }
    }
  };

  const back = () => setDigits((d) => d.slice(0, -1));

  return (
    <div className="nn-pin-wrap">
      <span className="nn-kicker nn-kicker--gold">
        <ShieldCheck size={14} style={{ verticalAlign: '-2px' }} /> Restricted
      </span>
      <h1 className="nn-chrome" style={{ fontSize: 'clamp(30px, 6vw, 56px)', marginTop: 14 }}>
        COMMAND DECK
      </h1>
      <p style={{ color: 'var(--nn-muted)' }}>Enter the owner PIN to continue.</p>
      <div className="nn-pin-dots" aria-label="PIN entry">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`nn-pin-dot${digits.length > i ? ' is-filled' : ''}`} />
        ))}
      </div>
      <div className="nn-pin-pad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className="nn-pin-key" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button type="button" className="nn-pin-key" onClick={back} aria-label="Backspace">
          ⌫
        </button>
        <button type="button" className="nn-pin-key" onClick={() => press('0')}>
          0
        </button>
        <button type="button" className="nn-pin-key" onClick={() => setDigits('')} aria-label="Clear">
          ✕
        </button>
      </div>
      <div className="nn-pin-error">{error ? 'Wrong PIN — try again.' : ''}</div>
    </div>
  );
}

function Dashboard() {
  const [demoMode, setDemoMode] = useState(() => readUnlockSettings().demoMode);
  const [unlockCount, setUnlockCount] = useState(() => readUnlocks().length);

  useEffect(() => {
    const id = window.setInterval(() => setUnlockCount(readUnlocks().length), 1000);
    return () => window.clearInterval(id);
  }, []);

  const toggleDemo = () => {
    const next = !demoMode;
    setDemoMode(next);
    writeUnlockSettings({ demoMode: next });
  };

  const stats = [
    { num: String(publishedSongs.length), label: 'Catalog tracks' },
    { num: String(MUSIC_VIDEOS.length), label: 'Music videos' },
    { num: String(CINEMATIC_VIDEOS.length), label: 'Game cinematics' },
    { num: String(THUNDER_BOSSES.length), label: 'Thunderdome bosses' },
    { num: String(unlockCount), label: 'Unlocks granted (this device)' },
  ];

  return (
    <div>
      <div className="nn-sec-head">
        <div>
          <span className="nn-kicker nn-kicker--gold">Owner only</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(30px, 6vw, 56px)', marginTop: 10 }}>
            COMMAND DECK
          </h1>
        </div>
        <Link className="nn-btn nn-btn-ghost" to="/">
          <ArrowLeft size={16} /> Back to site
        </Link>
      </div>

      <div className="nn-sec-head" style={{ marginTop: 8 }}>
        <div>
          <h2 className="nn-chrome-gold" style={{ fontSize: 22 }}>
            <ChartBar size={20} style={{ verticalAlign: '-3px' }} /> Content manifest
          </h2>
        </div>
      </div>
      <div className="nn-admin-grid" style={{ marginBottom: 36 }}>
        {stats.map((s) => (
          <div key={s.label} className="nn-glass nn-stat-card">
            <div className="nn-num">{s.num}</div>
            <div className="nn-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="nn-glass" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 6px', color: '#fff', fontSize: 20 }}>
          <CurrencyDollar size={20} style={{ verticalAlign: '-3px', color: 'var(--nn-gold)' }} /> $1
          unlock payments
        </h2>
        <p style={{ color: 'var(--nn-muted)', fontSize: 14, margin: '0 0 16px' }}>
          {demoMode
            ? 'DEMO MODE is on — checkouts are simulated and no card is charged.'
            : isLivePayments()
              ? 'LIVE MODE — Stripe Payment Link is configured and taking real $1 charges.'
              : 'Live requested but no payment link is configured — checkouts fall back to demo.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <button
            type="button"
            role="switch"
            aria-checked={demoMode}
            aria-label="Demo mode"
            className={`nn-toggle${demoMode ? ' is-on' : ''}`}
            onClick={toggleDemo}
          />
          <strong style={{ color: demoMode ? 'var(--nn-gold)' : 'var(--nn-cyan)' }}>
            {demoMode ? 'Demo mode ON' : 'Demo mode OFF'}
          </strong>
        </div>
        <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '14px 0 0' }}>
          Real charges stay blocked until Stripe identity/tax verification is
          complete and a $1 payment link is set. See the build log for the
          exact flip steps.
        </p>
      </div>

      <div className="nn-glass" style={{ padding: 24 }}>
        <h2 style={{ margin: '0 0 12px', color: '#fff', fontSize: 20 }}>Unlocks</h2>
        <p style={{ color: 'var(--nn-muted)', fontSize: 14 }}>
          {unlockCount} unlock{unlockCount === 1 ? '' : 's'} granted on this device.
        </p>
        <button type="button" className="nn-btn nn-btn-ghost" onClick={() => { clearUnlocks(); setUnlockCount(0); }}>
          <Trash size={16} /> Reset all unlocks
        </button>
      </div>
    </div>
  );
}

export function CommandDeckPage() {
  const [open, setOpen] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1',
  );

  return (
    <PublicLayout variant="blackhole" compact>
      <div className="nn-scope">
        <section className="nn-wrap" style={{ paddingTop: 56 }}>
          {open ? <Dashboard /> : <PinGate onUnlock={() => setOpen(true)} />}
        </section>
      </div>
    </PublicLayout>
  );
}
