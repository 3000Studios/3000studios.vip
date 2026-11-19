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
import { Reveal } from '../v2/Reveal';
import { VAULT_SONG_COUNT } from '../data/vaultSongs';
import { BLOG_ARTICLES } from '../data/blogArticles';
import '../styles/commerce.css';

const SOCIALS = [
  { name: 'YouTube', url: 'https://www.youtube.com/@3000Studio', Icon: YoutubeLogo },
  { name: 'Instagram', url: 'https://www.instagram.com/3000studios.vip/', Icon: InstagramLogo },
  { name: 'TikTok', url: 'https://www.tiktok.com/@3000STUDIOS', Icon: TiktokLogo },
  { name: 'Spotify', url: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', Icon: SpotifyLogo },
  { name: 'X', url: 'https://x.com/3000studios', Icon: XLogo },
];

/**
 * /about — Built Different, mockup section 17.
 * Released tracks is the live DistroKid count from the shared vault module
 * (VAULT_SONG_COUNT — 55 generated rows deduped to 52). It is NOT hardcoded:
 * the mockup's 51 is stale against the repo data. Podcast (26) and books (8)
 * come from the mockup — no count modules exist in the repo for either; blog
 * articles count is live (BLOG_ARTICLES.length).
 */
const PODCAST_EPISODES = 26;
const BOOKS_IN_STORE = 8;

export function AboutPage() {
  const releasedTracks = VAULT_SONG_COUNT;
  const blogArticles = BLOG_ARTICLES.length;

  const stats = [
    { value: String(releasedTracks), label: 'Released tracks' },
    { value: String(PODCAST_EPISODES), label: 'Podcast episodes' },
    { value: String(BOOKS_IN_STORE), label: 'Books in store' },
    { value: String(blogArticles), label: 'Blog articles' },
  ];

  const divisions = [
    { num: '01', name: 'Music', note: `${releasedTracks} songs on every platform` },
    { num: '02', name: 'Podcast', note: 'Follow and Subscribe, 26 episodes' },
    { num: '03', name: 'Press', note: '8 books in the studio store' },
    { num: '04', name: 'Games', note: 'Aeropocalypse: Online in closed testing' },
    { num: '05', name: 'Software', note: 'Amped Ear 3000 and the apps lab' },
    { num: '06', name: 'Live', note: 'Live Command broadcast deck' },
  ];

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">About — 3000 Studios</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            BUILT DIFFERENT
          </h1>
          <p>
            Independent AI-driven music production, cinematic video, games and creator media,
            from Acworth, Georgia.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="commerce-stats">
            {stats.map((s) => (
              <div key={s.label} className="commerce-stat">
                <div className="commerce-stat-value">{s.value}</div>
                <div className="commerce-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-glass" style={{ padding: 'clamp(24px, 5vw, 44px)', maxWidth: 880, margin: '0 auto' }}>
            <Reveal>
              <span className="commerce-eyebrow">The Founder</span>
              <h2 className="commerce-section-title" style={{ marginTop: 12, marginBottom: 16 }}>
                Jeremy Swain
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, color: 'var(--nn-text)', lineHeight: 1.7 }}>
                <p style={{ margin: 0 }}>
                  Founded 3000 Studios as an independent label and creator media brand. Songs
                  play as 1-minute previews on this site, with full songs on every platform.
                </p>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: 'var(--nn-cyan)' }}>3000 Studios</strong> is an
                  independent music production label and creator media brand founded by Jeremy
                  Swain. Every release begins in the studio: original songwriting, cutting-edge
                  AI production assistance, and meticulous human arrangement, vocal production,
                  mixing, and mastering.
                </p>
                <p style={{ margin: 0 }}>
                  The catalog is distributed globally across Spotify, Apple Music, YouTube, and
                  all major platforms via DistroKid. Every song is paired with a cinematic
                  official video.
                </p>
                <p style={{ margin: 0 }}>
                  Beyond music: <strong style={{ color: 'var(--nn-gold)' }}>Aeropocalypse:
                  Online</strong>, a 25-stage arcade combat game in closed testing; a growing
                  apps lab; and a live broadcast stage. One studio, every medium.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <Reveal>
            <span className="commerce-eyebrow">The Divisions</span>
            <h2 className="commerce-section-title" style={{ marginTop: 12 }}>
              One empire, six doors
            </h2>
          </Reveal>
          <div className="commerce-divisions">
            {divisions.map((d) => (
              <div key={d.num} className="commerce-division">
                <span className="commerce-division-num">{d.num}</span>
                <span className="commerce-division-name">{d.name}</span>
                <span className="commerce-division-note">{d.note}</span>
              </div>
            ))}
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
