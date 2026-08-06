import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import {
  STREAM_CUSTOMER_CODE,
  STREAM_LIVE_INPUT_ID,
  STREAM_PLAYER_UID,
  STREAM_PLAYER_URL,
  buildStreamPlayerUrl,
} from '../lib/streamConfig';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const ADMIN_PATH = '/admin';

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 1, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export function LiveStreamPage() {
  const [showStandby, setShowStandby] = useState(false);
  const playerUrl = useMemo(() => buildStreamPlayerUrl(STREAM_PLAYER_UID, STREAM_CUSTOMER_CODE), []);

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios on Cloudflare Stream.</motion.h1>
          <motion.p variants={fadeUp}>
            Public playback uses Cloudflare&apos;s hosted Stream Player. When the owner broadcasts from the admin
            console (phone WHIP or OBS), this player serves the Stream feed globally.
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
            <a className="studioButton ghost" href={playerUrl} target="_blank" rel="noreferrer">
              Open Stream Player
            </a>
          </motion.div>
        </motion.section>

        <section className="streamPublicPanel">
          <StreamFrame isLive={!showStandby} className="streamFrame--cf">
            {!showStandby ? (
              <CloudflareStreamPlayer
                uid={STREAM_PLAYER_UID}
                title="3000 Studios Cloudflare Stream Player"
                autoplay
                muted
              />
            ) : (
              <StandbyMusicWindow />
            )}
          </StreamFrame>

          <div className="streamToolbar">
            <span className="streamStatus">
              {showStandby
                ? 'Standby catalog · Stream Player paused'
                : '● Cloudflare Stream Player · hosted embed'}
            </span>
            <div className="streamToolbarActions">
              <button
                type="button"
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                onClick={() => setShowStandby((v) => !v)}
              >
                {showStandby ? 'Show Stream Player' : 'Show music standby'}
              </button>
              <a
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                href={STREAM_PLAYER_URL}
                target="_blank"
                rel="noreferrer"
              >
                Full player
              </a>
            </div>
          </div>

          <div className="vipCard streamMetaCard">
            <h2>Stream details</h2>
            <ul className="streamMetaList">
              <li>
                <strong>Player URL</strong>
                <a href={STREAM_PLAYER_URL} target="_blank" rel="noreferrer">
                  {STREAM_PLAYER_URL}
                </a>
              </li>
              <li>
                <strong>Asset UID</strong>
                <code>{STREAM_PLAYER_UID}</code>
              </li>
              <li>
                <strong>Customer</strong>
                <code>customer-{STREAM_CUSTOMER_CODE}</code>
              </li>
              <li>
                <strong>Live input (ingest)</strong>
                <code>{STREAM_LIVE_INPUT_ID}</code>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
