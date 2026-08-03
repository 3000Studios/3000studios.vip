import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { featureSong, rolloutSongs } from '../data/music';
import { WhepPlayer, buildWhepUrl, STREAM_MODE_KEY } from '../lib/webrtcStream';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const ADMIN_PATH = '/admin';

const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '6502a441fdad0df6eebf3270a569c1ab';

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

/** Resolve cover art path for a catalog track */
function resolveCover(src: string, title: string): string {
  if (src.includes('lick-my-balls-jazz')) return featureSong.jazz.cover;
  if (src.includes('lick-my-balls-remix')) return featureSong.remix.cover;

  // Convention: /media/foo.mp3 → try /media/foo-cover.jpg, then slug-based aliases
  const base = src.replace(/\.mp3$/i, '').replace(/^\/media\//, '');
  const aliases: Record<string, string> = {
    'always-feel-like': '/media/lick-my-balls-jazz-cover.jpg',
    'betty-boom-boom': '/media/lick-my-balls-remix-cover.jpg',
    'outkast-3000-studios-style': '/media/lick-my-balls-remix-cover.jpg',
    'ride-smooth': '/media/lick-my-balls-jazz-cover.jpg',
    'so-fresh-so-cosmic': '/media/lick-my-balls-jazz-cover.jpg',
    'waynes-world': '/media/lick-my-balls-remix-cover.jpg',
    'waynes-world-laid-back-weezy-mix': '/media/lick-my-balls-remix-cover.jpg',
    'i-always-feel-like': '/media/lick-my-balls-jazz-cover.jpg',
    'i-always-feel-like-someones': '/media/lick-my-balls-jazz-cover.jpg',
  };
  if (aliases[base]) return aliases[base];

  // Prefer explicit -cover.jpg next to the mp3 when uploaded later
  void title;
  return `/media/${base}-cover.jpg`;
}

const playlist = rolloutSongs.map((song) => ({
  ...song,
  cover: resolveCover(song.src, song.title),
}));

function StandbyMusicWindow() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const song = playlist[index] ?? playlist[0];

  const next = useCallback(() => {
    setCoverBroken(false);
    setIndex((i) => (i + 1) % playlist.length);
  }, []);

  const prev = useCallback(() => {
    setCoverBroken(false);
    setIndex((i) => (i - 1 + playlist.length) % playlist.length);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = song.src;
    audio.volume = 0.55;
    const attempt = audio.play();
    if (attempt) {
      void attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [song.src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => next();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [next]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  return (
    <div className="standbyStage" aria-label="Standby music player until live">
      <audio ref={audioRef} preload="auto" />

      <div className="standbyArtWrap">
        {!coverBroken ? (
          <img
            key={song.cover}
            className="standbyCover"
            src={song.cover}
            alt={`${song.title} cover art`}
            onError={() => setCoverBroken(true)}
          />
        ) : (
          <div className="standbyCoverFallback" aria-hidden="true">
            <span className="standbyRank">#{song.rank}</span>
            <strong>{song.title}</strong>
            <small>3000 Studios Original</small>
          </div>
        )}
        <div className="standbyVignette" />
      </div>

      <div className="standbyMeta">
        <span className="standbyNow">Now spinning</span>
        <strong className="standbyTitle">{song.title}</strong>
        <p className="standbyDesc">{song.description}</p>
        <div className="standbyControls">
          <button type="button" className="studioButton secondary" onClick={prev}>
            Prev
          </button>
          <button type="button" className="studioButton primary" onClick={toggle}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button type="button" className="studioButton secondary" onClick={next}>
            Next
          </button>
        </div>
      </div>

      <div className="streamMarquee" aria-hidden="true">
        <div className="streamMarqueeTrack">
          <span>STREAMING SOON · 3000 STUDIOS LIVE · GO LIVE FROM /ADMIN · STREAMING SOON · 3000 STUDIOS LIVE · GO LIVE FROM /ADMIN · </span>
          <span>STREAMING SOON · 3000 STUDIOS LIVE · GO LIVE FROM /ADMIN · STREAMING SOON · 3000 STUDIOS LIVE · GO LIVE FROM /ADMIN · </span>
        </div>
      </div>
    </div>
  );
}

export function LiveStreamPage() {
  const customerCode =
    import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
  const liveInputId =
    import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
  const configured = Boolean(customerCode && liveInputId);
  const embedUrl = configured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const whepUrl = configured ? buildWhepUrl(customerCode, liveInputId) : null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<WhepPlayer | null>(null);
  const [mode, setMode] = useState<'whep' | 'hls'>('whep');
  const [status, setStatus] = useState<'connecting' | 'live' | 'idle' | 'error'>('connecting');
  const isLive = status === 'live';

  const tryConnect = useCallback(async () => {
    if (!whepUrl || !videoRef.current) {
      setStatus('idle');
      setMode('hls');
      return;
    }
    setStatus('connecting');
    try {
      await playerRef.current?.stop();
      const player = new WhepPlayer(whepUrl);
      playerRef.current = player;
      await player.start(videoRef.current);
      setStatus('live');
      setMode('whep');
      try {
        localStorage.setItem(STREAM_MODE_KEY, 'webrtc');
      } catch {
        /* ignore */
      }
    } catch {
      setStatus('idle');
      setMode('hls');
    }
  }, [whepUrl]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await tryConnect();
    })();

    // Re-check every 20s so the page flips to live when the owner goes on air
    const poll = window.setInterval(() => {
      if (cancelled) return;
      if (status !== 'live') void tryConnect();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      void playerRef.current?.stop();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryConnect]);

  const statusLabel = useMemo(() => {
    if (isLive) return '● Live · low-latency WebRTC';
    if (status === 'connecting') return 'Checking for live broadcast…';
    return 'Standby · catalog rotation until go-live';
  }, [isLive, status]);

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live.</motion.h1>
          <motion.p variants={fadeUp}>
            Until the owner goes live, this window rotates the VIP catalog with cover art. When the
            broadcast starts from the admin console, the live feed takes over automatically.
          </motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <Link className="studioButton primary" to={ADMIN_PATH}>
              Owner Go Live
            </Link>
            <a
              className="studioButton secondary"
              href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20live%20stream`}
            >
              Stream Inquiry
            </a>
          </motion.div>
        </motion.section>

        <section className="streamPublicPanel">
          <div className="streamFrame">
            {/* Always mounted so WHEP can attach when broadcast starts */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              controls={isLive}
              className="streamVideo"
              style={{ display: isLive && mode === 'whep' ? 'block' : 'none' }}
            />

            {isLive && mode === 'hls' && embedUrl ? (
              <iframe
                title="3000 Studios live stream"
                src={embedUrl}
                className="streamIframe"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : null}

            {!isLive ? <StandbyMusicWindow /> : null}

            {isLive ? (
              <div className="streamLiveBadge" aria-hidden="true">
                LIVE
              </div>
            ) : null}
          </div>

          <div className="streamToolbar">
            <span className="streamStatus">{statusLabel}</span>
            <div className="streamToolbarActions">
              {!isLive ? (
                <button
                  type="button"
                  className="studioButton secondary"
                  style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                  onClick={() => void tryConnect()}
                >
                  Check for live now
                </button>
              ) : null}
              {isLive ? (
                <button
                  type="button"
                  className="studioButton secondary"
                  style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                  onClick={() => setMode((m) => (m === 'whep' ? 'hls' : 'whep'))}
                >
                  Switch to {mode === 'whep' ? 'HLS player' : 'WebRTC player'}
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
