import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  House,
  GameController,
  BookOpen,
  MusicNote,
  FilmStrip,
  Waveform,
  Microphone,
  ShoppingBag,
  Broadcast,
  Article,
  DeviceMobile,
  EnvelopeSimple,
  SpeakerHigh,
  SpeakerSlash,
  Play,
  Pause,
} from '@phosphor-icons/react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { LiveBand } from '../empire/LiveBand';
import { isSfxOn, playSfx, setSfxOn } from '../empire/sfx';
import { AERO_PLAY_URL, AERO_SITE_URL, SUPPORT_EMAIL } from '../empire/links';

type Item = { to: string; label: string; sub: string; icon: React.ReactNode; color: string; nav?: boolean };

const ITEMS: Item[] = [
  { to: '/', label: 'Home', sub: 'The empire', icon: <House size={20} weight="duotone" />, color: '#f2c867' },
  { to: '/aeropocalypse', label: 'Aeropocalypse', sub: 'Our game on Google Play', icon: <GameController size={22} weight="duotone" />, color: '#ff5a2c', nav: true },
  { to: '/books', label: 'Books', sub: '93 titles', icon: <BookOpen size={20} weight="duotone" />, color: '#f2c867', nav: true },
  { to: '/music', label: 'Music', sub: 'Songs and albums', icon: <MusicNote size={20} weight="duotone" />, color: '#9b6bff', nav: true },
  { to: '/video', label: 'Videos', sub: 'Music videos', icon: <FilmStrip size={20} weight="duotone" />, color: '#ff3d7f', nav: true },
  { to: '/podcast', label: 'Podcast', sub: 'Every episode', icon: <Microphone size={20} weight="duotone" />, color: '#3df2a8', nav: true },
  { to: '/beats', label: 'Beats', sub: 'Music for sale', icon: <Waveform size={20} weight="duotone" />, color: '#3ee8ff' },
  { to: '/shop', label: 'Shop', sub: 'Merch and VIP', icon: <ShoppingBag size={20} weight="duotone" />, color: '#f2c867', nav: true },
  { to: '/live', label: 'Live', sub: 'Live stream', icon: <Broadcast size={20} weight="duotone" />, color: '#ff3d3d' },
  { to: '/blog', label: 'Blog', sub: 'News and guides', icon: <Article size={20} weight="duotone" />, color: '#3ee8ff', nav: true },
  { to: '/apps', label: 'Apps', sub: 'Studio apps', icon: <DeviceMobile size={20} weight="duotone" />, color: '#3df2a8' },
  { to: '/contact', label: 'Contact', sub: SUPPORT_EMAIL, icon: <EnvelopeSimple size={20} weight="duotone" />, color: '#9b6bff', nav: true },
];

function activeItem(pathname: string): Item | undefined {
  if (pathname === '/') return ITEMS[0];
  if (pathname.startsWith('/song/')) return ITEMS.find((i) => i.to === '/music');
  if (pathname.startsWith('/thunder')) return ITEMS.find((i) => i.to === '/aeropocalypse');
  return ITEMS.find((i) => i.to !== '/' && (pathname === i.to || pathname.startsWith(`${i.to}/`)));
}

const short = (label: string) => (label === 'Aeropocalypse' ? 'Game' : label);

/** Animated 3000 Studios mark: the official badge inside two orbiting rings. */
function Logo() {
  return (
    <Link to="/" className="em-logo" aria-label="3000 Studios home">
      <span className="em-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40">
          <defs>
            <linearGradient id="emRingG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff3c9" />
              <stop offset="0.5" stopColor="#f2c867" />
              <stop offset="1" stopColor="#8a6a24" />
            </linearGradient>
            <clipPath id="emCoreClip">
              <circle cx="20" cy="20" r="12.5" />
            </clipPath>
          </defs>
          <g className="ring">
            <circle cx="20" cy="20" r="18.5" fill="none" stroke="url(#emRingG)" strokeWidth="1.4" strokeDasharray="22 6 4 6" />
          </g>
          <g className="ring2">
            <circle cx="20" cy="20" r="15.3" fill="none" stroke="#3ee8ff" strokeOpacity="0.7" strokeWidth="0.8" strokeDasharray="2 4" />
          </g>
          <g className="core">
            <image href="/media/official-3000-studios-profile-96.webp" x="7.5" y="7.5" width="25" height="25" clipPath="url(#emCoreClip)" />
          </g>
        </svg>
      </span>
      <span className="em-logo-word">
        <b>
          {'3000'.split('').map((c, i) => (
            <span key={i} style={{ '--i': i } as React.CSSProperties}>
              {c}
            </span>
          ))}
        </b>
        <small>STUDIOS</small>
      </span>
    </Link>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const music = useGlobalMusic();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [sfx, setSfx] = useState(isSfxOn);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const current = activeItem(pathname);

  /* Close the menu on navigation. */
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  /* Scroll: shrink + glass, hide on the way down, spring back on the way up,
     and a progress line along the bottom edge. One rAF per frame max. */
  useEffect(() => {
    let lastY = window.scrollY;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      headerRef.current?.style.setProperty('--em-scroll', (y / max).toFixed(4));
      setScrolled(y > 24);
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 260);
        lastY = y;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* Sliding page indicator under the desktop nav. */
  const movePill = useCallback((el: HTMLElement | null) => {
    const pill = pillRef.current;
    if (!pill) return;
    if (!el) {
      pill.style.opacity = '0';
      return;
    }
    pill.style.opacity = '1';
    pill.style.left = `${el.offsetLeft}px`;
    pill.style.width = `${el.offsetWidth}px`;
  }, []);
  const pillHome = useCallback(() => {
    movePill(navRef.current?.querySelector<HTMLElement>('a.is-active') ?? null);
  }, [movePill]);
  useLayoutEffect(() => {
    pillHome();
    // Webfonts change link widths once they load.
    void document.fonts?.ready.then(pillHome);
    window.addEventListener('resize', pillHome);
    return () => window.removeEventListener('resize', pillHome);
  }, [pathname, pillHome]);

  /* Menu: lock scroll, Escape closes, focus returns to the burger. */
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) burgerRef.current?.focus({ preventScroll: true });
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Swipe right, or down from the top, to close the menu. */
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const s = touch.current;
    touch.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const atTop = e.currentTarget.scrollTop <= 0;
    if ((dx > 80 && Math.abs(dy) < 60) || (atTop && dy > 110 && Math.abs(dx) < 60)) {
      playSfx('close');
      setOpen(false);
    }
  };

  const toggleMenu = () => {
    playSfx(open ? 'close' : 'open');
    setOpen((o) => !o);
  };
  const toggleSfx = () => {
    const next = !sfx;
    setSfxOn(next);
    setSfx(next);
    if (next) playSfx('tap');
  };

  return (
    <>
      <header
        ref={headerRef}
        className={`em-header${scrolled ? ' is-scrolled' : ''}${hidden && !open ? ' is-hidden' : ''}`}
      >
        <div className="em-header-bar">
          <LiveBand variant="header" />
          <Logo />
          <nav ref={navRef} className="em-nav" aria-label="Main" onMouseLeave={pillHome}>
            <span ref={pillRef} className="em-nav-pill" aria-hidden="true" />
            {ITEMS.filter((i) => i.nav).map((item, i) => {
              const active = current?.to === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={active ? 'is-active' : undefined}
                  aria-current={active ? 'page' : undefined}
                  style={{ '--i': i } as React.CSSProperties}
                  onMouseEnter={(e) => movePill(e.currentTarget)}
                  onFocus={(e) => movePill(e.currentTarget)}
                >
                  {short(item.label)}
                </Link>
              );
            })}
          </nav>
          <div className="em-header-actions">
            {current && (
              <span className="em-where" aria-label={`You are on ${current.label}`}>
                <i aria-hidden="true" />
                {short(current.label)}
              </span>
            )}
            <button
              type="button"
              className="em-iconbtn"
              onClick={music.toggle}
              aria-pressed={music.isPlaying}
              aria-label={music.isPlaying ? 'Pause music' : 'Play music'}
              title={music.isPlaying ? `Playing ${music.activeTitle}` : 'Play music'}
              data-em-silent
            >
              {music.isPlaying ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}
            </button>
            <button
              type="button"
              className="em-iconbtn"
              onClick={toggleSfx}
              aria-pressed={sfx}
              aria-label={sfx ? 'Turn click sounds off' : 'Turn click sounds on'}
              data-em-silent
            >
              {sfx ? <SpeakerHigh size={18} weight="duotone" /> : <SpeakerSlash size={18} weight="duotone" />}
            </button>
            <a
              className="em-btn em-subscribe"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Subscribe
            </a>
            <button
              ref={burgerRef}
              type="button"
              className={`em-burger${open ? ' is-open' : ''}`}
              aria-expanded={open}
              aria-controls="em-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={toggleMenu}
              data-em-silent
            >
              <span aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </button>
          </div>
          <span className="em-scrollline" aria-hidden="true" />
        </div>
      </header>

      <div
        id="em-menu"
        className={`em-menu${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span className="em-menu-scan" aria-hidden="true" />
        <div className="em-menu-hud" aria-hidden="true">
          <span>3000 Studios // nav</span>
          <span>{current ? `Now: ${current.label}` : 'Choose a page'}</span>
        </div>
        <nav className="em-menu-grid" aria-label="All pages">
          {ITEMS.map((item, i) => {
            const active = current?.to === item.to;
            const wide = item.to === '/aeropocalypse';
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`em-tile${active ? ' is-active' : ''}${wide ? ' wide' : ''}`}
                aria-current={active ? 'page' : undefined}
                style={{ '--i': i, '--c': item.color } as React.CSSProperties}
              >
                {item.icon}
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="t">{item.label}</span>
                  <span className="s">{item.sub}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="em-menu-foot">
          <a href={AERO_PLAY_URL} target="_blank" rel="noopener noreferrer">
            Get it on Google Play
          </a>
          <a href={AERO_SITE_URL} target="_blank" rel="noopener noreferrer">
            aeropocalypse.online
          </a>
          <a href="https://3000studios.substack.com" target="_blank" rel="noopener noreferrer">
            Substack
          </a>
          <a href="https://boughtitonline.com" target="_blank" rel="noopener noreferrer">
            Bought It Online
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </div>
        <p className="em-swipehint" aria-hidden="true">
          Swipe right to close
        </p>
      </div>
    </>
  );
}
