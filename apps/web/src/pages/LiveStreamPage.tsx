import { useEffect, useState } from 'react';
import { PublicLayout } from './Home';
import { StreamOverlayLayers } from '../components/StreamOverlayLayers';
import { STREAM_PLAYER_EMBED_SRC } from '../lib/streamConfig';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { loadStreamScene, subscribeStreamScene, type StreamScene } from '../lib/streamScene';
import '../styles/discover.css';

const INQUIRY_EMAIL = 'Team@3000studios.vip';

export function LiveStreamPage() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [live, setLive] = useState(false);

  useEffect(() => subscribeStreamScene(setScene), []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const state = await detectIsLive();
      if (!cancelled) setLive(state.live);
    };
    void poll();
    const id = window.setInterval(poll, 8000);
    const unsub = subscribeHostLive(setLive);
    const onHost = (e: Event) => {
      const detail = (e as CustomEvent).detail as { live?: boolean };
      if (typeof detail?.live === 'boolean') setLive(detail.live);
    };
    window.addEventListener('3000-host-live', onHost);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      unsub();
      window.removeEventListener('3000-host-live', onHost);
    };
  }, []);

  return (
    <PublicLayout variant="blackhole">
      <div className="livePublicClean liveWithNav discoverLive" data-live={live ? '1' : '0'}>
        <header className="livePublicHeader">
          <p className="vipKicker">{live ? 'On air' : 'Standby'}</p>
          <h1 className="livePublicTitle">3000 Studios Live</h1>
        </header>
        <main className="livePublicMain">
          <div className="liveOnlyStage livePublicStage mobileSafe">
            <div className="liveOnlyFeed">
              <iframe
                title="3000 Studios Live"
                src={`${STREAM_PLAYER_EMBED_SRC}${STREAM_PLAYER_EMBED_SRC.includes('?') ? '&' : '?'}preload=auto`}
                className="liveStreamIframe"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
              {live ? <StreamOverlayLayers layers={scene.layers} /> : null}
              <div className={live ? 'liveOnAirBadge' : 'liveStandbyBadge'} aria-live="polite">
                {live ? 'ON AIR' : 'Waiting for host · player stays ready'}
              </div>
            </div>
          </div>
        </main>
        <footer className="livePublicFooter">
          <a className="liveInquiryBtn" href={`mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('3000 Studios Live Stream Inquiry')}`}>Stream Inquiry</a>
        </footer>
      </div>
    </PublicLayout>
  );
}
