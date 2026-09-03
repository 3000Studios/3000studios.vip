import { useEffect, useState, type CSSProperties } from 'react';
import { PublicLayout } from './Home';
import { StreamOverlayLayers } from '../components/StreamOverlayLayers';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { STREAM_LIVE_INPUT_ID, STREAM_PLAYER_EMBED_SRC, STREAM_WHEP_URL } from '../lib/streamConfig';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { loadStreamScene, subscribeStreamScene, type StreamScene } from '../lib/streamScene';

const INQUIRY_EMAIL = 'Team@3000studios.vip';
const TITLE = '3000 Studios.vip LIVE STREAM';

/**
 * Public /live always mounts the Cloudflare Stream iframe so the window is
 * never empty. WHEP is an optional low-latency overlay when the host is live.
 */
export function LiveStreamPage() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [live, setLive] = useState(false);
  const [whepKey, setWhepKey] = useState(0);
  const [whepStatus, setWhepStatus] = useState<'connecting' | 'live' | 'error' | 'idle'>('idle');

  useEffect(() => {
    return subscribeStreamScene(setScene);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const state = await detectIsLive();
      if (!cancelled) {
        setLive(state.live);
        if (state.live) {
          setWhepStatus((s) => (s === 'idle' || s === 'error' ? 'connecting' : s));
        } else if (whepStatus !== 'live') {
          setWhepStatus('idle');
        }
      }
    };
    void poll();
    const id = window.setInterval(poll, 2500);
    const unsub = subscribeHostLive((flag) => {
      setLive(flag);
      if (flag) setWhepKey((k) => k + 1);
    });
    const onHost = (e: Event) => {
      const detail = (e as CustomEvent).detail as { live?: boolean };
      if (typeof detail?.live === 'boolean') {
        setLive(detail.live);
        if (detail.live) setWhepKey((k) => k + 1);
      }
    };
    window.addEventListener('3000-host-live', onHost);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      unsub();
      window.removeEventListener('3000-host-live', onHost);
    };
  }, [whepStatus]);

  useEffect(() => {
    if (!live) return;
    if (whepStatus === 'live' || whepStatus === 'error') return;
    const retry = window.setInterval(() => {
      setWhepKey((k) => k + 1);
    }, 5000);
    const failSafe = window.setTimeout(() => {
      setWhepStatus('error');
    }, 10000);
    return () => {
      window.clearInterval(retry);
      window.clearTimeout(failSafe);
    };
  }, [live, whepStatus]);

  const inquiryHref = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('3000 Studios Live Stream Inquiry')}&body=${encodeURIComponent('Hi 3000 Studios team,\n\n')}`;
  const useWhep = live && whepStatus !== 'error';

  return (
    <PublicLayout variant="blackhole">
      <div className="livePublicClean liveWithNav" data-live={live ? '1' : '0'}>
        <header className="livePublicHeader">
          <h1 className="livePublicTitle beatGoldTitle live3dTitle" aria-label={TITLE}>
            {Array.from(TITLE).map((char, index) => (
              <span
                key={`${char}-${index}`}
                className={char === ' ' ? 'beatGoldSpace' : 'beatGoldLetter live3dLetter'}
                style={{ '--letter-index': index } as CSSProperties}
                aria-hidden="true"
              >
                {char}
              </span>
            ))}
          </h1>
        </header>

        <main className="livePublicMain">
          <div className="liveOnlyStage livePublicStage mobileSafe">
            <div className="liveOnlyFeed">
              {useWhep ? (
                <WhepStreamPlayer
                  key={whepKey}
                  uid={STREAM_LIVE_INPUT_ID}
                  whepUrl={STREAM_WHEP_URL}
                  title="3000 Studios Live"
                  muted={false}
                  autoplay
                  onStatus={(s) => setWhepStatus(s)}
                />
              ) : (
                <iframe
                  title="3000 Studios Live"
                  src={`${STREAM_PLAYER_EMBED_SRC}${STREAM_PLAYER_EMBED_SRC.includes('?') ? '&' : '?'}preload=auto`}
                  className="liveStreamIframe"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
              {live && whepStatus === 'connecting' ? (
                <div className="liveConnectingOverlay" aria-live="polite">
                  <strong>Connecting to live feed…</strong>
                  <span>Low-latency WebRTC first. Cloudflare player stays underneath.</span>
                </div>
              ) : null}
              {!live ? (
                <div className="liveStandbyBadge" aria-live="polite">
                  Waiting for host · player stays ready
                </div>
              ) : (
                <div className="liveOnAirBadge" aria-live="polite">
                  ON AIR
                </div>
              )}
            </div>
            {live ? <StreamOverlayLayers layers={scene.layers} /> : null}
          </div>
        </main>

        <footer className="livePublicFooter">
          <a className="liveInquiryBtn" href={inquiryHref}>
            Stream Inquiry
          </a>
        </footer>
      </div>
    </PublicLayout>
  );
}
