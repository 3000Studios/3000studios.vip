import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { PublicLayout } from './Home';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import { StreamOverlayLayers } from '../components/StreamOverlayLayers';
import { StandbySoon } from '../components/StandbySoon';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { STREAM_PLAYER_UID } from '../lib/streamConfig';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { loadStreamScene, subscribeStreamScene, type StreamScene } from '../lib/streamScene';

const INQUIRY_EMAIL = 'Team@3000studios.vip';
const TITLE = '3000 Studios.vip LIVE STREAM';

/**
 * Public /live — site nav always on top, stream window + gold title + inquiry.
 */
export function LiveStreamPage() {
  const [scene, setScene] = useState<StreamScene>(() => loadStreamScene());
  const [live, setLive] = useState(false);
  const [preferWhep, setPreferWhep] = useState(true);
  const beatCleanup = useRef<(() => void) | null>(null);

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

  useEffect(() => {
    if (live) {
      let t = 0;
      const id = window.setInterval(() => {
        t += 0.08;
        const soft = 0.12 + Math.sin(t) * 0.06 + Math.sin(t * 2.3) * 0.04;
        document.documentElement.style.setProperty('--beat', soft.toFixed(3));
      }, 50);
      return () => window.clearInterval(id);
    }
    return undefined;
  }, [live]);

  useEffect(() => {
    return () => {
      beatCleanup.current?.();
      beatCleanup.current = null;
    };
  }, []);

  const inquiryHref = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent('3000 Studios Live Stream Inquiry')}&body=${encodeURIComponent('Hi 3000 Studios team,\n\n')}`;

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
          <div className="liveOnlyStage livePublicStage">
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
              <StandbySoon
                scene={scene}
                hideControls
                forceMusic
                shuffle
                onAudioElement={(el) => {
                  beatCleanup.current?.();
                  beatCleanup.current = null;
                  if (!el) return;
                  beatCleanup.current = attachBeatAnalyser(el);
                }}
              />
            )}
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

function attachBeatAnalyser(audio: HTMLAudioElement): () => void {
  let raf = 0;
  let ctx: AudioContext | null = null;
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return () => undefined;
    ctx = new AudioCtx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length / 255;
      document.documentElement.style.setProperty('--beat', Math.max(0.05, avg).toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    const resume = () => {
      void ctx?.resume();
    };
    audio.addEventListener('play', resume);
    tick();
    return () => {
      cancelAnimationFrame(raf);
      audio.removeEventListener('play', resume);
      try {
        source.disconnect();
        analyser.disconnect();
        void ctx?.close();
      } catch {
        /* ignore */
      }
    };
  } catch {
    return () => undefined;
  }
}
