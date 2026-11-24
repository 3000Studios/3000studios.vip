import { useEffect, useState } from 'react';
import { YoutubeLogo } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head, Ext, Go } from '../kit';
import { LIVE_STREAM_CONFIG } from '../../data/liveStream';
import { detectIsLive } from '../../lib/streamLiveDetect';
import { STREAM_CUSTOMER_CODE, STREAM_LIVE_INPUT_ID } from '../../lib/streamConfig';
import { WhepStreamPlayer } from '../../components/WhepStreamPlayer';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_LIVE_SLOT } from '../../lib/adsense';

/** Cloudflare WHEP playback is available when the Stream env config is set. */
const CAN_USE_WHEP = Boolean(STREAM_CUSTOMER_CODE && STREAM_LIVE_INPUT_ID);

export function LiveCommand() {
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
    // Re-check so the feed takes over while the page is open.
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
  const useWhep = isLive && CAN_USE_WHEP;
  const status = live === null ? 'Checking signal' : isLive ? 'On air' : 'Off air';

  return (
    <EmpirePage>
      <PageHero
        eyebrow="Live command"
        title={
          <>
            On air from
            <br />
            Acworth
          </>
        }
        lead="Watch 3000 Studios live: the broadcast deck, the schedule and the chat. When the studio goes live, the feed takes over this screen by itself."
        orb="rgba(61,242,168,.32)"
      >
        <div className="ep-ctas">
          <Ext href={`${LIVE_STREAM_CONFIG.channelUrl}?sub_confirmation=1`} gold>
            <YoutubeLogo size={18} weight="fill" /> Subscribe for alerts
          </Ext>
          <Ext href={`${LIVE_STREAM_CONFIG.channelUrl}/streams`}>Broadcast archive</Ext>
        </div>
      </PageHero>

      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', alignItems: 'start' }}>
          <div className="ep-glass ep-gilt ep-live" style={{ position: 'relative', gridColumn: 'span 1' }}>
            {useWhep ? (
              <WhepStreamPlayer title="3000 Studios live stream" muted={false} autoplay />
            ) : isLive ? (
              <iframe
                src={LIVE_STREAM_CONFIG.streamEmbedUrl}
                title="3000 Studios live stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="inner">
                <span className="ep-chip">{status}</span>
                <h3 style={{ fontSize: 40 }}>Next broadcast</h3>
                <p style={{ color: 'var(--fg-2)' }}>Announced here and on the 3000 Studios channels.</p>
              </div>
            )}
            <div className="ep-hud" aria-hidden="true">
              <span>DECK 01</span>
              <span style={{ color: isLive ? '#ff4d4d' : 'var(--em-jade)' }}>{isLive ? 'LIVE' : 'STANDBY'}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 18 }}>
            <div className="ep-glass ep-card">
              <span className={isLive ? 'ep-chip is-on' : 'ep-chip'}>{status}</span>
              <h3>Follow and Subscribe</h3>
              <p>The podcast is recorded in front of a live audience on this stage.</p>
              <div className="ep-foot">
                <Go to="/podcast">Episodes</Go>
              </div>
            </div>
            <div className="ep-glass ep-card">
              <span className="em-kicker">Archive</span>
              <h3>Every show, saved</h3>
              <p>All broadcasts are archived to the 3000 Studios YouTube channel.</p>
              <div className="ep-foot">
                <Ext href={`${LIVE_STREAM_CONFIG.channelUrl}/streams`}>Open the archive</Ext>
              </div>
            </div>
          </div>
        </div>
      </section>

      {LIVE_STREAM_CONFIG.chatEmbedUrl && !useWhep && isLive && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Live chat" title="Deck chat" />
            <div className="ep-glass">
              <iframe src={LIVE_STREAM_CONFIG.chatEmbedUrl} title="Live chat" style={{ width: '100%', height: 420, border: 0, background: '#000', display: 'block' }} />
            </div>
          </div>
        </section>
      )}

      {LIVE_STREAM_CONFIG.schedule.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Broadcast schedule" title={<>On the <span className="ep-metal">calendar</span></>} />
            <div className="ep-grid ep-g3">
              {LIVE_STREAM_CONFIG.schedule.map((s) => (
                <article key={s.title} className="ep-glass ep-card ep-lift">
                  <span className="em-kicker">{s.when}</span>
                  <h3>{s.title.replace(/\s*[—-]\s*LIVE\s*$/i, '')}</h3>
                  <p>{s.note}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ep-sec">
        <div className="em-wrap">
          <AdSenseUnit slot={ADSENSE_LIVE_SLOT} />
        </div>
      </section>
    </EmpirePage>
  );
}
