import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { rolloutSongs } from '../data/music';
import { VipExperience, VipLeaderboard } from '../components/VipExperience';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const INTRO_VIDEO = '/media/spotify-signing.mp4';
const DEFAULT_TRACK = '/media/always-feel-like.mp3';
const ADMIN_PATH = '/vault/stream';
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
  { to: '/', label: 'Home' },
  { to: '/music', label: 'Music' },
  { to: '/video', label: 'Video' },
  { to: '/live', label: 'Live' },
  { to: '/community', label: 'Chat' },
  { to: '/requests', label: 'Requests' },
  { to: '/blog', label: 'Blog' },
  { to: '/sponsors', label: 'Sponsors' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const blogSeeds = [
  {
    title: 'Independent Music Video Production Built For Search, Streams, And Sponsors',
    keywords:
      'independent music video production, cinematic artist branding, sponsor-ready video content, Atlanta creator rollout, premium music marketing',
    summary:
      '3000 Studios VIP connects original music, cinematic video, sponsor inventory, and search-ready editorial into one conversion-focused media destination.',
  },
  {
    title: 'How 3000 Studios Turns Music Releases Into A Full VIP Media Experience',
    keywords:
      'music release strategy, VIP music showcase, creator monetization, live streaming studio, fan engagement platform',
    summary:
      'A release should work as more than a song page. It should drive watch time, licensing interest, community activity, and direct buyer action.',
  },
  {
    title: 'Live Streaming, Song Requests, And Community Chat For Modern Music Brands',
    keywords:
      'live music stream, song request board, community chat room, music fan engagement, Cloudflare Stream playback',
    summary:
      'The site gives fans a direct path to listen, watch, request new song ideas, and follow the next 3000 Studios live broadcast.',
  },
];

const sponsors = [
  'Music video launch sponsor',
  'Live stream presenting sponsor',
  'Creator tools partner',
  'VIP drop product placement',
  'Community challenge sponsor',
  'Newsletter and blog sponsor',
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
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  );
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
  }
  return (
    <button className={className} type="button" onClick={handleClick}>
      {children}
    </button>
  );
}

function AudioReactiveWallpaper({ variant = 'spiral' }: { variant?: string }) {
  return (
    <div className={`vipWallpaper ${variant}`} aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function BeatDancingTitle({ text }: { text: string }) {
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
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
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

function MusicController() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeTitle, setActiveTitle] = useState('Always Feel Like');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.38;
    audio.muted = muted;
    const playAttempt = audio.play();
    if (playAttempt) {
      void playAttempt.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  }, [muted]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function connectAnalyzer() {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      document.documentElement.style.setProperty('--beat', avg.toFixed(3));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }

  function playTrack(src: string, title: string) {
    const audio = audioRef.current;
    if (!audio) return;
    connectAnalyzer();
    if (!audio.src.endsWith(src)) {
      audio.src = src;
      audio.currentTime = 0;
    }
    audio.muted = muted;
    void audio.play().then(() => {
      setActiveTitle(title);
      setIsPlaying(true);
    });
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    connectAnalyzer();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    void audio.play().then(() => setIsPlaying(true));
  }

  return (
    <div className="globalPlayer" aria-label="Site music player">
      <audio ref={audioRef} src={DEFAULT_TRACK} preload="auto" loop />
      <div>
        <span>Now playing</span>
        <strong>{activeTitle}</strong>
      </div>
      <button type="button" onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={() => setMuted((current) => !current)}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <select
        aria-label="Select track"
        value={activeTitle}
        onChange={(event) => {
          const song = rolloutSongs.find((item) => item.title === event.target.value);
          if (song) playTrack(song.src, song.title);
        }}
      >
        {rolloutSongs.map((song) => (
          <option key={song.title} value={song.title}>
            {song.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export function PublicLayout({ children, variant = 'spiral' }: { children: ReactNode; variant?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`vipSite vipSite-${variant}`}>
      <AudioReactiveWallpaper variant={variant} />
      <header className="vipHeader">
        <AudioReactiveWallpaper variant="global" />
        <Link className="vipLogo" to="/" onClick={() => setOpen(false)} aria-label="3000 Studios VIP home">
          <span className="logoOrb">3000</span>
          <strong>3000 Studios</strong>
        </Link>
        <nav className={open ? 'vipNav open' : 'vipNav'} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>
        <button className="vipMenu" type="button" onClick={() => setOpen((value) => !value)}>
          {open ? 'Close' : 'Menu'}
        </button>
      </header>
      <MusicController />
      {children}
      <div className="vipEnergyDivider" aria-hidden="true" />
      <footer className="vipFooter">
        <AudioReactiveWallpaper variant="global" />
        <VipLeaderboard />
        <div className="footerBrand">
          <strong>3000 Studios</strong>
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
  const checkoutHref =
    import.meta.env.VITE_STRIPE_PAYMENT_LINK ||
    import.meta.env.VITE_STRIPE_BASIC_LINK ||
    `mailto:${OWNER_EMAIL}?subject=3000%20Studios%20music%20purchase`;

  return (
    <PublicLayout variant="spiral">
      <VipExperience />
      <main className="vipMain">
        <section className="redCarpetHero">
          <video src={INTRO_VIDEO} autoPlay muted loop playsInline preload="auto" />
          <div className="carpetDepth" aria-hidden="true" />
          <motion.div className="heroCopy" initial="hidden" animate="show" variants={stagger}>
            <motion.span className="vipKicker" variants={fadeUp}>
              Music video content live stream
            </motion.span>
            <BeatDancingTitle text="3000 Studios" />
            <motion.p variants={fadeUp}>
              A premium music and video destination with live streaming, animated sound-reactive wallpapers,
              sponsor-ready pages, community requests, and VIP creator operations.
            </motion.p>
            <motion.div className="heroActions" variants={fadeUp}>
              <StudioButton to="/live">Watch Live</StudioButton>
              <StudioButton to="/music" variant="secondary">
                Hear Music
              </StudioButton>
              <StudioButton href={checkoutHref} variant="ghost">
                Buy Or Book
              </StudioButton>
            </motion.div>
          </motion.div>
        </section>

        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_HOME_SLOT} />

        <motion.section className="vipSection featureRail" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger}>
          {[
            ['Music Showcase', 'Original tracks, playable previews, direct purchase and licensing paths.'],
            ['Live Stream', 'Cloudflare Stream-ready playback plus a protected owner stream console.'],
            ['Community Chat', 'Visitor chat and song ideas that can upgrade to Firebase or D1 persistence.'],
            ['Sponsor Inventory', 'Clear placements for launch partners, video sponsors, and creator tools.'],
          ].map(([title, copy]) => (
            <motion.article className="vipCard" key={title} variants={fadeUp}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </motion.article>
          ))}
        </motion.section>
      </main>
    </PublicLayout>
  );
}

export function MusicShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [shouldPlaySelected, setShouldPlaySelected] = useState(false);
  const selectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeSong = rolloutSongs[activeIndex] ?? rolloutSongs[0];

  useEffect(() => {
    const audio = selectedAudioRef.current;
    if (!audio || !shouldPlaySelected) return;
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, [activeSong.src, shouldPlaySelected]);

  const selectSong = (index: number) => {
    playPop();
    setShouldPlaySelected(true);
    if (index === activeIndex && selectedAudioRef.current) {
      selectedAudioRef.current.currentTime = 0;
      void selectedAudioRef.current.play().catch(() => undefined);
    }
    setActiveIndex(index);
  };

  const moveCarousel = (direction: -1 | 1) => {
    const nextIndex = (activeIndex + direction + rolloutSongs.length) % rolloutSongs.length;
    selectSong(nextIndex);
  };

  const getCarouselSlot = (index: number) => {
    const length = rolloutSongs.length;
    const rawOffset = index - activeIndex;
    const wrappedOffset =
      rawOffset > length / 2 ? rawOffset - length : rawOffset < -length / 2 ? rawOffset + length : rawOffset;
    if (wrappedOffset === 0) return 'middle';
    if (wrappedOffset === -1) return 'left';
    if (wrappedOffset === 1) return 'right';
    if (wrappedOffset < -1) return 'left-hidden';
    return 'right-hidden';
  };

  return (
    <PublicLayout variant="vortex">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Music showcase
          </motion.span>
          <motion.h1 variants={fadeUp}>Original tracks with sound-reactive motion.</motion.h1>
          <motion.p variants={fadeUp}>
            Play the current 3000 Studios catalog, open the featured song page, and route purchases or licensing inquiries through real contact and payment paths.
          </motion.p>
        </motion.section>
        <section className="itunesScrollerSection" aria-label="3000 Studios song carousel">
          <div className="itunesScrollerHeader">
            <span className="vipKicker">CodePen-inspired cover flow</span>
            <h2>{activeSong.title}</h2>
            <p>{activeSong.description}</p>
          </div>
          <div className="itunesScroller" role="region" aria-roledescription="carousel" aria-label="Original song carousel">
            <div className="itunesNav" aria-label="Carousel controls">
              <button type="button" className="prev" onClick={() => moveCarousel(-1)} aria-label="Previous song">
                &laquo;
              </button>
              <button type="button" className="next" onClick={() => moveCarousel(1)} aria-label="Next song">
                &raquo;
              </button>
            </div>
            {rolloutSongs.map((song, index) => {
              const slot = getCarouselSlot(index);
              return (
                <button
                  type="button"
                  className={`itunesItem ${slot}`}
                  key={song.src}
                  onClick={() => selectSong(index)}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  aria-label={`Play ${song.title}`}
                >
                  <span className="itunesCover">
                    <span className="itunesRank">#{song.rank}</span>
                    <strong>{song.title}</strong>
                    <small>3000 Studios Original</small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="itunesNowPlaying">
            <div>
              <span>Now selected</span>
              <strong>{activeSong.title}</strong>
            </div>
            <audio ref={selectedAudioRef} key={activeSong.src} src={activeSong.src} controls preload="auto" />
          </div>
        </section>
        <motion.section className="vipSection trackList" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger}>
          {rolloutSongs.map((song) => (
            <motion.article className="trackCard" key={song.title} variants={fadeUp} data-active={song.src === activeSong.src ? 'true' : undefined}>
              <span>#{song.rank}</span>
              <div>
                <h2>{song.title}</h2>
                <p>{song.description}</p>
              </div>
              <button
                type="button"
                className="trackSelectButton"
                onClick={() => selectSong(song.rank - 1)}
              >
                Play Full Song
              </button>
            </motion.article>
          ))}
        </motion.section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_MUSIC_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function VideoPage() {
  return (
    <PublicLayout variant="electric">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Video content
          </motion.span>
          <motion.h1 variants={fadeUp}>High-definition rollout visuals for music, creators, and sponsors.</motion.h1>
        </motion.section>
        <section className="videoGrid">
          <video className="featureVideo" src={INTRO_VIDEO} controls playsInline preload="metadata" />
          <div className="vipCard">
            <h2>Opening video</h2>
            <p>
              This real site asset loads as the first impression on the homepage and remains available here as the official featured video slot.
            </p>
            <StudioButton to="/sponsors">Sponsor A Video</StudioButton>
          </div>
        </section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_VIDEO_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function LivePage() {
  const configured = Boolean(import.meta.env.VITE_STREAM_CUSTOMER_CODE && import.meta.env.VITE_STREAM_LIVE_INPUT_ID);
  const embedUrl = configured
    ? `https://customer-${import.meta.env.VITE_STREAM_CUSTOMER_CODE}.cloudflarestream.com/${import.meta.env.VITE_STREAM_LIVE_INPUT_ID}/iframe`
    : null;

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live when the broadcast is active.</motion.h1>
          <motion.p variants={fadeUp}>
            Public playback is wired for Cloudflare Stream. Ingest keys stay in Cloudflare and OBS, not in the browser.
          </motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <StudioButton to={ADMIN_PATH}>Owner Stream Console</StudioButton>
            <StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20live%20stream`} variant="secondary">
              Stream Inquiry
            </StudioButton>
          </motion.div>
        </motion.section>
        <section className="streamPublicPanel">
          {embedUrl ? (
            <iframe title="3000 Studios live stream" src={embedUrl} allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
          ) : (
            <div className="vipCard">
              <h2>Stream setup required</h2>
              <p>
                Add VITE_STREAM_CUSTOMER_CODE and VITE_STREAM_LIVE_INPUT_ID in Cloudflare Pages after creating the Stream live input.
              </p>
            </div>
          )}
        </section>
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
    setMessages((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim() || 'VIP Guest',
        message: message.trim().slice(0, 280),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setMessage('');
  }

  return (
    <PublicLayout variant="pulse">
      <main className="vipMain">
        <motion.section className="vipPageHero compact" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Community chat room
          </motion.span>
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
            {messages.map((item) => (
              <article className="messageCard" key={item.id}>
                <strong>{item.name}</strong>
                <span>{safeDate(item.createdAt)}</span>
                <p>{item.message}</p>
              </article>
            ))}
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
    setIdeas((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim() || 'VIP Listener',
        mood,
        idea: idea.trim().slice(0, 360),
        votes: 1,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setIdea('');
  }

  return (
    <PublicLayout variant="goldwave">
      <main className="vipMain">
        <motion.section className="vipPageHero compact" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Song request board
          </motion.span>
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
                <button
                  type="button"
                  onClick={() =>
                    setIdeas((current) =>
                      current.map((ideaItem) =>
                        ideaItem.id === item.id ? { ...ideaItem, votes: ideaItem.votes + 1 } : ideaItem,
                      ),
                    )
                  }
                >
                  Vote {item.votes}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}

export function BlogPage() {
  const posts = useMemo(
    () =>
      blogSeeds.map((post, index) => ({
        ...post,
        date: new Date(Date.UTC(2026, 6, 13 - index)).toISOString(),
      })),
    [],
  );

  return (
    <PublicLayout variant="nebula">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Automated SEO blog
          </motion.span>
          <motion.h1 variants={fadeUp}>Search-ready music, video, live stream, and sponsor content.</motion.h1>
        </motion.section>
        <section className="blogGrid">
          {posts.map((post) => (
            <article className="blogCard" key={post.title}>
              <span>{safeDate(post.date)}</span>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
              <strong>{post.keywords}</strong>
            </article>
          ))}
        </section>
        <AdSenseUnit slot={import.meta.env.VITE_ADSENSE_BLOG_SLOT} />
      </main>
    </PublicLayout>
  );
}

export function SponsorsPage() {
  return (
    <PublicLayout variant="chrome">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Sponsorships
          </motion.span>
          <motion.h1 variants={fadeUp}>Sponsor the next 3000 Studios music and video rollout.</motion.h1>
          <motion.p variants={fadeUp}>
            Built for music brands, creator tools, local businesses, labels, production partners, and stream sponsors.
          </motion.p>
          <motion.div variants={fadeUp}>
            <StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20sponsorship`}>
              Request Sponsor Package
            </StudioButton>
          </motion.div>
        </motion.section>
        <section className="sponsorGrid">
          {sponsors.map((item) => (
            <article className="vipCard" key={item}>
              <h2>{item}</h2>
              <p>Available for approved partners only. Placement, usage, and disclosures are reviewed before publication.</p>
            </article>
          ))}
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
          <span className="vipKicker">Contact</span>
          <h1>Book music, video, sponsorship, licensing, or live stream support.</h1>
          <p>Email <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a> with the release, budget, timeline, and rights needed.</p>
        </section>
      </main>
    </PublicLayout>
  );
}

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'copyright' | 'cookies' | 'disclaimer' }) {
  const content = {
    privacy: {
      title: 'Privacy Policy',
      text:
        '3000 Studios VIP limits personal data collection to contact requests, site operations, security, analytics, advertising measurement, legal compliance, and optional community submissions. Google AdSense may use cookies or similar technologies to serve and measure ads when ad serving is active. Do not submit sensitive personal information in public forms.',
    },
    terms: {
      title: 'Terms Of Use',
      text:
        'By using this site you agree to lawful use, respectful community behavior, no scraping or abuse, and no unauthorized copying of music, videos, visuals, source code, private streams, or protected admin content.',
    },
    copyright: {
      title: 'Copyright And DMCA',
      text:
        'All original music, video, graphics, branding, and site content are owned by 3000 Studios or their respective rights holders. For takedown or licensing requests, send a detailed notice to the contact email.',
    },
    cookies: {
      title: 'Cookie Notice',
      text:
        'The site may use necessary storage for preferences, local community entries, playback settings, security, analytics, AdSense advertising, fraud prevention, and advertising review. Browser controls can clear local data at any time.',
    },
    disclaimer: {
      title: 'Legal Disclaimer',
      text:
        'The site provides music, media, entertainment, community, and business information. It is not legal, financial, medical, or professional advice. Sponsorships and offers require separate written approval.',
    },
  }[type];

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <section className="vipPageHero legalHero">
          <span className="vipKicker">Legal</span>
          <h1>{content.title}</h1>
          <p>{content.text}</p>
          <p>
            Contact: <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>
          </p>
        </section>
      </main>
    </PublicLayout>
  );
}
