import { Link } from 'react-router-dom';
import { Headphones, Microphone, Play, SpotifyLogo, YoutubeLogo } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import {
  LATEST_EPISODE,
  PODCAST_EPISODES,
  PODCAST_SPOTIFY_EMBED_URL,
  PODCAST_SPOTIFY_SHOW_URL,
  PODCAST_SUBSTACK_URL,
  STUDIO_YOUTUBE_CHANNEL_URL,
} from '../data/podcastEpisodes';

/**
 * /podcast — The 3000 Studios Podcast (mockup section 6).
 *
 * Hosts Follow and Subscribe. All 26 episode titles are transcribed
 * verbatim from the mockup; no durations or descriptions are invented, so
 * rows carry no duration line. Per-episode Watch goes to the 3000 Studios
 * YouTube channel and Listen goes to the Spotify show — the two
 * destinations the existing page already uses. The Substack button stays
 * disabled until a verified Substack URL is supplied (see
 * podcastEpisodes.ts / NOTES.md).
 */

/** Fixed bar heights so the waveform is stable between renders. */
const WAVE_HEIGHTS = [
  34, 62, 48, 88, 55, 96, 40, 72, 58, 100, 44, 80, 52, 92, 38, 68, 60, 84, 46,
  76, 50, 90, 42, 64,
];

function Waveform() {
  return (
    <div className="gv-wave" aria-hidden="true">
      {WAVE_HEIGHTS.map((height, i) => (
        <i
          key={i}
          style={{ height: `${height}%`, animationDelay: `${(i % 8) * 0.09}s` }}
        />
      ))}
    </div>
  );
}

function SubstackButton() {
  if (PODCAST_SUBSTACK_URL.length === 0) {
    return (
      <button
        type="button"
        className="nn-btn nn-btn-ghost"
        disabled
        aria-disabled="true"
        title="Substack link not yet verified — see NOTES.md"
        style={{ opacity: 0.55, cursor: 'not-allowed' }}
      >
        Substack
      </button>
    );
  }
  return (
    <a
      className="nn-btn nn-btn-ghost"
      href={PODCAST_SUBSTACK_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Substack
    </a>
  );
}

export function PodcastPage() {
  const rest = PODCAST_EPISODES.filter((ep) => ep.number !== LATEST_EPISODE.number);

  return (
    <PublicLayoutV2 wallpaper="beams">
      <div className="nn-scope">
        {/* ================= HERO ================= */}
        <section className="nn-hero">
          <span className="nn-kicker">
            <Headphones size={14} style={{ verticalAlign: '-2px' }} /> The Official 3000 Studios Show
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            THE 3000 STUDIOS PODCAST
          </h1>
          <p>
            26 episodes with hosts Follow and Subscribe. Each show opens with
            the day and weather in Acworth and closes the same way every time:
            stars after dark.
          </p>
          <div className="nn-btn-row">
            <a
              className="nn-btn nn-btn-gold"
              href={STUDIO_YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <YoutubeLogo size={18} weight="fill" style={{ verticalAlign: -3, marginRight: 8 }} />
              Watch on YouTube
            </a>
            <SubstackButton />
            <a
              className="nn-btn nn-btn-ghost"
              href={PODCAST_SPOTIFY_SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SpotifyLogo size={18} weight="fill" style={{ verticalAlign: -3, marginRight: 8 }} />
              Listen on Spotify
            </a>
          </div>
        </section>

        {/* ================= HOSTS ================= */}
        <section className="gv-section" aria-label="Hosts">
          <div className="gv-host-grid">
            {(['Follow', 'Subscribe'] as const).map((host) => (
              <article className="gv-host-card" key={host}>
                <Microphone size={26} weight="duotone" style={{ color: 'var(--md-gold, #d4af37)' }} />
                <h3>{host}</h3>
                <p>Co-host</p>
              </article>
            ))}
          </div>
        </section>

        {/* ================= LATEST EPISODE ================= */}
        <section className="gv-section" aria-label="Latest episode">
          <div className="gv-latest">
            <span className="gv-kicker">Latest · Episode {LATEST_EPISODE.number}</span>
            <h3>{LATEST_EPISODE.title}</h3>
            <Waveform />
            <div className="gv-btn-row" style={{ justifyContent: 'flex-start', marginTop: 6 }}>
              <a
                className="nn-btn nn-btn-gold"
                href={STUDIO_YOUTUBE_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Play size={16} weight="bold" style={{ verticalAlign: -2, marginRight: 8 }} />
                Watch
              </a>
              <a
                className="nn-btn nn-btn-ghost"
                href={PODCAST_SPOTIFY_SHOW_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SpotifyLogo size={18} weight="fill" style={{ verticalAlign: -3, marginRight: 8 }} />
                Listen
              </a>
            </div>
          </div>
        </section>

        {/* ================= SPOTIFY PLAYER ================= */}
        <section className="gv-section" aria-label="Listen to the show">
          <div
            style={{
              borderRadius: 18,
              overflow: 'hidden',
              border: '1px solid rgba(212,175,55,0.25)',
              background: '#0b0f16',
            }}
          >
            <iframe
              title="3000 Studios Podcast on Spotify"
              src={PODCAST_SPOTIFY_EMBED_URL}
              width="100%"
              height="352"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </section>

        <LiveLine />

        {/* ================= ALL 26 EPISODES ================= */}
        <section className="gv-section" id="episodes" aria-label="All episodes">
          <div className="gv-section-head">
            <span className="gv-kicker">All 26 episodes</span>
            <h2>Every show, start to finish</h2>
          </div>
          <RevealGroup className="gv-ep-list" stagger={0.06}>
            {rest.map((ep) => (
              <RevealItem key={ep.number}>
                <article className="gv-ep" id={`episode-${ep.number}`}>
                  <span className="gv-ep-num" aria-label={`Episode ${ep.number}`}>
                    {String(ep.number).padStart(2, '0')}
                  </span>
                  <h3 className="gv-ep-title">{ep.title}</h3>
                  <div className="gv-ep-actions">
                    <a
                      className="nn-btn nn-btn-ghost"
                      href={STUDIO_YOUTUBE_CHANNEL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Watch
                    </a>
                    <a
                      className="nn-btn nn-btn-gold"
                      href={PODCAST_SPOTIFY_SHOW_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Listen
                    </a>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div style={{ marginTop: 30, textAlign: 'center' }}>
              <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '0 0 20px' }}>
                Follow the show on Spotify so the next drop lands in your feed automatically.
              </p>
              <a
                className="nn-btn nn-btn-gold"
                href={PODCAST_SPOTIFY_SHOW_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SpotifyLogo size={20} weight="fill" style={{ marginRight: 10, verticalAlign: -3 }} />
                Follow on Spotify
              </a>
            </div>
          </Reveal>
        </section>

        <LiveLine />

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
