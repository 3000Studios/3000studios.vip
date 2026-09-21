import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { rolloutSongs } from '../data/music';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { PublicLayout } from './PublicLayout';
import '../styles/music-deck.css';

const normalized = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  return `${minutes}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}

export function MusicDeck() {
  const music = useGlobalMusic();
  const catalog = officialReleaseVideos;
  const [activeIndex, setActiveIndex] = useState(0);
  const active = catalog[activeIndex] ?? catalog[0];
  const matchedSong = useMemo(
    () => rolloutSongs.find((song) => normalized(song.title) === normalized(active.title)),
    [active.title],
  );

  const pick = (index: number) => {
    const next = ((index % catalog.length) + catalog.length) % catalog.length;
    setActiveIndex(next);
    const video = catalog[next];
    const songIdx = rolloutSongs.findIndex((song) => normalized(song.title) === normalized(video.title));
    if (songIdx >= 0) music.playIndex(songIdx, { autoplay: music.isPlaying });
  };

  const yt = active.videoId;
  const art = youtubeArtworkUrl(yt);
  const dragX = useRef<number | null>(null);

  const onSwipeStart = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button,input')) return;
    dragX.current = e.clientX;
  };
  const onSwipeEnd = (e: ReactPointerEvent) => {
    if (dragX.current === null) return;
    const dx = e.clientX - dragX.current;
    dragX.current = null;
    if (dx < -48) pick(activeIndex + 1);
    else if (dx > 48) pick(activeIndex - 1);
  };

  return (
    <PublicLayout variant="electric">
      <main
        className="vipMain dkMusicPage musicDeckPage"
        onPointerDown={onSwipeStart}
        onPointerUp={onSwipeEnd}
        onPointerCancel={() => (dragX.current = null)}
      >
        <div className="dkArtFill" style={{ backgroundImage: `url(${art})` }} aria-hidden="true" />
        <div className="dkVideoStage" aria-hidden="true">
          <iframe
            key={`${yt}-${music.isPlaying ? 'play' : 'stop'}`}
            title={`${active.title} video`}
            src={`${youtubeEmbedUrl(yt)}&autoplay=${music.isPlaying ? 1 : 0}&mute=1&controls=0&loop=1&playlist=${yt}&playsinline=1`}
            allow="encrypted-media; picture-in-picture"
          />
        </div>
        <div className="dkArtDim" aria-hidden="true" />
        <section className="dkStage" aria-label="Official release player">

          <div className="dkPlayer">
            <button type="button" className="dkPlayerBtn" onClick={() => pick(activeIndex - 1)} aria-label="Previous song">‹</button>
            <button type="button" className="dkPlayMain" onClick={music.toggle} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
              {music.isPlaying ? '❚❚' : '▶'}
            </button>
            <button type="button" className="dkPlayerBtn" onClick={() => pick(activeIndex + 1)} aria-label="Next song">›</button>
            <div className="dkPlayerMeta">
              <strong>{active.title}</strong>
              <span>3000 Studios · {active.release}{matchedSong ? '' : ' · video'}</span>
            </div>
            <label className="dkSeek">
              <span>{formatTime(music.currentTime)}</span>
              <input
                type="range"
                min={0}
                max={Math.max(1, music.duration)}
                step={0.1}
                value={Math.min(music.currentTime, music.duration || 0)}
                onChange={(event) => music.seekTo(Number(event.target.value))}
                aria-label="Seek"
              />
              <span>{formatTime(music.duration)}</span>
            </label>
            <a className="studioButton secondary dkWatch" href={youtubeWatchUrl(yt)} target="_blank" rel="noreferrer">Open video</a>
          </div>
          <p className="dkSwipeHint" aria-hidden="true">
            Swipe ← → for the next video · {catalog.length} official drops
          </p>
          <div className="dkMoneyRow">
            <a className="studioButton" href="https://buy.stripe.com/6oUcN52Kx8yW14YcEabAs0T">Own it $0.99</a>
            <a className="studioButton secondary" href="https://buy.stripe.com/28EbJ15WJg1oeVO1ZwbAs0U">VIP $3.99/mo</a>
            <a className="studioButton secondary" href={youtubeWatchUrl(yt)} target="_blank" rel="noreferrer">YouTube</a>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
