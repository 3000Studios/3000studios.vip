import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { StreamOverlayLayers } from '../components/StreamOverlayLayers';
import { streamPlayerIframeSrc } from '../lib/streamConfig';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { loadStreamScene, subscribeStreamScene, type StreamScene } from '../lib/streamScene';
import { LiveChatPanel, TipJar, ViewerCount, useLiveRoom } from '../components/LiveInteraction';
import '../styles/discover.css';

const INQUIRY_EMAIL = 'Team@3000studios.vip';
const inquiryHref = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('3000 Studios Live Stream Inquiry')}`;

export function LiveStreamPage() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [live, setLive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const liveRoom = useLiveRoom();

  const iframeSrc = `${streamPlayerIframeSrc({
    autoplay: true,
    muted: isMuted,
    primaryColor: 'ffd700',
  })}${streamPlayerIframeSrc({}).includes('?') ? '&' : '?'}preload=auto`;

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
    <PublicLayout variant="blackhole" compact>
      <div className={`livePublicClean liveWithNav liveWatchLayout discoverLive ${chatOpen ? 'is-chat-open' : ''}`} data-live={live ? '1' : '0'}>
        <header className="livePublicHeader">
          <p className={live ? 'livePulse' : 'vipKicker'}>{live ? 'On air' : 'Standby'}</p>
          <h1 className="livePublicTitle">3000 Studios Live</h1>
          <ViewerCount count={liveRoom.viewers} />
        </header>
        <main className="livePublicMain liveWatchMain">
          <div className="liveOnlyStage livePublicStage mobileSafe liveStageFrame">
            <div className="liveOnlyFeed">
              <iframe
                key={isMuted ? 'muted-player' : 'unmuted-player'}
                title="3000 Studios Live"
                src={iframeSrc}
                className="liveStreamIframe"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
              {isMuted ? (
                <button
                  type="button"
                  className="liveSoundToggleBanner"
                  onClick={() => setIsMuted(false)}
                  title="Click to turn on live stream audio"
                >
                  <span className="soundIcon" aria-hidden="true">🔊</span>
                  <div className="soundTextBox">
                    <strong>TAP FOR SOUND</strong>
                    <span>Stream starts muted for browser autoplay. Tap to listen with full audio.</span>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  className="liveSoundIndicatorBtn"
                  onClick={() => setIsMuted(true)}
                  title="Mute stream audio"
                >
                  🔊 Audio playing (tap to mute)
                </button>
              )}
              {live ? <StreamOverlayLayers layers={scene.layers} /> : null}
              <div className={live ? 'liveOnAirBadge' : 'liveStandbyBadge'} aria-live="polite">
                {live ? 'ON AIR' : 'Waiting for host · player stays ready'}
              </div>
            </div>
          </div>
          <aside className="liveWatchRail" aria-label="Viewer interaction">
            <TipJar />
            <LiveChatPanel messages={liveRoom.messages} onSent={liveRoom.setMessages} />
            <button
              type="button"
              className="liveInquiryBtn"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'Link copied' : 'Copy live link'}
            </button>
            <a className="liveInquiryBtn" href={inquiryHref}>
              Stream Inquiry
            </a>
            <Link className="liveInquiryBtn" to="/music">
              Music
            </Link>
          </aside>
        </main>
        <div className="liveMobileDock">
          <button type="button" className="liveDockBtn" onClick={() => setChatOpen((v) => !v)}>
            {chatOpen ? 'Close chat' : 'Chat & tips'}
          </button>
          <a className="liveInquiryBtn" href={inquiryHref}>
            Inquiry
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
