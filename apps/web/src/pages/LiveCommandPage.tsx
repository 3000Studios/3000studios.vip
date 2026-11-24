import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Broadcast, CalendarBlank, ChatCircleDots, Heart, Users, YoutubeLogo } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { LIVE_STREAM_CONFIG } from '../data/liveStream';
import { detectIsLive } from '../lib/streamLiveDetect';
import { STREAM_CUSTOMER_CODE, STREAM_LIVE_INPUT_ID } from '../lib/streamConfig';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { ADSENSE_LIVE_SLOT } from '../lib/adsense';

/**
 * /live — Live Command, redesigned as the ON AIR FROM ACWORTH broadcast
 * deck (mockup section 5).
 *
 * Honest live state, same as the page it replaces: `detectIsLive()` runs
 * on mount and re-checks every 20s; the feed takes over automatically
 * when the studio actually goes live. Until then the stage shows OFF AIR
 * with the next-broadcast panel — no fake "live" badge, no staged stream.
 * Schedule, support cards and chat are carried over unchanged from the
 * existing LiveBroadcastPage.
 */

/** Cloudflare WHEP playback is available when the Stream env config is set. */
const CAN_USE_WHEP = Boolean(STREAM_CUSTOMER_CODE && STREAM_LIVE_INPUT_ID);

const YOUTUBE_SUBSCRIBE_URL = 'https://www.youtube.com/@3000Studio?sub_confirmation=1';

export function LiveCommandPage() {
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
        {/* ================= HERO ================= */}
        <section className="nn-hero">
          <span className={`nn-live-badge ${isLive ? 'is-live' : 'is-off'}`}>
            <span className="nn-dot" />
            {live === null ? 'Checking signal…' : isLive ? 'Live now' : 'Offline'}
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            ON AIR FROM ACWORTH
          </h1>
          <p>
            Watch 3000 Studios live: broadcast deck, schedule and chat.
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

        {/* ================= BROADCAST DECK ================= */}
        <section className="gv-section" aria-label="Broadcast deck">
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
                <WhepStreamPlayer title="3000 Studios live stream" muted={false} autoplay />
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
                  <a className="nn-btn nn-btn-cyan" href={YOUTUBE_SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                    Subscribe for live alerts
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= OFF AIR / NEXT BROADCAST ================= */}
        <section className="gv-section" aria-label="Next broadcast">
          <div className="gv-status-panel">
            <span className="gv-kicker gv-kicker--crimson">
              <span className="gv-dot gv-dot--off" aria-hidden="true" />
              {isLive ? 'On air' : 'Off air'}
            </span>
            <h2>Next broadcast</h2>
            <p>Announced here and on 3000 Studios social channels.</p>
          </div>
        </section>

        {/* ================= STAGE 01 + PODCAST ================= */}
        <section className="gv-section" aria-label="Stage 01">
          <div className="gv-stage-grid">
            <div className="gv-stage-panel">
              <span className="gv-kicker">Stage 01 — Standby</span>
              <h3>Follow and Subscribe</h3>
              <p>The podcast is recorded in front of a live audience on this stage.</p>
              <div className="gv-btn-row" style={{ justifyContent: 'flex-start' }}>
                <Link className="nn-btn nn-btn-gold" to="/podcast">
                  Episodes
                </Link>
              </div>
            </div>
            <div className="gv-stage-panel">
              <span className="gv-kicker">Archive — Every show, saved</span>
              <h3>Missed a broadcast?</h3>
              <p>All broadcasts are archived to the 3000 Studios YouTube channel.</p>
              <div className="gv-btn-row" style={{ justifyContent: 'flex-start' }}>
                <a
                  className="nn-btn nn-btn-ghost"
                  href={LIVE_STREAM_CONFIG.channelUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <YoutubeLogo size={18} weight="fill" style={{ verticalAlign: -3, marginRight: 8 }} />
                  Open the archive
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SCHEDULE ================= */}
        <section className="gv-section" aria-label="Broadcast schedule">
          <div className="gv-section-head">
            <span className="gv-kicker">
              <CalendarBlank size={14} style={{ verticalAlign: '-2px' }} /> Broadcast schedule
            </span>
            <h2>Upcoming streams</h2>
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

        {/* ================= SUPPORT ================= */}
        <section className="gv-section" aria-label="Support the broadcast">
          <div className="nn-grid">
            <article className="nn-card" style={{ padding: 22 }}>
              <span className="nn-kicker">YouTube</span>
              <h3 style={{ color: '#fff', margin: '12px 0 6px' }}>Super Chat &amp; Stickers</h3>
              <p style={{ color: 'var(--nn-muted)', fontSize: 14, margin: '0 0 16px' }}>
                Drop a paid highlight in the live chat during any broadcast — your message pins
                to the top of the deck.
              </p>
              <a className="nn-btn nn-btn-gold" href={YOUTUBE_SUBSCRIBE_URL} target="_blank" rel="noreferrer">
                <YoutubeLogo size={18} weight="fill" /> Open the channel
              </a>
            </article>
            <article className="nn-card" style={{ padding: 22 }}>
              <span className="nn-kicker">Direct</span>
              <h3 style={{ color: '#fff', margin: '12px 0 6px' }}>Tip the studio</h3>
              <p style={{ color: 'var(--nn-muted)', fontSize: 14, margin: '0 0 16px' }}>
                Send a one-time tip anytime — no account needed. 100% goes to 3000 Studios
                productions.
              </p>
              <a className="nn-btn nn-btn-cyan" href={LIVE_STREAM_CONFIG.channelUrl} target="_blank" rel="noreferrer">
                <Heart size={18} weight="fill" /> Tip via YouTube
              </a>
            </article>
            <article className="nn-card" style={{ padding: 22 }}>
              <span className="nn-kicker">Ongoing</span>
              <h3 style={{ color: '#fff', margin: '12px 0 6px' }}>Memberships</h3>
              <p style={{ color: 'var(--nn-muted)', fontSize: 14, margin: '0 0 16px' }}>
                Channel memberships unlock badges, emotes, and member-only streams as the
                community grows.
              </p>
              <Link className="nn-btn nn-btn-ghost" to="/vip">
                <Users size={18} weight="duotone" /> VIP perks
              </Link>
            </article>
          </div>
        </section>

        {/* ================= CHAT ================= */}
        {LIVE_STREAM_CONFIG.chatEmbedUrl && !useWhepPlayer && (
          <section className="gv-section" aria-label="Live chat">
            <div className="gv-section-head">
              <span className="gv-kicker">
                <ChatCircleDots size={14} style={{ verticalAlign: '-2px' }} /> Live chat
              </span>
              <h2>Deck chat</h2>
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

        <section className="gv-section">
          <AdSenseUnit slot={ADSENSE_LIVE_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/aeropocalypse/privacy">Aeropocalypse Privacy</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
