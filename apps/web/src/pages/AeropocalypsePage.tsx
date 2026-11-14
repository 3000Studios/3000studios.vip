import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { AERO_BOSSES, AERO_SHIPS, AERO_WEAPONS } from '../data/aeropocalypse';
import { AERO_STILLS } from '../data/aeropocalypseStills';
import { CINEMATIC_CDN } from '../data/videoCatalog';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/aeropocalypse.css';

/* ==========================================================================
   THEATER FILM SLOT — the ~2-minute cinematic premiere.
   Spec for the film crew: file name `cinematic-theater.mp4`, 1920x1080,
   ~2:00, gameplay + cinematics cut as one film. It is served from
   CINEMATIC_CDN (Cloudflare Pages has a ~25 MB per-file limit, so the film
   does NOT live in public/). When the film is live on the CDN, set
   THEATER_FILM_READY to true and the poster premiere treatment below is
   replaced by the real player. Until then the slot shows the feature-art
   poster with the premiere treatment — never a fake player.
   ========================================================================== */
const THEATER_FILM_READY = false;
const THEATER_FILM_SRC = `${CINEMATIC_CDN}/cinematic-theater.mp4`;
const THEATER_POSTER = '/media/aeropocalypse/poster.jpg';
const GAME_ICON = '/media/aeropocalypse/icon.png';

const THREAT_COLORS: Record<string, string> = {
  ALPHA: '#1e88f9',
  OMEGA: '#f4ae3e',
  TITAN: '#8b5cf6',
  NEXUS: '#ff3b5c',
};

const THREAT_LABELS: Record<string, string> = {
  ALPHA: 'Standard Combat Threat',
  OMEGA: 'Elite Combat Threat',
  TITAN: 'Titan-Class Annihilator',
  NEXUS: 'Nexus-Class Extinction Event',
};

const GAME_STATS: { value: string; label: string }[] = [
  { value: '25', label: 'Stages' },
  { value: '25', label: 'Bosses' },
  { value: '15', label: 'Jets' },
  { value: '19', label: 'Weapons' },
  { value: '32', label: 'Paint Schemes' },
  { value: '30', label: 'Track Soundtrack' },
];

export function AeropocalypsePage() {
  const [selectedBoss, setSelectedBoss] = useState(AERO_BOSSES[0]);
  const [selectedShip, setSelectedShip] = useState(AERO_SHIPS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bosses' | 'ships' | 'weapons'>('overview');
  const bossCount = AERO_BOSSES.length;

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="aero-page">
        {/* ================================================================
            THEATER HERO — the premiere screen
            ================================================================ */}
        <section className="aero-hero" id="theater">
          <span className="aero-kicker">3000 Studios Presents</span>
          <h1 className="aero-title">
            AEROPOCALYPSE
            <span className="aero-online">ONLINE</span>
          </h1>
          <p className="aero-tagline">
            Twenty-five stages of arcade flight combat. Fifteen jets, nineteen
            weapons, and a boss waiting at the end of every sky.{' '}
            <strong>Welcome to the theater.</strong>
          </p>
        </section>

        <div className="aero-theater">
          <div className="aero-marquee" aria-hidden="true">
            {Array.from({ length: 18 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <div className="aero-screen-frame">
            <div className="aero-screen">
              {THEATER_FILM_READY ? (
                <video
                  src={THEATER_FILM_SRC}
                  controls
                  playsInline
                  preload="metadata"
                  poster={THEATER_POSTER}
                />
              ) : (
                <>
                  <img
                    src={THEATER_POSTER}
                    alt="AEROPOCALYPSE: ONLINE — the hero jet bursts through the warp ring"
                  />
                  <div className="aero-premiere">
                    <span className="aero-premiere-kicker">The Premiere</span>
                    <h2>One film. Every sky.</h2>
                    <p>
                      The full cinematic — gameplay and story cut as a single
                      two-minute film — premieres here with the Google Play
                      launch. Take your seat early.
                    </p>
                    <div className="aero-cta-row">
                      <Link className="aero-btn-gold" to="/contact">
                        ▣ Join the launch list
                      </Link>
                      <a className="aero-btn-ghost" href="#database">
                        Explore the field database
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stat band — the game's real numbers */}
          <div className="aero-stats" role="list" aria-label="Game facts">
            {GAME_STATS.map((s) => (
              <div className="aero-stat" role="listitem" key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================================
            GOOGLE PLAY LAUNCH PANEL — honest pre-launch CTA.
            When the listing goes live, this panel's buttons become the
            store link. Until then every button here works (launch list /
            privacy), and the copy says exactly where launch stands.
            ================================================================ */}
        <section className="aero-section" aria-label="Google Play launch">
          <div className="aero-panel aero-launch">
            <img
              className="aero-launch-icon"
              src={GAME_ICON}
              alt="AEROPOCALYPSE: ONLINE game icon"
              width={168}
              height={168}
            />
            <div>
              <span className="aero-kicker" style={{ letterSpacing: '0.24em' }}>
                <span className="aero-status-dot" aria-hidden="true" />
                Closed testing — live now
              </span>
              <h2 className="aero-h2">Launching on Google Play</h2>
              <p className="aero-lede" style={{ margin: '0 0 20px' }}>
                AEROPOCALYPSE: ONLINE is in closed testing on Google Play and
                is <strong style={{ color: 'var(--aero-text)' }}>not yet on public sale</strong>.
                The public launch opens with the cinematic premiere above —
                join the launch list and you will be first in when the skies
                open.
              </p>
              <div className="aero-cta-row">
                <Link className="aero-btn-gold" to="/contact">
                  ▣ Join the launch list
                </Link>
                <Link className="aero-btn-ghost" to="/aeropocalypse/privacy">
                  🔒 Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            GAMEPLAY GALLERY — real frames from the launch build.
            Renders only when capture stills have been dropped in
            (src/data/aeropocalypseStills.ts) — no empty section ships.
            ================================================================ */}
        {AERO_STILLS.length > 0 && (
          <section className="aero-section" aria-label="Gameplay stills">
            <span className="aero-kicker">From the cockpit</span>
            <h2 className="aero-h2">Gameplay, Frame by Frame</h2>
            <p className="aero-lede" style={{ margin: '0 0 22px' }}>
              Real frames from the launch build — every stage flown with a
              different jet and a different weapon on the stick.
            </p>
            <div className="aero-gallery">
              {AERO_STILLS.map((still) => (
                <figure className="aero-shot" key={still.src}>
                  <img src={still.src} alt={still.alt} loading="lazy" />
                  <figcaption>{still.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================
            FIELD DATABASE — boss roster, hangar, armory
            ================================================================ */}
        <section className="aero-section" id="database">
          <div className="aero-tabs" role="group" aria-label="Field database sections">
            {(['overview', 'bosses', 'ships', 'weapons'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="aero-tab"
                aria-pressed={activeTab === tab}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {(activeTab === 'overview' || activeTab === 'bosses') && (
          <section id="boss-roster" className="aero-section" style={{ marginTop: 0 }}>
            <div className="aero-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
                <div>
                  <span className="aero-kicker">Tactical Threat Database</span>
                  <h2 className="aero-h2" style={{ marginBottom: 0 }}>
                    The Boss Roster
                  </h2>
                </div>
                <div style={{ color: 'var(--aero-muted)', fontSize: 13 }}>
                  Select a threat profile to analyze combat specs:
                </div>
              </div>

              {/* Campaign progression strip */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: 'var(--aero-muted)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Campaign Progression
                  </span>
                  <span style={{ color: 'var(--aero-muted)', fontSize: 11 }}>
                    ALPHA <span style={{ color: THREAT_COLORS.ALPHA }}>■</span> · OMEGA <span style={{ color: THREAT_COLORS.OMEGA }}>■</span> · TITAN <span style={{ color: THREAT_COLORS.TITAN }}>■</span> · NEXUS <span style={{ color: THREAT_COLORS.NEXUS }}>■</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
                  {AERO_BOSSES.map((boss) => {
                    const color = THREAT_COLORS[boss.threatLevel];
                    const isSelected = selectedBoss.id === boss.id;
                    return (
                      <button
                        key={boss.id}
                        type="button"
                        onClick={() => setSelectedBoss(boss)}
                        title={`${boss.name} — ${boss.threatLevel}`}
                        style={{
                          flex: '0 0 auto',
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: `2px solid ${isSelected ? '#fff' : color}`,
                          background: isSelected
                            ? `radial-gradient(circle at 35% 35%, ${color}, rgba(0,0,0,0.9) 75%)`
                            : 'rgba(8, 12, 20, 0.9)',
                          color: isSelected ? '#05060a' : color,
                          fontWeight: 800,
                          fontSize: 13,
                          boxShadow: isSelected ? `0 0 14px ${color}` : `0 0 6px ${color}55`,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {boss.level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boss selector grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
                {AERO_BOSSES.map((boss) => {
                  const isSelected = selectedBoss.id === boss.id;
                  const color = THREAT_COLORS[boss.threatLevel];
                  return (
                    <button
                      key={boss.id}
                      type="button"
                      onClick={() => setSelectedBoss(boss)}
                      style={{
                        background: isSelected ? 'rgba(10, 14, 24, 0.95)' : 'rgba(10, 13, 22, 0.8)',
                        border: isSelected ? `1px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        borderTop: `3px solid ${color}`,
                        borderRadius: 8,
                        padding: '10px',
                        textAlign: 'left',
                        color: '#fff',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? `0 0 12px ${color}44` : undefined,
                        transform: isSelected ? 'translateY(-2px)' : undefined,
                      }}
                    >
                      <div style={{ fontSize: 11, color, fontWeight: 800 }}>
                        LV {String(boss.level).padStart(2, '0')} · {boss.threatLevel}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, margin: '4px 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {boss.name}
                      </div>
                      <div style={{ fontSize: 11, color: '#f4ae3e' }}>
                        {boss.codename}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active boss detail HUD */}
              <div
                key={selectedBoss.id}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(8, 12, 20, 0.95), rgba(4, 6, 12, 0.98))',
                  border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}`,
                  borderRadius: 12,
                  padding: '24px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 24,
                  boxShadow: `0 0 28px ${THREAT_COLORS[selectedBoss.threatLevel]}33, inset 0 0 60px rgba(0,0,0,0.5)`,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `linear-gradient(transparent 0%, ${THREAT_COLORS[selectedBoss.threatLevel]}14 48%, ${THREAT_COLORS[selectedBoss.threatLevel]}33 50%, ${THREAT_COLORS[selectedBoss.threatLevel]}14 52%, transparent 100%)`,
                    backgroundSize: '100% 220%',
                    animation: 'aero-scan 4.5s linear infinite',
                  }}
                />
                <style>{`@keyframes aero-scan { 0% { background-position: 0 -120%; } 100% { background-position: 0 220%; } }`}</style>
                <div style={{ position: 'relative' }}>
                  <span style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {selectedBoss.threatLevel} CLASS · {THREAT_LABELS[selectedBoss.threatLevel]}
                  </span>
                  <h3 style={{ fontSize: 26, margin: '6px 0 2px', color: '#fff', fontWeight: 800 }}>
                    {selectedBoss.name}
                  </h3>
                  <div style={{ color: '#f4ae3e', fontSize: 14, marginBottom: 12 }}>
                    Sector: {selectedBoss.environment} · Codename: {selectedBoss.codename}
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--aero-muted)', marginBottom: 4 }}>
                      <span>THREAT INDEX</span>
                      <span style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontWeight: 800 }}>
                        {selectedBoss.level}/{bossCount}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(selectedBoss.level / bossCount) * 100}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${THREAT_COLORS[selectedBoss.threatLevel]}88, ${THREAT_COLORS[selectedBoss.threatLevel]})`,
                          boxShadow: `0 0 10px ${THREAT_COLORS[selectedBoss.threatLevel]}`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ color: 'var(--aero-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
                    {selectedBoss.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', position: 'relative' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--aero-muted)', fontSize: 11, textTransform: 'uppercase' }}>Target Weakness:</span>
                    <div style={{ color: '#ff3b5c', fontWeight: 700, fontSize: 14 }}>{selectedBoss.weakness}</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--aero-muted)', fontSize: 11, textTransform: 'uppercase' }}>Signature Attack:</span>
                    <div style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontWeight: 700, fontSize: 14 }}>{selectedBoss.signatureAttack}</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--aero-muted)', fontSize: 11, textTransform: 'uppercase' }}>Armor Rating & Score:</span>
                    <div style={{ color: '#f4ae3e', fontWeight: 700, fontSize: 14 }}>
                      {selectedBoss.armorRating} · +{selectedBoss.scoreValue.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'ships') && (
          <section id="ship-hangar" className="aero-section">
            <div style={{ marginBottom: 24 }}>
              <span className="aero-kicker">Fleet Engineering</span>
              <h2 className="aero-h2">Combat Interceptors & Battleships</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {AERO_SHIPS.map((ship) => (
                <article
                  key={ship.id}
                  className="aero-card"
                  style={{
                    borderColor: selectedShip.id === ship.id ? 'rgba(30, 136, 249, 0.8)' : undefined,
                  }}
                  onClick={() => setSelectedShip(ship)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: '#1e88f9', fontSize: 12, fontWeight: 800 }}>{ship.role}</span>
                    <span style={{ color: '#f4ae3e', fontSize: 11, background: 'rgba(244, 174, 62, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                      {ship.unlockedAt}
                    </span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: 20, margin: '0 0 8px' }}>{ship.name}</h3>
                  <p style={{ color: 'var(--aero-muted)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                    {ship.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--aero-muted)', marginBottom: 2 }}>
                        <span>Speed</span>
                        <span style={{ color: '#1e88f9' }}>{ship.speed}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.speed}%`, height: '100%', background: '#1e88f9' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--aero-muted)', marginBottom: 2 }}>
                        <span>Armor</span>
                        <span style={{ color: '#f4ae3e' }}>{ship.armor}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.armor}%`, height: '100%', background: '#f4ae3e' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--aero-muted)', marginBottom: 2 }}>
                        <span>Firepower</span>
                        <span style={{ color: '#21ba0f' }}>{ship.firepower}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.firepower}%`, height: '100%', background: '#21ba0f' }} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'overview' || activeTab === 'weapons') && (
          <section id="weapon-armory" className="aero-section">
            <div style={{ marginBottom: 24 }}>
              <span className="aero-kicker">Munitions Matrix</span>
              <h2 className="aero-h2">Specialized Weapon Systems</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {AERO_WEAPONS.map((wep) => (
                <article key={wep.id} className="aero-card">
                  <span style={{ color: '#8b5cf6', fontSize: 12, fontWeight: 800 }}>{wep.type}</span>
                  <h3 style={{ color: '#fff', fontSize: 20, margin: '4px 0 6px' }}>{wep.name}</h3>
                  <p style={{ color: 'var(--aero-muted)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                    {wep.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(244, 174, 62, 0.15)' }}>
                    <span style={{ color: '#f4ae3e', fontSize: 13, fontWeight: 700 }}>{wep.dps}</span>
                    <span style={{ color: 'var(--aero-muted)', fontSize: 12 }}>{wep.ammo}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ================================================================
            MERCH TEASER
            ================================================================ */}
        <section className="aero-section">
          <div
            className="aero-panel"
            style={{
              textAlign: 'center',
              borderColor: 'rgba(244, 174, 62, 0.35)',
              background: 'linear-gradient(145deg, rgba(20, 16, 6, 0.9), rgba(8, 10, 16, 0.95))',
            }}
          >
            <span className="aero-kicker">🛒 Aeropocalypse Supply Drop</span>
            <h2 className="aero-h2">Wear the Sky</h2>
            <p className="aero-lede" style={{ margin: '0 auto 22px', textAlign: 'center' }}>
              Official AEROPOCALYPSE: ONLINE merch is loading into the armory — tees, hoodies,
              and pilot gear forged in the neon-noir foundry. First drops land in the 3000 Studios
              store.
            </p>
            <div className="aero-cta-row" style={{ justifyContent: 'center' }}>
              <a className="aero-btn-gold" href="https://boughtitonline.com" target="_blank" rel="noreferrer">
                🛒 Shop the Store
              </a>
              <Link className="aero-btn-ghost" to="/live">
                ▶ Catch the Dev Stream
              </Link>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1200, margin: '48px auto 0', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>
      </div>
    </PublicLayoutV2>
  );
}
