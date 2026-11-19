import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Pause, Play } from '@phosphor-icons/react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { LazyYouTube } from '../components/LazyYouTube';
import { HYPERFOLLOW_URL } from '../lib/commerce';
import {
  getVaultSongBySlug,
  featuredVaultSongs,
  vaultSongs,
  type VaultSong,
} from '../data/vaultSongs';
import { youtubeWatchUrl } from '../data/officialReleases';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { usePageMeta } from '../lib/usePageMeta';

/**
 * SongPage — /song/:slug, one release page per vault song.
 *
 * - The song is looked up in the deduped vault (vaultSongs), never in the
 *   un-deduped rollout list, so /song/am-i-wrong resolves to the one kept
 *   row instead of the first of two duplicate rows.
 * - Nothing auto-plays. No mount-time playback, no autoplaying video
 *   iframe: the preview starts only on the Play preview press (capped at
 *   60 seconds), and the video mounts only after the visitor presses the
 *   video poster.
 * - The video comes from the unified official-release list (see
 *   vaultSongs.getVaultVideoId): curated entries first, then
 *   officialReleases.generated.json, matched by exact normalized title.
 *   Songs with no video show the preview player only — no video id is
 *   ever invented.
 * - No carousel on this route: "More from the vault" is a static grid.
 */

const PREVIEW_CAP_SECONDS = 60;
const COVER_FALLBACK = '/media/official-3000-studios-profile.png';
const MORE_COUNT = 7;

function formatTime(seconds: number): string {
  const clamped = Math.max(0, Math.min(PREVIEW_CAP_SECONDS, Math.floor(seconds)));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const music = useGlobalMusic();
  const song = getVaultSongBySlug(slug || '');
  const [videoOpen, setVideoOpen] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  // Gate for the 1:00 cap effect. Mirrors `previewing` as a ref so the
  // effect can clear the gate when the cap fires (or the track changes)
  // without calling setState inside the effect. It carries the slug it was
  // started for, so a slug change invalidates a stale gate inside the
  // effect — refs must never be touched during render.
  const previewGateRef = useRef<{ slug: string } | null>(null);

  usePageMeta({
    title: song ? `3000 Studios - ${song.title}` : 'Song',
    description: song
      ? `Listen to "${song.title}" by 3000 Studios — official music, video, and streaming links.`
      : '3000 Studios song page.',
  });

  // A fresh slug resets the video and preview state. Adjusted during
  // render — the React-endorsed pattern for resetting state when a
  // param changes — never setState inside an effect for this.
  const [prevSlug, setPrevSlug] = useState(slug);
  if (prevSlug !== slug) {
    setPrevSlug(slug);
    setVideoOpen(false);
    setPreviewing(false);
  }

  const moreSongs: VaultSong[] = useMemo(() => {
    if (!song) return [];
    const featured = featuredVaultSongs.filter(
      (candidate) => candidate.slug !== song.slug,
    );
    if (featured.length >= MORE_COUNT) return featured.slice(0, MORE_COUNT);
    const rest = vaultSongs.filter(
      (candidate) =>
        candidate.slug !== song.slug &&
        !featured.some((item) => item.slug === candidate.slug),
    );
    return [...featured, ...rest].slice(0, MORE_COUNT);
  }, [song]);

  const isPreviewPlaying =
    !!song && previewing && music.activeTitle === song.title && music.isPlaying;
  const previewTime =
    !!song && previewing && music.activeTitle === song.title
      ? music.currentTime
      : 0;

  // 1:00 preview cap: stop this song's preview at 60 seconds and rewind it.
  useEffect(() => {
    const gate = previewGateRef.current;
    if (!song || !gate || gate.slug !== slug) {
      previewGateRef.current = null;
      return;
    }
    if (music.activeTitle !== song.title) {
      previewGateRef.current = null;
      return;
    }
    if (music.isPlaying && music.currentTime >= PREVIEW_CAP_SECONDS) {
      music.pause();
      music.seekTo(0);
      previewGateRef.current = null;
    }
  }, [song, slug, music]);

  const handlePreview = () => {
    if (!song) return;
    if (isPreviewPlaying) {
      music.pause();
      setPreviewing(false);
      previewGateRef.current = null;
      return;
    }
    if (music.activeTitle === song.title && !music.isPlaying) {
      music.play();
      setPreviewing(true);
      previewGateRef.current = { slug: song.slug };
      return;
    }
    const src = song.preview || song.src;
    if (!src) return;
    window.dispatchEvent(
      new CustomEvent('3000-play-track', {
        detail: { src, title: song.title, slug: song.slug },
      }),
    );
    setPreviewing(true);
    previewGateRef.current = { slug: song.slug };
  };

  if (!song) {
    return (
      <PublicLayoutV2 wallpaper="eq">
        <main className="mv-scope mv-song">
          <div className="mv-notfound">
            <h1>Track unavailable</h1>
            <p>This song is not in the public Music Vault.</p>
            <Link className="mv-btn mv-btn-gold" to="/music">
              Back to the vault
            </Link>
          </div>
        </main>
      </PublicLayoutV2>
    );
  }

  const progress = Math.min(100, (previewTime / PREVIEW_CAP_SECONDS) * 100);
  const poster = song.videoId
    ? `https://i.ytimg.com/vi/${song.videoId}/maxresdefault.jpg`
    : '';

  return (
    <PublicLayoutV2 wallpaper="eq">
      <main className="mv-scope mv-song">
        <Link className="mv-back" to="/music">
          ← Back to the vault
        </Link>

        <section className="mv-song-hero" aria-labelledby="song-title">
          <span className="mv-kicker">Single · 3000 Studios</span>
          <h1 id="song-title" className="mv-title">
            {song.title}
          </h1>
          <p className="mv-sub">
            Official music video on YouTube. Preview a minute here, then take
            the full song to your platform.
          </p>

          <div className="mv-song-layout">
            <img
              className="mv-song-cover"
              src={song.cover}
              alt={`${song.title} cover art`}
              onError={(event) => {
                (event.target as HTMLImageElement).src = COVER_FALLBACK;
              }}
            />

            <div className="mv-player">
              <button
                type="button"
                className="mv-btn mv-btn-gold mv-btn-play"
                onClick={handlePreview}
                aria-label={
                  isPreviewPlaying
                    ? `Pause ${song.title} preview`
                    : `Play ${song.title} preview`
                }
              >
                {isPreviewPlaying ? (
                  <Pause size={20} weight="fill" />
                ) : (
                  <Play size={20} weight="fill" />
                )}
                {isPreviewPlaying ? 'Pause preview' : 'Play preview'}
              </button>
              <div
                className="mv-progress"
                role="progressbar"
                aria-label="Preview progress"
                aria-valuemin={0}
                aria-valuemax={PREVIEW_CAP_SECONDS}
                aria-valuenow={Math.floor(previewTime)}
              >
                <div
                  className="mv-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mv-time" aria-live="off">
                {formatTime(previewTime)} / 1:00
              </p>
              <p className="mv-quiet">
                Preview a minute here — nothing plays until you press play.
              </p>

              <div className="mv-platform-row">
                <a
                  className="mv-btn mv-btn-gold"
                  href={HYPERFOLLOW_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  Spotify →
                </a>
                {song.apple ? (
                  <a
                    className="mv-btn mv-btn-ghost"
                    href={song.apple}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Apple Music →
                  </a>
                ) : null}
                {song.videoId ? (
                  <a
                    className="mv-btn mv-btn-ghost"
                    href={youtubeWatchUrl(song.videoId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Watch the video →
                  </a>
                ) : null}
              </div>

              <p className="mv-credits">
                <span>2026 Released</span>
                <span aria-hidden="true">·</span>
                <span>DistroKid Distribution</span>
              </p>
            </div>
          </div>
        </section>

        {song.videoId ? (
          <section className="mv-section" aria-labelledby="video-heading">
            <h2 id="video-heading">Official video</h2>
            {videoOpen ? (
              <LazyYouTube
                videoId={song.videoId}
                title={`${song.title} official video`}
                autoLoad
                muted={false}
                controls
              />
            ) : (
              <button
                type="button"
                className="mv-video-poster"
                onClick={() => setVideoOpen(true)}
                aria-label={`Play the ${song.title} official video`}
                style={{ backgroundImage: `url(${poster})` }}
              >
                <span className="mv-video-play" aria-hidden="true">
                  ▶
                </span>
                <span className="mv-video-label">Watch the video</span>
              </button>
            )}
          </section>
        ) : (
          <section className="mv-section" aria-labelledby="video-heading">
            <h2 id="video-heading">Official video</h2>
            <p>
              No official video for this song yet — preview it above, then
              hear the full song on your platform.
            </p>
          </section>
        )}

        <section className="mv-section" aria-labelledby="more-heading">
          <div className="mv-sec-head">
            <div>
              <span className="mv-eyebrow">More from the vault</span>
              <h2 id="more-heading">Keep listening</h2>
            </div>
            <Link className="mv-sec-link" to="/music">
              All songs →
            </Link>
          </div>
          <div className="mv-more-grid">
            {moreSongs.map((item) => (
              <article key={item.slug} className="mv-card">
                <div className="mv-card-cover">
                  <Link to={`/song/${item.slug}`} aria-label={item.title}>
                    <img
                      src={item.cover}
                      alt={`${item.title} cover art`}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = COVER_FALLBACK;
                      }}
                    />
                  </Link>
                </div>
                <div className="mv-card-body">
                  <h3>
                    <Link to={`/song/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <span>3000 Studios · Single</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayoutV2>
  );
}
