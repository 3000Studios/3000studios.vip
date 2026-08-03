import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';
import { WhepPlayer, buildWhepUrl, STREAM_MODE_KEY } from '../lib/webrtcStream';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const ADMIN_PATH = '/admin';

const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '654382980fc1896d6e16b1e66a299bd6';

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export function LiveStreamPage() {
  const customerCode =
    import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
  const liveInputId =
    import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
  const configured = Boolean(customerCode && liveInputId);
  const embedUrl = configured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;
  const whepUrl = configured ? buildWhepUrl(customerCode, liveInputId) : null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<WhepPlayer | null>(null);
  const [mode, setMode] = useState<'whep' | 'hls'>('whep');
  const [status, setStatus] = useState<'connecting' | 'live' | 'idle' | 'error'>('connecting');
  const isLive = status === 'live';

  const tryConnect = useCallback(async () => {
    if (!whepUrl || !videoRef.current) {
      setStatus('idle');
      setMode('hls');
      return;
    }
    setStatus('connecting');
    try {
      await playerRef.current?.stop();
      const player = new WhepPlayer(whepUrl);
      playerRef.current = player;
      await player.start(videoRef.current);
      setStatus('live');
      setMode('whep');
      try {
        localStorage.setItem(STREAM_MODE_KEY, 'webrtc');
      } catch {
        /* ignore */
      }
    } catch {
      setStatus('idle');
      setMode('hls');
    }
  }, [whepUrl]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await tryConnect();
    })();

    const poll = window.setInterval(() => {
      if (cancelled) return;
      if (status !== 'live') void tryConnect();
    }, 20000);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      void playerRef.current?.stop();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tryConnect]);

  const statusLabel = useMemo(() => {
    if (isLive) return '● Live · low-latency WebRTC';
    if (status === 'connecting') return 'Checking for live broadcast…';
    return 'Standby · VIP catalog with cover art until go-live';
  }, [isLive, status]);

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live.</motion.h1>
          <motion.p variants={fadeUp}>
            Until the owner goes live, this window rotates the VIP catalog with cover art and a
            STREAMING SOON ticker. When the broadcast starts from the admin console, the live feed
            takes over automatically.
          </motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <Link className="studioButton primary" to={ADMIN_PATH}>
              Owner Go Live
            </Link>
            <a
              className="studioButton secondary"
              href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20live%20stream`}
            >
              Stream Inquiry
            </a>
          </motion.div>
        </motion.section>

        <section className="streamPublicPanel">
          <StreamFrame isLive={isLive}>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              controls={isLive}
              className="streamVideo"
              style={{ display: isLive && mode === 'whep' ? 'block' : 'none' }}
            />

            {isLive && mode === 'hls' && embedUrl ? (
              <iframe
                title="3000 Studios live stream"
                src={embedUrl}
                className="streamIframe"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : null}

            {!isLive ? <StandbyMusicWindow /> : null}
          </StreamFrame>

          <div className="streamToolbar">
            <span className="streamStatus">{statusLabel}</span>
            <div className="streamToolbarActions">
              {!isLive ? (
                <button
                  type="button"
                  className="studioButton secondary"
                  style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                  onClick={() => void tryConnect()}
                >
                  Check for live now
                </button>
              ) : (
                <button
                  type="button"
                  className="studioButton secondary"
                  style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                  onClick={() => setMode((m) => (m === 'whep' ? 'hls' : 'whep'))}
                >
                  Switch to {mode === 'whep' ? 'HLS player' : 'WebRTC player'}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
