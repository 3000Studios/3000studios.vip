import { GameController, Play } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { MagneticLink } from './chrome';
import { THUNDER_BOSSES } from '../data/thunderDome';

const THREAT_COLORS: Record<string, string> = {
  ALPHA: '#00f0ff',
  OMEGA: '#ffd700',
  TITAN: '#a855f7',
  NEXUS: '#ff3366',
};

export function ThunderdomeFeature() {
  const preview = THUNDER_BOSSES.slice(0, 6);

  return (
    <section className="v3-section" style={{ paddingTop: 0 }} aria-label="Thunderdome feature">
      <div className="v3-wrap">
        <Reveal>
          <div
            className="v3-card"
            style={{
              textAlign: 'center',
              borderColor: 'rgba(241,183,78,.35)',
              boxShadow: '0 30px 90px rgba(241,183,78,.08)',
              padding: 'clamp(36px, 5vw, 64px) clamp(24px, 4vw, 56px)',
            }}
          >
            <div
              className="v3-eyebrow"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <GameController size={14} /> Featured · 24-boss combat
            </div>
            <h2 className="v3-h2" style={{ fontSize: 'clamp(38px, 7vw, 76px)', marginTop: 12 }}>
              Thunder <em>Dome</em>
            </h2>
            <p className="v3-lead" style={{ margin: '0 auto', textAlign: 'center' }}>
              24 hand-crafted bosses. 4 threat tiers. One dome. Enter the premier
              3000 Studios arcade flight combat universe.
            </p>

            <div
              className="v3-grid"
              style={{ marginTop: 36, textAlign: 'left', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
            >
              {preview.map((boss) => {
                const color = THREAT_COLORS[boss.threatLevel] || '#00f0ff';
                return (
                  <div
                    key={boss.id}
                    className="v3-card"
                    style={{
                      padding: '18px',
                      borderTop: `3px solid ${color}`,
                    }}
                  >
                    <div style={{ fontSize: 11, color, fontWeight: 800, letterSpacing: 2 }}>
                      LV {String(boss.level).padStart(2, '0')} · {boss.threatLevel}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginTop: 6 }}>
                      {boss.name}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--v3-mut)', marginTop: 4 }}>
                      {boss.environment}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="v3-cta-row">
              <MagneticLink to="/thunder-dome" className="v3-btn v3-btn--gold">
                <Play size={18} weight="fill" /> Enter the Dome
              </MagneticLink>
              <MagneticLink to="/video" className="v3-btn v3-btn--ghost">
                Watch the cinematics
              </MagneticLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
