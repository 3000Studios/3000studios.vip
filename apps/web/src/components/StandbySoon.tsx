import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { featureSong, rolloutSongs } from '../data/music';
import type { StreamScene } from '../lib/streamScene';

function resolveCover(src: string): string {
  if (src.includes('lick-my-balls-jazz')) return featureSong.jazz.cover;
  if (src.includes('lick-my-balls-remix')) return featureSong.remix.cover;
  const base = src.replace(/\.mp3$/i, '').replace(/^\/media\//, '');
  return `/media/covers/${base}.jpg`;
}

const playlist = rolloutSongs.map((s) => ({ ...s, cover: resolveCover(s.src) }));

type Props = {
  scene: StreamScene;
  /** Viewer mode: no play/prev controls (always true for public) */
  hideControls?: boolean;
  onAudioElement?: (el: HTMLAudioElement | null) => void;
};

/** Viewer standby: music art + admin-styled “live soon” message. */
export function StandbySoon({ scene, hideControls = true, onAudioElement }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [index, setIndex] = useState(0);
  const song = playlist[index] ?? playlist[0];
  const st = scene.standby;

  useEffect(() => {
    onAudioElement?.(audioRef.current);
    return () => onAudioElement?.(null);
  }, [onAudioElement]);

  useEffect(() => {
    if (!scene.standbyMusic) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.crossOrigin = 'anonymous';
    audio.src = song.src;
    audio.volume = 0.45;
    void audio.play().catch(() => undefined);
    const onEnded = () => setIndex((i) => (i + 1) % playlist.length);
    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [song.src, scene.standbyMusic]);

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
      {scene.standbyMusic ? <audio ref={audioRef} preload="auto" loop={false} crossOrigin="anonymous" /> : null}
      <div className="standbySoonBg">
        <img
          className="standbySoonCover"
          src={song.cover}
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
      {!hideControls ? null : null}
    </div>
  );
}
