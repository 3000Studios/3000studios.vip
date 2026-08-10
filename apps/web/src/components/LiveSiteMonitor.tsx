import { useState } from 'react';
import { CloudflareStreamPlayer } from './CloudflareStreamPlayer';
import { WhepStreamPlayer } from './WhepStreamPlayer';
import { StreamManifestPlayer } from './StreamManifestPlayer';
import { STREAM_LIVE_INPUT_ID, STREAM_PLAYER_UID } from '../lib/streamConfig';

const LIVE_URL = 'https://3000studios.vip/live';

type MonitorMode = 'player' | 'whep' | 'hls';

type Props = {
  /** When true, prefer low-latency WHEP (you're broadcasting) */
  broadcasting?: boolean;
  className?: string;
};

/**
 * Exact public-site style monitor: same Stream endpoints viewers use on /live,
 * with optional audio so you can hear what the live page plays.
 */
export function LiveSiteMonitor({ broadcasting = false, className = '' }: Props) {
  const [mode, setMode] = useState<MonitorMode>(broadcasting ? 'whep' : 'player');
  const [soundOn, setSoundOn] = useState(false);
  const [status, setStatus] = useState('idle');

  return (
    <div className={`liveSiteMonitor ${className}`.trim()}>
      <div className="liveSiteMonitorBar">
        <div className="streamModeTabs" role="tablist" aria-label="Live page monitor source">
          {(
            [
              ['player', 'Stream Player'],
              ['whep', 'WHEP (live)'],
              ['hls', 'HLS'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`streamModeTab ${mode === id ? 'active' : ''}`}
              onClick={() => setMode(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="liveSiteMonitorActions">
          <button
            type="button"
            className={`cBtn sm ${soundOn ? 'primary' : 'ghost'}`}
            onClick={() => setSoundOn((v) => !v)}
            title="Unmute to hear the public stream (same audio viewers get)"
          >
            {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
          </button>
          <a className="cBtn sm ghost" href={LIVE_URL} target="_blank" rel="noreferrer">
            Open /live
          </a>
        </div>
      </div>

      <div className="liveSiteMonitorStage">
        {mode === 'player' ? (
          <CloudflareStreamPlayer
            uid={STREAM_PLAYER_UID}
            title="Live page · Stream Player"
            autoplay
            muted={!soundOn}
          />
        ) : null}
        {mode === 'whep' ? (
          <WhepStreamPlayer
            uid={STREAM_LIVE_INPUT_ID}
            title="Live page · WHEP"
            autoplay
            muted={!soundOn}
            onStatus={(s) => setStatus(s)}
          />
        ) : null}
        {mode === 'hls' ? (
          <StreamManifestPlayer
            uid={STREAM_PLAYER_UID}
            mode="hls"
            title="Live page · HLS"
            autoplay
            muted={!soundOn}
            onStatus={(s) => setStatus(s)}
          />
        ) : null}
      </div>

      <p className="liveSiteMonitorHint">
        This is the public feed (same Cloudflare endpoints as{' '}
        <a href={LIVE_URL} target="_blank" rel="noreferrer">
          /live
        </a>
        ). Turn <strong>Sound on</strong> to hear it. Status: <em>{mode === 'player' ? 'hosted player' : status}</em>
        {broadcasting ? ' · You are publishing via WHIP' : ' · Waiting for a live publisher'}
      </p>
    </div>
  );
}
