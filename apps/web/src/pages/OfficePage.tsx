import { useCallback, useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import './office.css';

/**
 * THE OFFICE — owner-only live window (Boss order, 2026-10-31).
 *
 * The room camera publishes from the Legion (OBS, "Office-Private" profile)
 * to a MediaMTX relay that listens ONLY on the studio tailnet. This page
 * fetches its player endpoints at runtime from /office-cam-config.json,
 * which is injected into the deployment only — never committed to git.
 *
 * The 8888 keypad below is a UI gate (same code as the .space door), NOT
 * real security. The feed's actual privacy is network-level: off the
 * tailnet, the player endpoints simply do not answer, and this window
 * falls back to its closed/branded state.
 *
 * Playback notes (verified against MediaMTX, 2026-10-31):
 * - WHEP/WebRTC carries VIDEO ONLY. The camera's audio is AAC, which no
 *   WebRTC client can receive, and the relay rejects any offer that asks
 *   for an audio track (HTTP 400) — so the WebRTC offer is video-only.
 * - Sound rides the HLS feed (a few seconds behind). "Sound mode" below
 *   switches the window to HLS; "Instant mode" switches back to WebRTC.
 */

const GATE_KEY = 'vip-office-gate-v1';
const PASSCODE = '8888';
const CONFIG_URL = '/office-cam-config.json';

type OfficeCamConfig = { whep?: string; hls?: string };
type FeedMode = 'connecting' | 'webrtc' | 'hls' | 'offline';

async function loadConfig(): Promise<OfficeCamConfig | null> {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as OfficeCamConfig;
    if (!data || (typeof data.whep !== 'string' && typeof data.hls !== 'string')) return null;
    return data;
  } catch {
    return null;
  }
}

function waitForIceComplete(pc: RTCPeerConnection, timeoutMs: number): Promise<void> {
  if (pc.iceGatheringState === 'complete') return Promise.resolve();
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);
    pc.onicegatheringstatechange = () => {
      if (pc.iceGatheringState === 'complete') {
        window.clearTimeout(timer);
        resolve();
      }
    };
  });
}

function waitForFirstFrame(video: HTMLVideoElement, timeoutMs: number): Promise<boolean> {
  return new Promise((resolve) => {
    if (video.videoWidth > 0 && video.readyState >= 2) {
      resolve(true);
      return;
    }
    const timer = window.setTimeout(() => {
      cleanup();
      resolve(video.videoWidth > 0);
    }, timeoutMs);
    const onFrame = () => {
      if (video.videoWidth > 0) {
        cleanup();
        resolve(true);
      }
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeEventListener('playing', onFrame);
      video.removeEventListener('timeupdate', onFrame);
    };
    video.addEventListener('playing', onFrame);
    video.addEventListener('timeupdate', onFrame);
  });
}

function OfficeWindow() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const runRef = useRef(0);
  const configRef = useRef<OfficeCamConfig | null>(null);
  const [mode, setMode] = useState<FeedMode>('connecting');
  const [muted, setMuted] = useState(true);

  const teardown = useCallback(() => {
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {
        /* already closed */
      }
      pcRef.current = null;
    }
    if (hlsRef.current) {
      try {
        hlsRef.current.destroy();
      } catch {
        /* already destroyed */
      }
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
      video.removeAttribute('src');
      video.load();
    }
  }, []);

  const connectWhep = useCallback(
    async (whepUrl: string, run: number): Promise<boolean> => {
      const video = videoRef.current;
      if (!video) return false;
      const pc = new RTCPeerConnection();
      pcRef.current = pc;
      const stream = new MediaStream();
      pc.addTransceiver('video', { direction: 'recvonly' });
      pc.ontrack = (event) => {
        stream.addTrack(event.track);
        if (video.srcObject !== stream) video.srcObject = stream;
      };
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await waitForIceComplete(pc, 3500);
        if (runRef.current !== run) return false;
        const controller = new AbortController();
        const timer = window.setTimeout(() => controller.abort(), 9000);
        let res: Response;
        try {
          res = await fetch(whepUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/sdp' },
            body: pc.localDescription?.sdp ?? '',
            signal: controller.signal,
          });
        } finally {
          window.clearTimeout(timer);
        }
        if (!res.ok) return false;
        const answer = await res.text();
        if (runRef.current !== run) return false;
        await pc.setRemoteDescription({ type: 'answer', sdp: answer });
        video.muted = true;
        setMuted(true);
        await video.play().catch(() => undefined);
        return await waitForFirstFrame(video, 12000);
      } catch {
        return false;
      }
    },
    [],
  );

  const connectHls = useCallback(
    async (hlsUrl: string, run: number): Promise<boolean> => {
      const video = videoRef.current;
      if (!video) return false;
      try {
        if (Hls.isSupported()) {
          const hls = new Hls({ maxBufferLength: 30 });
          hlsRef.current = hls;
          const fatal = new Promise<boolean>((resolve) => {
            hls.on(Hls.Events.ERROR, (_event, data) => {
              if (data.fatal) resolve(false);
            });
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              void video.play().catch(() => undefined);
            });
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          video.muted = true;
          setMuted(true);
          const framed = waitForFirstFrame(video, 15000);
          return await Promise.race([fatal, framed]);
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = hlsUrl;
          video.muted = true;
          setMuted(true);
          await video.play().catch(() => undefined);
          return await waitForFirstFrame(video, 15000);
        }
        return false;
      } catch {
        return false;
      } finally {
        void run;
      }
    },
    [],
  );

  const start = useCallback(
    async (prefer: 'auto' | 'webrtc' | 'hls') => {
      const run = ++runRef.current;
      teardown();
      setMode('connecting');
      if (!configRef.current) {
        configRef.current = await loadConfig();
        if (runRef.current !== run) return;
      }
      const cfg = configRef.current;
      if (!cfg) {
        setMode('offline');
        return;
      }
      const order: Array<'webrtc' | 'hls'> =
        prefer === 'hls' ? ['hls', 'webrtc'] : prefer === 'webrtc' ? ['webrtc', 'hls'] : ['webrtc', 'hls'];
      for (const kind of order) {
        if (runRef.current !== run) return;
        const ok =
          kind === 'webrtc'
            ? cfg.whep
              ? await connectWhep(cfg.whep, run)
              : false
            : cfg.hls
              ? await connectHls(cfg.hls, run)
              : false;
        if (runRef.current !== run) return;
        if (ok) {
          setMode(kind);
          return;
        }
        teardown();
      }
      setMode('offline');
    },
    [connectHls, connectWhep, teardown],
  );

  useEffect(() => {
    void start('auto');
    return () => {
      runRef.current += 1;
      teardown();
    };
  }, [start, teardown]);

  const live = mode === 'webrtc' || mode === 'hls';
  const statusText =
    mode === 'connecting'
      ? 'Opening the office window…'
      : mode === 'webrtc'
        ? 'LIVE — instant view'
        : mode === 'hls'
          ? 'LIVE — with sound (a few seconds behind)'
          : 'The office window is closed right now.';

  return (
    <div className="officeWindowWrap">
      <div className="officeWindowFrame">
        <video
          ref={videoRef}
          className={`officeWindowVideo${live ? ' isLive' : ''}`}
          playsInline
          autoPlay
          muted
          aria-label="Live view of the 3000 Studios office"
        />
        {!live && (
          <div className="officeWindowPoster" aria-hidden={mode === 'connecting'}>
            <div className="officePosterBrand">3000 STUDIOS</div>
            <div className="officePosterTitle">THE OFFICE</div>
            <div className="officePosterLine">
              {mode === 'offline'
                ? 'This window opens when the studio stream is on — and only from inside the studio network.'
                : 'One moment…'}
            </div>
          </div>
        )}
        <div className={`officeLiveBadge${live ? ' on' : ''}`}>
          <span className="officeLiveDot" />
          {live ? 'LIVE' : mode === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
        </div>
      </div>
      <div className="officeWindowBar">
        <p className="officeStatus" role="status">
          {statusText}
        </p>
        <div className="officeControls">
          {mode === 'webrtc' && (
            <button type="button" className="officeBtn" onClick={() => void start('hls')}>
              Sound mode
            </button>
          )}
          {mode === 'hls' && (
            <>
              <button
                type="button"
                className="officeBtn"
                onClick={() => {
                  const video = videoRef.current;
                  if (video) {
                    video.muted = !video.muted;
                    setMuted(video.muted);
                  }
                }}
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button type="button" className="officeBtn" onClick={() => void start('webrtc')}>
                Instant mode
              </button>
            </>
          )}
          {mode === 'offline' && (
            <button
              type="button"
              className="officeBtn"
              onClick={() => {
                configRef.current = null;
                void start('auto');
              }}
            >
              Try again
            </button>
          )}
        </div>
      </div>
      <p className="officeNote">
        Private owner view. The camera feed never leaves the studio network — no public stream, no
        Twitch, no YouTube.
      </p>
    </div>
  );
}

function OfficeGate({ onUnlock }: { onUnlock: () => void }) {
  const [entry, setEntry] = useState('');
  const [denied, setDenied] = useState(false);

  const press = useCallback(
    (digit: string) => {
      setEntry((prev) => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;
        if (next.length === 4) {
          if (next === PASSCODE) {
            try {
              sessionStorage.setItem(GATE_KEY, '1');
            } catch {
              /* private mode — gate just won't persist */
            }
            window.setTimeout(onUnlock, 150);
          } else {
            setDenied(true);
            window.setTimeout(() => {
              setEntry('');
              setDenied(false);
            }, 700);
          }
        }
        return next;
      });
    },
    [onUnlock],
  );

  const backspace = useCallback(() => {
    setDenied(false);
    setEntry((prev) => prev.slice(0, -1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      if (e.key === 'Backspace') backspace();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, backspace]);

  return (
    <div className="officeGate">
      <p className="officeGateKicker">3000 STUDIOS — OWNER ACCESS</p>
      <h1 className="officeGateTitle">THE OFFICE</h1>
      <p className="officeGateHint">{denied ? 'That code did not open the door.' : 'Enter the passcode.'}</p>
      <div className={`officeDots${denied ? ' denied' : ''}`} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`officeDot${entry.length > i ? ' filled' : ''}`} />
        ))}
      </div>
      <div className="officeKeypad" role="group" aria-label="Passcode keypad">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className="officeKey" onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button
          type="button"
          className="officeKey officeKeyGhost"
          onClick={() => {
            setEntry('');
            setDenied(false);
          }}
        >
          C
        </button>
        <button type="button" className="officeKey" onClick={() => press('0')}>
          0
        </button>
        <button type="button" className="officeKey officeKeyGhost" onClick={backspace}>
          ⌫
        </button>
      </div>
    </div>
  );
}

export function OfficePage() {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(GATE_KEY) === '1';
    } catch {
      return false;
    }
  });

  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="officePage">
        {unlocked ? (
          <>
            <header className="officeHead">
              <p className="officeKicker">3000 STUDIOS</p>
              <h1 className="officeTitle">THE OFFICE</h1>
              <p className="officeSub">The Boss&apos;s window — live from the studio room.</p>
            </header>
            <OfficeWindow />
          </>
        ) : (
          <OfficeGate onUnlock={() => setUnlocked(true)} />
        )}
      </section>
    </PublicLayoutV2>
  );
}
