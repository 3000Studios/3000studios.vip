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
  if (pathname.startsWith('/admin') || pathname.startsWith('/vault') || pathname.startsWith('/agent')) {
    return null;
  }
  return (
    <div className="musicDock ytPerkSafe" role="region" aria-label="Now playing">
      <img src={music.activeSong.cover} alt="" />
      <div className="musicDockMeta">
        <strong>{music.activeSong.title}</strong>
        <span>{fmt(music.currentTime)} · 30s sample unless unlocked</span>
      </div>
      <button type="button" className="musicDockPlay" onClick={music.toggle} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
        {music.isPlaying ? '❚❚' : '▶'}
      </button>
    </div>
  );
}
