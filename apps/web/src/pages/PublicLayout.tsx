import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { GlobalMusicToggle } from '../components/GlobalMusic';
import { ZombieFX } from '../components/ZombieFX';
import { ScrollFX } from '../components/ScrollFX';
import { PlatformLogos } from '../components/PlatformLogos';
import { ChromeWallpaper } from '../components/ChromeWallpaper';
import { type SongPalette } from '../data/music';
import { adsenseClientId } from '../lib/adsense';
import { usePrefersReducedMotion } from '../lib/mediaQuery';
import { fadeUp } from './PageMotion';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const navItems = [
  { to: '/', label: 'Home', icon: '⌂', hint: 'Studio Lobby' },
  { to: '/music', label: 'Music', icon: '♪', hint: '47 Songs' },
  { to: '/video', label: 'Video', icon: '▶', hint: 'Visuals' },
  { to: '/live', label: 'Live', icon: '●', hint: 'Broadcast' },
  { to: '/thunder-dome', label: 'Thunder Dome', icon: '🛸', hint: '24 Bosses' },
  { to: '/apps', label: 'Apps', icon: '⚡', hint: 'Software Lab' },
  { to: '/projects', label: 'Projects', icon: '✦', hint: 'Engineering' },
  { to: '/blog', label: 'Blog', icon: '◈', hint: 'Insights' },
  { to: '/shop', label: 'Shop', icon: '▣', hint: 'Merch' },
  { to: '/vip', label: 'VIP', icon: '★', hint: 'Vault Passes' },
  { to: '/community', label: 'Chat', icon: '◎', hint: 'Community' },
  { to: '/requests', label: 'Requests', icon: '♬', hint: 'Pitch Songs' },
  { to: '/sponsors', label: 'Sponsors', icon: '◆', hint: 'Partners' },
  { to: '/about', label: 'About', icon: '◇', hint: 'The Studio' },
  { to: '/contact', label: 'Contact', icon: '✉', hint: 'Direct Inquiry' },
  { to: '/admin', label: 'Admin', icon: '⚙', hint: 'Owner Console' },
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

import { ThreeReactiveBackground } from '../components/ThreeReactiveBackground';

export function AudioReactiveWallpaper() {
  return <ThreeReactiveBackground />;
}

export function BeatDancingTitle({ text }: { text: string }) {
  return (
    <motion.h1 className="beatGoldTitle" variants={fadeUp} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span
          key={`${char}-${index}`}
          className={char === ' ' ? 'beatGoldSpace' : 'beatGoldLetter'}
          style={{ '--letter-index': index } as CSSProperties}
          aria-hidden="true"
        >
          {char}
        </span>
      ))}
    </motion.h1>
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
        <AudioReactiveWallpaper />
        <ZombieFX />
        <ScrollFX />
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
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </main>
      {compact ? null : <div className="vipEnergyDivider" aria-hidden="true" />}
      <footer className="vipFooter" style={{ background: '#040508', borderTop: '1px solid rgba(255, 215, 0, 0.25)', padding: '48px 20px 100px' }}>
        <ReducedMotionGate>
          <ChromeWallpaper zone="footer" />
        </ReducedMotionGate>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <PlatformLogos />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, margin: '36px 0 32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <img src="/media/official-3000-studios-profile.png" alt="3000 Studios" style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #ffd700' }} />
                <strong style={{ color: '#ffd700', fontSize: 18, fontFamily: 'Syne, sans-serif' }}>3000 STUDIOS</strong>
              </div>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>
                Original music label, game studio, AI laboratory, and digital software creators. We build the things we want to exist.
              </p>
              <div style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>
                Owner & Producer: Jeremy Swain
              </div>
            </div>

            <div>
              <span style={{ color: '#00f0ff', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14 }}>
                Studio Ecosystem
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <li><Link to="/music" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>♪ 47-Song Catalog</Link></li>
                <li><Link to="/video" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>▶ Official Video Cinema</Link></li>
                <li><Link to="/live" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>● Live Broadcast Stage</Link></li>
                <li><Link to="/thunder-dome" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>🛸 Thunder Dome (24 Bosses)</Link></li>
                <li><Link to="/apps" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>⚡ Software & Apps Lab</Link></li>
                <li><Link to="/projects" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>✦ Engineering Projects</Link></li>
              </ul>
            </div>

            <div>
              <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14 }}>
                Commerce & Community
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <li><Link to="/shop" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>▣ VIP Drops & Merch</Link></li>
                <li><Link to="/vip" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>★ VIP Vault Membership</Link></li>
                <li><Link to="/community" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>◎ Community Chat Lounge</Link></li>
                <li><Link to="/requests" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>♬ Pitch Song Ideas</Link></li>
                <li><Link to="/blog" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>◈ Engineering Blog</Link></li>
                <li><Link to="/sponsors" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>◆ Brand Partnerships</Link></li>
              </ul>
            </div>

            <div>
              <span style={{ color: '#a855f7', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 14 }}>
                Trust & Legal
              </span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
                <li><Link to="/about" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>About 3000 Studios</Link></li>
                <li><Link to="/contact" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>Contact & Booking</Link></li>
                <li><Link to="/privacy" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>Privacy Policy</Link></li>
                <li><Link to="/terms" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>Terms of Service</Link></li>
                <li><Link to="/copyright" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>Copyright & Licensing</Link></li>
                <li><Link to="/cookies" style={{ color: 'var(--vip-cream)', textDecoration: 'none' }}>Cookie Preferences</Link></li>
                <li><Link to="/admin" style={{ color: 'rgba(255, 215, 0, 0.4)', textDecoration: 'none', fontSize: 12 }}>⚙ Studio Admin</Link></li>
              </ul>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 215, 0, 0.15)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--vip-text-muted)' }}>
            <div>
              © {new Date().getFullYear()} 3000 Studios. All Rights Reserved. Production by Jeremy Swain.
            </div>
            <div>
              Canonical Host: <strong style={{ color: '#ffd700' }}>3000studios.vip</strong> · Deployed via Cloudflare Edge
            </div>
          </div>
        </div>
      </footer>
      {compact ? null : <div className="vipEnergyDivider bottom" aria-hidden="true" />}
    </div>
  );
}
