import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import '../styles/vip-luxury.css';

export function AboutPage() {
  return (
    <PublicLayout variant="electric" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 920, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            The Story
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            About 3000 Studios
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', fontSize: 16 }}>
            Independent AI-driven music production from Acworth, Georgia.
          </p>
        </section>

        <section className="vip-glass-card" style={{ padding: '36px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <p style={{ color: '#f8f6f0', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            <strong style={{ color: '#ffd700' }}>3000 Studios</strong> is an independent music production label and creator media brand founded by Jeremy Swain in Acworth, Georgia. Every release begins in the studio: original songwriting, cutting-edge AI production assistance, and meticulous human arrangement, vocal production, mixing, and mastering.
          </p>
          <p style={{ color: '#f8f6f0', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            Our 47-release catalog is distributed globally across Spotify, Apple Music, YouTube, and all major digital streaming platforms via DistroKid. Every song is paired with a cinematic official music video, creating a rich visual world for our community.
          </p>
          <p style={{ color: '#f8f6f0', fontSize: 16, lineHeight: 1.7, margin: 0 }}>
            We operate at the leading edge of music technology. Advanced AI accelerates ideation, melody synthesis, and instrumentals, while human artistry shapes each song into an anthemic, unforgettable experience across pop, hip-hop, electronic, rock, and cinematic genres.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: 20 }}>
            <Link className="vip-btn-gold" to="/#music">
              Explore 47 Tracks
            </Link>
            <Link className="vip-btn-obsidian" to="/live">
              Watch Live Stream
            </Link>
            <Link className="vip-btn-obsidian" to="/contact">
              Contact Studio
            </Link>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
