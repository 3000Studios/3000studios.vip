import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FilmStrip, GameController } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS } from '../data/videoCatalog';
import { VideoFacadeCard } from '../components/VideoFacadeCard';

const PAGE_SIZE = 12;

/**
 * VIDEO VAULT — fast-track 2026-10-29 (audit Phase 1).
 * The $1.00 full-video unlock is REMOVED entirely: it gated nothing (the
 * preview and "full" YouTube IDs were the same) and its checkout was never
 * connected. Videos are YouTube embeds presented as click-to-play facades
 * (thumbnail + play button; the iframe loads only on click), paginated
 * with Load More so the full catalog never mounts at once.
 */
export function VideoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'music' | 'cinematics'>('music');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const q = searchQuery.toLowerCase();
  const music = MUSIC_VIDEOS.filter(
    (v) => v.title.toLowerCase().includes(q) || v.subtitle.toLowerCase().includes(q),
  );
  const cinematics = CINEMATIC_VIDEOS.filter((v) =>
    v.title.toLowerCase().includes(q),
  );

  const items = tab === 'music' ? music : cinematics;
  const shown = items.slice(0, visible);

  return (
    <PublicLayoutV2 wallpaper="beams">
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">
            <FilmStrip size={14} style={{ verticalAlign: '-2px' }} /> Official
            cinema theater
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            VIDEO VAULT
          </h1>
          <p>
            Every video here plays <strong>free</strong> — tap a poster and it
            plays right here via YouTube. No unlock, no paywall, no checkout:
            the full videos live on the 3000 Studios YouTube channel.
          </p>
          <div className="nn-btn-row">
            <a
              className="nn-btn nn-btn-gold"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
            >
              Subscribe @3000Studio
            </a>
            <Link className="nn-btn nn-btn-ghost" to="/music">
              <PlayCircle size={18} /> Music catalog
            </Link>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 20,
            }}
          >
            <button
              type="button"
              className={`nn-chip${tab === 'music' ? ' is-active' : ''}`}
              onClick={() => {
                setTab('music');
                setVisible(PAGE_SIZE);
              }}
            >
              <FilmStrip size={14} style={{ verticalAlign: '-2px' }} /> Music
              videos ({MUSIC_VIDEOS.length})
            </button>
            <button
              type="button"
              className={`nn-chip${tab === 'cinematics' ? ' is-active' : ''}`}
              onClick={() => {
                setTab('cinematics');
                setVisible(PAGE_SIZE);
              }}
            >
              <GameController size={14} style={{ verticalAlign: '-2px' }} />{' '}
              Thunder Dome cinematics ({CINEMATIC_VIDEOS.length})
            </button>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              className="nn-input"
              style={{ minWidth: 220 }}
            />
          </div>

          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--nn-muted)' }}>
              No videos match “{searchQuery}”.
            </p>
          ) : (
            <>
              <div className="nn-grid">
                {shown.map((item) => (
                  <VideoFacadeCard key={item.id} item={item} />
                ))}
              </div>
              {visible < items.length && (
                <div className="sp-loadmore">
                  <button
                    type="button"
                    className="nn-btn nn-btn-cyan"
                    onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  >
                    Load more videos ({items.length - visible} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* No AdSense unit on /video: aggregate surface listing explicit
            titles — ads-off by route (audit §4.3). */}

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
