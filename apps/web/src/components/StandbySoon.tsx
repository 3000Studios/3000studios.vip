import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { featureSong, rolloutSongs } from '../data/music';
import type { StreamScene } from '../lib/streamScene';

function resolveCover(src: string): string {
  if (src.includes('lick-my-balls-jazz')) return featureSong.jazz.cover;
  if (src.includes('lick-my-balls-remix')) return featureSong.remix.cover;
  const base = src.replace(/\.mp3$/i, '').replace(/^\/media\//, '');
  return `/media/covers/${base}.jpg`;
}

function shuffleSongs<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const baseCatalog = rolloutSongs.map((s) => ({ ...s, cover: resolveCover(s.src) }));

type Props = {
  scene: StreamScene;
  hideControls?: boolean;
  /** Always play catalog music (ignore scene.standbyMusic off) */
  forceMusic?: boolean;
  /** Fresh random order every mount */
  shuffle?: boolean;
  onAudioElement?: (el: HTMLAudioElement | null) => void;
};

/** Viewer standby: random 3000 catalog + admin-styled “live soon” message. */
export function StandbySoon({
  scene,
  hideControls = true,
  forceMusic = false,
  shuffle = false,
  onAudioElement,
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // New random order every mount (each page load / user visit)
  const [playlist, setPlaylist] = useState(() => (shuffle ? shuffleSongs(baseCatalog) : baseCatalog));
  const [index, setIndex] = useState(0);
  const song = playlist[index] ?? playlist[0];
  const st = scene.standby;
  const musicOn = forceMusic || scene.standbyMusic;

  useEffect(() => {
    onAudioElement?.(audioRef.current);
    return () => onAudioElement?.(null);
  }, [onAudioElement, song.src]);

  useEffect(() => {
    if (!musicOn || !song) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.crossOrigin = 'anonymous';
    audio.src = song.src;
    audio.volume = 0.48;
    const tryPlay = () => {
      void audio.play().catch(() => undefined);
    };
    tryPlay();
    const unlock = () => tryPlay();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    const onEnded = () => {
      setIndex((i) => {
        const next = i + 1;
        if (next >= playlist.length) {
          if (shuffle) {
            setPlaylist(shuffleSongs(baseCatalog));
          }
          return 0;
        }
        return next;
      });
    };
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('ended', onEnded);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [song?.src, musicOn, playlist.length, shuffle]);

  const textStyle: CSSProperties = {
    position: 'absolute',
    left: `${st.x}%`,
    top: `${st.y}%`,
    transform: 'translate(-50%, -50%)',
    width: 'min(92%, 720px)',
    textAlign: st.align,
    fontFamily: st.fontFamily,
    fontSize: `clamp(1.25rem, ${st.fontSize / 28}vw, ${st.fontSize}px)`,
    fontWeight: st.fontWeight,
    color: st.color,
    textShadow: st.textShadow,
    letterSpacing: st.letterSpacing,
    textTransform: st.textTransform,
    zIndex: 5,
    pointerEvents: 'none',
  };

  return (
    <div className="standbySoon" aria-label={st.text || 'Stream will be live soon'}>
      {musicOn ? <audio ref={audioRef} preload="auto" loop={false} crossOrigin="anonymous" /> : null}
      <div className="standbySoonBg">
        <img
          className="standbySoonCover"
          src={song?.cover}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0.2';
          }}
        />
        <div className="standbySoonVignette" />
      </div>
      <div className="standbySoonTicker" aria-hidden="true">
        <span style={{ animationDuration: '28s' }}>{(st.ticker + ' · ').repeat(6)}</span>
      </div>
      <div className="standbySoonCopy" style={textStyle}>
        <div className="standbySoonMain">{st.text}</div>
        {st.subtext ? (
          <div
            className="standbySoonSub"
            style={{ color: st.subColor, fontSize: '0.45em', marginTop: '0.55em', fontWeight: 600 }}
          >
            {st.subtext}
          </div>
        ) : null}
      </div>
      {st.customCss ? <style>{st.customCss}</style> : null}
      {hideControls ? null : null}
    </div>
  );
}
