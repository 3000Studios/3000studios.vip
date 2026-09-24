import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GlobalMusicToggle } from '../components/GlobalMusic';
import { LiveWallpaper } from '../components/LiveWallpaper';
import { MouseFX } from '../components/MouseFX';
import { ZombieFX } from '../components/ZombieFX';
import { ScrollFX } from '../components/ScrollFX';
import { PlatformLogos } from '../components/PlatformLogos';
import { ChromeWallpaper } from '../components/ChromeWallpaper';
import { DeferredFxStyles } from '../components/DeferredFxStyles';
import { type SongPalette } from '../data/music';
import { adsenseClientId } from '../lib/adsense';
import { usePrefersReducedMotion } from '../lib/mediaQuery';


const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const navItems = [
  { to: '/', label: 'Home', icon: '⌂', hint: 'VIP lobby' },
  { to: '/music', label: 'Music', icon: '♪', hint: 'Full catalog' },
  { to: '/video', label: 'Video', icon: '▶', hint: 'Visuals' },
  { to: '/live', label: 'Live', icon: '●', hint: 'Broadcast' },
  { to: '/community', label: 'Chat', icon: '◎', hint: 'Community' },
  { to: '/requests', label: 'Requests', icon: '✦', hint: 'Song ideas' },
  { to: '/blog', label: 'Blog', icon: '◈', hint: 'Editorial' },
  { to: '/sponsors', label: 'Sponsors', icon: '◆', hint: 'Partners' },
  { to: '/wallpaper', label: 'Wallpaper', icon: '🎨', hint: 'Live visuals' },
  { to: '/about', label: 'About', icon: '◇', hint: 'The studio' },
  { to: '/contact', label: 'Contact', icon: '✉', hint: 'Book us' },
  { to: '/admin', label: 'Admin', icon: '⚙', hint: 'Owner control' },
] as const;

function navIsActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

function playPop() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.18);
  window.setTimeout(() => void ctx.close(), 260);
}

export function StudioButton({
  children,
  to,
  href,
  variant = 'primary',
  onClick,
}: {
  children: ReactNode;
  to?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}) {
  const className = `studioButton ${variant}`;
  const handleClick = () => {
    playPop();
    onClick?.();
  };
  if (to)
    return (
      <Link className={className} to={to} onClick={handleClick}>
        {children}
      </Link>
    );
  if (href)
    return (
      <a
        className={className}
        href={href}
        onClick={handleClick}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        target={href.startsWith('http') ? '_blank' : undefined}
      >
        {children}
      </a>
    );
  return (
    <button className={className} type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

export function ReducedMotionGate({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <>{children}</>;
}

function IdleFx({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    let id = 0;
    if (w.requestIdleCallback) {
      id = w.requestIdleCallback(() => setReady(true), { timeout: 2200 });
    } else {
      id = w.setTimeout(() => setReady(true), 400);
    }
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else w.clearTimeout(id);
    };
  }, []);
  if (!ready) return null;
  return <>{children}</>;
}

export function AudioReactiveWallpaper({
  variant = 'spiral',
  palette,
  coverUrl,
}: {
  variant?: string;
  palette?: SongPalette;
  coverUrl?: string;
}) {
  return <LiveWallpaper variant={variant} palette={palette} coverUrl={coverUrl} />;
}

export function BeatDancingTitle({ text }: { text: string }) {
  return (
    <h1 className="beatGoldTitle" aria-label={text}>
      {text}
    </h1>
  );
}

function hasAdConsent() {
  try {
    const raw = localStorage.getItem('3000-consent-v1');
    return raw ? (JSON.parse(raw) as { ads?: boolean }).ads === true : false;
  } catch {
    return false;
  }
}

export function AdSenseUnit({ slot, label = 'Advertisement' }: { slot?: string; label?: string }) {
  const clientId = adsenseClientId();
  useEffect(() => {
    if (!slot || !clientId || !hasAdConsent()) return;
    try {
      const target = window as unknown as { adsbygoogle?: unknown[] };
      target.adsbygoogle = target.adsbygoogle ?? [];
      target.adsbygoogle.push({});
    } catch {
      /* Ad blockers or pending AdSense approval can block the client script. */
    }
  }, [slot, clientId]);
  if (!slot || !clientId || !hasAdConsent()) return null;
  return (
    <aside className="adsenseSlot" aria-label={label}>
      <span>{label}</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', minHeight: 250 }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

export function PublicLayout({
  children,
  variant = 'spiral',
  compact = false,
}: {
  children: ReactNode;
  variant?: string;
  compact?: boolean;
}) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<{ wallpaper: string; cover?: string; palette?: SongPalette }>({
    wallpaper: variant,
  });
  useEffect(() => {
    const id = window.setTimeout(() => setTheme((prev) => ({ ...prev, wallpaper: variant })), 0);
    return () => window.clearTimeout(id);
  }, [variant]);
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(id);
  }, [location.pathname]);
  useEffect(() => {
    document.body.classList.toggle('vip-nav-open', open);
    return () => document.body.classList.remove('vip-nav-open');
  }, [open]);
  useEffect(() => {
    const onTheme = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        wallpaper?: string;
        cover?: string;
        palette?: SongPalette;
      };
      setTheme((prev) => ({
        wallpaper: detail.wallpaper || prev.wallpaper || variant,
        cover: detail.cover || prev.cover,
        palette: detail.palette || prev.palette,
      }));
    };
    window.addEventListener('3000-song-theme', onTheme as EventListener);
    return () => window.removeEventListener('3000-song-theme', onTheme as EventListener);
  }, [variant]);
  const wallpaperVariant = theme.wallpaper || variant;
  return (
    <div
      className={`vipSite vipSite-${variant} vipSite-live${open ? ' is-nav-open' : ''}${compact ? ' is-compact' : ''}`}
      data-page-wallpaper={variant}
      data-song-wallpaper={wallpaperVariant}
    >
      <div className="filmLetterbox top" aria-hidden="true" />
      <div className="filmLetterbox bottom" aria-hidden="true" />
      <div className="filmGrain" aria-hidden="true" />
      <div className="filmScan" aria-hidden="true" />
      <ReducedMotionGate>
        <IdleFx>
          <DeferredFxStyles />
          <AudioReactiveWallpaper
            variant={wallpaperVariant}
            palette={theme.palette}
            coverUrl={theme.cover}
          />
          <MouseFX />
          <ZombieFX />
          <ScrollFX />
        </IdleFx>
      </ReducedMotionGate>
      <div className="scrollProgress" aria-hidden="true" />
      <header className="vipHeader vipHeader--epic">
        <ReducedMotionGate>
          <ChromeWallpaper zone="header" />
        </ReducedMotionGate>
        <Link
          className="vipLogo"
          to="/"
          onClick={() => setOpen(false)}
          aria-label="3000 Studios VIP home"
        >
          <img
            className="officialProfileLogo"
            src="/media/official-3000-studios-profile.png"
            alt=""
          />
          <span className="logoStack">
            <strong className="logoWordmark">3000 Studios</strong>
            <small className="logoSub">VIP Media · Live · Music</small>
          </span>
        </Link>
        <nav
          id="vip-primary-nav"
          className={open ? 'vipNav vipNav--rail open' : 'vipNav vipNav--rail'}
          aria-label="Primary navigation"
        >
          <div className="vipNavMobileHead">
            <span className="vipNavMobileKicker">Navigate the VIP</span>
            <strong>3000 Studios</strong>
          </div>
          <div className="vipNavTrack">
            {navItems.map((item, index) => {
              const active = navIsActive(location.pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? 'vipNavLink is-active' : 'vipNavLink'}
                  data-active={active ? 'true' : undefined}
                  style={{ '--nav-i': index } as CSSProperties}
                  onClick={() => {
                    playPop();
                    setOpen(false);
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="vipNavIcon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="vipNavCopy">
                    <span className="vipNavLabel">{item.label}</span>
                    <span className="vipNavHint">{item.hint}</span>
                  </span>
                  <span className="vipNavGlow" aria-hidden="true" />
                </Link>
              );
            })}
          </div>
          <div className="vipNavMobileFoot">
            <a href={`mailto:${OWNER_EMAIL}`} className="vipNavCta">
              Book / License
            </a>
          </div>
        </nav>
        <GlobalMusicToggle className="vipHeaderMusic" />
        <button
          className={open ? 'vipMenu is-open' : 'vipMenu'}
          type="button"
          aria-expanded={open}
          aria-controls="vip-primary-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="vipMenuBars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="vipMenuText">{open ? 'Close' : 'Menu'}</span>
        </button>
        <button
          type="button"
          className={open ? 'vipNavBackdrop is-open' : 'vipNavBackdrop'}
          aria-label="Close navigation"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
        />
      </header>
      {children}
      {compact ? null : <div className="vipEnergyDivider" aria-hidden="true" />}
      <footer className={compact ? 'vipFooter vipFooter--slim' : 'vipFooter'}>
        <ReducedMotionGate>
          <ChromeWallpaper zone="footer" />
        </ReducedMotionGate>
        <div className="footerReactive" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <i key={index} style={{ '--footer-energy': (index % 7) * 0.045 } as CSSProperties} />
          ))}
        </div>
        <PlatformLogos />
        {compact ? null : (
          <>
            <div className="footerBrand">
              <strong className="shimmerText">3000 Studios</strong>
              <p>Official music, videos, TikTok/IG promo, and DistroKid HyperFollow.</p>
            </div>
            <div className="footerLinks">
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
              <Link to="/copyright">Copyright</Link>
              <Link to="/cookies">Cookies</Link>
              <Link to="/disclaimer">Disclaimer</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </>
        )}
      </footer>
      {compact ? null : <div className="vipEnergyDivider bottom" aria-hidden="true" />}
    </div>
  );
}
