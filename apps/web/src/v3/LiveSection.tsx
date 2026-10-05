import { useEffect, useState } from 'react';
import { Broadcast } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { MagneticLink } from './chrome';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { STREAM_PLAYER_EMBED_SRC } from '../lib/streamConfig';

/* Live stream — kept front and center */
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
          {live ? (
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
              <iframe
                src={`${STREAM_PLAYER_EMBED_SRC}?autoplay=true&muted=true`}
                title="3000 Studios live stream"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{ width: '100%', aspectRatio: '16 / 9', border: 0, display: 'block' }}
              />
            </div>
          ) : (
            <div className="v3-card" style={{ marginTop: 40, textAlign: 'center' }}>
              <Broadcast size={40} weight="duotone" color="#f1b74e" />
              <h3 style={{ margin: '14px 0 10px', fontSize: 22 }}>The stage is dark right now</h3>
              <p style={{ color: '#9aa0ae', maxWidth: '52ch', margin: '0 auto 24px', lineHeight: 1.7 }}>
                When the lights come up, it happens here first. Follow the channel so you
                never miss a broadcast.
              </p>
              <div className="v3-cta-row" style={{ marginTop: 0 }}>
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
            </div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
