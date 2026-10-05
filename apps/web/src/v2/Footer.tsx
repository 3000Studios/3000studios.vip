import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  YoutubeLogo,
  SpotifyLogo,
  AppleLogo,
  InstagramLogo,
  TiktokLogo,
  PaperPlaneTilt,
} from '@phosphor-icons/react';

const SOCIALS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@3000Studio', icon: <YoutubeLogo size={22} weight="duotone" /> },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', icon: <SpotifyLogo size={22} weight="duotone" /> },
  { label: 'Apple Music', href: 'https://music.apple.com/us/artist/3000-studios/6802721597', icon: <AppleLogo size={22} weight="duotone" /> },
  { label: 'Instagram', href: 'https://www.instagram.com/3000studios.vip', icon: <InstagramLogo size={22} weight="duotone" /> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@3000studios.vip', icon: <TiktokLogo size={22} weight="duotone" /> },
];

const EXPLORE = [
  { to: '/#music', label: 'Music catalog' },
  { to: '/#videos', label: 'Official videos' },
  { to: '/#live', label: 'Live stage' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/beats', label: 'Beats & instrumentals' },
  { to: '/shop', label: 'Shop merch' },
  { to: '/community', label: 'Community' },
  { to: '/concepts', label: 'Concept board' },
];

const STUDIO = [
  { to: '/about', label: 'About the studio' },
  { to: '/requests', label: 'Request a song' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/blog', label: 'Blog' },
  { to: '/contact', label: 'Contact / booking' },
  { to: '/go-live', label: 'Go live' },
];

const LEGAL = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms' },
  { to: '/copyright', label: 'Copyright' },
  { to: '/cookies', label: 'Cookies' },
  { to: '/disclaimer', label: 'Disclaimer' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    window.location.href = `mailto:Team@3000studios.vip?subject=${encodeURIComponent(
      'VIP list signup',
    )}&body=${encodeURIComponent(`Please add ${email.trim()} to the 3000 Studios VIP list.`)}`;
    setSent(true);
  };

  return (
    <footer className="v2-footer">
      <hr className="v2-live-line" />
      <div className="v2-wrap v2-footer-grid">
        <div className="v2-footer-brand">
          <Link to="/" className="v2-brand" aria-label="3000 Studios home">
            <img src="/media/official-3000-studios-profile.png" alt="" className="v2-brand-logo" />
            <span className="v2-brand-word">
              <strong>
                3000<span className="v2-grad-text">Studios</span>
              </strong>
              <small>VIP · MUSIC · LIVE</small>
            </span>
          </Link>
          <p className="v2-footer-blurb">
            Independent music production from Acworth, Georgia. Original songs, cinematic videos,
            and live broadcasts — straight from the studio.
          </p>
          <div className="v2-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`3000 Studios on ${s.label}`}
                className="v2-social-btn"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <nav className="v2-footer-col" aria-label="Explore">
          <h3>Explore</h3>
          <ul>
            {EXPLORE.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="v2-footer-col" aria-label="Studio">
          <h3>Studio</h3>
          <ul>
            {STUDIO.map((l) => (
              <li key={l.label}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="v2-footer-col v2-footer-news">
          <h3>Join the VIP list</h3>
          <p>Get new drops, live alerts, and exclusives first.</p>
          {sent ? (
            <p className="v2-news-done">Opening your mail app — hit send and you&apos;re in.</p>
          ) : (
            <form onSubmit={subscribe} className="v2-news-form">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="v2-input"
              />
              <button type="submit" className="v2-btn v2-btn--sm" aria-label="Join the VIP list">
                <PaperPlaneTilt size={16} weight="bold" /> Join
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="v2-wrap v2-footer-bottom">
        <p>© {new Date().getFullYear()} 3000 Studios · Acworth, Georgia. All rights reserved.</p>
        <nav aria-label="Legal">
          {LEGAL.map((l, i) => (
            <span key={l.to}>
              {i > 0 && <i className="v2-dot" aria-hidden="true" />}
              <Link to={l.to}>{l.label}</Link>
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
