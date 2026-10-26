import { useEffect, useState } from 'react';
import { Reveal } from '../v2/Reveal';
import { MagneticLink } from './chrome';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';

/**
 * Live stream — front and center.
 *
 * The player is the YouTube channel live embed: it always resolves to
 * whatever broadcast is currently live on the 3000 Studios channel
 * (24/7 stream), with no per-broadcast video ID to maintain. It never
 * autoplays — the visitor presses play.
 */
const YOUTUBE_CHANNEL_ID = 'UCTQnEFZUIutrFuDlxGj9cDA';
const YOUTUBE_LIVE_EMBED_SRC = `https://www.youtube.com/embed/live_stream?channel=${YOUTUBE_CHANNEL_ID}`;
const YOUTUBE_LIVE_URL = 'https://www.youtube.com/@3000Studio/live';

export function LiveSection() {
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void detectIsLive().then((s) => {
      if (!cancelled) setLive(s.live);
    });
    const unsub = subscribeHostLive((v) => setLive(v));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <section id="live" className="v3-section">
      <div className="v3-wrap">
        <Reveal>
          <div className="v3-eyebrow">Broadcast</div>
          <h2 className="v3-h2">
            Live <em>stage</em>
          </h2>
          <p className="v3-lead">
            Live shows, studio sessions, and listening parties happen here.{' '}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                color: live ? '#ff2fb3' : '#9aa0ae',
                fontWeight: 700,
              }}
            >
              <span className="v3-live-dot" aria-hidden="true" />
              {live ? 'On air now' : live === null ? 'Checking…' : 'Offline'}
            </span>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div
            className="v3-card"
            style={{
              padding: 0,
              overflow: 'hidden',
              marginTop: 40,
              borderColor: 'rgba(255,47,179,.5)',
              boxShadow: '0 0 80px rgba(255,47,179,.25), 0 30px 80px rgba(0,0,0,.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '14px 18px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontWeight: 700,
                }}
              >
                <span className="v3-live-dot" aria-hidden="true" />
                Watch Live — 3000 Studios 24/7
              </span>
              <a
                href={YOUTUBE_LIVE_URL}
                target="_blank"
                rel="noreferrer"
                style={{ color: '#f1b74e', fontWeight: 600 }}
              >
                Open in YouTube
              </a>
            </div>
            <iframe
              src={YOUTUBE_LIVE_EMBED_SRC}
              title="Watch Live — 3000 Studios 24/7"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ width: '100%', aspectRatio: '16 / 9', border: 0, display: 'block' }}
            />
          </div>
          <div className="v3-cta-row">
            <a
              className="v3-btn v3-btn--gold"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
            >
              Get notified
            </a>
            <MagneticLink to="/go-live" className="v3-btn v3-btn--ghost">
              Owner? Go live
            </MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
