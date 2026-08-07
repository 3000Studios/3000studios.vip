import { useEffect, useState } from 'react';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import { StreamOverlayLayers } from '../components/StreamOverlayLayers';
import { StandbySoon } from '../components/StandbySoon';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { STREAM_PLAYER_UID } from '../lib/streamConfig';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { loadStreamScene, subscribeStreamScene, type StreamScene } from '../lib/streamScene';

/**
 * Public live page — viewer-only.
 * Live: fullscreen stream window + host overlay layers.
 * Offline: music standby + “live soon” (styled from admin).
 * No setup UI, protocol docs, or control chrome.
 */
export function LiveStreamPage() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [live, setLive] = useState(false);
  const [preferWhep, setPreferWhep] = useState(true);

  useEffect(() => {
    setScene(loadStreamScene());
    return subscribeStreamScene(setScene);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const state = await detectIsLive();
      if (!cancelled) setLive(state.live);
    };
    void poll();
    const id = window.setInterval(poll, 8000);
    const unsub = subscribeHostLive((flag) => {
      if (flag) setLive(true);
      else void poll();
    });
    return () => {
      cancelled = true;
      window.clearInterval(id);
      unsub();
    };
  }, []);

  return (
    <div className="liveOnlyShell" data-live={live ? '1' : '0'}>
      <div className="liveOnlyStage">
        {live ? (
          <>
            <div className="liveOnlyFeed">
              {preferWhep ? (
                <WhepStreamPlayer
                  uid={STREAM_PLAYER_UID}
                  title="3000 Studios Live"
                  muted={false}
                  autoplay
                  onStatus={(s) => {
                    if (s === 'error') setPreferWhep(false);
                  }}
                />
              ) : (
                <CloudflareStreamPlayer
                  uid={STREAM_PLAYER_UID}
                  title="3000 Studios Live"
                  autoplay
                  muted={false}
                />
              )}
            </div>
            <StreamOverlayLayers layers={scene.layers} />
          </>
        ) : (
          <StandbySoon scene={scene} />
        )}
      </div>
    </div>
  );
}
