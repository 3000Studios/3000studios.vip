import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { THUNDER_BOSSES, THUNDER_SHIPS, THUNDER_WEAPONS } from '../data/thunderDome';
import { CINEMATIC_CDN } from '../data/videoCatalog';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

const THREAT_COLORS: Record<string, string> = {
  ALPHA: '#00f0ff',
  OMEGA: '#ffd700',
  TITAN: '#a855f7',
  NEXUS: '#ff3366',
};

const THREAT_LABELS: Record<string, string> = {
  ALPHA: 'Standard Combat Threat',
  OMEGA: 'Elite Combat Threat',
  TITAN: 'Titan-Class Annihilator',
  NEXUS: 'Nexus-Class Extinction Event',
};

export function ThunderDomePage() {
  const [selectedBoss, setSelectedBoss] = useState(THUNDER_BOSSES[0]);
  const [selectedShip, setSelectedShip] = useState(THUNDER_SHIPS[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'bosses' | 'ships' | 'weapons'>('overview');

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            THUNDER DOME HERO: CARBON FIBER & CYBER-HUD COCKPIT
            ========================================================================= */}
        <section className="vip-hero-hub" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)', background: 'rgba(0, 240, 255, 0.08)' }}>
              ⚡ 24-LEVEL COMBAT FLIGHT SIMULATOR
            </span>
            <span className="md-kicker" style={{ color: '#ffd700' }}>
              60 FPS ARCADE ENGINE
            </span>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text" style={{ background: 'linear-gradient(135deg, #00f0ff, #fff 45%, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              THUNDER DOME
            </span>
          </h1>

          <p style={{ maxWidth: 680, margin: '0 auto 24px', fontSize: 'clamp(15px, 2.5vw, 18px)' }}>
            Enter the premier 3000 Studios high-octane arcade flight combat universe. 24 hand-crafted celestial environments, 24 lethal multi-phase bosses, custom ship chassis, and sub-millisecond mobile touch dogfights.
          </p>

          <div className="vip-badge-row">
            <a
              className="vip-btn-gold"
              href="#boss-roster"
              style={{ background: 'linear-gradient(135deg, #00f0ff, #0077aa)', color: '#05060a' }}
            >
              ▶ Inspect 24 Bosses
            </a>
            <a
              className="vip-btn-gold"
              href="https://play.google.com/store/search?q=Thunderdome%20AeroStrike&c=apps"
              target="_blank"
              rel="noreferrer"
              title="Thunderdome: AeroStrike on Google Play (internal test in progress)"
            >
              ▣ Get it on Google Play
            </a>
            <a className="vip-btn-obsidian" href="#dome-trailer">
              🎬 Watch Trailer
            </a>
            <a className="vip-btn-obsidian" href="#ship-hangar">
              🛸 Ship Hangar
            </a>
            <a className="vip-btn-obsidian" href="#weapon-armory">
              ⚔ Weapon Armory
            </a>
            <Link className="vip-btn-obsidian" to="/thunder-dome/privacy">
              🔒 Privacy Policy
            </Link>
          </div>
        </section>

        {/* =========================================================================
            TRAILER SLOT: cinematic embed
            ========================================================================= */}
        <section id="dome-trailer" style={{ maxWidth: 1100, margin: '0 auto 48px', padding: '0 16px' }}>
          <div className="vip-glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(0,240,255,0.15)' }}>
              <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
                🎬 Official trailer slot
              </span>
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
            <div style={{ padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <span style={{ color: 'var(--vip-text-muted)', fontSize: 13 }}>
                Thunderdome: AeroStrike — game intro cinematic. Full archive on the{' '}
                <Link to="/video" style={{ color: '#00f0ff' }}>Video Vault</Link>.
              </span>
              <Link className="vip-btn-obsidian" to="/video" style={{ fontSize: 12, padding: '8px 16px' }}>
                All 30 cinematics
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            NAV TABS: SYSTEM HUDS
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 36px', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(['overview', 'bosses', 'ships', 'weapons'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className="vip-btn-obsidian"
                style={{
                  textTransform: 'uppercase',
                  fontSize: 13,
                  padding: '8px 20px',
                  borderColor: activeTab === tab ? '#00f0ff' : undefined,
                  background: activeTab === tab ? 'rgba(0, 240, 255, 0.15)' : undefined,
                  color: activeTab === tab ? '#00f0ff' : undefined,
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            SECTION 1: SYSTEM OVERVIEW & SPECS
            ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'bosses') && (
          <section id="boss-roster" style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
            <div className="vip-glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
                <div>
                  <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
                    Tactical Threat Database
                  </span>
                  <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', margin: '4px 0 0', fontWeight: 800 }}>
                    24 Bosses & Combat Levels
                  </h2>
                </div>
                <div style={{ color: 'var(--vip-text-muted)', fontSize: 13 }}>
                  Select a threat profile to analyze combat specs:
                </div>
              </div>

              {/* Campaign Progression Strip — all 24 levels */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: 'var(--vip-text-muted)', fontSize: 12, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Campaign Progression
                  </span>
                  <span style={{ color: 'var(--vip-text-muted)', fontSize: 11 }}>
                    ALPHA <span style={{ color: THREAT_COLORS.ALPHA }}>■</span> · OMEGA <span style={{ color: THREAT_COLORS.OMEGA }}>■</span> · TITAN <span style={{ color: THREAT_COLORS.TITAN }}>■</span> · NEXUS <span style={{ color: THREAT_COLORS.NEXUS }}>■</span>
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }}>
                  {THUNDER_BOSSES.map((boss) => {
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
                          cursor: 'pointer',
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

              {/* Boss Selector Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, marginBottom: 28 }}>
                {THUNDER_BOSSES.map((boss) => {
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
                        cursor: 'pointer',
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
                      <div style={{ fontSize: 11, color: '#ffd700' }}>
                        {boss.codename}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Boss Detail HUD */}
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
                {/* scanline sweep */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    background: `linear-gradient(transparent 0%, ${THREAT_COLORS[selectedBoss.threatLevel]}14 48%, ${THREAT_COLORS[selectedBoss.threatLevel]}33 50%, ${THREAT_COLORS[selectedBoss.threatLevel]}14 52%, transparent 100%)`,
                    backgroundSize: '100% 220%',
                    animation: 'td-scan 4.5s linear infinite',
                  }}
                />
                <style>{`@keyframes td-scan { 0% { background-position: 0 -120%; } 100% { background-position: 0 220%; } }`}</style>
                <div style={{ position: 'relative' }}>
                  <span style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {selectedBoss.threatLevel} CLASS · {THREAT_LABELS[selectedBoss.threatLevel]}
                  </span>
                  <h3 style={{ fontSize: 26, margin: '6px 0 2px', color: '#fff', fontWeight: 800 }}>
                    {selectedBoss.name}
                  </h3>
                  <div style={{ color: '#ffd700', fontSize: 14, marginBottom: 12 }}>
                    Sector: {selectedBoss.environment} · Codename: {selectedBoss.codename}
                  </div>
                  {/* threat meter */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--vip-text-muted)', marginBottom: 4 }}>
                      <span>THREAT INDEX</span>
                      <span style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontWeight: 800 }}>
                        {selectedBoss.level}/24
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${(selectedBoss.level / 24) * 100}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${THREAT_COLORS[selectedBoss.threatLevel]}88, ${THREAT_COLORS[selectedBoss.threatLevel]})`,
                          boxShadow: `0 0 10px ${THREAT_COLORS[selectedBoss.threatLevel]}`,
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
                    {selectedBoss.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center', position: 'relative' }}>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Target Weakness:</span>
                    <div style={{ color: '#ff3366', fontWeight: 700, fontSize: 14 }}>{selectedBoss.weakness}</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Signature Attack:</span>
                    <div style={{ color: THREAT_COLORS[selectedBoss.threatLevel], fontWeight: 700, fontSize: 14 }}>{selectedBoss.signatureAttack}</div>
                  </div>
                  <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '10px 14px', borderRadius: 8, border: `1px solid ${THREAT_COLORS[selectedBoss.threatLevel]}55` }}>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Armor Rating & Score:</span>
                    <div style={{ color: '#ffd700', fontWeight: 700, fontSize: 14 }}>
                      {selectedBoss.armorRating} · +{selectedBoss.scoreValue.toLocaleString()} PTS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 2: SHIP HANGAR
            ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'ships') && (
          <section id="ship-hangar" style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
            <div style={{ marginBottom: 24 }}>
              <span className="md-kicker" style={{ color: '#ffd700' }}>Fleet Engineering</span>
              <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', margin: '4px 0 0', fontWeight: 800 }}>
                Combat Interceptors & Battleships
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {THUNDER_SHIPS.map((ship) => (
                <article
                  key={ship.id}
                  className="vip-glass-card"
                  style={{
                    padding: '24px',
                    borderColor: selectedShip.id === ship.id ? 'rgba(0, 240, 255, 0.8)' : undefined,
                    cursor: 'pointer',
                  }}
                  onClick={() => setSelectedShip(ship)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ color: '#00f0ff', fontSize: 12, fontWeight: 800 }}>{ship.role}</span>
                    <span style={{ color: '#ffd700', fontSize: 11, background: 'rgba(255, 215, 0, 0.1)', padding: '2px 8px', borderRadius: 4 }}>
                      {ship.unlockedAt}
                    </span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: 20, margin: '0 0 8px' }}>{ship.name}</h3>
                  <p style={{ color: 'var(--vip-text-muted)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                    {ship.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--vip-text-muted)', marginBottom: 2 }}>
                        <span>Speed</span>
                        <span style={{ color: '#00f0ff' }}>{ship.speed}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.speed}%`, height: '100%', background: '#00f0ff' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--vip-text-muted)', marginBottom: 2 }}>
                        <span>Armor</span>
                        <span style={{ color: '#ffd700' }}>{ship.armor}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.armor}%`, height: '100%', background: '#ffd700' }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--vip-text-muted)', marginBottom: 2 }}>
                        <span>Firepower</span>
                        <span style={{ color: '#ff3366' }}>{ship.firepower}%</span>
                      </div>
                      <div style={{ width: '100%', height: 4, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${ship.firepower}%`, height: '100%', background: '#ff3366' }} />
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            SECTION 3: WEAPON ARMORY
            ========================================================================= */}
        {(activeTab === 'overview' || activeTab === 'weapons') && (
          <section id="weapon-armory" style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
            <div style={{ marginBottom: 24 }}>
              <span className="md-kicker" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.4)' }}>
                Munitions Matrix
              </span>
              <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', margin: '4px 0 0', fontWeight: 800 }}>
                Specialized Weapon Systems
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {THUNDER_WEAPONS.map((wep) => (
                <article key={wep.id} className="vip-glass-card" style={{ padding: '24px' }}>
                  <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 800 }}>{wep.type}</span>
                  <h3 style={{ color: '#fff', fontSize: 20, margin: '4px 0 6px' }}>{wep.name}</h3>
                  <p style={{ color: 'var(--vip-text-muted)', fontSize: 13, lineHeight: 1.5, margin: '0 0 16px' }}>
                    {wep.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: 8, border: '1px solid rgba(255, 215, 0, 0.15)' }}>
                    <span style={{ color: '#ffd700', fontSize: 13, fontWeight: 700 }}>{wep.dps}</span>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>{wep.ammo}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            MERCH TEASER: Thunderdome gear
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
          <div
            className="vip-glass-card"
            style={{
              padding: '36px 28px',
              textAlign: 'center',
              borderColor: 'rgba(255, 215, 0, 0.35)',
              background:
                'linear-gradient(145deg, rgba(20, 16, 6, 0.9), rgba(8, 10, 16, 0.95))',
            }}
          >
            <span className="md-kicker" style={{ color: '#ffd700' }}>
              🛒 Thunderdome Supply Drop
            </span>
            <h2
              className="vip-gold-text"
              style={{ fontSize: 'clamp(24px, 4.5vw, 38px)', margin: '10px 0 12px', fontWeight: 800 }}
            >
              Wear the Dome
            </h2>
            <p style={{ color: 'var(--vip-text-muted)', fontSize: 15, maxWidth: 620, margin: '0 auto 22px', lineHeight: 1.6 }}>
              Official Thunderdome: AeroStrike merch is loading into the armory — tees, hoodies,
              and pilot gear forged in the neon-noir foundry. First drops land in the 3000 Studios
              store.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                className="vip-btn-gold"
                href="https://boughtitonline.com"
                target="_blank"
                rel="noreferrer"
              >
                🛒 Shop the Store
              </a>
              <Link className="vip-btn-obsidian" to="/live">
                ▶ Catch the Dev Stream
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: GOOGLE ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

      </div>
    </PublicLayoutV2>
  );
}
