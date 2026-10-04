import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass, PlayCircle } from '@phosphor-icons/react';
import { PublicLayout, AdSenseUnit } from './Home';
import { publishedSongs } from '../data/publishedSongs';
import { SongCarousel } from '../components/SongCarousel';
import { OFFICIAL_PLATFORM_LINKS } from '../data/platforms';
import { useGlobalMusic } from '../components/GlobalMusic';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';

export function MusicPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ORIGINALS' | 'SINGLES'>('ALL');
  const music = useGlobalMusic();

  const filteredSongs = useMemo(() => {
    return publishedSongs.filter((song) => {
      const matchSearch = song.title.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === 'ORIGINALS') return song.title.toLowerCase().includes('original') || !song.title.toLowerCase().includes('single');
      if (filter === 'SINGLES') return song.title.toLowerCase().includes('single') || true;
      return true;
    });
  }, [search, filter]);

  const handlePlaySong = (song: typeof publishedSongs[0]) => {
    const src = song.preview || song.src;
    if (src) {
      window.dispatchEvent(
        new CustomEvent('3000-play-track', {
          detail: { src, title: song.title, slug: song.slug },
        })
      );
    }
  };

  return (
    <PublicLayout variant="spiral" compact={false}>
      <div className="nn-scope">
        <section className="nn-hero">
          <div className="nn-btn-row" style={{ marginBottom: 18 }}>
            <span className="nn-kicker">✦ Official discography</span>
            <span className="nn-kicker nn-kicker--gold">{publishedSongs.length} master releases</span>
          </div>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)' }}>
            MUSIC VAULT
          </h1>
          <p>
            Original high-energy electronic, bass, hip-hop, and cybernetic
            compositions produced by Jeremy Swain. Every official DistroKid
            release streams free in full.
          </p>
          <div className="nn-btn-row">
            <a
              className="nn-btn nn-btn-gold"
              href="https://distrokid.com/hyperfollow/3000studios"
              target="_blank"
              rel="noreferrer"
            >
              ✦ HyperFollow hub
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
          <div className="nn-glass" style={{ padding: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 12, color: 'var(--nn-muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
              Stream 3000 Studios across verified platforms
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
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)' }}>
                Official Music Vault ({filteredSongs.length} Tracks)
              </h2>
              <p>Click play on any song to stream instantly or open the high-res detail page.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['ALL', 'ORIGINALS', 'SINGLES'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className={`nn-chip${filter === cat ? ' is-active' : ''}`}
                >
                  {cat}
                </button>
              ))}
              <span style={{ position: 'relative' }}>
                <MagnifyingGlass
                  size={16}
                  style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--nn-muted)' }}
                />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="nn-input"
                  style={{ paddingLeft: 38, minWidth: 180 }}
                />
              </span>
            </div>
          </div>

          <SongCarousel
            songs={filteredSongs}
            onPlay={handlePlaySong}
            activeTitle={music.activeSong.title}
            isPlaying={music.isPlaying}
          />

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <Link className="nn-btn nn-btn-cyan" to="/video">
              <PlayCircle size={18} /> Unlock full videos + downloads — $1
            </Link>
          </div>
        </section>

        <section className="nn-wrap">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
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
    </PublicLayout>
  );
}
