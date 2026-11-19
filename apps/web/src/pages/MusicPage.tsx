import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Pause, Play } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { HYPERFOLLOW_URL, PLATFORMS } from '../lib/commerce';
import { useGlobalMusic } from '../components/GlobalMusic';
import { VaultCarousel } from '../components/VaultCarousel';
import {
  VAULT_SONG_COUNT,
  featuredVaultSongs,
  vaultSongs,
  type VaultSong,
} from '../data/vaultSongs';

/**
 * MusicPage — /music, the public Music Vault.
 *
 * - DistroKid-only: every song comes from vaultSongs (the deduped
 *   publishedSongs.generated.json). Private library songs never appear.
 * - Exactly ONE carousel on this route: VaultCarousel (featured 8).
 *   The catalog below it is a plain searchable list, not a carousel.
 * - Nothing auto-plays. No hero video, no mount-time playback: a preview
 *   starts only when a visitor presses a preview button, and it is capped
 *   at 60 seconds.
 */

const PREVIEW_CAP_SECONDS = 60;
const COVER_FALLBACK = '/media/official-3000-studios-profile.png';

function platformUrl(id: string): string {
  return PLATFORMS.find((platform) => platform.id === id)?.url ?? HYPERFOLLOW_URL;
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().trim();
}

export function MusicPage() {
  const [search, setSearch] = useState('');
  const music = useGlobalMusic();
  // The preview this page started. A ref, not state: the render never reads
  // it (play state comes from the global player), and the 1:00 cap effect
  // can clear it without calling setState inside an effect.
  const previewingRef = useRef<{
    slug: string;
    title: string;
  } | null>(null);

  const query = normalizeSearch(search);
  const filteredSongs = useMemo(
    () =>
      vaultSongs.filter((song) =>
        normalizeSearch(song.title).includes(query),
      ),
    [query],
  );

  const handlePlaySong = (song: VaultSong) => {
    const isActive = music.activeTitle === song.title;
    if (isActive && music.isPlaying) {
      music.pause();
      previewingRef.current = null;
      return;
    }
    if (isActive && !music.isPlaying) {
      music.play();
      previewingRef.current = { slug: song.slug, title: song.title };
      return;
    }
    const src = song.preview || song.src;
    if (!src) return;
    window.dispatchEvent(
      new CustomEvent('3000-play-track', {
        detail: { src, title: song.title, slug: song.slug },
      }),
    );
    previewingRef.current = { slug: song.slug, title: song.title };
  };

  // 1:00 preview cap: stop a vault preview at 60 seconds and rewind it.
  // Gated on the preview this page started, so the global player's other
  // playback is never touched.
  useEffect(() => {
    const previewing = previewingRef.current;
    if (!previewing) return;
    if (music.activeTitle !== previewing.title) {
      previewingRef.current = null;
      return;
    }
    if (music.isPlaying && music.currentTime >= PREVIEW_CAP_SECONDS) {
      music.pause();
      music.seekTo(0);
      previewingRef.current = null;
    }
  }, [music]);

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="mv-scope">
        <section className="mv-hero">
          <span className="mv-kicker">Official discography · DistroKid</span>
          <h1 className="mv-title">{VAULT_SONG_COUNT} SONGS. ONE VAULT.</h1>
          <p className="mv-sub">
            Every track previews free for one minute. Full songs live on
            Spotify, Apple Music and every other platform.
          </p>
          <div className="mv-platform-row" aria-label="Listen on">
            <a
              className="mv-btn mv-btn-gold"
              href={platformUrl('spotify')}
              target="_blank"
              rel="noreferrer"
            >
              Spotify →
            </a>
            <a
              className="mv-btn mv-btn-ghost"
              href={platformUrl('apple')}
              target="_blank"
              rel="noreferrer"
            >
              Apple Music →
            </a>
            <a
              className="mv-btn mv-btn-ghost"
              href={platformUrl('youtube')}
              target="_blank"
              rel="noreferrer"
            >
              YouTube →
            </a>
            <a
              className="mv-btn mv-btn-ghost"
              href={HYPERFOLLOW_URL}
              target="_blank"
              rel="noreferrer"
            >
              HyperFollow hub →
            </a>
          </div>
          <p className="mv-quiet">
            Nothing plays until you press play. Previews run one minute.
          </p>
        </section>

        <section className="mv-section" aria-labelledby="featured-heading">
          <div className="mv-sec-head">
            <div>
              <span className="mv-eyebrow">Featured</span>
              <h2 id="featured-heading">New in the vault</h2>
            </div>
            <a className="mv-sec-link" href="#catalog">
              All {VAULT_SONG_COUNT} songs ↓
            </a>
          </div>
          <VaultCarousel
            songs={featuredVaultSongs}
            onPlay={handlePlaySong}
            activeTitle={music.activeSong.title}
            isPlaying={music.isPlaying}
          />
        </section>

        <section
          id="catalog"
          className="mv-section"
          aria-labelledby="catalog-heading"
        >
          <div className="mv-sec-head">
            <div>
              <span className="mv-eyebrow">The full catalog</span>
              <h2 id="catalog-heading">
                All {VAULT_SONG_COUNT} songs
              </h2>
              <p>
                {query
                  ? `Showing ${filteredSongs.length} of ${VAULT_SONG_COUNT} songs.`
                  : 'Every DistroKid release, one minute free each.'}
              </p>
            </div>
            <label className="mv-search">
              <span className="mv-search-icon" aria-hidden="true">
                <MagnifyingGlass size={18} />
              </span>
              <span className="mv-sr-only">Find a song</span>
              <input
                type="search"
                placeholder="Find a song"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Find a song"
              />
            </label>
          </div>

          {filteredSongs.length === 0 ? (
            <div className="mv-empty-block">
              <p>No songs match “{search}”.</p>
              <button
                type="button"
                className="mv-btn mv-btn-ghost mv-btn-sm"
                onClick={() => setSearch('')}
              >
                Clear search
              </button>
            </div>
          ) : (
            <ol className="mv-catalog">
              {filteredSongs.map((song) => {
                const vaultIndex = vaultSongs.findIndex(
                  (candidate) => candidate.slug === song.slug,
                );
                const isActive =
                  music.activeTitle === song.title && music.isPlaying;
                return (
                  <li key={song.slug} className="mv-row">
                    <span className="mv-row-num" aria-hidden="true">
                      {String(vaultIndex + 1).padStart(2, '0')}
                    </span>
                    <img
                      className="mv-row-cover"
                      src={song.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(event) => {
                        (event.target as HTMLImageElement).src = COVER_FALLBACK;
                      }}
                    />
                    <span className="mv-row-title">
                      <Link to={`/song/${song.slug}`}>{song.title}</Link>
                      <span>3000 Studios · Single</span>
                    </span>
                    <span className="mv-row-length">1:00</span>
                    <button
                      type="button"
                      className={`mv-btn mv-btn-preview${isActive ? ' is-playing' : ''}`}
                      onClick={() => handlePlaySong(song)}
                      aria-label={
                        isActive
                          ? `Pause ${song.title} preview`
                          : `Preview ${song.title}`
                      }
                    >
                      {isActive ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                      {isActive ? 'Pause' : 'Preview'}
                    </button>
                    <Link
                      className="mv-btn mv-btn-ghost mv-btn-sm"
                      to={`/song/${song.slug}`}
                    >
                      Details →
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </PublicLayoutV2>
  );
}
