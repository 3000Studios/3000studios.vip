import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { WhepPlayer, buildWhepUrl, STREAM_MODE_KEY } from '../lib/webrtcStream';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const ADMIN_PATH = '/admin';

const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '6502a441fdad0df6eebf3270a569c1ab';

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

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      if (!whepUrl || !videoRef.current) return;
      setStatus('connecting');
      try {
        const player = new WhepPlayer(whepUrl);
        playerRef.current = player;
        await player.start(videoRef.current);
        if (!cancelled) {
          setStatus('live');
          setMode('whep');
          try {
            localStorage.setItem(STREAM_MODE_KEY, 'webrtc');
          } catch {
            /* ignore */
          }
        }
      } catch {
        if (!cancelled) {
          setStatus('idle');
          setMode('hls');
        }
      }
    }

    void connect();

    return () => {
      cancelled = true;
      void playerRef.current?.stop();
      playerRef.current = null;
    };
  }, [whepUrl]);

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live.</motion.h1>
          <motion.p variants={fadeUp}>
            Phone and browser broadcasts appear here instantly via Cloudflare WebRTC. Owner goes live
            from the admin console (passcode 3000) — no OBS required.
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
          <div
            style={{
              position: 'relative',
              aspectRatio: '16 / 9',
              borderRadius: 16,
              overflow: 'hidden',
              border: '1px solid rgba(255,211,106,0.22)',
              boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              background: '#000',
            }}
          >
            {/* WHEP player for phone / browser WHIP broadcasts */}
            <video
              ref={videoRef}
              playsInline
              autoPlay
              controls
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                background: '#000',
                display: mode === 'whep' ? 'block' : 'none',
              }}
            />

            {/* HLS / Stream iframe fallback (OBS RTMP path) */}
            {mode === 'hls' && embedUrl ? (
              <iframe
                title="3000 Studios live stream"
                src={embedUrl}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : null}

            {status === 'connecting' && mode === 'whep' ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  color: 'rgba(255,255,255,0.65)',
                  fontWeight: 700,
                  fontSize: 14,
                  pointerEvents: 'none',
                }}
              >
                Connecting to live feed…
              </div>
            ) : null}

            {status === 'idle' && mode === 'hls' ? (
              <div
                style={{
                  position: 'absolute',
                  bottom: 12,
                  left: 12,
                  right: 12,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.55)',
                  fontSize: 12,
                  fontWeight: 600,
                  pointerEvents: 'none',
                }}
              >
                Waiting for broadcast · Owner starts from /admin on phone
              </div>
            ) : null}
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ color: 'rgba(226,232,240,0.7)', fontSize: 13, fontWeight: 600 }}>
              {status === 'live'
                ? '● Live · low-latency WebRTC'
                : mode === 'hls'
                  ? 'Stream player · starts when broadcast is active'
                  : 'Connecting…'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                onClick={() => setMode((m) => (m === 'whep' ? 'hls' : 'whep'))}
              >
                Switch to {mode === 'whep' ? 'HLS player' : 'WebRTC player'}
              </button>
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
