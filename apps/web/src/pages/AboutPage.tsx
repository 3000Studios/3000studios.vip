import { Link } from 'react-router-dom';
import {
  YoutubeLogo,
  InstagramLogo,
  TiktokLogo,
  SpotifyLogo,
  XLogo,
  EnvelopeSimple,
} from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { publishedSongs } from '../data/publishedSongs';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS } from '../data/videoCatalog';
import { THUNDER_BOSSES } from '../data/thunderDome';

const SOCIALS = [
  { name: 'YouTube', url: 'https://www.youtube.com/@3000Studio', Icon: YoutubeLogo },
  { name: 'Instagram', url: 'https://www.instagram.com/3000studios.vip/', Icon: InstagramLogo },
  { name: 'TikTok', url: 'https://www.tiktok.com/@3000STUDIOS', Icon: TiktokLogo },
  { name: 'Spotify', url: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', Icon: SpotifyLogo },
  { name: 'X', url: 'https://x.com/3000studios', Icon: XLogo },
];

export function AboutPage() {
  const stats = [
    { value: String(publishedSongs.length), label: 'Released tracks' },
    { value: String(MUSIC_VIDEOS.length), label: 'Official music videos' },
    { value: String(THUNDER_BOSSES.length), label: 'Thunderdome bosses' },
    { value: String(CINEMATIC_VIDEOS.length), label: 'Game cinematics' },
  ];

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">The story</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            THE STUDIO
          </h1>
          <p>
            Independent AI-driven music production, cinematic video, games, and
            creator media — from Acworth, Georgia to every screen on earth.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-admin-grid">
            {stats.map((s) => (
              <div key={s.label} className="nn-glass nn-stat-card">
                <div className="nn-num">{s.value}</div>
                <div className="nn-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-glass" style={{ padding: 'clamp(24px, 5vw, 44px)', maxWidth: 880, margin: '0 auto' }}>
            <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: 16 }}>
              Built Different
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--nn-text)', lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                <strong style={{ color: 'var(--nn-cyan)' }}>3000 Studios</strong> is an
                independent music production label and creator media brand founded
                by Jeremy Swain. Every release begins in the studio: original
                songwriting, cutting-edge AI production assistance, and meticulous
                human arrangement, vocal production, mixing, and mastering.
              </p>
              <p style={{ margin: 0 }}>
                The catalog is distributed globally across Spotify, Apple Music,
                YouTube, and all major platforms via DistroKid. Every song is
                paired with a cinematic official video — and now, every video can
                be unlocked in full right here for $1.
              </p>
              <p style={{ margin: 0 }}>
                Beyond music: <strong style={{ color: 'var(--nn-gold)' }}>Thunderdome:
                AeroStrike</strong>, a 24-boss arcade combat game; a growing apps
                lab; and a live broadcast stage. One studio, every medium.
              </p>
            </div>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48, textAlign: 'center' }}>
          <span className="nn-kicker nn-kicker--gold">Follow the studio</span>
          <div className="nn-socials" style={{ marginTop: 20 }}>
            {SOCIALS.map(({ name, url, Icon }) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name} title={name}>
                <Icon size={20} weight="duotone" />
              </a>
            ))}
            <a href="mailto:mr.jwswain@gmail.com" aria-label="Email" title="Email">
              <EnvelopeSimple size={20} weight="duotone" />
            </a>
          </div>
          <div style={{ marginTop: 26 }}>
            <Link className="nn-btn nn-btn-gold" to="/contact">
              <EnvelopeSimple size={18} /> Book / Contact
            </Link>
          </div>
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
