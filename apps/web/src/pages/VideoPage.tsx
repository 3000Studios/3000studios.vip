import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayCircle, FilmStrip, GameController } from '@phosphor-icons/react';
import { PublicLayout, AdSenseUnit } from './Home';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS } from '../data/videoCatalog';
import { UnlockCard } from '../components/UnlockCard';
import { readUnlocks } from '../lib/unlockPayments';
import { ADSENSE_VIDEO_SLOT } from '../lib/adsense';

export function VideoPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'music' | 'cinematics'>('music');

  const q = searchQuery.toLowerCase();
  const music = MUSIC_VIDEOS.filter(
    (v) => v.title.toLowerCase().includes(q) || v.subtitle.toLowerCase().includes(q),
  );
  const cinematics = CINEMATIC_VIDEOS.filter((v) => v.title.toLowerCase().includes(q));

  const items = tab === 'music' ? music : cinematics;
  const unlockedCount = readUnlocks().length;

  return (
    <PublicLayout variant="electric" compact={false}>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">
            <FilmStrip size={14} style={{ verticalAlign: '-2px' }} /> Official cinema theater
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            VIDEO VAULT
          </h1>
          <p>
            Every video plays a free preview right here. Unlock the full video
            plus the full song for $1 — yours forever, download included.
            {unlockedCount > 0 && (
              <>
                {' '}
                <strong style={{ color: 'var(--nn-gold)' }}>
                  {unlockedCount} unlocked on this device.
                </strong>
              </>
            )}
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button
              type="button"
              className={`nn-chip${tab === 'music' ? ' is-active' : ''}`}
              onClick={() => setTab('music')}
            >
              <FilmStrip size={14} style={{ verticalAlign: '-2px' }} /> Music videos ({MUSIC_VIDEOS.length})
            </button>
            <button
              type="button"
              className={`nn-chip${tab === 'cinematics' ? ' is-active' : ''}`}
              onClick={() => setTab('cinematics')}
            >
              <GameController size={14} style={{ verticalAlign: '-2px' }} /> Thunderdome cinematics ({CINEMATIC_VIDEOS.length})
            </button>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="nn-input"
              style={{ minWidth: 220 }}
            />
          </div>

          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--nn-muted)' }}>
              No videos match “{searchQuery}”.
            </p>
          ) : (
            <div className="nn-grid">
              {items.map((item) => (
                <UnlockCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>

        <section className="nn-wrap">
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
    </PublicLayout>
  );
}
