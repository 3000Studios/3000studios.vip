import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { type SongPalette } from '../data/music';
import {
  OFFICIAL_YOUTUBE_CHANNEL_URL,
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { getDailyBlogPosts } from '../data/blog';
import { LiveWallpaper } from '../components/LiveWallpaper';
import { MouseFX } from '../components/MouseFX';
import { ZombieFX } from '../components/ZombieFX';
import { ScrollFX } from '../components/ScrollFX';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';
const INTRO_VIDEO = '/media/spotify-signing.mp4';
const ADMIN_PATH = '/admin';
const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-5800977493749262';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

const navItems = [
  { to: '/', label: 'Home', icon: '⌂', hint: 'VIP lobby' },
  { to: '/music', label: 'Music', icon: '♪', hint: 'Full catalog' },
  { to: '/video', label: 'Video', icon: '▶', hint: 'Visuals' },
  { to: '/live', label: 'Live', icon: '●', hint: 'Broadcast' },
  { to: '/community', label: 'Chat', icon: '◎', hint: 'Community' },
  { to: '/requests', label: 'Requests', icon: '✦', hint: 'Song ideas' },
  { to: '/blog', label: 'Blog', icon: '◈', hint: 'Editorial' },
  { to: '/sponsors', label: 'Sponsors', icon: '◆', hint: 'Partners' },
  { to: '/about', label: 'About', icon: '◇', hint: 'The studio' },
  { to: '/contact', label: 'Contact', icon: '✉', hint: 'Book us' },
] as const;

function navIsActive(pathname: string, to: string) {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

const sponsors = [
  'Music video launch sponsor',
  'Live stream presenting sponsor',
  'Creator tools partner',
  'VIP drop product placement',
  'Community challenge sponsor',
  'Newsletter and blog sponsor',
];

const networkSites = [
  { name: '3000 Studios VIP', url: 'https://3000studios.vip', tag: 'Main Launch' },
  { name: 'Music Catalog', url: '/music', tag: 'Tracks' },
  { name: 'Live Stream', url: '/live', tag: 'Broadcast' },
  { name: 'Creator Ops', url: '/admin', tag: 'Private' },
];

type StoredMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

type RequestIdea = {
  id: string;
  name: string;
  idea: string;
  mood: string;
  votes: number;
  createdAt: string;
};

function safeDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function playPop() {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

function StudioButton({
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
  if (to) {
    return (
      <Link className={className} to={to} onClick={handleClick}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a className={className} href={href} onClick={handleClick} rel={href.startsWith('http') ? 'noreferrer' : undefined} target={href.startsWith('http') ? '_blank' : undefined}>
        {children}
      </a>
    );
  }
  return (
    <button className={className} type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

function AudioReactiveWallpaper({
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

function BeatDancingTitle({ text }: { text: string }) {
  return (
    <motion.h1 className="beatGoldTitle" variants={fadeUp} aria-label={text}>
      {Array.from(text).map((char, index) => (
        <span key={`${char}-${index}`} className={char === ' ' ? 'beatGoldSpace' : 'beatGoldLetter'} style={{ '--letter-index': index } as CSSProperties} aria-hidden="true">
          {char}
        </span>
      ))}
    </motion.h1>
  );
}

function AdSenseUnit({ slot, label = 'Advertisement' }: { slot?: string; label?: string }) {
  useEffect(() => {
    if (!slot) return;
    try {
      const target = window as unknown as { adsbygoogle?: unknown[] };
      target.adsbygoogle = target.adsbygoogle ?? [];
      target.adsbygoogle.push({});
    } catch {
      // Ad blockers or pending AdSense approval can block the client script.
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <aside className="adsenseSlot" aria-label={label}>
      <span>{label}</span>
      <ins className="adsbygoogle" style={{ display: 'block' }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </aside>
  );
}

function useStoredList<T>(key: string, fallback: T[]) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, key]);

  return [items, setItems] as const;
}

export function PublicLayout({ children, variant = 'spiral' }: { children: ReactNode; variant?: string }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<{ wallpaper: string; cover?: string; palette?: SongPalette }>({ wallpaper: variant });

  useEffect(() => {
    const id = window.setTimeout(() => { setTheme((prev) => ({ ...prev, wallpaper: variant })); }, 0);
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
      const detail = (e as CustomEvent).detail as { wallpaper?: string; cover?: string; palette?: SongPalette };
      setTheme((prev) => ({ wallpaper: detail.wallpaper || prev.wallpaper || variant, cover: detail.cover || prev.cover, palette: detail.palette || prev.palette }));
    };
    window.addEventListener('3000-song-theme', onTheme as EventListener);
    return () => window.removeEventListener('3000-song-theme', onTheme as EventListener);
  }, [variant]);

  const wallpaperVariant = theme.wallpaper || variant;

  return (
    <div className={`vipSite vipSite-${variant} vipSite-live${open ? ' is-nav-open' : ''}`} data-page-wallpaper={variant} data-song-wallpaper={wallpaperVariant}>
      <AudioReactiveWallpaper variant={wallpaperVariant} palette={theme.palette} coverUrl={theme.cover} />
      <MouseFX />
      <ZombieFX />
      <ScrollFX />
      <div className="scrollProgress" aria-hidden="true" />
      <header className="vipHeader vipHeader--epic">
        <Link className="vipLogo" to="/" onClick={() => setOpen(false)} aria-label="3000 Studios VIP home">
          <span className="logoOrb">3000</span>
          <span className="logoStack">
            <strong className="logoWordmark">3000 Studios</strong>
            <small className="logoSub">VIP Media · Live · Music</small>
          </span>
        </Link>

        <nav id="vip-primary-nav" className={open ? 'vipNav vipNav--rail open' : 'vipNav vipNav--rail'} aria-label="Primary navigation">
          <div className="vipNavMobileHead">
            <span className="vipNavMobileKicker">Navigate the VIP</span>
            <strong>3000 Studios</strong>
          </div>
          <div className="vipNavTrack">
            {navItems.map((item, index) => {
              const active = navIsActive(location.pathname, item.to);
              return (
                <Link key={item.to} to={item.to} className={active ? 'vipNavLink is-active' : 'vipNavLink'} data-active={active ? 'true' : undefined} style={{ '--nav-i': index } as CSSProperties} onClick={() => { playPop(); setOpen(false); }} aria-current={active ? 'page' : undefined}>
                  <span className="vipNavIcon" aria-hidden="true">{item.icon}</span>
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
            <a href={`mailto:${OWNER_EMAIL}`} className="vipNavCta">Book / License</a>
          </div>
        </nav>

        <button className={open ? 'vipMenu is-open' : 'vipMenu'} type="button" aria-expanded={open} aria-controls="vip-primary-nav" onClick={() => setOpen((value) => !value)}>
          <span className="vipMenuBars" aria-hidden="true"><i /><i /><i /></span>
          <span className="vipMenuText">{open ? 'Close' : 'Menu'}</span>
        </button>

        <button type="button" className={open ? 'vipNavBackdrop is-open' : 'vipNavBackdrop'} aria-label="Close navigation" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} />
      </header>
      {children}
      <div className="vipEnergyDivider" aria-hidden="true" />
      <footer className="vipFooter">
        <div className="footerBrand">
          <strong className="shimmerText">3000 Studios</strong>
          <p>Music, cinematic video content, live streams, sponsorships, song requests, and private creator operations.</p>
        </div>
        <div className="footerLinks">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/copyright">Copyright</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/disclaimer">Disclaimer</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
      <div className="vipEnergyDivider bottom" aria-hidden="true" />
    </div>
  );
}

export function Home() {
  const checkoutHref = import.meta.env.VITE_STRIPE_PAYMENT_LINK || import.meta.env.VITE_STRIPE_BASIC_LINK || `mailto:${OWNER_EMAIL}?subject=3000%20Studios%20music%20purchase`;

  return (
    <PublicLayout variant="spiral">
      <main className="vipMain">
        <section className="redCarpetHero">
          <video src={INTRO_VIDEO} autoPlay muted loop playsInline preload="auto" />
          <div className="carpetDepth" aria-hidden="true" />
          <motion.div className="heroCopy heroCopy--yt" initial="hidden" animate="show" variants={stagger}>
            <motion.span className="vipKicker" variants={fadeUp}>YouTube · DistroKid · Official artist</motion.span>
            <BeatDancingTitle text="3000 Studios" />
            <motion.p variants={fadeUp}>Official music videos and DistroKid releases. Subscribe so YouTube actually puts the next drop in your feed.</motion.p>
            <motion.div className="heroFeature" variants={fadeUp}>
              <a className="heroFeatureCard" href="https://www.youtube.com/watch?v=tIY1WU9N_RU" target="_blank" rel="noreferrer">
                <img src="/media/covers/not-giving-up-tonight.jpg" alt="Not Giving Up Tonight official video" />
                <span>
                  <small>Live on DistroKid + YouTube</small>
                  <strong>Not Giving Up Tonight</strong>
                </span>
              </a>
            </motion.div>
            <motion.div className="heroActions" variants={fadeUp}>
              <a className="studioButton ytCta" href="https://www.youtube.com/@3000Studio?sub_confirmation=1" target="_blank" rel="noreferrer">Subscribe on YouTube</a>
              <StudioButton href="https://www.youtube.com/watch?v=tIY1WU9N_RU" variant="secondary">Watch the video</StudioButton>
              <StudioButton to="/music" variant="ghost">Full catalog</StudioButton>
              <StudioButton href={checkoutHref} variant="ghost">Buy Or Book</StudioButton>
            </motion.div>
          </motion.div>
        </section>

        <section className="ytSubscribeBar" aria-label="YouTube subscribe">
          <div className="ytSubscribeInner">
            <p className="ytSubscribeKicker">Official artist channel</p>
            <h2>Watch the videos. Subscribe @3000Studio.</h2>
            <p>New official videos, DistroKid releases, and 3000 Studios drops. Tap subscribe so YouTube actually shows you the next one.</p>
            <div className="heroActions">
              <StudioButton href="https://www.youtube.com/@3000Studio?sub_confirmation=1">Subscribe</StudioButton>
              <StudioButton href="https://www.youtube.com/watch?v=tIY1WU9N_RU" variant="secondary">Not Giving Up Tonight</StudioButton>
            </div>
          </div>
        </section>

        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_HOME_SLOT} />

        <motion.section className="vipSection featureRail" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger}>
          {[['Music Showcase', 'Original tracks, playable previews, direct purchase and licensing paths.'], ['Live Stream', 'Cloudflare Stream-ready playback plus a protected owner stream console.'], ['Community Chat', 'Visitor chat and song ideas that can upgrade to Firebase or D1 persistence.'], ['Sponsor Inventory', 'Clear placements for launch partners, video sponsors, and creator tools.']].map(([title, copy]) => (
            <motion.article className="vipCard" key={title} variants={fadeUp}><h2>{title}</h2><p>{copy}</p></motion.article>
          ))}
        </motion.section>

        <motion.section className="vipSection networkSection" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>3000 Studios Network</motion.span>
          <motion.h2 variants={fadeUp}>All doors open for VIP members</motion.h2>
          <div className="networkGrid">
            {networkSites.map((site) => (
              <motion.article className="vipCard networkCard" key={site.name} variants={fadeUp}>
                <span className="networkTag">{site.tag}</span>
                <h3>{site.name}</h3>
                <StudioButton to={site.url.startsWith('http') ? undefined : site.url} href={site.url.startsWith('http') ? site.url : undefined} variant="secondary">Enter</StudioButton>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </PublicLayout>
  );
}

function ReleaseCarousel({ activeIndex, onSelect }: { activeIndex: number; onSelect: (index: number) => void }) {
  const [frontIndex, setFrontIndex] = useState(activeIndex);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const count = officialReleaseVideos.length;
  const step = 360 / count;

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setFrontIndex((index) => (index + 1) % count), 2400);
    return () => window.clearInterval(timer);
  }, [count, paused]);

  const move = (direction: number) => setFrontIndex((index) => (index + direction + count) % count);
  const select = (index: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setFrontIndex(index);
    onSelect(index);
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    suppressClick.current = false;
    setPaused(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(distance) > 38) {
      suppressClick.current = true;
      move(distance < 0 ? 1 : -1);
    }
  };

  return (
    <div
      className="releaseCarousel"
      role="region"
      aria-label="Official release preview carousel"
      tabIndex={0}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
      onPointerDown={startDrag}
      onPointerUp={endDrag}
      onPointerCancel={() => { dragStart.current = null; }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <p className="releaseCarouselHint">Swipe or use arrows · Tap a thumbnail to play</p>
      <div className="releaseCarouselViewport">
        <div className="releaseCarouselRing" style={{ transform: `rotateY(${-frontIndex * step}deg)` }}>
          {officialReleaseVideos.map((release, index) => (
            <button
              type="button"
              key={release.videoId}
              className={index === activeIndex ? 'releaseCarouselCard is-playing' : 'releaseCarouselCard'}
              style={{ transform: `rotateY(${index * step}deg) translateZ(var(--carousel-radius))` }}
              onClick={() => select(index)}
              aria-label={`Play ${release.title} in the main player`}
              aria-pressed={index === activeIndex}
              tabIndex={index === frontIndex ? 0 : -1}
            >
              <span className="releasePreviewArt">
                <img src={youtubeArtworkUrl(release.videoId)} alt={`${release.title} video thumbnail`} loading="lazy" draggable="false" />
                <span className="releasePreviewPlay" aria-hidden="true">▶</span>
                <small>{release.duration}</small>
              </span>
              <span className="releasePreviewTitle">{release.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="releaseCarouselControls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous release">‹</button>
        <span>{frontIndex + 1} / {count}</span>
        <button type="button" onClick={() => move(1)} aria-label="Next release">›</button>
      </div>
    </div>
  );
}

export function MusicShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const activeSong = officialReleaseVideos[activeIndex] ?? officialReleaseVideos[0];
  const pick = (index: number) => setActiveIndex(((index % officialReleaseVideos.length) + officialReleaseVideos.length) % officialReleaseVideos.length);
  const preview = (index: number) => {
    pick(index);
    window.setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };

  return (
    <PublicLayout variant="vortex">
      <main className="vipMain dkMusicPage">
        <div className="dkArtFill" style={{ backgroundImage: `url(${youtubeArtworkUrl(activeSong.videoId)})` }} aria-hidden="true" />
        <div className="dkArtDim" aria-hidden="true" />
        <section className="dkStage" aria-label="DistroKid releases">
          <p className="vipKicker dkKicker">DistroKid · Official YouTube catalog</p>
          <div className="dkDock" ref={playerRef}>
            <button type="button" className="dkArrow" onClick={() => pick(activeIndex - 1)} aria-label="Previous release">
              ‹
            </button>
            <div className="dkHero">
              <iframe className="dkOfficialEmbed" src={youtubeEmbedUrl(activeSong.videoId)} title={`${activeSong.title} official video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
              <div className="dkMeta">
                <h1>{activeSong.title}</h1>
                <p>3000 Studios · {activeSong.release} · {activeSong.duration}</p>
                <div className="dkActions">
                  <a className="studioButton ytCta" href={youtubeWatchUrl(activeSong.videoId)} target="_blank" rel="noreferrer">Open on YouTube</a>
                  <a className="studioButton secondary" href={OFFICIAL_YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">Official channel</a>
                </div>
              </div>
            </div>
            <button type="button" className="dkArrow" onClick={() => pick(activeIndex + 1)} aria-label="Next release">
              ›
            </button>
          </div>
          <ReleaseCarousel key={`music-${activeIndex}`} activeIndex={activeIndex} onSelect={preview} />
        </section>
      </main>
    </PublicLayout>
  );
}

export function VideoPage() {
  const [featuredVideoId, setFeaturedVideoId] = useState(officialReleaseVideos[0].videoId);
  const playerRef = useRef<HTMLDivElement | null>(null);
  const featured = officialReleaseVideos.find((video) => video.videoId === featuredVideoId) ?? officialReleaseVideos[0];
  const activeIndex = officialReleaseVideos.findIndex((video) => video.videoId === featured.videoId);
  const preview = (index: number) => {
    setFeaturedVideoId(officialReleaseVideos[index].videoId);
    window.setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
  };
  return (
    <PublicLayout variant="electric">
      <main className="vipMain videoPage">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Official music videos</motion.span>
          <motion.h1 variants={fadeUp}>Watch here. Support the official 3000 Studios channel.</motion.h1>
          <motion.p variants={fadeUp}>Only DistroKid-confirmed releases matched to the Official Artist Channel are included.</motion.p>
        </motion.section>
        <section className="officialCinema">
          <div className="officialCinemaFeature" ref={playerRef}>
            <iframe src={youtubeEmbedUrl(featured.videoId)} title={`${featured.title} official music video`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            <div><span className="vipKicker">Now screening</span><h2>{featured.title}</h2><p>{featured.release} · {featured.duration}</p><a className="studioButton secondary" href={youtubeWatchUrl(featured.videoId)} target="_blank" rel="noreferrer">Open on YouTube</a></div>
          </div>
          <ReleaseCarousel key={`video-${activeIndex}`} activeIndex={activeIndex} onSelect={preview} />
        </section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_VIDEO_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function LivePage() {
  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Live stream</motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live when the broadcast is active.</motion.h1>
          <motion.p variants={fadeUp}>Public playback is powered by Cloudflare's hosted Stream Player. When you go live from the owner admin console or OBS, this embed serves the Stream feed. Stream keys stay in Cloudflare and OBS only.</motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <StudioButton to={ADMIN_PATH}>Owner Admin Console</StudioButton>
            <StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20live%20stream`} variant="secondary">Stream Inquiry</StudioButton>
          </motion.div>
        </motion.section>
        <section className="streamPublicPanel"><div className="cfStreamShell"><CloudflareStreamPlayer title="3000 Studios live stream" /></div></section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_LIVE_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function CommunityPage() {
  const [messages, setMessages] = useStoredList<StoredMessage>('3000studios-chat-v1', []);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [{ id: crypto.randomUUID(), name: name.trim() || 'VIP Guest', message: message.trim().slice(0, 280), createdAt: new Date().toISOString() }, ...current]);
    setMessage('');
  }
  return (
    <PublicLayout variant="pulse">
      <main className="vipMain">
        <motion.section className="vipPageHero compact" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Community chat room</motion.span>
          <motion.h1 variants={fadeUp}>Talk music, videos, live drops, and next-song ideas.</motion.h1>
        </motion.section>
        <section className="interactionGrid">
          <form className="vipForm" onSubmit={submit}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Display name" maxLength={42} />
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a clean community message" maxLength={280} />
            <StudioButton>Post Message</StudioButton>
          </form>
          <div className="messageList">
            {messages.length === 0 ? <p>No messages on this device yet. Start the room.</p> : null}
            {messages.map((item) => (<article className="messageCard" key={item.id}><strong>{item.name}</strong><span>{safeDate(item.createdAt)}</span><p>{item.message}</p></article>))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export function RequestsPage() {
  const [ideas, setIdeas] = useStoredList<RequestIdea>('3000studios-requests-v1', []);
  const [name, setName] = useState('');
  const [mood, setMood] = useState('cinematic');
  const [idea, setIdea] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!idea.trim()) return;
    setIdeas((current) => [{ id: crypto.randomUUID(), name: name.trim() || 'VIP Listener', mood, idea: idea.trim().slice(0, 360), votes: 1, createdAt: new Date().toISOString() }, ...current]);
    setIdea('');
  }
  return (
    <PublicLayout variant="goldwave">
      <main className="vipMain">
        <motion.section className="vipPageHero compact" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Song request board</motion.span>
          <motion.h1 variants={fadeUp}>Tell 3000 Studios what the next song should be about.</motion.h1>
        </motion.section>
        <section className="interactionGrid">
          <form className="vipForm" onSubmit={submit}>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" maxLength={42} />
            <select value={mood} onChange={(event) => setMood(event.target.value)}>
              <option value="cinematic">Cinematic</option>
              <option value="street">Street anthem</option>
              <option value="club">Club energy</option>
              <option value="spiritual">Spiritual</option>
              <option value="story">Storytelling</option>
            </select>
            <textarea value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="The next song should be about..." maxLength={360} />
            <StudioButton>Submit Idea</StudioButton>
          </form>
          <div className="messageList">
            {ideas.length === 0 ? <p>No song ideas on this device yet.</p> : null}
            {ideas.map((item) => (
              <article className="messageCard requestCard" key={item.id}>
                <strong>{item.idea}</strong>
                <span>{item.name} / {item.mood} / {safeDate(item.createdAt)}</span>
                <button type="button" onClick={() => setIdeas((current) => current.map((ideaItem) => (ideaItem.id === item.id ? { ...ideaItem, votes: ideaItem.votes + 1 } : ideaItem)))}>Vote {item.votes}</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export function BlogPage() {
  const posts = useMemo(() => getDailyBlogPosts(new Date()), []);
  return (
    <PublicLayout variant="nebula">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Daily auto blog</motion.span>
          <motion.h1 variants={fadeUp}>Search-ready music, video, live stream, and sponsor content.</motion.h1>
          <motion.p variants={fadeUp}>Cards refresh once per day with site-update stories and SEO evergreen posts — including images and video when available.</motion.p>
        </motion.section>
        <section className="blogGrid blogGrid--media">
          {posts.map((post) => (
            <article className="blogCard blogCard--media" key={post.id} data-reveal>
              <div className="blogMedia">
                {post.video ? (<video src={post.video} muted playsInline loop autoPlay preload="metadata" poster={post.image} />) : (<img src={post.image} alt="" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = '/favicon.svg'; }} />)}
                <span className="blogCat">{post.category}</span>
              </div>
              <span className="blogDate">{safeDate(post.date)}</span>
              <h2>{post.title}</h2><p>{post.summary}</p>
              <strong className="blogKeywords">{post.keywords}</strong>
            </article>
          ))}
        </section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_BLOG_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function SponsorsPage() {
  const loop = [...sponsors, ...sponsors];
  return (
    <PublicLayout variant="chrome">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>Sponsorships</motion.span>
          <motion.h1 variants={fadeUp}>Sponsor the next 3000 Studios music and video rollout.</motion.h1>
          <motion.p variants={fadeUp}>Built for music brands, creator tools, local businesses, labels, production partners, and stream sponsors.</motion.p>
          <motion.div variants={fadeUp}><StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20sponsorship`}>Request Sponsor Package</StudioButton></motion.div>
        </motion.section>
        <section className="sponsorMarquee" aria-label="Sponsor inventory">
          <div className="sponsorMarqueeTrack">
            {loop.map((item, i) => (<article className="vipCard sponsorMarqueeCard" key={`${item}-${i}`}><h2>{item}</h2><p>Available for approved partners only. Placement, usage, and disclosures are reviewed before publication.</p></article>))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export function AboutPage() {
  return (
    <PublicLayout variant="electric">
      <main className="vipMain">
        <section className="vipPageHero">
          <span className="vipKicker">About</span>
          <h1>3000 Studios is a music, video, and creator media brand.</h1>
          <p>Built for original releases, live moments, fan feedback, sponsor packages, and premium digital rollouts.</p>
        </section>
      </main>
    </PublicLayout>
  );
}

export function ContactPage() {
  return (
    <PublicLayout variant="pulse">
      <main className="vipMain">
        <section className="vipPageHero">
          <span className="vipKicker">Contact Us</span>
          <h1>Book music, video, sponsorship, licensing, or live stream support.</h1>
          <p>Reach 3000 Studios directly by email for releases, budgets, timelines, rights, Spotify account access, and booking.</p>
        </section>
        <section className="contactEmailBlock" aria-label="Contact email">
          <div className="contactEmailInner">
            <p className="contactEmailLabel">Primary contact email</p>
            <p className="contactEmailValue"><a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a></p>
            <p className="contactEmailNote">Owner / artist: 3000 Studios · Write to <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a> with your project details.</p>
            <StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20contact`}>Email {OWNER_EMAIL}</StudioButton>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'copyright' | 'cookies' | 'disclaimer' }) {
  const content = {
    privacy: { title: 'Privacy Policy', text: '3000 Studios VIP limits personal data collection to contact requests, site operations, security, analytics, advertising measurement, legal compliance, and optional community submissions. Google AdSense may use cookies or similar technologies to serve and measure ads when ad serving is active. Do not submit sensitive personal information in public forms.' },
    terms: { title: 'Terms Of Use', text: 'By using this site you agree to lawful use, respectful community behavior, no scraping or abuse, and no unauthorized copying of music, videos, visuals, source code, private streams, or protected admin content.' },
    copyright: { title: 'Copyright And DMCA', text: 'All original music, video, graphics, branding, and site content are owned by 3000 Studios or their respective rights holders. For takedown or licensing requests, send a detailed notice to the contact email.' },
    cookies: { title: 'Cookie Notice', text: 'The site may use necessary storage for preferences, local community entries, playback settings, security, analytics, AdSense advertising, fraud prevention, and advertising review. Browser controls can clear local data at any time.' },
    disclaimer: { title: 'Legal Disclaimer', text: 'The site provides music, media, entertainment, community, and business information. It is not legal, financial, medical, or professional advice. Sponsorships and offers require separate written approval.' },
  }[type];

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <section className="vipPageHero legalHero">
          <span className="vipKicker">Legal</span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
          <p>Contact: <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a></p>
        </section>
      </main>
    </PublicLayout>
  );
}
