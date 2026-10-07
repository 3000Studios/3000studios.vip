import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { STUDIO_APPS } from '../data/appsData';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

export function AppsPage() {
  const [filter, setFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Audio Tool', 'Game', 'AI Engine', 'Web Platform'];
  const filteredApps = filter === 'ALL'
    ? STUDIO_APPS
    : STUDIO_APPS.filter((a) => a.category === filter);

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            APPS HERO: MACHINED CHROME & SOFTWARE MATRIX
            ========================================================================= */}
        <section className="vip-hero-hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
              ✦ 3000 STUDIOS SOFTWARE LAB
            </span>
            <span className="md-kicker">
              PRODUCTION APPLICATIONS
            </span>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text">SOFTWARE & APPS</span>
          </h1>

          <p style={{ maxWidth: 660, margin: '0 auto 24px' }}>
            From high-precision audio DSP analyzers and 60fps canvas game engines to sub-second WebRTC broadcast infrastructure, we build the tools we want to exist.
          </p>

          <div className="vip-badge-row">
            <Link className="vip-btn-gold" to="/thunder-dome">
              🛸 Play Thunder Dome
            </Link>
            <Link className="vip-btn-obsidian" to="/#music">
              ♪ Velvet Audio Engine
            </Link>
            <Link className="vip-btn-obsidian" to="/live">
              ● WebRTC Live Studio
            </Link>
          </div>
        </section>

        {/* =========================================================================
            FILTER TABS
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 36px', padding: '0 16px' }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className="vip-btn-obsidian"
                style={{
                  fontSize: 13,
                  padding: '8px 18px',
                  borderColor: filter === cat ? '#ffd700' : undefined,
                  background: filter === cat ? 'rgba(255, 215, 0, 0.15)' : undefined,
                  color: filter === cat ? '#ffd700' : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            APPS GRID: PRODUCT LAUNCH TILES
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {filteredApps.map((app) => (
              <article key={app.id} id={app.id} className="vip-glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{app.icon}</span>
                    <div>
                      <span style={{ color: app.badgeColor, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {app.category}
                      </span>
                      <div style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>
                        {app.platform} · {app.version}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: '#00d632', fontSize: 11, background: 'rgba(0, 214, 50, 0.1)', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                    {app.status}
                  </span>
                </div>

                <h2 style={{ color: '#fff', fontSize: 22, margin: '0 0 6px', fontWeight: 800 }}>
                  {app.name}
                </h2>
                <div style={{ color: '#ffd700', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                  {app.tagline}
                </div>
                <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px' }}>
                  {app.description}
                </p>

                {/* Highlights */}
                <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '14px', borderRadius: 8, border: '1px solid rgba(255, 215, 0, 0.15)', marginBottom: 20 }}>
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                    Key Architectural Capabilities:
                  </span>
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--vip-text-muted)', fontSize: 13, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {app.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>

                {/* Tech Stack Chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24, marginTop: 'auto' }}>
                  {app.techStack.map((tech) => (
                    <span key={tech} style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--vip-cream)', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Action CTA */}
                {app.actionUrl.startsWith('/') ? (
                  <Link to={app.actionUrl} className="vip-btn-gold" style={{ textAlign: 'center' }}>
                    {app.actionLabel} ↗
                  </Link>
                ) : (
                  <a href={app.actionUrl} target="_blank" rel="noreferrer" className="vip-btn-gold" style={{ textAlign: 'center' }}>
                    {app.actionLabel} ↗
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* =========================================================================
            ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

      </div>
    </PublicLayoutV2>
  );
}
