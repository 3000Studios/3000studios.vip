import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilmStrip, GameController, PlayCircle } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import {
  CINEMATIC_VIDEOS,
  MUSIC_VIDEOS,
  youtubeWatch,
  type VideoCatalogItem,
} from '../data/videoCatalog';
import { LIVE_STREAM_CONFIG } from '../data/liveStream';
import { getOfficialVideoForTitle } from '../data/officialReleases';
import { PODCAST_SHOW } from '../data/podcastEpisodes';

/** Studio YouTube channel — HEAD's canonical constant (branch name was STUDIO_YOUTUBE_CHANNEL_URL). */
const STUDIO_YOUTUBE_CHANNEL_URL = PODCAST_SHOW.youtubeChannel;
import { UnlockCard } from '../components/UnlockCard';
import { ADSENSE_VIDEO_SLOT } from '../lib/adsense';

/**
 * /video — Video Vault, redesigned as THE SCREENING ROOM (mockup section 4).
 *
 * Three lanes, all driven by existing catalog data — no video IDs invented:
 *  1. Music videos — MUSIC_VIDEOS from videoCatalog (official releases with
 *     a YouTube videoId). Featured row title-matches the mockup's four
 *     names via the repo's getOfficialVideoForTitle helper; all four
 *     resolve in the current catalog.
 *  2. Aeropocalypse cinematics — CINEMATIC_VIDEOS (30 clips). The
 *     Opening / Mid-game / Finale feature picks are the catalog items whose
 *     titles are literally "Game Intro", "Boss Incoming" and
 *     "Credits Finale".
 *  3. Live broadcasts archive — category cards only. The catalog holds no
 *     per-item video IDs for these, so the cards link to /live, /podcast
 *     and the YouTube channel instead of embedding anything unvetted.
 */

const FEATURED_MUSIC_TITLES = [
  'Always Feel Like',
  "I'm Feelin' It",
  'Motel Television',
  'ROOM goes COLD',
];

const FEATURED_CINEMATIC_IDS: Array<{ id: string; phase: string }> = [
  { id: 'cine-game-intro-v1', phase: 'Opening' },
  { id: 'cine-boss-incoming-v1', phase: 'Mid-game' },
  { id: 'cine-credits-finale-v1', phase: 'Finale' },
];

const ARCHIVE_CARDS: Array<{
  title: string;
  blurb: string;
  to: string;
  external: boolean;
  cta: string;
}> = [
  {
    title: 'Podcast',
    blurb: 'Episodes recorded in front of a live audience on the Live Command stage.',
    to: '/podcast',
    external: false,
    cta: 'Episodes',
  },
  {
    title: 'Live',
    blurb: 'Full live broadcasts, saved to the 3000 Studios YouTube channel.',
    to: STUDIO_YOUTUBE_CHANNEL_URL,
    external: true,
    cta: 'Open the archive',
  },
  {
    title: 'Studio Session',
    blurb: 'Beat-making, mix feedback and track premieres from the studio floor.',
    to: STUDIO_YOUTUBE_CHANNEL_URL,
    external: true,
    cta: 'Open the archive',
  },
  {
    title: 'Broadcast Archive',
    blurb: 'Every show, saved. All broadcasts are archived to the 3000 Studios YouTube channel.',
    to: STUDIO_YOUTUBE_CHANNEL_URL,
    external: true,
    cta: 'Open the archive',
  },
];

/**
 * Title lookup through the repo's own helper (handles the curated-title
 * normalisation, e.g. generated "I always feel Like" vs curated
 * "Always Feel Like"), then resolves to the VideoCatalogItem by videoId.
 * All four mockup featured titles resolve in the current catalog:
 * Always Feel Like (GRokxtfSu9s), I'm Feelin' It (aqbImIx7S-s),
 * Motel Television (NYoaRy3i5XA), ROOM goes COLD (Tb4bXdEMJKA).
 */
function findVideoByTitle(title: string): VideoCatalogItem | undefined {
  const official = getOfficialVideoForTitle(title);
  if (official === undefined) return undefined;
  return MUSIC_VIDEOS.find(
    (v) => v.preview.type === 'youtube' && v.preview.videoId === official.videoId,
  );
}

export function VideoVaultPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const featuredMusic = useMemo(
    () =>
      FEATURED_MUSIC_TITLES.map((title) => findVideoByTitle(title)).filter(
        (v): v is VideoCatalogItem => v !== undefined,
      ),
    [],
  );

  const q = searchQuery.trim().toLowerCase();
  const music = useMemo(
    () =>
      q.length === 0
        ? MUSIC_VIDEOS
        : MUSIC_VIDEOS.filter(
            (v) =>
              v.title.toLowerCase().includes(q) ||
              v.subtitle.toLowerCase().includes(q),
          ),
    [q],
  );

  const featuredCinematics = useMemo(
    () =>
      FEATURED_CINEMATIC_IDS.map(({ id, phase }) => ({
        phase,
        item: CINEMATIC_VIDEOS.find((v) => v.id === id),
      })).filter(
        (entry): entry is { phase: string; item: VideoCatalogItem } =>
          entry.item !== undefined,
      ),
    [],
  );

  return (
    <PublicLayoutV2 wallpaper="beams">
      <div className="nn-scope">
        {/* ================= HERO ================= */}
        <section className="nn-hero">
          <span className="nn-kicker">
            <FilmStrip size={14} style={{ verticalAlign: '-2px' }} /> Official cinema theater
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            THE SCREENING ROOM
          </h1>
          <p>
            Free on YouTube. Every single from the 51-song catalog has an
            official video.
          </p>
          <div className="nn-btn-row">
            <a
              className="nn-btn nn-btn-gold"
              href={STUDIO_YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
            <Link className="nn-btn nn-btn-ghost" to="/music">
              <PlayCircle size={18} /> Music catalog
            </Link>
          </div>
        </section>

        {/* ================= LANE 1 — MUSIC VIDEOS ================= */}
        <section className="gv-section" aria-label="Music videos">
          <div className="gv-lane-head">
            <div>
              <span className="gv-kicker">Music videos</span>
              <h2>Every single, official video</h2>
            </div>
            <Link className="nn-btn nn-btn-ghost" to="/music">
              Go to music
            </Link>
          </div>

          {featuredMusic.length > 0 && (
            <div className="gv-featured-row">
              {featuredMusic.map((item) => {
                const watchUrl =
                  item.preview.type === 'youtube'
                    ? youtubeWatch(item.preview.videoId)
                    : STUDIO_YOUTUBE_CHANNEL_URL;
                return (
                  <a
                    className="gv-cine-feature"
                    key={item.id}
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <span>Official video</span>
                    <h3>{item.title}</h3>
                    <p>{item.subtitle}</p>
                    <span className="gv-card-link">Watch on YouTube →</span>
                  </a>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            <label htmlFor="gv-video-search" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
              Search videos
            </label>
            <input
              id="gv-video-search"
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="gv-search"
            />
          </div>

          {music.length === 0 ? (
            <p className="gv-empty">No videos match “{searchQuery}”.</p>
          ) : (
            <div className="nn-grid">
              {music.map((item) => (
                <UnlockCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        {/* ================= LANE 2 — AEROPOCALYPSE CINEMATICS ================= */}
        <section className="gv-section" id="cinematics" aria-label="Aeropocalypse cinematics">
          <div className="gv-lane-head">
            <div>
              <span className="gv-kicker">Aeropocalypse cinematics</span>
              <h2>Opening, mid-game and finale</h2>
            </div>
            <Link className="nn-btn nn-btn-ghost" to="/aeropocalypse">
              Go to Aeropocalypse
            </Link>
          </div>

          <div className="gv-featured-row">
            {featuredCinematics.map(({ phase, item }) => {
              const playUrl = item.full.type === 'mp4' ? item.full.url : undefined;
              return (
                <a
                  className="gv-cine-feature"
                  key={item.id}
                  href={playUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'block', textDecoration: 'none' }}
                >
                  <span>{phase}</span>
                  <h3>{item.title}</h3>
                  <p>{item.subtitle}</p>
                  <span className="gv-card-link">Play cinematic →</span>
                </a>
              );
            })}
          </div>

          <div className="nn-grid">
            {CINEMATIC_VIDEOS.map((item) => (
              <UnlockCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ================= LANE 3 — LIVE BROADCASTS ARCHIVE ================= */}
        <section className="gv-section" aria-label="Live broadcasts archive">
          <div className="gv-lane-head">
            <div>
              <span className="gv-kicker">Live broadcasts</span>
              <h2>Archived from Live Command</h2>
              <p>All broadcasts are archived to the 3000 Studios YouTube channel.</p>
            </div>
            <Link className="nn-btn nn-btn-ghost" to="/live">
              Go to live
            </Link>
          </div>

          <div className="gv-archive-grid">
            {ARCHIVE_CARDS.map((card) =>
              card.external ? (
                <a
                  key={card.title}
                  className="gv-archive-card"
                  href={card.to}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="gv-kicker">
                    <GameController size={14} style={{ verticalAlign: '-2px' }} /> Archive
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.blurb}</p>
                  <span className="gv-card-link">{card.cta} →</span>
                </a>
              ) : (
                <Link key={card.title} className="gv-archive-card" to={card.to}>
                  <span className="gv-kicker">
                    <GameController size={14} style={{ verticalAlign: '-2px' }} /> Archive
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.blurb}</p>
                  <span className="gv-card-link">{card.cta} →</span>
                </Link>
              ),
            )}
          </div>

          <Reveal delay={0.1}>
            <p style={{ textAlign: 'center', color: 'var(--nn-muted)', marginTop: 22 }}>
              Broadcast home is{' '}
              <a href={LIVE_STREAM_CONFIG.channelUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--nn-gold)' }}>
                {LIVE_STREAM_CONFIG.channelUrl}
              </a>
              .
            </p>
          </Reveal>
        </section>

        <section className="gv-section">
          <AdSenseUnit slot={ADSENSE_VIDEO_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
