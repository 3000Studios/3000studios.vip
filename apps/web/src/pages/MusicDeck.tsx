import { useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalMusic } from '../components/GlobalMusic';
import { rolloutSongs } from '../data/music';
import {
  OFFICIAL_YOUTUBE_CHANNEL_URL,
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { PublicLayout } from './Home';
import '../styles/music-deck.css';

const SPOTIFY_ARTIST = 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik';
const APPLE_ARTIST = 'https://music.apple.com/us/artist/3000-studios/6802721597';
const YT_MUSIC = 'https://music.youtube.com/channel/UCTQnEFZUIutrFuDlxGj9cDA';
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
  const [drag, setDrag] = useState<{ startX: number } | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
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

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    setDrag({ startX: event.clientX });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const delta = event.clientX - drag.startX;
    if (delta < -48) pick(activeIndex + 1);
    else if (delta > 48) pick(activeIndex - 1);
    setDrag(null);
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
          <p className="vipKicker dkKicker">3000 Studios · Coverflow</p>
          <div
            className="dkCoverflow"
            ref={stageRef}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => setDrag(null)}
          >
            {catalog.map((song, index) => {
              const offset = index - activeIndex;
              const abs = Math.abs(offset);
              if (abs > 4) return null;
              return (
                <button
                  type="button"
                  key={song.videoId}
                  className={offset === 0 ? 'dkSlide is-active' : 'dkSlide'}
                  style={{ '--offset': offset, zIndex: 40 - abs } as CSSProperties}
                  onClick={() => pick(index)}
                  aria-current={offset === 0 ? 'true' : undefined}
                  aria-label={song.title}
                >
                  <img src={youtubeArtworkUrl(song.videoId)} alt="" draggable={false} />
                </button>
              );
            })}
          </div>

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

          <nav className="platformLinks" aria-label="Official music platforms">
            <a href={SPOTIFY_ARTIST} target="_blank" rel="noreferrer">Spotify</a>
            <a href={APPLE_ARTIST} target="_blank" rel="noreferrer">Apple Music</a>
            <a href={YT_MUSIC} target="_blank" rel="noreferrer">YouTube Music</a>
            <a href={OFFICIAL_YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">YouTube</a>
            <Link to="/video">Videos</Link>
            <Link to="/live">Live</Link>
            <Link to="/shop">Shop</Link>
          </nav>
        </section>
      </main>
    </PublicLayout>
  );
}
