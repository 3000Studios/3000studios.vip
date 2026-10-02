import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';

const facts = [
  { value: '47', label: 'Released tracks' },
  { value: '5', label: 'Genres in rotation' },
  { value: 'AI+', label: 'AI-assisted, human-finished' },
];

export function AboutPage() {
  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap">
          <Reveal>
            <span className="v2-kicker">The Story</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              About <span className="v2-grad-text">3000 Studios</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 640 }}>
              Independent AI-driven music production from Acworth, Georgia.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="v2-grid-3" style={{ marginTop: 32 }}>
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="v2-card v2-card--lift"
                  style={{ padding: '22px 24px', textAlign: 'center' }}
                >
                  <div
                    className="v2-display"
                    style={{ fontSize: 40, color: 'var(--v2-neon)' }}
                  >
                    {fact.value}
                  </div>
                  <div style={{ color: 'var(--v2-muted)', fontSize: 14, marginTop: 6 }}>
                    {fact.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 880 }}>
          <Reveal>
            <div className="v2-card" style={{ padding: 'clamp(24px, 5vw, 44px)' }}>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <p className="v2-lede">
                  <strong style={{ color: 'var(--v2-neon)' }}>3000 Studios</strong> is
                  an independent music production label and creator media brand founded by
                  Jeremy Swain in Acworth, Georgia. Every release begins in the studio:
                  original songwriting, cutting-edge AI production assistance, and meticulous
                  human arrangement, vocal production, mixing, and mastering.
                </p>
                <p className="v2-lede">
                  Our 47-release catalog is distributed globally across Spotify, Apple
                  Music, YouTube, and all major digital streaming platforms via
                  DistroKid. Every song is paired with a cinematic official music video,
                  creating a rich visual world for our community.
                </p>
                <p className="v2-lede">
                  We operate at the leading edge of music technology. Advanced AI
                  accelerates ideation, melody synthesis, and instrumentals, while human
                  artistry shapes each song into an anthemic, unforgettable experience
                  across pop, hip-hop, electronic, rock, and cinematic genres.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section">
        <div className="v2-wrap" style={{ textAlign: 'center' }}>
          <RevealGroup className="v2-grid-3">
            <RevealItem>
              <Link className="v2-btn" to="/#music" style={{ width: '100%' }}>
                Explore 47 Tracks
              </Link>
            </RevealItem>
            <RevealItem>
              <Link className="v2-btn v2-btn--blue" to="/#live" style={{ width: '100%' }}>
                Watch Live Stream
              </Link>
            </RevealItem>
            <RevealItem>
              <Link className="v2-btn v2-btn--ghost" to="/contact" style={{ width: '100%' }}>
                Contact Studio
              </Link>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>
    </PublicLayoutV2>
  );
}
