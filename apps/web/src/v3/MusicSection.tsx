import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowSquareOut, MagnifyingGlass, Pause, Play } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { useGlobalMusic } from '../components/GlobalMusic';
import { publishedSongs } from '../data/publishedSongs';
import { settleReturnPurchase } from '../lib/commerce';
import { ARTIST_LINKS, getTrackLinks } from '../lib/trackLinks';
import { hasPreview } from '../lib/previews';

/** Settle any pending VIP plan purchase when Stripe returns with ?paid=1. */
// eslint-disable-next-line react-refresh/only-export-components
export function settlePendingPurchase() {
  void settleReturnPurchase();
}

/* MUSIC MODEL (Boss order 2026-10-27): on-site track sales are retired.
   Songs are free on the streaming platforms, so this catalog plays a
   preview of every track (the produced 1-minute preview where one
   exists, otherwise the label's short clip — lib/previews) and sends
   listeners out for the full song: per-track verified links only
   (lib/trackLinks); Spotify/Amazon exist at artist level only and are
   labeled as such. The old $0.99 "Own it" grant/settle flow is gone,
   along with owned-track downloads. */
export function MusicSection() {
  const music = useGlobalMusic();
  const [query, setQuery] = useState('');

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
            Every released track, with a preview playing right here — a full
            1-minute preview where the studio cut exists, the label&apos;s
            short clip everywhere else. The full song is free on the
            streaming platforms — pick yours under any track and it counts.
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
          <div style={{ marginTop: 18 }}>
            <Link
              to="/beats"
              className="v3-btn v3-btn--ghost"
              style={{ padding: '12px 28px', fontSize: 12 }}
            >
              Making your own record? License an instrumental
            </Link>
          </div>
        </Reveal>

        <div className="v3-track-grid">
          {filtered.map((song, i) => {
            const isActive =
              music.activeTitle.toLowerCase() === song.title.toLowerCase() ||
              music.activeSong?.slug === song.slug;
            const playing = isActive && music.isPlaying;
            const links = getTrackLinks(song.slug);
            return (
              <Reveal key={song.slug} delay={Math.min(i * 0.03, 0.3)}>
                <article className={`v3-track acss-shine${isActive ? ' is-active' : ''}`}>
                  <button
                    type="button"
                    className="v3-track-cover"
                    onClick={() => (playing ? music.pause() : music.playTrack(song.src, song.title))}
                    aria-label={
                      playing ? `Pause preview of ${song.title}` : `Play the preview of ${song.title}`
                    }
                  >
                    <img src={song.cover} alt={`${song.title} album artwork`} loading="lazy" />
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
                    <p className="v3-track-preview-note">
                      {hasPreview(song.slug)
                        ? playing
                          ? 'Playing the 1-minute preview'
                          : '1-minute preview'
                        : 'Preview clip'}
                    </p>
                    {links.length > 0 && (
                      <div className="v3-track-links" aria-label={`Hear the full song: ${song.title}`}>
                        <span className="v3-track-links-label">Full song:</span>
                        {links.map((l) => (
                          <a key={l.id} href={l.url} target="_blank" rel="noreferrer">
                            {l.label} <ArrowSquareOut size={11} aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="v3-artist-platforms acss-glass">
            <strong>Every song, on your platform</strong>
            <p>
              Per-track Spotify and Amazon links don&apos;t exist in the
              label&apos;s records, so here are the artist pages instead —
              every release lives there:
            </p>
            <div className="v3-track-links">
              {ARTIST_LINKS.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer">
                  {l.label} <ArrowSquareOut size={11} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
