import { Link } from 'react-router-dom';
import {
  YoutubeLogo,
  SpotifyLogo,
  AppleLogo,
  InstagramLogo,
  TiktokLogo,
  FacebookLogo,
  Play,
  Pause,
} from '@phosphor-icons/react';
import { EmpireBrand, SHOP_URL } from './Header';
import { useGlobalMusic } from '../components/GlobalMusic';

const SOCIALS = [
  { label: 'YouTube', href: 'https://www.youtube.com/@3000Studio', icon: <YoutubeLogo size={22} weight="duotone" /> },
  { label: 'Instagram', href: 'https://www.instagram.com/3000studios.vip', icon: <InstagramLogo size={22} weight="duotone" /> },
  { label: 'TikTok', href: 'https://www.tiktok.com/@3000studios.vip', icon: <TiktokLogo size={22} weight="duotone" /> },
  { label: 'Facebook', href: 'https://www.facebook.com/3000Studios.vip', icon: <FacebookLogo size={22} weight="duotone" /> },
  { label: 'Spotify', href: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', icon: <SpotifyLogo size={22} weight="duotone" /> },
  { label: 'Apple Music', href: 'https://music.apple.com/us/artist/3000-studios/6802721597', icon: <AppleLogo size={22} weight="duotone" /> },
];

type FooterLink = { to: string; label: string; external?: boolean };

// Link columns per the redesign mockup. "Books" points at /books, a route
// the books slice adds — see home/NOTES.md. "Aeropocalypse" points at the
// live game route /thunder-dome until the Aeropocalypse slice ships
// /aeropocalypse.
const PLAY: FooterLink[] = [
  { to: '/thunder-dome', label: 'Aeropocalypse' },
  { to: '/apps', label: 'Apps' },
  { to: '/projects', label: 'Projects' },
  { to: '/live', label: 'Live' },
];

const LISTEN: FooterLink[] = [
  { to: '/music', label: 'Music Vault' },
  { to: '/video', label: 'Video Vault' },
  { to: '/podcast', label: 'Podcast' },
  { to: '/beats', label: 'Beat Packs' },
];

const BUY: FooterLink[] = [
  { to: '/books', label: 'Books' },
  { to: SHOP_URL, label: 'Shop', external: true },
  { to: '/vip', label: 'VIP' },
  { to: '/sponsors', label: 'Sponsors' },
];

const STUDIO: FooterLink[] = [
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/requests', label: 'Requests' },
  { to: '/contact', label: 'Contact' },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav className="v2-footer-col" aria-label={title}>
      <h3>{title}</h3>
      <ul>
        {links.map((l) => (
          <li key={l.label}>
            {l.external ? (
              <a href={l.to} target="_blank" rel="noreferrer">
                {l.label}
              </a>
            ) : (
              <Link to={l.to}>{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Studio Radio status line. GlobalMusic owns playback; the footer only
 * reflects it. Nothing plays until a visitor presses play.
 */
function StudioRadio() {
  const { isPlaying, toggle, activeTitle } = useGlobalMusic();
  return (
    <div className="v2-footer-radio">
      <span className="v2-footer-radio-label">Studio Radio</span>
      <button
        type="button"
        className={`v2-footer-radio-btn${isPlaying ? ' is-on' : ''}`}
        onClick={toggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? `Pause Studio Radio, now playing ${activeTitle}` : 'Play Studio Radio'}
      >
        {isPlaying ? <Pause size={15} weight="fill" /> : <Play size={15} weight="fill" />}
        <span>{isPlaying ? `On · ${activeTitle}` : 'Off until you press play'}</span>
      </button>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="v2-footer v2-footer--empire">
      <hr className="v2-live-line" />
      <div className="v2-wrap v2-footer-grid v2-footer-grid--empire">
        <div className="v2-footer-brand">
          <Link to="/" className="v2-brand v2-brand--empire" aria-label="3000 Studios home">
            <EmpireBrand />
          </Link>
          <p className="v2-footer-blurb">
            Independent music, games, books, software and live media, run by Jeremy Swain.
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

        <FooterColumn title="Play" links={PLAY} />
        <FooterColumn title="Listen" links={LISTEN} />
        <FooterColumn title="Buy" links={BUY} />
        <FooterColumn title="Studio" links={STUDIO} />
      </div>

      <div className="v2-wrap v2-footer-radio-row">
        <StudioRadio />
      </div>

      <div className="v2-wrap v2-footer-bottom">
        <p>3000 Studios. All rights reserved.</p>
        <nav aria-label="Legal">
          <Link to="/privacy">Privacy</Link>
          <i className="v2-dot" aria-hidden="true" />
          <Link to="/terms">Terms</Link>
          <i className="v2-dot" aria-hidden="true" />
          <Link to="/sitemap">All pages</Link>
        </nav>
      </div>
    </footer>
  );
}
