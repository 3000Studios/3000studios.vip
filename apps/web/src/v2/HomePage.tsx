import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Pause,
  Broadcast,
  MagnifyingGlass,
  ArrowRight,
  Lightning,
} from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine, AdSenseUnit } from './PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from './Reveal';
import { useGlobalMusic } from '../components/GlobalMusic';
import { LazyYouTube } from '../components/LazyYouTube';
import { publishedSongs } from '../data/publishedSongs';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { STREAM_PLAYER_EMBED_SRC } from '../lib/streamConfig';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import './home.css';

/* ---------------- hero ---------------- */

function Hero({ live }: { live: boolean }) {
  return (
    <section className="v2-hero">
      <div className="v2-wrap v2-hero-inner">
        <Reveal>
          <span className="v2-kicker">Independent label · Acworth, Georgia</span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="v2-display v2-hero-title">
            3000
            <br />
            <span className="v2-grad-text">Studios</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="v2-lede v2-hero-lede">
            Original music, cinematic videos, and live broadcasts — produced in-house, released
            worldwide. This is the whole universe on one page: press play below.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="v2-hero-ctas">
            <a href="#music" className="v2-btn">
              <Play size={18} weight="fill" /> Listen now
            </a>
            <a href="#videos" className="v2-btn v2-btn--ghost">
              Watch videos
            </a>
            {live && (
              <a href="#live" className="v2-btn v2-btn--blue">
                <Broadcast size={18} weight="fill" /> We&apos;re live
              </a>
            )}
          </div>
        </Reveal>
        <Reveal delay={0.32}>
          <div className="v2-hero-stats">
            <div>
              <strong>{publishedSongs.length}</strong>
              <span>released tracks</span>
            </div>
            <div>
              <strong>{officialReleaseVideos.length}</strong>
              <span>official videos</span>
            </div>
            <div>
              <strong className={live ? 'is-live' : ''}>{live ? 'LIVE' : '24/7'}</strong>
              <span>{live ? 'on air now' : 'studio mode'}</span>
            </div>
          </div>
        </Reveal>
      </div>
      <a href="#live" className="v2-scroll-cue" aria-label="Scroll to live section">
        <span />
      </a>
    </section>
  );
}

/* ---------------- live ---------------- */

function LiveSection() {
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
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

  return (
    <section id="live" className="v2-section">
      <div className="v2-wrap">
        <Reveal>
          <div className="v2-sec-head">
            <div>
              <span className="v2-kicker">Broadcast</span>
              <h2 className="v2-sec-title">
                Live <span className="v2-grad-text">stage</span>
              </h2>
            </div>
            <span className={`v2-live-badge${live ? ' is-live' : ''}`}>
              <i aria-hidden="true" />
              {live ? 'On air' : live === null ? 'Checking…' : 'Offline'}
            </span>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          {live ? (
            <div className="v2-live-player v2-card">
              <iframe
                src={`${STREAM_PLAYER_EMBED_SRC}?autoplay=true&muted=true`}
                title="3000 Studios live stream"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
              />
            </div>
          ) : (
            <div className="v2-card v2-live-offline">
              <Broadcast size={40} weight="duotone" className="v2-live-offline-icon" />
              <h3>The stage is dark right now</h3>
              <p>
                Live shows, studio sessions, and listening parties happen here. Follow the
                channel so you never miss a broadcast.
              </p>
              <div className="v2-live-offline-ctas">
                <a
                  className="v2-btn v2-btn--sm"
                  href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get notified
                </a>
                <Link className="v2-btn v2-btn--sm v2-btn--ghost" to="/go-live">
                  Owner? Go live
                </Link>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- videos ---------------- */

function VideoSection() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(officialReleaseVideos[0]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return officialReleaseVideos;
    return officialReleaseVideos.filter(
      (v) => v.title.toLowerCase().includes(q) || v.release.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section id="videos" className="v2-section">
      <div className="v2-wrap">
        <Reveal>
          <div className="v2-sec-head">
            <div>
              <span className="v2-kicker">Cinema</span>
              <h2 className="v2-sec-title">
                Official <span className="v2-grad-text">videos</span>
              </h2>
            </div>
            <label className="v2-search">
              <MagnifyingGlass size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search videos…"
                aria-label="Search videos"
                className="v2-input"
              />
            </label>
          </div>
        </Reveal>

        {selected && (
          <Reveal>
            <div className="v2-theater v2-card">
              <LazyYouTube videoId={selected.videoId} title={selected.title} autoLoad />
              <div className="v2-theater-meta">
                <div>
                  <span className="v2-chip">{selected.release}</span>
                  <h3>{selected.title}</h3>
                </div>
                <a
                  className="v2-btn v2-btn--sm v2-btn--ghost"
                  href={youtubeWatchUrl(selected.videoId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Watch on YouTube <ArrowRight size={15} />
                </a>
              </div>
            </div>
          </Reveal>
        )}

        <RevealGroup className="v2-video-grid" stagger={0.04}>
          {filtered.slice(0, 24).map((v) => (
            <RevealItem key={v.videoId}>
              <button
                type="button"
                className={`v2-video-card v2-card v2-card--lift${selected?.videoId === v.videoId ? ' is-active' : ''}`}
                onClick={() => {
                  setSelected(v);
                  document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="v2-video-thumb">
                  <img src={youtubeArtworkUrl(v.videoId)} alt="" loading="lazy" />
                  <span className="v2-video-play" aria-hidden="true">
                    <Play size={20} weight="fill" />
                  </span>
                  <span className="v2-video-dur">{v.duration}</span>
                </span>
                <span className="v2-video-title">{v.title}</span>
              </button>
            </RevealItem>
          ))}
        </RevealGroup>
        {filtered.length > 24 && (
          <Reveal>
            <p className="v2-more-note">
              Showing 24 of {filtered.length} videos —{' '}
              <a
                href="https://www.youtube.com/@3000Studio/videos"
                target="_blank"
                rel="noreferrer"
              >
                browse them all on YouTube
              </a>
              .
            </p>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ---------------- music ---------------- */

function MusicSection() {
  const music = useGlobalMusic();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publishedSongs;
    return publishedSongs.filter((s) => s.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <section id="music" className="v2-section">
      <div className="v2-wrap">
        <Reveal>
          <div className="v2-sec-head">
            <div>
              <span className="v2-kicker">Catalog</span>
              <h2 className="v2-sec-title">
                The <span className="v2-grad-text">music</span>
              </h2>
              <p className="v2-lede" style={{ marginTop: 10, maxWidth: '52ch' }}>
                Every released track, playable right here. Tap any cover to play — it keeps
                going while you browse.
              </p>
            </div>
            <label className="v2-search">
              <MagnifyingGlass size={18} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tracks…"
                aria-label="Search tracks"
                className="v2-input"
              />
            </label>
          </div>
        </Reveal>

        <RevealGroup className="v2-track-grid" stagger={0.03}>
          {filtered.map((song) => {
            const isActive =
              music.activeTitle.toLowerCase() === song.title.toLowerCase() ||
              music.activeSong?.slug === song.slug;
            const playing = isActive && music.isPlaying;
            return (
              <RevealItem key={song.slug}>
                <article className={`v2-track v2-card${isActive ? ' is-active' : ''}`}>
                  <button
                    type="button"
                    className="v2-track-cover"
                    onClick={() =>
                      playing ? music.pause() : music.playTrack(song.src, song.title)
                    }
                    aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
                  >
                    <img src={song.cover} alt="" loading="lazy" />
                    <span className="v2-track-play" aria-hidden="true">
                      {playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}
                    </span>
                    {playing && (
                      <span className="v2-eq" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </button>
                  <div className="v2-track-meta">
                    <h3>
                      <Link to={`/song/${song.slug}`}>{song.title}</Link>
                    </h3>
                    <div className="v2-track-links">
                      {song.youtubeId && (
                        <a
                          href={youtubeWatchUrl(song.youtubeId)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Watch ${song.title} on YouTube`}
                        >
                          Video
                        </a>
                      )}
                      {(song.buy || song.apple) && (
                        <a
                          href={song.buy ?? song.apple}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`Buy ${song.title}`}
                        >
                          Buy
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/* ---------------- page ---------------- */

export function HomePage() {
  const [live, setLive] = useState(false);

  useEffect(() => {
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

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <Hero live={live} />
      <LiveLine />
      <LiveSection />
      <LiveLine />
      <VideoSection />
      <div className="v2-wrap">
        <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
      </div>
      <LiveLine />
      <MusicSection />
      <LiveLine />
      <section className="v2-section">
        <div className="v2-wrap">
          <Reveal>
            <div className="v2-card v2-cta-band">
              <Lightning size={34} weight="duotone" />
              <h2 className="v2-display">
                Your turn. <span className="v2-grad-text">Request it.</span>
              </h2>
              <p className="v2-lede">
                Got a song idea, a vibe, or a story? Send it to the studio — community requests
                shape what gets made next.
              </p>
              <div className="v2-hero-ctas" style={{ justifyContent: 'center' }}>
                <Link to="/requests" className="v2-btn">
                  Make a request
                </Link>
                <Link to="/community" className="v2-btn v2-btn--ghost">
                  Join the community
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayoutV2>
  );
}
