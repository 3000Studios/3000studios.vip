import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ArrowsOut, ArrowUpRight } from '@phosphor-icons/react';
import { Header } from '../v2/Header';
import { Footer } from '../v2/Footer';
import { PageFade, Reveal } from '../v2/Reveal';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { CommandRail } from './Cockpit';
import { Preloader } from './chrome';
import { settlePendingPurchase } from './MusicSection';
import { usePageMeta } from '../lib/usePageMeta';
import {
  officialReleaseVideos,
  youtubeEmbedUrl,
  youtubeWatchUrl,
  type OfficialReleaseVideo,
} from '../data/officialReleases';
import { publishedShorts } from '../data/publishedShorts';
import './mv.css';

/* ============================================================================
   Homepage — cinematic music-video premiere layout (Boss order 2026-11-04).
   Design language ported from the reference build he supplied: letterbox
   player, Anton display type overlapping the frame, mono micro-labels,
   numbered platform tiles. ALL content is his real catalog — the reference
   build's artist/titles/credits were stripped, only the style was kept.
   The Space Water (RootLayout WaterWallpaper) stays the page wallpaper.
   No AdSense unit on home (unchanged: ads-off by route in explicitAdsGate).
   ========================================================================== */

/* Featured hero video: 'Always Feel Like' — oEmbed-verified official music
   video (2026-11-04). NOT officialReleaseVideos[0]: that entry pairs the
   'I'm Feelin' It' title with a #Shorts videoId (data error, flagged). */
const FEATURED =
  officialReleaseVideos.find((v) => v.videoId === 'GRokxtfSu9s') ?? officialReleaseVideos[0];

const PLATFORMS = [
  { name: 'YouTube', href: 'https://www.youtube.com/@3000Studio', external: true },
  { name: 'Spotify', href: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik', external: true },
  { name: 'Apple Music', href: 'https://music.apple.com/us/artist/3000-studios/6802721597', external: true },
  { name: 'Music For Sale', href: '/beats', external: false },
] as const;

/** Split a song title into two display lines, roughly balanced. */
function splitTitle(title: string): [string, string] {
  const words = title.replace(/['']/g, '’').split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [title.toUpperCase(), ''];
  let best = 1;
  let bestDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' ').length;
    const b = words.slice(i).join(' ').length;
    if (Math.abs(a - b) < bestDiff) {
      bestDiff = Math.abs(a - b);
      best = i;
    }
  }
  return [words.slice(0, best).join(' ').toUpperCase(), words.slice(best).join(' ').toUpperCase()];
}

export function HomePage() {
  const [live, setLive] = useState(false);
  const [current, setCurrent] = useState<OfficialReleaseVideo>(FEATURED);
  const [playing, setPlaying] = useState(false);
  const [idle, setIdle] = useState(false);
  const [posterFallback, setPosterFallback] = useState(false);
  const idleTimer = useRef<number | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const topRef = useRef<HTMLDivElement | null>(null);

  usePageMeta({
    title: 'Official Music & Live Stage',
    description:
      '3000 Studios — original music, cinematic videos, and live broadcasts from Acworth, Georgia. New singles weekly, on all platforms.',
  });

  useEffect(() => {
    settlePendingPurchase();
    let cancelled = false;
    void detectIsLive().then((s) => {
      if (!cancelled) setLive(s.live);
    });
    const unsub = subscribeHostLive((v) => setLive(v));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const bumpIdle = () => {
    setIdle(false);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2600);
  };

  useEffect(() => {
    if (playing) bumpIdle();
    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const selectVideo = (v: OfficialReleaseVideo, autoplay: boolean) => {
    setCurrent(v);
    setPosterFallback(false);
    setPlaying(autoplay);
  };

  const playFromWall = (v: OfficialReleaseVideo) => {
    selectVideo(v, true);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void frameRef.current?.requestFullscreen?.();
  };

  const [line1, line2] = splitTitle(current.title);
  const poster = posterFallback
    ? `https://i.ytimg.com/vi/${current.videoId}/hqdefault.jpg`
    : `https://i.ytimg.com/vi/${current.videoId}/maxresdefault.jpg`;

  const marqueeTitles = officialReleaseVideos.slice(0, 16).map((v) => v.title);

  return (
    <div className="v3-root">
      <Preloader />
      <Header />
      <PageFade routeKey="/">
        <main className="mv-root" ref={topRef}>
          {live && (
            <Link to="/live" className="mv-live">
              <span className="dot" />
              Live now — The Last Sky Broadcast — Watch the stream
            </Link>
          )}

          {/* ---------- HERO PLAYER ---------- */}
          <section className="mv-hero mv-wrap">
            <div className="mv-herometa">
              <span>3000 Studios</span>
              <span className="c">Official Music Video — Runtime {current.duration}</span>
              <span>{current.release}</span>
            </div>

            <div
              ref={frameRef}
              className="mv-frame"
              onClick={() => {
                if (!playing) setPlaying(true);
              }}
              onMouseMove={bumpIdle}
              role="button"
              aria-label={playing ? current.title : `Play ${current.title}`}
            >
              {playing ? (
                <iframe
                  src={`${youtubeEmbedUrl(current.videoId)}&autoplay=1`}
                  title={`${current.title} — 3000 Studios (official music video)`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    className="poster"
                    src={poster}
                    alt={`${current.title} — 3000 Studios official music video`}
                    onError={() => setPosterFallback(true)}
                  />
                  <div className="shade" aria-hidden />
                </>
              )}
              <div className="mv-bar top" aria-hidden />
              <div className="mv-bar bot" aria-hidden />
              <span className="mv-corner l" aria-hidden>
                2.39:1
              </span>
              <span className="mv-corner r" aria-hidden>
                REC <span className="mv-rec">●</span>
              </span>

              {!playing && (
                <div className="mv-playwrap">
                  <button
                    className="mv-playbtn"
                    aria-label={`Play ${current.title} with sound`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaying(true);
                    }}
                  >
                    <Play size={36} weight="fill" style={{ marginLeft: 4 }} />
                  </button>
                  <span className="mv-playhint">Click to play with sound</span>
                </div>
              )}

              {playing && (
                <div className={`mv-controls${idle ? ' hidden' : ''}`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaying(false);
                    }}
                    aria-label="Pause"
                  >
                    <Pause size={18} />
                  </button>
                  <span className="ttl">
                    {current.title} — {current.duration}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    aria-label="Toggle fullscreen"
                  >
                    <ArrowsOut size={18} />
                  </button>
                </div>
              )}
            </div>

            <div className="mv-titleblock">
              <h1 className="mv-bigname">
                {line1}
                {line2 && <span className="l2">{line2}</span>}
              </h1>
              <div className="mv-titlemeta">
                <span className="artist">3000 Studios</span>
                <span>Official Music Video</span>
                <span>Acworth, Georgia</span>
                <a href={youtubeWatchUrl(current.videoId)} target="_blank" rel="noreferrer">
                  Watch on YouTube ↗
                </a>
              </div>
            </div>
          </section>

          {/* ---------- TITLE MARQUEE ---------- */}
          <div className="mv-marquee" aria-hidden>
            <div className="track">
              {[0, 1].map((dup) => (
                <span key={dup} style={{ display: 'inline-flex' }}>
                  {marqueeTitles.map((t) => (
                    <span className="item" key={`${dup}-${t}`}>
                      <i>•</i>
                      {t}
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>

          {/* ---------- VIDEO WALL — ALL OFFICIAL RELEASES ---------- */}
          <section className="mv-section mv-wrap">
            <Reveal>
              <div className="mv-sechead">
                <div>
                  <p className="mv-eyebrow">01 — The Catalog</p>
                  <h2 className="mv-h2">Music Videos</h2>
                </div>
                <p className="mv-micro">
                  {officialReleaseVideos.length} official videos — click any frame to play it up top
                </p>
              </div>
            </Reveal>
            <div className="mv-wall">
              {officialReleaseVideos.map((v, i) => (
                <button
                  key={v.videoId}
                  className={`mv-card${v.videoId === current.videoId ? ' active' : ''}`}
                  onClick={() => playFromWall(v)}
                >
                  <span className="thumb">
                    <img
                      src={`https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`}
                      alt={`${v.title} — 3000 Studios`}
                      loading="lazy"
                    />
                    <span className="go" aria-hidden>
                      <span>
                        <Play size={20} weight="fill" style={{ marginLeft: 2 }} />
                      </span>
                    </span>
                    <span className="dur">{v.duration}</span>
                  </span>
                  <span className="meta">
                    <span className="idx">{String(i + 1).padStart(2, '0')}</span>
                    <span>
                      <span className="name">{v.title}</span>
                      <span className="rel" style={{ display: 'block' }}>
                        {v.release}
                      </span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ---------- SHORTS RAIL ---------- */}
          <section className="mv-section mv-wrap" style={{ paddingTop: 0 }}>
            <Reveal>
              <div className="mv-sechead">
                <div>
                  <p className="mv-eyebrow">02 — Short Cuts</p>
                  <h2 className="mv-h2">The Shorts</h2>
                </div>
                <p className="mv-micro">{publishedShorts.length} shorts — tap one to watch on YouTube</p>
              </div>
            </Reveal>
            <div className="mv-shorts">
              {publishedShorts.map((s) => (
                <a
                  key={s.videoId}
                  className="mv-short"
                  href={`https://www.youtube.com/shorts/${s.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="thumb">
                    <img
                      src={`https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`}
                      alt={`${s.title} — 3000 Studios short`}
                      loading="lazy"
                    />
                  </span>
                  <span className="name" style={{ display: 'block' }}>
                    {s.title}
                  </span>
                </a>
              ))}
            </div>
          </section>

          {/* ---------- PLATFORMS ---------- */}
          <section className="mv-section mv-wrap" style={{ paddingTop: 0 }}>
            <Reveal>
              <div className="mv-sechead" style={{ borderBottom: 0, marginBottom: 34 }}>
                <div>
                  <p className="mv-eyebrow">03 — Watch &amp; Listen</p>
                  <h2 className="mv-h2">All Platforms</h2>
                </div>
              </div>
            </Reveal>
            <div className="mv-tiles">
              {PLATFORMS.map((p, i) =>
                p.external ? (
                  <a key={p.name} className="mv-tile" href={p.href} target="_blank" rel="noreferrer">
                    <span className="left">
                      <span className="num">0{i + 1}</span>
                      <span className="pname">{p.name}</span>
                    </span>
                    <ArrowUpRight size={26} className="arrow" />
                  </a>
                ) : (
                  <Link key={p.name} className="mv-tile" to={p.href}>
                    <span className="left">
                      <span className="num">0{i + 1}</span>
                      <span className="pname">{p.name}</span>
                    </span>
                    <ArrowUpRight size={26} className="arrow" />
                  </Link>
                ),
              )}
            </div>
          </section>
        </main>
      </PageFade>
      <Footer />
      <CommandRail />
    </div>
  );
}
