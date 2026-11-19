import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { GameController, Play, YoutubeLogo } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import { THUNDER_BOSSES, type ThunderBoss } from '../data/thunderDome';
import { CINEMATIC_CDN } from '../data/videoCatalog';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';

/**
 * /aeropocalypse — Aeropocalypse: Online.
 * Canonical game page per the redesign mockup (section 1). The legacy
 * /thunder-dome route keeps serving ThunderDomePage untouched.
 *
 * Copy is transcribed from the mockup only. Boss identity (level, codename,
 * name, threat class) comes from the existing THUNDER_BOSSES dataset, which
 * matches the mockup's 24-name roster exactly. The mockup's stat deck says
 * "25 BOSS ENCOUNTERS" while the roster names 24 bosses — both numbers are
 * reproduced as written; see NOTES.md open question 2.
 */

type ThreatClass = 'ALPHA' | 'OMEGA' | 'TITAN' | 'NEXUS';
type BossFilter = 'ALL' | ThreatClass;

const FILTERS: BossFilter[] = ['ALL', 'ALPHA', 'OMEGA', 'TITAN', 'NEXUS'];

const THREAT_COLORS: Record<ThreatClass, string> = {
  ALPHA: '#00f0ff',
  OMEGA: '#ffd700',
  TITAN: '#a855f7',
  NEXUS: '#ff3366',
};

/** Play destination already used by ThunderDomePage. */
const PLAY_STORE_URL =
  'https://play.google.com/store/search?q=Thunderdome%20AeroStrike&c=apps';

const STATS: Array<{ value: string; label: string }> = [
  { value: '25', label: 'Stages' },
  { value: '25', label: 'Boss Encounters' },
  { value: '15', label: 'Jets' },
  { value: '19', label: 'Weapons' },
  { value: '32', label: 'Paint Schemes' },
  { value: '30', label: 'Soundtrack Tracks' },
];

function JetMark() {
  return (
    <svg
      className="gv-jet"
      viewBox="0 0 400 160"
      role="img"
      aria-label="Aeropocalypse interceptor jet, top view"
    >
      <defs>
        <linearGradient id="gv-jet-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6dd8a" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a6d1c" />
        </linearGradient>
      </defs>
      {/* fuselage */}
      <path d="M196 4 L212 62 L206 150 L200 156 L194 150 L188 62 Z" fill="url(#gv-jet-gold)" />
      {/* swept wings */}
      <path d="M192 58 L40 138 L52 148 L190 92 Z" fill="url(#gv-jet-gold)" opacity="0.92" />
      <path d="M208 58 L360 138 L348 148 L210 92 Z" fill="url(#gv-jet-gold)" opacity="0.92" />
      {/* tail fins */}
      <path d="M192 128 L150 156 L196 146 Z" fill="url(#gv-jet-gold)" opacity="0.75" />
      <path d="M208 128 L250 156 L204 146 Z" fill="url(#gv-jet-gold)" opacity="0.75" />
      {/* cockpit */}
      <ellipse cx="200" cy="46" rx="7" ry="18" fill="#05060a" opacity="0.85" />
      {/* engine glow */}
      <circle cx="200" cy="156" r="6" fill="#e0263c" />
    </svg>
  );
}

function LaunchListForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [joined, setJoined] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Enter a valid email address to join the launch list.');
      return;
    }
    setError('');
    setJoined(true);
  }

  return (
    <div className="gv-form-card" id="launch-list">
      <span className="gv-kicker">Launch list</span>
      <h2>Join the launch list</h2>
      <p>
        Aeropocalypse is in closed testing on Google Play. Join the list and
        the launch opens to testers first.
      </p>
      {joined ? (
        <p className="gv-form-success" role="status">
          You are on the launch list.
        </p>
      ) : (
        <form className="gv-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="gv-launch-email" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Email address
          </label>
          <input
            id="gv-launch-email"
            className="gv-input"
            type="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={error ? 'gv-launch-error' : undefined}
          />
          <button className="nn-btn nn-btn-gold" type="submit">
            Join the launch list
          </button>
        </form>
      )}
      {error && (
        <p className="gv-form-error" id="gv-launch-error" role="alert">
          {error}
        </p>
      )}
      <p className="gv-form-note">No spam. Unsubscribe anytime.</p>
    </div>
  );
}

function BossCard({ boss }: { boss: ThunderBoss }) {
  const color = THREAT_COLORS[boss.threatLevel];
  return (
    <article className="gv-boss">
      <span className="gv-boss-level" aria-label={`Level ${boss.level}`}>
        {String(boss.level).padStart(2, '0')}
      </span>
      <div>
        <span className="gv-boss-code">{boss.codename}</span>
        <h3 className="gv-boss-name">{boss.name}</h3>
      </div>
      <span className="gv-threat" style={{ color }}>{boss.threatLevel}</span>
    </article>
  );
}

export function AeropocalypsePage() {
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<BossFilter>('ALL');

  const bosses = useMemo(
    () => (filter === 'ALL' ? THUNDER_BOSSES : THUNDER_BOSSES.filter((b) => b.threatLevel === filter)),
    [filter],
  );

  const counts = useMemo(() => {
    const map: Record<BossFilter, number> = { ALL: THUNDER_BOSSES.length, ALPHA: 0, OMEGA: 0, TITAN: 0, NEXUS: 0 };
    for (const boss of THUNDER_BOSSES) map[boss.threatLevel] += 1;
    return map;
  }, []);

  const stageOne = THUNDER_BOSSES[0];

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="md-scope">
        {/* ================= HANGAR HERO ================= */}
        <section className="gv-hangar">
          <div className="gv-radar" aria-hidden="true" />
          <div className="gv-hangar-inner">
            <Reveal>
              <span className="gv-kicker gv-kicker--crimson">
                <span className="gv-dot" aria-hidden="true" />
                Closed testing on Google Play
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="gv-title">
                <span className="gv-gold-text">AEROPOCALYPSE</span>
                <br />
                ONLINE
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="gv-lede">
                An arcade flight combat game, launching soon. Fly 25 stages,
                break 25 boss encounters.
              </p>
            </Reveal>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <JetMark />
            </motion.div>
            <Reveal delay={0.24}>
              <div className="gv-btn-row">
                <a className="nn-btn nn-btn-gold" href="#launch-list">
                  Join the launch list
                </a>
                <Link className="nn-btn nn-btn-ghost" to="/video#cinematics">
                  <Play size={18} weight="bold" style={{ verticalAlign: -3, marginRight: 8 }} />
                  Watch the cinematics
                </Link>
                <a
                  className="nn-btn nn-btn-ghost"
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GameController size={18} style={{ verticalAlign: -3, marginRight: 8 }} />
                  Get it on Google Play
                </a>
              </div>
            </Reveal>
            <div className="gv-hud-strip" aria-label="Game status readout">
              <span>
                Stage <b>01 / 25</b>
              </span>
              <span>
                Boss <b>Iron-01</b>
              </span>
              <span>
                Status <b>Closed testing</b>
              </span>
            </div>
          </div>
        </section>

        {/* ================= STAT DECK ================= */}
        <section aria-label="Game statistics">
          <div className="gv-stat-deck">
            {STATS.map((stat) => (
              <div className="gv-stat" key={stat.label}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ================= STAGE 01 SPOTLIGHT ================= */}
        <section className="gv-section" aria-label="Stage 1 spotlight">
          <div className="gv-stage-card">
            <span className="gv-stage-num" aria-hidden="true">
              01
            </span>
            <div>
              <span className="gv-kicker">Stage 01 / 25</span>
              <h3>
                {stageOne.name} — {stageOne.codename}
              </h3>
              <div className="gv-stage-meta">
                <span>
                  Threat <b>{stageOne.threatLevel}</b>
                </span>
                <span>
                  Arena <b>{stageOne.environment}</b>
                </span>
                <span>
                  Weakness <b>{stageOne.weakness}</b>
                </span>
                <span>
                  Signature attack <b>{stageOne.signatureAttack}</b>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= CINEMATIC SLOT ================= */}
        <section className="gv-section" id="cinematics" aria-label="Opening cinematic">
          <div className="nn-glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(212,175,55,0.2)',
              }}
            >
              <YoutubeLogo size={20} weight="duotone" style={{ color: 'var(--md-gold, #d4af37)' }} />
              <strong style={{ letterSpacing: '0.14em', fontSize: 13, textTransform: 'uppercase' }}>
                Opening cinematic
              </strong>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              <video
                src={`${CINEMATIC_CDN}/game-intro-v1.mp4`}
                controls
                playsInline
                preload="metadata"
                poster="/media/official-3000-studios-profile.png"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div style={{ padding: '14px 20px' }}>
              <span style={{ color: 'var(--md-muted, #a7adbd)', fontSize: 13 }}>
                Aeropocalypse — game intro cinematic. Full archive on the{' '}
                <Link to="/video" style={{ color: 'var(--md-gold-hi, #f6dd8a)' }}>
                  Video Vault
                </Link>
                .
              </span>
            </div>
          </div>
        </section>

        {/* ================= BOSS ROSTER ================= */}
        <section className="gv-section" id="boss-roster" aria-label="Boss roster">
          <div className="gv-section-head">
            <span className="gv-kicker">The boss roster</span>
            <h2>24 NAMES TO FEAR</h2>
            <p>Filter by threat class. Every boss is a multi-phase encounter.</p>
          </div>
          <div className="gv-filter-row" role="group" aria-label="Filter by threat class">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                className={`gv-filter-btn${filter === f ? ' is-active' : ''}`}
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f} · {counts[f]}
              </button>
            ))}
          </div>
          <div className="gv-boss-grid">
            {bosses.map((boss) => (
              <BossCard key={boss.id} boss={boss} />
            ))}
          </div>
        </section>

        {/* ================= LAUNCH LIST ================= */}
        <section className="gv-section" aria-label="Join the launch list">
          <LaunchListForm />
        </section>

        <section className="gv-section">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
