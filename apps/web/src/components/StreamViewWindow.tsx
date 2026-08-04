import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { featureSong, rolloutSongs } from '../data/music';
import { VelvetStage } from './VelvetStage';

function resolveCover(src: string): string {
  if (src.includes('lick-my-balls-jazz')) return featureSong.jazz.cover;
  if (src.includes('lick-my-balls-remix')) return featureSong.remix.cover;

  const base = src.replace(/\.mp3$/i, '').replace(/^\/media\//, '');
  const aliases: Record<string, string> = {
    'always-feel-like': featureSong.jazz.cover,
    'betty-boom-boom': featureSong.remix.cover,
    'outkast-3000-studios-style': featureSong.remix.cover,
    'ride-smooth': featureSong.jazz.cover,
    'so-fresh-so-cosmic': featureSong.jazz.cover,
    'waynes-world': featureSong.remix.cover,
    'waynes-world-laid-back-weezy-mix': featureSong.remix.cover,
    'i-always-feel-like': featureSong.jazz.cover,
    'i-always-feel-like-someones': featureSong.jazz.cover,
    'click-clack-3000-studios-original': featureSong.remix.cover,
    'code-red': featureSong.remix.cover,
    'subwoofer-pressure': featureSong.remix.cover,
    'subwoofer-pressure-2': featureSong.remix.cover,
  };
  if (aliases[base]) return aliases[base];
  return `/media/${base}-cover.jpg`;
}

const playlist = rolloutSongs.map((song) => ({
  ...song,
  cover: resolveCover(song.src),
}));

type StreamViewWindowProps = {
  isLive?: boolean;
  compact?: boolean;
  muted?: boolean;
  className?: string;
};

/** Shared live window: catalog standby + covers + STREAMING SOON until go-live */
export function StandbyMusicWindow({
  compact = false,
  muted = false,
  className = '',
}: Omit<StreamViewWindowProps, 'isLive'>) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [coverBroken, setCoverBroken] = useState(false);
  const song = playlist[index] ?? playlist[0];

  const next = useCallback(() => {
    setCoverBroken(false);
    setIndex((i) => (i + 1) % playlist.length);
  }, []);

  const prev = useCallback(() => {
    setCoverBroken(false);
    setIndex((i) => (i - 1 + playlist.length) % playlist.length);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = song.src;
    audio.volume = muted ? 0 : 0.55;
    audio.muted = muted;
    const attempt = audio.play();
    if (attempt) {
      void attempt.then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [song.src, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => next();
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [next]);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  return (
    <VelvetStage isLive={false} showSoonTicker className={className}>
      <div
        className={`standbyStage ${compact ? 'compact' : ''}`.trim()}
        aria-label="Standby music player until live"
      >
        <audio ref={audioRef} preload="auto" />

        <div className="standbyArtWrap">
          {!coverBroken ? (
            <img
              key={song.cover}
              className="standbyCover"
              src={song.cover}
              alt={`${song.title} cover art`}
              onError={() => setCoverBroken(true)}
            />
          ) : (
            <div className="standbyCoverFallback" aria-hidden="true">
              <span className="standbyRank">#{song.rank}</span>
              <strong>{song.title}</strong>
              <small>3000 Studios Original</small>
            </div>
          )}
          <div className="standbyVignette" />
          <div className="standbyGlow" aria-hidden="true" />
        </div>

        <div className="standbyMeta">
          <span className="standbyNow">Now spinning</span>
          <strong className="standbyTitle">{song.title}</strong>
          {!compact ? <p className="standbyDesc">{song.description}</p> : null}
          <div className="standbyControls">
            <button type="button" className="studioButton secondary standbyBtn" onClick={prev}>
              Prev
            </button>
            <button type="button" className="studioButton primary standbyBtn" onClick={toggle}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="studioButton secondary standbyBtn" onClick={next}>
              Next
            </button>
          </div>
        </div>
      </div>
    </VelvetStage>
  );
}

export function StreamFrame({
  children,
  isLive = false,
  className = '',
}: {
  children: ReactNode;
  isLive?: boolean;
  className?: string;
}) {
  return (
    <VelvetStage isLive={isLive} showSoonTicker={!isLive} className={className}>
      <div className={`streamFrame ${isLive ? 'is-live' : 'is-standby'}`.trim()} style={{ border: 'none', boxShadow: 'none', background: 'transparent', minHeight: '100%', height: '100%', aspectRatio: 'auto' }}>
        {children}
      </div>
    </VelvetStage>
  );
}
