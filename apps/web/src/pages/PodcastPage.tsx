import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import {
  Headphones,
  Microphone,
  Play,
  Sparkle,
  SpotifyLogo,
  YoutubeLogo,
} from '@phosphor-icons/react';
import { LazyYouTube } from '../components/LazyYouTube';
import { PODCAST_EPISODES, PODCAST_SHOW, podcastWatchUrl } from '../data/podcastEpisodes';

const SHOW_URL = PODCAST_SHOW.spotifyShow;
const SHOW_EMBED = 'https://open.spotify.com/embed/show/033SHVotmOb7vSOUOOcmFI';
// Verified live 2026-10-05: R2 bucket "3000studios-cinematics", served via cdn.3000studios.vip (HTTP 200, video/mp4).
const HERO_VIDEO = 'https://cdn.3000studios.vip/cinematics/game-intro-v1.mp4';

/**
 * /podcast — Follow and Subscribe, the 3000 Studios Podcast hub.
 * Hero streams a muted looping studio cinematic; the Spotify show embed is
 * the audio player; every episode (from src/data/podcastEpisodes.ts) gets a
 * card with its YouTube embed and links.
 */
export function PodcastPage() {
  return (
    <PublicLayoutV2 wallpaper="beams">
      <style>{`
        .pod-hero { position: relative; overflow: hidden; border-bottom: 1px solid rgba(0,240,255,.14); }
        .pod-hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .5; }
        .pod-hero-shade { position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(5,7,10,.72) 0%, rgba(5,7,10,.55) 45%, var(--nn-bg) 100%); }
        .pod-hero-inner { position: relative; z-index: 1; padding: clamp(72px, 12vw, 140px) 0 clamp(48px, 7vw, 88px); }
        .pod-headline { font-family: var(--nn-font); font-weight: 800; letter-spacing: .01em;
          font-size: clamp(2.6rem, 7.5vw, 5.5rem); line-height: 1.02; margin: 18px 0 0; color: #fff; }
        .pod-shimmer { background: linear-gradient(100deg, var(--nn-gold) 10%, #fff6c9 30%, var(--nn-cyan) 55%, var(--nn-gold) 80%);
          background-size: 220% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: pod-shimmer 6s linear infinite; }
        @keyframes pod-shimmer { to { background-position: 220% center; } }
        .pod-glow { animation: pod-glow 3.2s ease-in-out infinite; }
        @keyframes pod-glow {
          0%, 100% { text-shadow: 0 0 26px rgba(0,240,255,.35), 0 0 60px rgba(255,215,0,.18); }
          50% { text-shadow: 0 0 40px rgba(0,240,255,.6), 0 0 90px rgba(255,215,0,.32); }
        }
        .pod-host-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 18px;
          border: 1px solid rgba(255,215,0,.35); border-radius: 999px; background: rgba(255,215,0,.06);
          color: var(--nn-gold); font-weight: 700; font-size: 14px; }
        .pod-player-shell { border-radius: 18px; overflow: hidden; border: 1px solid rgba(0,240,255,.22);
          box-shadow: 0 18px 70px rgba(0,240,255,.12); background: #0b0f16; }
        .pod-ep { display: grid; grid-template-columns: 64px 1fr; gap: 18px; padding: 22px;
          border: 1px solid rgba(0,240,255,.14); border-radius: 16px; background: rgba(10,14,20,.72); }
        .pod-ep-num { font-family: var(--nn-font); font-weight: 800; font-size: 30px; color: transparent;
          -webkit-text-stroke: 1.5px var(--nn-cyan); line-height: 1; }
        .pod-ep-video { margin-top: 16px; border-radius: 12px; overflow: hidden; aspect-ratio: 16 / 9;
          background: #000; border: 1px solid rgba(0,240,255,.14); }
        .pod-ep-video .lazyYouTube { width: 100%; height: 100%; }
        @media (max-width: 560px) { .pod-ep { grid-template-columns: 1fr; } .pod-ep-num { font-size: 22px; } }
        .pod-cta-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 26px; }
        .nn-btn-big { padding: 16px 30px; font-size: 17px; border-radius: 14px; }
        @media (prefers-reduced-motion: reduce) {
          .pod-shimmer, .pod-glow { animation: none; }
        }
      `}</style>

      {/* HERO — welcoming animated intro over a looping studio cinematic */}
      <section className="pod-hero">
        {/* No autoplay above the fold (fast-track 2026-10-29): static
            poster frame; the Spotify embed below is the player. */}
        <video
          className="pod-hero-video"
          src={HERO_VIDEO}
          muted
          loop
          playsInline
          preload="none"
          poster="/media/official-3000-studios-profile.webp"
          aria-hidden="true"
        />
        <div className="pod-hero-shade" aria-hidden="true" />
        <div className="pod-hero-inner">
          <div className="v2-wrap" style={{ textAlign: 'center' }}>
            <Reveal>
              <span className="v2-kicker">
                <Headphones size={15} weight="bold" style={{ marginRight: 8, verticalAlign: -2 }} />
                The Official 3000 Studios Show
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h1 className="pod-headline pod-glow">
                Pull up a chair.
                <br />
                <span className="pod-shimmer">This is the 3000 Studios Podcast.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="v2-lede" style={{ maxWidth: 640, margin: '20px auto 0' }}>
                Follow and Subscribe is the official 3000 Studios podcast — the studio, the
                music, the books, and the Aeropocalypse game, straight from the source. Every
                episode is right below, streaming free.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <div style={{ marginTop: 22 }}>
                <span className="pod-host-pill">
                  <Microphone size={16} weight="bold" />
                  Hosted by Follow &amp; Subscribe
                </span>
              </div>
            </Reveal>
            <Reveal delay={0.4}>
              <div className="pod-cta-row" style={{ justifyContent: 'center' }}>
                <a
                  className="nn-btn nn-btn-gold nn-btn-big"
                  href={SHOW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SpotifyLogo size={20} weight="fill" style={{ marginRight: 10, verticalAlign: -3 }} />
                  Listen on Spotify
                </a>
                <a className="nn-btn nn-btn-ghost nn-btn-big" href="#episodes">
                  <Play size={18} weight="bold" style={{ marginRight: 10, verticalAlign: -2 }} />
                  Browse Episodes
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STREAMING PLAYER — the actual show, embedded */}
      <section className="v2-section" id="listen">
        <div className="v2-wrap" style={{ maxWidth: 860 }}>
          <Reveal>
            <span className="v2-kicker">Stream It Right Here</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="v2-display" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)' }}>
              Press play. <span className="v2-grad-text">That&apos;s it.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 10 }}>
              The full show streams below — no app to install, no account needed to listen.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="pod-player-shell" style={{ marginTop: 26 }}>
              <iframe
                title="3000 Studios Podcast on Spotify"
                src={SHOW_EMBED}
                width="100%"
                height="352"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              />
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      {/* EPISODES — rendered from src/data/podcastEpisodes.ts */}
      <section className="v2-section" id="episodes">
        <div className="v2-wrap" style={{ maxWidth: 860 }}>
          <Reveal>
            <span className="v2-kicker">Every Episode</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="v2-display" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)' }}>
              The full run — <span className="v2-grad-text">{PODCAST_EPISODES.length} episodes</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 10 }}>
              Watch every episode right here, or take the show with you:
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="pod-cta-row" style={{ marginTop: 18 }}>
              <a
                className="nn-btn nn-btn-gold"
                href={PODCAST_SHOW.youtubeChannel}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px 22px', fontSize: 15 }}
              >
                <YoutubeLogo size={18} weight="fill" style={{ marginRight: 8, verticalAlign: -3 }} />
                YouTube Channel
              </a>
              <a
                className="nn-btn nn-btn-ghost"
                href={PODCAST_SHOW.spotifyShow}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px 22px', fontSize: 15 }}
              >
                <SpotifyLogo size={18} weight="fill" style={{ marginRight: 8, verticalAlign: -3 }} />
                Spotify Show
              </a>
              <a
                className="nn-btn nn-btn-ghost"
                href={PODCAST_SHOW.substack}
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: '12px 22px', fontSize: 15 }}
              >
                Read on Substack
              </a>
            </div>
          </Reveal>
          <div style={{ marginTop: 26, gap: 18 }}>
          <RevealGroup className="v2-grid" stagger={0.12}>
            {PODCAST_EPISODES.map((ep) => (
              <RevealItem key={ep.n}>
                <article className="pod-ep" id={`episode-${ep.n}`}>
                  <div className="pod-ep-num">{String(ep.n).padStart(2, '0')}</div>
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--nn-font)',
                        fontSize: 20,
                        margin: '0 0 8px',
                        color: '#fff',
                        lineHeight: 1.3,
                      }}
                    >
                      Ep. {ep.n} — {ep.title}
                    </h3>
                    <div className="pod-ep-video">
                      <LazyYouTube
                        videoId={ep.youtubeId}
                        title={`Follow and Subscribe — Ep. ${ep.n}: ${ep.title}`}
                      />
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginTop: 14 }}>
                      <a
                        className="nn-btn nn-btn-cyan"
                        href={podcastWatchUrl(ep)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: '10px 20px', fontSize: 14 }}
                      >
                        <YoutubeLogo size={15} weight="fill" style={{ marginRight: 8, verticalAlign: -2 }} />
                        Watch on YouTube
                      </a>
                      {ep.spotifyUrl && (
                        <a
                          className="nn-btn nn-btn-ghost"
                          href={ep.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '10px 20px', fontSize: 14 }}
                        >
                          <SpotifyLogo size={15} weight="fill" style={{ marginRight: 8, verticalAlign: -2 }} />
                          Listen on Spotify
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
          </div>

          <Reveal delay={0.1}>
            <div
              className="v2-card"
              style={{
                marginTop: 30,
                padding: '28px clamp(20px, 4vw, 36px)',
                textAlign: 'center',
                borderColor: 'rgba(255,215,0,.3)',
              }}
            >
              <Sparkle size={26} weight="fill" style={{ color: 'var(--nn-gold)' }} />
              <p
                style={{
                  fontFamily: 'var(--nn-font)',
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#fff',
                  margin: '12px 0 6px',
                }}
              >
                More episodes are on the way.
              </p>
              <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '0 0 20px' }}>
                Follow the show on Spotify and YouTube so the next drop lands in your feed
                automatically.
              </p>
              <div className="pod-cta-row" style={{ justifyContent: 'center', marginTop: 0 }}>
                <a
                  className="nn-btn nn-btn-gold nn-btn-big"
                  href={SHOW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SpotifyLogo size={20} weight="fill" style={{ marginRight: 10, verticalAlign: -3 }} />
                  Follow on Spotify
                </a>
                <a
                  className="nn-btn nn-btn-ghost nn-btn-big"
                  href={PODCAST_SHOW.youtubeChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <YoutubeLogo size={20} weight="fill" style={{ marginRight: 10, verticalAlign: -3 }} />
                  Subscribe on YouTube
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
