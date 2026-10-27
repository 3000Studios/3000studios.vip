import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalMusic } from './GlobalMusic';
import { HYPERFOLLOW_URL } from '../lib/commerce';
import { getTrackLinks } from '../lib/trackLinks';
import { playbackKind } from '../data/music';

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
  }, [music.activeSong.title, music.isPlaying]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/vault') || pathname.startsWith('/agent')) {
    return null;
  }
  if (!visible) return null;

  const kind = playbackKind(music.activeSong.src);
  // On-site playback is previews only (music model flip, 2026-10-27) —
  // the dock says so plainly instead of claiming a full stream.
  const streamLabel = music.playbackError
    ? 'Unavailable'
    : kind === 'apple-preview'
      ? 'Apple preview'
      : kind === 'missing'
        ? 'Unavailable'
        : '1-minute preview';
  const fullSongUrl = getTrackLinks(music.activeSong.slug)[0]?.url ?? HYPERFOLLOW_URL;

  return (
    <div
      className="musicDock ytPerkSafe"
      role="region"
      aria-label="Now playing"
      onPointerEnter={resetVisibility}
      onFocus={resetVisibility}
      onClick={resetVisibility}
    >
      <img src={music.activeSong.cover} alt={`${music.activeSong.title} album artwork`} />
      <div className="musicDockMeta">
        <strong>{music.activeSong.title}</strong>
        <span>
          {fmt(music.currentTime)} / {fmt(music.duration)} · {streamLabel}
        </span>
        {music.playbackError ? <em className="musicDockError">{music.playbackError}</em> : null}
      </div>
      <button type="button" className="musicDockPlay" onClick={music.toggle} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
        {music.isPlaying ? '❚❚' : '▶'}
      </button>
      <a
        className="musicDockBuy"
        href={fullSongUrl}
        target="_blank"
        rel="noreferrer"
        aria-label={`Hear the full song: ${music.activeSong.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        Full song
      </a>
    </div>
  );
}
