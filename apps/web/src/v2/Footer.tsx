import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  YoutubeLogo,
  SpotifyLogo,
  AppleLogo,
  InstagramLogo,
  TiktokLogo,
  FacebookLogo,
  Newspaper,
  PaperPlaneTilt,
  EnvelopeSimple,
  GameController,
  Lifebuoy,
} from '@phosphor-icons/react';
import { LiveBand } from '../empire/LiveBand';
import { AERO_PLAY_URL, AERO_SITE_URL, BOOK_STORE_URL, SUBSTACK_URL, SUPPORT_EMAIL, TEAM_EMAIL } from '../empire/links';

const SHOP_URL = 'https://boughtitonline.com';
const GUMROAD_URL = 'https://3000studios.gumroad.com';
const BN_URL = 'https://www.barnesandnoble.com/w/family-game-night-games-jeremy-swain/1151782724';

const SOCIALS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@3000Studio', icon: <YoutubeLogo size={20} weight="duotone" /> },
  { label: 'Instagram', href: 'https://www.instagram.com/3000studios.vip', icon: <InstagramLogo size={20} weight="duotone" /> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@3000studios.vip', icon: <TiktokLogo size={20} weight="duotone" /> },
  { label: 'Facebook', href: 'https://www.facebook.com/3000Studios.vip', icon: <FacebookLogo size={20} weight="duotone" /> },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', icon: <SpotifyLogo size={20} weight="duotone" /> },
  { label: 'Apple Music', href: 'https://music.apple.com/us/artist/3000-studios/6802721597', icon: <AppleLogo size={20} weight="duotone" /> },
  { label: 'Substack', href: SUBSTACK_URL, icon: <Newspaper size={20} weight="duotone" /> },
];

const EXPLORE = [
  { to: '/aeropocalypse', label: 'Aeropocalypse: Online' },
  { to: '/books', label: 'Books' },
  { to: '/music', label: 'Music' },
  { to: '/video', label: 'Videos' },
  { to: '/beats', label: 'Music For Sale' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/live', label: 'Live Stream' },
];

const STUDIO = [
  { to: '/about', label: 'About the studio' },
  { to: '/blog', label: 'Blog' },
  { to: '/shop', label: 'Merch and VIP' },
  { to: '/apps', label: 'Apps' },
  { to: '/community', label: 'Community' },
  { to: '/requests', label: 'Request a song' },
  { to: '/sponsors', label: 'Sponsors' },
];

const STORES = [
  { to: AERO_PLAY_URL, label: 'Aeropocalypse on Google Play' },
  { to: AERO_SITE_URL, label: 'aeropocalypse.online' },
  { to: BOOK_STORE_URL, label: 'Books on Payhip' },
  { to: BN_URL, label: 'Books at Barnes and Noble' },
  { to: GUMROAD_URL, label: 'Tools on Gumroad' },
  { to: SHOP_URL, label: 'Bought It Online' },
  { to: 'https://open.spotify.com/show/033SHVotmOb7vSOUOOcmFI', label: 'Podcast on Spotify' },
  { to: 'https://www.paypal.com/donate/?business=mr.jwswain@gmail.com&currency_code=USD', label: 'Tip the studio on PayPal' },
];

const LEGAL = [
  { to: '/privacy', label: 'Privacy' },
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
    const value = email.trim();
    if (!value) return;
    // Signups POST to the studio inbox; mailto is only the fallback when
    // the inbox endpoint is unreachable (audit P1-7).
    void fetch('/api/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'subscribe', email: value }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('inbox unavailable');
        setSent(true);
      })
      .catch(() => {
        window.location.href = `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent(
          'VIP list signup',
        )}&body=${encodeURIComponent(`Please add ${value} to the 3000 Studios VIP list.`)}`;
        setSent(true);
      });
  };

  return (
    <footer className="em-footer">
      <LiveBand variant="footer" />
      <div className="em-footer-in">
        <p className="em-footer-big" aria-hidden="true">
          3000 Studios
        </p>

        <h2 className="em-kicker">Contact</h2>
        <div className="em-contact">
          <a className="em-card" href={`mailto:${SUPPORT_EMAIL}`}>
            <span className="ic">
              <Lifebuoy size={24} weight="duotone" />
            </span>
            <span>
              <b>Support</b>
              <span>{SUPPORT_EMAIL}</span>
            </span>
          </a>
          <a className="em-card" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Aeropocalypse: Online')}`}>
            <span className="ic">
              <GameController size={24} weight="duotone" />
            </span>
            <span>
              <b>Game help</b>
              <span>Aeropocalypse questions and feedback</span>
            </span>
          </a>
          <a className="em-card" href={`mailto:${TEAM_EMAIL}?subject=${encodeURIComponent('Booking and business')}`}>
            <span className="ic">
              <EnvelopeSimple size={24} weight="duotone" />
            </span>
            <span>
              <b>Booking</b>
              <span>{TEAM_EMAIL}</span>
            </span>
          </a>
        </div>

        <h2 className="em-kicker">Follow</h2>
        <div className="em-socials">
          {SOCIALS.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`3000 Studios on ${s.label}`}>
              {s.icon}
              {s.label}
            </a>
          ))}
        </div>

        <div className="em-cols">
          <div>
            <h3>Explore</h3>
            <ul>
              {EXPLORE.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Studio</h3>
            <ul>
              {STUDIO.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Stores</h3>
            <ul>
              {STORES.map((l) => (
                <li key={l.to}>
                  <a href={l.to} target="_blank" rel="noopener noreferrer">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>VIP list</h3>
            <p className="em-news-lede">New songs, books and game drops, first.</p>
            {sent ? (
              <p className="em-news-done">You are on the list.</p>
            ) : (
              <form className="em-news" onSubmit={subscribe}>
                <label htmlFor="em-news-email" className="em-sr">
                  Email address
                </label>
                <input
                  id="em-news-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button className="em-btn" type="submit" aria-label="Join the VIP list">
                  <PaperPlaneTilt size={18} weight="bold" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="em-legal">
          <span>© {new Date().getFullYear()} 3000 Studios. All rights reserved.</span>
          <nav aria-label="Legal">
            {LEGAL.map((l) => (
              <Link key={l.to} to={l.to}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
