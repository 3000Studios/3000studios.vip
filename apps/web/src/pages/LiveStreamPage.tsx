import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import { ManifestUrlList, StreamManifestPlayer, type ManifestMode } from '../components/StreamManifestPlayer';
import { WhepStreamPlayer } from '../components/WhepStreamPlayer';
import { StreamProtocolEndpoints } from '../components/StreamProtocolEndpoints';
import {
  STREAM_CUSTOMER_CODE,
  STREAM_DASH_URL,
  STREAM_HLS_URL,
  STREAM_LIVE_INPUT_ID,
  STREAM_PLAYER_UID,
  STREAM_PLAYER_URL,
  STREAM_RTMPS_PLAYBACK_KEY,
  STREAM_RTMPS_PLAYBACK_SERVER,
  STREAM_SRT_PLAYBACK_URL,
  STREAM_WHEP_URL,
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

type ViewMode = 'hosted' | 'whep' | 'hls' | 'dash' | 'standby';

export function LiveStreamPage() {
  const [view, setView] = useState<ViewMode>('hosted');
  const [playback, setPlayback] = useState<string>('idle');
  const playerUrl = useMemo(() => buildStreamPlayerUrl(STREAM_PLAYER_UID, STREAM_CUSTOMER_CODE), []);

  const isLiveChrome = view !== 'standby';
  const manifestMode: ManifestMode = view === 'dash' ? 'dash' : 'hls';

  const statusLabel =
    view === 'standby'
      ? 'Standby catalog · Stream paused'
      : view === 'hosted'
        ? '● Cloudflare Stream Player · hosted embed'
        : view === 'whep'
          ? `● WebRTC WHEP · ${playback}`
          : view === 'hls'
            ? `● Custom HLS · ${playback}`
            : `● Custom DASH · ${playback}`;

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Protocol-specific Cloudflare Stream playback.</motion.h1>
          <motion.p variants={fadeUp}>
            Hosted player, sub-second WHEP, HLS/DASH for web libraries, plus SRT and RTMPS endpoints for pro apps
            (OBS, ffplay, vMix).
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
          <div className="streamModeTabs" role="tablist" aria-label="Player mode">
            {(
              [
                ['hosted', 'Stream Player'],
                ['whep', 'WHEP (WebRTC)'],
                ['hls', 'HLS'],
                ['dash', 'DASH'],
                ['standby', 'Music standby'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                className={`streamModeTab ${view === id ? 'active' : ''}`}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <StreamFrame isLive={isLiveChrome} className="streamFrame--cf">
            {view === 'hosted' ? (
              <CloudflareStreamPlayer
                uid={STREAM_PLAYER_UID}
                title="3000 Studios Cloudflare Stream Player"
                autoplay
                muted
              />
            ) : null}
            {view === 'whep' ? (
              <WhepStreamPlayer
                uid={STREAM_PLAYER_UID}
                title="3000 Studios WHEP playback"
                muted
                autoplay
                onStatus={(s) => setPlayback(s)}
              />
            ) : null}
            {view === 'hls' || view === 'dash' ? (
              <StreamManifestPlayer
                uid={STREAM_PLAYER_UID}
                mode={manifestMode}
                autoplay
                muted
                title={`3000 Studios ${manifestMode.toUpperCase()} player`}
                onStatus={(s) => setPlayback(s)}
              />
            ) : null}
            {view === 'standby' ? <StandbyMusicWindow /> : null}
          </StreamFrame>

          <div className="streamToolbar">
            <span className="streamStatus">{statusLabel}</span>
            <div className="streamToolbarActions">
              <a
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                href={STREAM_WHEP_URL}
                target="_blank"
                rel="noreferrer"
              >
                WHEP
              </a>
              <a
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                href={STREAM_HLS_URL}
                target="_blank"
                rel="noreferrer"
              >
                HLS
              </a>
              <a
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                href={STREAM_DASH_URL}
                target="_blank"
                rel="noreferrer"
              >
                DASH
              </a>
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
            <StreamProtocolEndpoints uid={STREAM_PLAYER_UID} />
          </div>

          <div className="vipCard streamMetaCard">
            <h2>Quick reference</h2>
            <ul className="streamMetaList">
              <li>
                <strong>Asset UID</strong>
                <code>{STREAM_PLAYER_UID}</code>
              </li>
              <li>
                <strong>Customer</strong>
                <code>customer-{STREAM_CUSTOMER_CODE}</code>
              </li>
              <li>
                <strong>WHEP</strong>
                <code>{STREAM_WHEP_URL}</code>
              </li>
              <li>
                <strong>SRT</strong>
                <code>{STREAM_SRT_PLAYBACK_URL}</code>
              </li>
              <li>
                <strong>RTMPS server</strong>
                <code>{STREAM_RTMPS_PLAYBACK_SERVER}</code>
              </li>
              <li>
                <strong>RTMPS key</strong>
                <code>{STREAM_RTMPS_PLAYBACK_KEY}</code>
              </li>
              <li>
                <strong>Live input (ingest only)</strong>
                <code>{STREAM_LIVE_INPUT_ID}</code>
              </li>
            </ul>
            <div style={{ marginTop: '1rem' }}>
              <h3 className="streamProtocolSub">HLS / DASH shortcuts</h3>
              <ManifestUrlList uid={STREAM_PLAYER_UID} />
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
