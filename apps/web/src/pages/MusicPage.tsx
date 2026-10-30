import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, Play, Pause } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { publishedSongs, type PublishedSong } from '../data/publishedSongs';
import { OFFICIAL_PLATFORM_LINKS } from '../data/platforms';
import { useGlobalMusic } from '../components/GlobalMusic';

const PAGE_SIZE = 12;

/** Dedupe by slug — counts and rendering derive from data, never hardcoded. */
const UNIQUE_SONGS: PublishedSong[] = Array.from(
  new Map(publishedSongs.map((s) => [s.slug, s])).values(),
);

/** Deterministic waveform bars from the slug (poster art, not audio data). */
function waveBars(slug: string): number[] {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return Array.from({ length: 28 }, (_, i) => {
    h = (h * 1103515245 + 12345 + i) >>> 0;
    return 22 + ((h >> 8) % 78);
  });
}

function SonicPoster({
  song,
  index,
  onPlay,
  isCurrent,
  isPlaying,
}: {
  song: PublishedSong;
  index: number;
  onPlay: (song: PublishedSong) => void;
  isCurrent: boolean;
  isPlaying: boolean;
}) {
  const bars = waveBars(song.slug);
  return (
    <article className="sp-poster">
      <div className="sp-poster-art">
        <img
          src={song.cover || '/media/official-3000-studios-profile.webp'}
          alt={`${song.title} cover art`}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              '/media/official-3000-studios-profile.webp';
          }}
        />
        <span className="sp-poster-n">№ {String(index + 1).padStart(2, '0')}</span>
        <span className="sp-poster-preview">1-min preview</span>
      </div>
      <div className="sp-wave" aria-hidden="true">
        {bars.map((v, i) => (
          <i key={i} style={{ height: `${v}%` }} />
        ))}
      </div>
      <div className="sp-poster-body">
        <h3>
          <Link to={`/song/${song.slug}`}>{song.title}</Link>
        </h3>
        <p className="sp-liner">
          3000 Studios · Official release. Plays as a 1-minute preview here —
          the full track lives on Apple Music, Spotify &amp; every major
          platform.
        </p>
        <div className="sp-poster-actions">
          <button type="button" className="sp-play" onClick={() => onPlay(song)}>
            {isCurrent && isPlaying ? (
              <>
                <Pause size={16} weight="fill" /> Pause preview
              </>
            ) : (
              <>
                <Play size={16} weight="fill" /> Play preview
              </>
            )}
          </button>
          <Link className="sp-link" to={`/song/${song.slug}`}>
            Poster page
          </Link>
          {song.apple && (
            <a className="sp-link" href={song.apple} target="_blank" rel="noreferrer">
              Apple Music — full track
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function MusicPage() {
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const music = useGlobalMusic();

  const filteredSongs = useMemo(() => {
    const q = search.toLowerCase();
    return UNIQUE_SONGS.filter((song) => song.title.toLowerCase().includes(q));
  }, [search]);

  const shown = filteredSongs.slice(0, visible);

  const handlePlaySong = (song: PublishedSong) => {
    const src = song.preview || song.src;
    if (src) {
      window.dispatchEvent(
        new CustomEvent('3000-play-track', {
          detail: { src, title: song.title, slug: song.slug },
        }),
      );
    }
  };

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <div className="nn-scope">
        {/* Sonic Print hero — static poster field, NO autoplay video. */}
        <section className="nn-hero">
          <div className="nn-btn-row" style={{ marginBottom: 18 }}>
            <span className="nn-kicker">✦ Official discography</span>
            <span className="nn-kicker nn-kicker--gold">
              {UNIQUE_SONGS.length} master releases
            </span>
          </div>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)' }}>
            MUSIC VAULT
          </h1>
          <p>
            Original high-energy electronic, bass, hip-hop, and cybernetic
            compositions produced by Jeremy Swain — presented as Sonic Print
            posters.
          </p>
          <div className="sp-hero-note">
            <strong>How listening works here:</strong> songs play as{' '}
            <strong>1-minute previews</strong> on this site. Full tracks live
            on the streaming platforms — every poster carries its Apple Music
            link, and the full catalog is on Spotify and all major platforms.
          </div>
          <div className="nn-btn-row" style={{ marginTop: 20 }}>
            <a
              className="nn-btn nn-btn-gold"
              href="https://distrokid.com/hyperfollow/3000studios"
              target="_blank"
              rel="noreferrer"
            >
              ✦ HyperFollow hub — full tracks
            </a>
            <a
              className="nn-btn nn-btn-ghost"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
            >
              ▶ YouTube channel
            </a>
            <Link className="nn-btn nn-btn-ghost" to="/video">
              ▣ Music videos
            </Link>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 40 }}>
          <div className="nn-glass acss-texture" style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 12, color: 'var(--nn-muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              Full tracks stream on verified platforms
            </div>
            <div className="nn-btn-row">
              {OFFICIAL_PLATFORM_LINKS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="nn-btn nn-btn-ghost"
                  style={{ fontSize: 13, padding: '8px 16px' }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                  <span>{p.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <div className="nn-sec-head">
            <div>
              <h2
                className="nn-chrome-gold"
                style={{ fontSize: 'clamp(24px, 4.5vw, 36px)' }}
              >
                Sonic Print Catalog ({filteredSongs.length} Tracks)
              </h2>
              <p>
                Press play for the 1-minute preview, or open the poster page
                for the full release details and platform links.
              </p>
            </div>
            <span style={{ position: 'relative' }}>
              <MagnifyingGlass
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--nn-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setVisible(PAGE_SIZE);
                }}
                className="nn-input"
                style={{ paddingLeft: 38, minWidth: 180 }}
              />
            </span>
          </div>

          {shown.length === 0 ? (
            <p style={{ color: 'var(--nn-muted)' }}>No songs match “{search}”.</p>
          ) : (
            <div className="sp-grid sp-reel">
              {shown.map((song, i) => (
                <SonicPoster
                  key={song.slug}
                  song={song}
                  index={i}
                  onPlay={handlePlaySong}
                  isCurrent={music.activeSong.title === song.title}
                  isPlaying={music.isPlaying}
                />
              ))}
            </div>
          )}

          {visible < filteredSongs.length && (
            <div className="sp-loadmore">
              <button
                type="button"
                className="nn-btn nn-btn-cyan"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
              >
                Load more posters ({filteredSongs.length - visible} remaining)
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <a
              className="nn-btn nn-btn-gold"
              href="https://distrokid.com/hyperfollow/3000studios"
              target="_blank"
              rel="noreferrer"
            >
              Full tracks on every platform — HyperFollow hub
            </a>
          </div>
        </section>

        {/* No AdSense unit on /music: aggregate catalog surface listing
            explicit titles — ads-off by route (audit §4.3). */}

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
