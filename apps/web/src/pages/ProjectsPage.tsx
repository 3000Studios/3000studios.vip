import { Link } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from './Home';
import { STUDIO_PROJECTS } from '../data/projectsData';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

export function ProjectsPage() {
  return (
    <PublicLayout variant="spiral" compact={false}>
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            PROJECTS HERO
            ========================================================================= */}
        <section className="vip-hero-hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker">✦ PRODUCTION PORTFOLIO</span>
            <span className="md-kicker" style={{ color: '#00f0ff' }}>ENGINEERING & CREATIVE CASE STUDIES</span>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text">FEATURED PROJECTS</span>
          </h1>

          <p style={{ maxWidth: 660, margin: '0 auto 24px' }}>
            Real systems engineered and shipped by 3000 Studios. Deep architectural case studies spanning game engines, audio DSP software, and edge-first web platforms.
          </p>

          <div className="vip-badge-row">
            <Link className="vip-btn-gold" to="/thunder-dome">
              🛸 Thunder Dome 24
            </Link>
            <Link className="vip-btn-obsidian" to="/apps">
              ⚡ Software Lab
            </Link>
            <Link className="vip-btn-obsidian" to="/blog">
              ◈ Engineering Blog
            </Link>
          </div>
        </section>

        {/* =========================================================================
            PROJECT CASE STUDIES
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {STUDIO_PROJECTS.map((proj, idx) => (
              <article key={proj.id} className="vip-glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                  <div>
                    <span className="md-kicker" style={{ marginBottom: 4, display: 'inline-block' }}>
                      Case Study #{String(idx + 1).padStart(2, '0')} · {proj.category}
                    </span>
                    <h2 style={{ color: '#fff', fontSize: 'clamp(22px, 3.5vw, 30px)', margin: 0, fontWeight: 800 }}>
                      {proj.title}
                    </h2>
                  </div>
                  <span style={{ color: '#00d632', fontSize: 12, background: 'rgba(0, 214, 50, 0.1)', padding: '4px 10px', borderRadius: 4, fontWeight: 700 }}>
                    {proj.status}
                  </span>
                </div>

                <p style={{ color: '#ffd700', fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>
                  {proj.summary}
                </p>

                <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
                  {proj.story}
                </p>

                {/* Metrics Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
                  {proj.metrics.map((m, i) => (
                    <div key={i} style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px 16px', borderRadius: 8, border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                      <span style={{ color: 'var(--vip-text-muted)', fontSize: 11, textTransform: 'uppercase', display: 'block' }}>{m.label}</span>
                      <strong style={{ color: '#00f0ff', fontSize: 18 }}>{m.value}</strong>
                    </div>
                  ))}
                </div>

                {/* Tech Stack & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {proj.techStack.map((tech) => (
                      <span key={tech} style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--vip-cream)', fontSize: 11, padding: '4px 10px', borderRadius: 4 }}>
                        {tech}
                      </span>
                    ))}
                  </div>

                  <Link to={proj.actionUrl} className="vip-btn-gold">
                    {proj.actionLabel} ↗
                  </Link>
                </div>
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
    </PublicLayout>
  );
}
