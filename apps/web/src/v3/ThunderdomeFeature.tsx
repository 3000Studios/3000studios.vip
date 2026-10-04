import { Link } from 'react-router-dom';
import { GameController, Play } from '@phosphor-icons/react';
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
    <section className="nn-wrap" style={{ margin: '56px auto' }} aria-label="Thunderdome feature">
      <div className="nn-glass nn-glass--gold" style={{ padding: '36px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span className="nn-kicker">
            <GameController size={14} style={{ verticalAlign: '-2px' }} /> Featured · 24-boss combat
          </span>
          <h2 className="nn-chrome" style={{ fontSize: 'clamp(34px, 7vw, 72px)', marginTop: 14 }}>
            THUNDER DOME
          </h2>
          <p style={{ color: 'var(--nn-muted)', maxWidth: 620, margin: '12px auto 0' }}>
            24 hand-crafted bosses. 4 threat tiers. One dome. Enter the premier
            3000 Studios arcade flight combat universe.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {preview.map((boss) => {
            const color = THREAT_COLORS[boss.threatLevel] || '#00f0ff';
            return (
              <div
                key={boss.id}
                style={{
                  border: `1px solid ${color}55`,
                  borderTop: `3px solid ${color}`,
                  borderRadius: 10,
                  padding: '12px',
                  background: 'rgba(5,8,12,0.7)',
                }}
              >
                <div style={{ fontSize: 11, color, fontWeight: 800 }}>
                  LV {String(boss.level).padStart(2, '0')} · {boss.threatLevel}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 4 }}>
                  {boss.name}
                </div>
              </div>
            );
          })}
        </div>

        <div className="nn-btn-row">
          <Link className="nn-btn nn-btn-gold" to="/thunder-dome" style={{ fontSize: 16, padding: '14px 34px' }}>
            <Play size={18} weight="fill" /> Enter the Dome
          </Link>
          <Link className="nn-btn nn-btn-ghost" to="/video">
            Watch the cinematics
          </Link>
        </div>
      </div>
    </section>
  );
}
