import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from './Home';
import { publishedSongs } from '../data/publishedSongs';
import { SongCarousel } from '../components/SongCarousel';
import { OFFICIAL_PLATFORM_LINKS } from '../data/platforms';
import { useGlobalMusic } from '../components/GlobalMusic';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

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
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            MUSIC HERO: 47 TRACKS & UNIVERSAL DISTRIBUTION
            ========================================================================= */}
        <section className="vip-hero-hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker">✦ OFFICIAL DISCOGRAPHY</span>
            <span className="md-kicker" style={{ color: '#ffd700' }}>47 MASTER RELEASES</span>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text">3000 STUDIOS MUSIC</span>
          </h1>

          <p style={{ maxWidth: 660, margin: '0 auto 24px' }}>
            Original high-energy electronic, bass, hip-hop, and cybernetic compositions produced by Jeremy Swain. All 47 official releases stream free in full.
          </p>

          <div className="vip-badge-row">
            <a className="vip-btn-gold" href="https://distrokid.com/hyperfollow/3000studios" target="_blank" rel="noreferrer">
              ✦ DistroKid HyperFollow Hub
            </a>
            <a className="vip-btn-obsidian" href="https://www.youtube.com/@3000Studio?sub_confirmation=1" target="_blank" rel="noreferrer">
              ▶ YouTube Channel
            </a>
            <Link className="vip-btn-obsidian" to="/video">
              ▣ 47 Music Videos
            </Link>
          </div>
        </section>

        {/* =========================================================================
            PLATFORM ICON STRIP
            ========================================================================= */}
        <section style={{ maxWidth: 1280, margin: '0 auto 40px', padding: '0 16px' }}>
          <div className="vip-glass-card" style={{ padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: 14, fontSize: 13, color: 'var(--vip-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Stream 3000 Studios Across Verified Platforms:
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {OFFICIAL_PLATFORM_LINKS.map((p) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  className="vip-btn-obsidian"
                  style={{ fontSize: 13, padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <span style={{ color: p.color }}>{p.icon}</span>
                  <span>{p.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            47-SONG CATALOG WITH FILTERS & INSTANT PREVIEW
            ========================================================================= */}
        <section style={{ maxWidth: 1280, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', margin: 0, fontWeight: 800 }}>
                Official Music Vault ({filteredSongs.length} Tracks)
              </h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
                Click play on any song to stream instantly or open the high-res detail page.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {(['ALL', 'ORIGINALS', 'SINGLES'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className="vip-btn-obsidian"
                  style={{
                    fontSize: 12,
                    padding: '8px 14px',
                    borderColor: filter === cat ? '#ffd700' : undefined,
                    background: filter === cat ? 'rgba(255, 215, 0, 0.15)' : undefined,
                    color: filter === cat ? '#ffd700' : undefined,
                  }}
                >
                  {cat}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search catalog..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'rgba(10, 13, 22, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 14,
                  outline: 'none',
                  minWidth: 180,
                }}
              />
            </div>
          </div>

          <SongCarousel
            songs={filteredSongs}
            onPlay={handlePlaySong}
            activeTitle={music.activeSong.title}
            isPlaying={music.isPlaying}
          />
        </section>

        {/* =========================================================================
            ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

      </div>
    </PublicLayout>
  );
}
