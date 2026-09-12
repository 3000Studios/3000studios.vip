import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalMusic } from './GlobalMusic';

function fmt(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const m = Math.floor(value / 60);
  return `${m}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}

export function MusicDock() {
  const { pathname } = useLocation();
  const music = useGlobalMusic();
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);

  const resetVisibility = () => {
    setVisible(true);
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(false), 4000);
  };

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    hideTimer.current = window.setTimeout(() => setVisible(false), 4000);
    return () => {
      window.clearTimeout(showTimer);
      if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    };
    // Track changes and playback starts should briefly surface the player.
  }, [music.activeSong.title, music.isPlaying]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/vault') || pathname.startsWith('/agent')) {
    return null;
  }
  if (!visible) return null;

  return (
    <div className="musicDock ytPerkSafe" role="region" aria-label="Now playing" onPointerEnter={resetVisibility} onFocus={resetVisibility} onClick={resetVisibility}>
      <img src={music.activeSong.cover} alt="" />
      <div className="musicDockMeta">
        <strong>{music.activeSong.title}</strong>
        <span>{fmt(music.currentTime)} / {fmt(music.duration)} · Full stream</span>
      </div>
      <button type="button" className="musicDockPlay" onClick={music.toggle} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
        {music.isPlaying ? '❚❚' : '▶'}
      </button>
    </div>
  );
}
