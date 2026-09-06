import { useMemo, useState } from 'react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { rolloutSongs } from '../data/music';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { PublicLayout } from './Home';
import { ReleaseCarousel } from '../components/ReleaseCarousel';
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

  return (
    <PublicLayout variant="electric">
      <main className="vipMain dkMusicPage musicDeckPage">
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
        <section className="dkStage" aria-label="Official release coverflow">
          <p className="vipKicker dkKicker">3000 Studios · 3D selector</p>
          <ReleaseCarousel activeIndex={activeIndex} onSelect={pick} />

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

          <div className="compactTrackSection">
            <h3 className="compactTrackHead">Official Catalog ({catalog.length})</h3>
            <div className="compactTrackGrid">
              {catalog.map((track, idx) => (
                <button
                  key={track.videoId}
                  type="button"
                  className={`compactTrackRow ${idx === activeIndex ? 'is-active' : ''}`}
                  onClick={() => pick(idx)}
                >
                  <img src={youtubeArtworkUrl(track.videoId)} alt="" className="compactTrackThumb" />
                  <div className="compactTrackInfo">
                    <strong>{track.title}</strong>
                    <span>{track.release}</span>
                  </div>
                  <span className="compactTrackBadge">{idx === activeIndex && music.isPlaying ? '▶ ON AIR' : 'PLAY'}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
