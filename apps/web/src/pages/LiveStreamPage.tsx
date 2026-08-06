import { useMemo, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';
import { StandbyMusicWindow, StreamFrame } from '../components/StreamViewWindow';
import { CloudflareStreamPlayer } from '../components/CloudflareStreamPlayer';
import { ManifestUrlList, StreamManifestPlayer, type ManifestMode } from '../components/StreamManifestPlayer';
import {
  STREAM_CUSTOMER_CODE,
  STREAM_DASH_URL,
  STREAM_HLS_URL,
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

type ViewMode = 'hosted' | 'hls' | 'dash' | 'standby';

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
          <motion.h1 variants={fadeUp}>Watch 3000 Studios on Cloudflare Stream.</motion.h1>
          <motion.p variants={fadeUp}>
            Playback options: Cloudflare hosted player, or bring-your-own player via HLS / DASH manifests (hls.js,
            dash.js, Safari native, mobile SDKs).
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
                ['hls', 'HLS (custom)'],
                ['dash', 'DASH (custom)'],
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
                href={STREAM_HLS_URL}
                target="_blank"
                rel="noreferrer"
              >
                HLS .m3u8
              </a>
              <a
                className="studioButton secondary"
                style={{ minHeight: 40, padding: '0 14px', fontSize: 12 }}
                href={STREAM_DASH_URL}
                target="_blank"
                rel="noreferrer"
              >
                DASH .mpd
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
            <h2>Bring your own player</h2>
            <p className="cMuted" style={{ marginTop: 0 }}>
              Use these Cloudflare Stream manifests with any HLS/DASH library or native mobile player.
            </p>
            <ManifestUrlList uid={STREAM_PLAYER_UID} />
            <ul className="streamMetaList" style={{ marginTop: '1rem' }}>
              <li>
                <strong>Stream Player URL</strong>
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
