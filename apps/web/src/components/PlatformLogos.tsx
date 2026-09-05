import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

const SPOTIFY = 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik';
const APPLE = 'https://music.apple.com/us/artist/3000-studios/6802721597';
const YT_MUSIC = 'https://music.youtube.com/channel/UCTQnEFZUIutrFuDlxGj9cDA';
const YOUTUBE = 'https://www.youtube.com/@3000Studio';

function LogoMark({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`platLogoMark ${className}`} aria-hidden="true">
      {children}
    </span>
  );
}

export function PlatformLogos() {
  return (
    <nav className="platLogoRow" aria-label="Official 3000 Studios platforms">
      <a className="platLogo" href={SPOTIFY} target="_blank" rel="noreferrer">
        <LogoMark className="platSpotify">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="12" r="12" fill="#1DB954" />
            <path d="M6.6 15.4c3.4-1.4 7.3-1.1 10.8.8" fill="none" stroke="#121212" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M6.2 12.4c4-1.7 8.6-1.4 12.6.9" fill="none" stroke="#121212" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M5.8 9.4c4.6-2 10-1.6 14.6 1" fill="none" stroke="#121212" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </LogoMark>
        <span>Spotify</span>
      </a>
      <a className="platLogo" href={APPLE} target="_blank" rel="noreferrer">
        <LogoMark className="platApple">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <defs>
              <linearGradient id="am" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FA233B" />
                <stop offset="100%" stopColor="#FB5C74" />
              </linearGradient>
            </defs>
            <rect width="24" height="24" rx="6" fill="url(#am)" />
            <path d="M10 7.2l7 1.2v7.1a2.4 2.4 0 11-1.6-2.3V10l-3.8-.7v6.4a2.4 2.4 0 11-1.6-2.3V7.2z" fill="#fff" />
          </svg>
        </LogoMark>
        <span>Apple Music</span>
      </a>
      <a className="platLogo" href={YT_MUSIC} target="_blank" rel="noreferrer">
        <LogoMark className="platYtMusic">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <circle cx="12" cy="12" r="12" fill="#FF0000" />
            <circle cx="12" cy="12" r="8.2" fill="none" stroke="#fff" strokeWidth="1.4" />
            <path d="M10.2 8.6l6.2 3.4-6.2 3.4V8.6z" fill="#fff" />
          </svg>
        </LogoMark>
        <span>YouTube Music</span>
      </a>
      <a className="platLogo" href={YOUTUBE} target="_blank" rel="noreferrer">
        <LogoMark className="platYoutube">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <rect x="1" y="5" width="22" height="14" rx="4" fill="#FF0000" />
            <path d="M10 9.2l6 2.8-6 2.8V9.2z" fill="#fff" />
          </svg>
        </LogoMark>
        <span>YouTube</span>
      </a>
      <Link className="platLogo" to="/video">
        <LogoMark className="platVideo">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <rect width="24" height="24" rx="6" fill="#111" />
            <rect x="3" y="6" width="18" height="12" rx="2" fill="#FFD700" />
            <path d="M10 9.4l5 2.6-5 2.6V9.4z" fill="#111" />
          </svg>
        </LogoMark>
        <span>Video</span>
      </Link>
      <Link className="platLogo" to="/live">
        <LogoMark className="platLive">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <rect width="24" height="24" rx="6" fill="#111" />
            <circle cx="12" cy="12" r="5" fill="#FF2D2D" />
            <circle className="platLivePulse" cx="12" cy="12" r="8" fill="none" stroke="#FF2D2D" strokeWidth="1.4" />
          </svg>
        </LogoMark>
        <span>Live</span>
      </Link>
      <Link className="platLogo" to="/shop">
        <LogoMark className="platShop">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <rect width="24" height="24" rx="6" fill="#111" />
            <path d="M7 9h10l-.8 8.2a2 2 0 01-2 1.8H9.8a2 2 0 01-2-1.8L7 9z" fill="#FFD700" />
            <path d="M9 9V8a3 3 0 016 0v1" fill="none" stroke="#FFD700" strokeWidth="1.6" />
          </svg>
        </LogoMark>
        <span>Shop</span>
      </Link>
    </nav>
  );
}
