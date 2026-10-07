import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Broadcast, CalendarBlank, ChatCircleDots, YoutubeLogo } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { LIVE_STREAM_CONFIG } from '../data/liveStream';
import { detectIsLive } from '../lib/streamLiveDetect';
import { STREAM_CUSTOMER_CODE, STREAM_LIVE_INPUT_ID } from '../lib/streamConfig';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { ADSENSE_LIVE_SLOT } from '../lib/adsense';

/** Cloudflare WHEP playback is available when the Stream env config is set. */
const CAN_USE_WHEP = Boolean(STREAM_CUSTOMER_CODE && STREAM_LIVE_INPUT_ID);

export function LiveBroadcastPage() {
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const check = () => {
      detectIsLive()
        .then((s) => {
          if (!cancelled) setLive(s.live);
        })
        .catch(() => {
          if (!cancelled) setLive(LIVE_STREAM_CONFIG.defaultLive);
        });
    };
    check();
    // Re-check periodically so the feed takes over automatically when the
    // studio goes live while this page is open (any viewer device).
    const poll = window.setInterval(check, 20_000);
    const t = window.setTimeout(() => {
      if (!cancelled) setLive((v) => (v === null ? LIVE_STREAM_CONFIG.defaultLive : v));
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      window.clearTimeout(t);
    };
  }, []);

  const isLive = live === true;
  // WHEP player when live and Stream is configured; YouTube embed is the
  // fallback only when Stream config is absent.
  const useWhepPlayer = isLive && CAN_USE_WHEP;

  return (
    <PublicLayoutV2 wallpaper="nebula">
      <div className="nn-scope">
        <section className="nn-hero">
          <span className={`nn-live-badge ${isLive ? 'is-live' : 'is-off'}`}>
            <span className="nn-dot" />
            {live === null ? 'Checking signal…' : isLive ? 'Live now' : 'Offline'}
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            LIVE COMMAND
          </h1>
          <p>
            The 3000 Studios broadcast deck. When the studio goes live, the feed
            takes over this screen automatically.
          </p>
          <div className="nn-btn-row">
            <a className="nn-btn nn-btn-gold" href={LIVE_STREAM_CONFIG.channelUrl} target="_blank" rel="noreferrer">
              <YoutubeLogo size={18} weight="fill" /> Open channel
            </a>
            <Link className="nn-btn nn-btn-ghost" to="/video">
              Watch the vault
            </Link>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 40 }}>
          <div className="nn-glass" style={{ padding: 0, overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(0,240,255,0.15)',
              }}
            >
              <Broadcast size={20} weight="duotone" style={{ color: 'var(--nn-cyan)' }} />
              <strong style={{ letterSpacing: '0.14em', fontSize: 13 }}>
                {isLive ? 'ON AIR — 3000 STUDIOS' : 'STANDBY — NEXT BROADCAST BELOW'}
              </strong>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
              {useWhepPlayer ? (
                <WhepStreamPlayer
                  title="3000 Studios live stream"
                  muted={false}
                  autoplay
                />
              ) : isLive ? (
                <iframe
                  src={LIVE_STREAM_CONFIG.streamEmbedUrl}
                  title="3000 Studios live stream"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 14,
                    textAlign: 'center',
                    padding: 24,
                  }}
                >
                  <span className="nn-kicker">Signal offline</span>
                  <p style={{ color: 'var(--nn-muted)', maxWidth: 480, margin: 0 }}>
                    The studio is not broadcasting right now. Catch the vault
                    below, or subscribe so you never miss a drop.
                  </p>
                  <a
                    className="nn-btn nn-btn-cyan"
                    href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Subscribe for live alerts
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 40 }}>
          <div className="nn-sec-head">
            <div>
              <span className="nn-kicker nn-kicker--gold">
                <CalendarBlank size={14} style={{ verticalAlign: '-2px' }} /> Broadcast schedule
              </span>
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
                Upcoming Streams
              </h2>
            </div>
          </div>
          <div className="nn-grid">
            {LIVE_STREAM_CONFIG.schedule.map((s) => (
              <article key={s.title} className="nn-card" style={{ padding: 22 }}>
                <span className="nn-kicker">{s.when}</span>
                <h3 style={{ color: '#fff', margin: '12px 0 6px' }}>{s.title}</h3>
                <p style={{ color: 'var(--nn-muted)', fontSize: 14, margin: 0 }}>{s.note}</p>
              </article>
            ))}
          </div>
        </section>

        {LIVE_STREAM_CONFIG.chatEmbedUrl && !useWhepPlayer && (
          <section className="nn-wrap" style={{ marginBottom: 40 }}>
            <div className="nn-sec-head">
              <div>
                <span className="nn-kicker">
                  <ChatCircleDots size={14} style={{ verticalAlign: '-2px' }} /> Live chat
                </span>
                <h2 className="nn-chrome" style={{ fontSize: 'clamp(24px, 4vw, 40px)' }}>
                  Deck Chat
                </h2>
              </div>
            </div>
            <div className="nn-glass" style={{ padding: 0, overflow: 'hidden' }}>
              <iframe
                src={LIVE_STREAM_CONFIG.chatEmbedUrl}
                title="Live chat"
                style={{ width: '100%', height: 420, border: 'none', background: '#000' }}
              />
            </div>
          </section>
        )}

        <section className="nn-wrap">
          <AdSenseUnit slot={ADSENSE_LIVE_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/thunder-dome/privacy">Thunderdome Privacy</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
