import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DownloadSimple, LockKey, MagnifyingGlass, Pause, Play } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { useGlobalMusic } from '../components/GlobalMusic';
import { publishedSongs } from '../data/publishedSongs';
import { youtubeWatchUrl } from '../data/officialReleases';
import {
  TRACK_PRICE_CENTS,
  formatMoney,
  grantTrack,
  readEntitlement,
} from '../lib/commerce';

const PENDING_KEY = '3000-pending-track';

function useOwnedTracks(): string[] {
  const [tracks, setTracks] = useState<string[]>(() => readEntitlement().tracks);
  useEffect(() => {
    const onChange = () => setTracks(readEntitlement().tracks);
    window.addEventListener('3000-entitlement', onChange);
    return () => window.removeEventListener('3000-entitlement', onChange);
  }, []);
  return tracks;
}

/** $0.99 — yours to keep + download. Not a license, just the song. */
function buyTrack(slug: string) {
  try {
    localStorage.setItem(PENDING_KEY, slug);
  } catch {
    /* private mode */
  }
  grantTrack(slug);
  window.location.assign('/api/pay?sku=track');
}

/** If Stripe sends the buyer back with ?paid=1, lock in the pending unlock. */
export function settlePendingPurchase() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') !== '1') return;
    const slug = localStorage.getItem(PENDING_KEY);
    if (slug) {
      grantTrack(slug);
      localStorage.removeItem(PENDING_KEY);
    }
    params.delete('paid');
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', clean);
  } catch {
    /* ignore */
  }
}

export function MusicSection() {
  const music = useGlobalMusic();
  const [query, setQuery] = useState('');
  const owned = useOwnedTracks();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return publishedSongs;
    return publishedSongs.filter((s) => s.title.toLowerCase().includes(q));
  }, [query]);

  return (
    <section id="music" className="v3-section">
      <div className="v3-wrap">
        <Reveal>
          <div className="v3-eyebrow">Catalog</div>
          <h2 className="v3-h2">
            The <em>music</em>
          </h2>
          <p className="v3-lead">
            Every released track, playable right here. Tap any cover — it keeps going
            while you browse. Own any song for {formatMoney(TRACK_PRICE_CENTS)}: yours
            to keep and download, forever. No license, no strings.
          </p>
          <label className="v3-search">
            <MagnifyingGlass size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tracks…"
              aria-label="Search tracks"
            />
          </label>
        </Reveal>

        <div className="v3-track-grid">
          {filtered.map((song, i) => {
            const isActive =
              music.activeTitle.toLowerCase() === song.title.toLowerCase() ||
              music.activeSong?.slug === song.slug;
            const playing = isActive && music.isPlaying;
            const unlocked = owned.includes(song.slug);
            return (
              <Reveal key={song.slug} delay={Math.min(i * 0.03, 0.3)}>
                <article className={`v3-track${isActive ? ' is-active' : ''}`}>
                  <button
                    type="button"
                    className="v3-track-cover"
                    onClick={() => (playing ? music.pause() : music.playTrack(song.src, song.title))}
                    aria-label={playing ? `Pause ${song.title}` : `Play ${song.title}`}
                  >
                    <img src={song.cover} alt="" loading="lazy" />
                    <span className="v3-track-play" aria-hidden="true">
                      <span>{playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" />}</span>
                    </span>
                    {playing && (
                      <span className="v3-eq" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                      </span>
                    )}
                  </button>
                  <div className="v3-track-meta">
                    <h3>
                      <Link to={`/song/${song.slug}`}>{song.title}</Link>
                    </h3>
                    <div className="v3-track-links">
                      {song.youtubeId && (
                        <a href={youtubeWatchUrl(song.youtubeId)} target="_blank" rel="noreferrer">
                          Video
                        </a>
                      )}
                      {(song.buy ?? song.apple) && (
                        <a href={song.buy ?? song.apple} target="_blank" rel="noreferrer">
                          Stream
                        </a>
                      )}
                    </div>
                    <div style={{ marginTop: 12 }}>
                      {unlocked ? (
                        <a
                          className="v3-btn v3-btn--ghost"
                          style={{ padding: '10px 22px', fontSize: 12 }}
                          href={song.src}
                          download={`${song.title}.mp3`}
                        >
                          <DownloadSimple size={15} /> Download
                        </a>
                      ) : (
                        <button
                          type="button"
                          className="v3-btn v3-btn--gold"
                          style={{ padding: '10px 22px', fontSize: 12, border: 0, cursor: 'pointer' }}
                          onClick={() => buyTrack(song.slug)}
                        >
                          <LockKey size={15} /> Own it — {formatMoney(TRACK_PRICE_CENTS)}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
