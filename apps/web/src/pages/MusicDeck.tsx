import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  SpeakerHigh,
  SpeakerSlash,
} from '@phosphor-icons/react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { distrokidSongs, rolloutSongs } from '../data/music';
import {
  OFFICIAL_YOUTUBE_CHANNEL_URL,
  officialReleaseVideos,
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
  const platterRef = useRef<HTMLButtonElement | null>(null);
  const scratchRef = useRef({ angle: 0, time: 0, wasPlaying: false });
  const [scratchAngle, setScratchAngle] = useState(0);
  const [scratching, setScratching] = useState(false);
  const video = useMemo(
    () => officialReleaseVideos.find((item) => normalized(item.title) === normalized(music.activeSong.title)),
    [music.activeSong.title],
  );
  const fallbackVideo = officialReleaseVideos[music.activeIndex % officialReleaseVideos.length];
  const wallpaperId = video?.videoId || fallbackVideo.videoId;

  const angleAt = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = platterRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.atan2(event.clientY - rect.top - rect.height / 2, event.clientX - rect.left - rect.width / 2);
  };
  const startScratch = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    scratchRef.current = { angle: angleAt(event), time: music.currentTime, wasPlaying: music.isPlaying };
    music.pause();
    setScratching(true);
  };
  const moveScratch = (event: PointerEvent<HTMLButtonElement>) => {
    if (!scratching) return;
    const delta = angleAt(event) - scratchRef.current.angle;
    const seconds = scratchRef.current.time + delta * 2.6;
    music.seekTo(seconds);
    setScratchAngle((value) => value + (delta * 180) / Math.PI);
    scratchRef.current = { ...scratchRef.current, angle: angleAt(event), time: seconds };
  };
  const endScratch = () => {
    setScratching(false);
    if (scratchRef.current.wasPlaying) music.play();
  };

  const keyboardSeek = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault();
      music.seekTo(music.currentTime - 5);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault();
      music.seekTo(music.currentTime + 5);
    }
  };

  return (
    <PublicLayout variant="electric">
      <div className="musicVideoWall" aria-hidden="true">
        <iframe
          title=""
          src={`https://www.youtube-nocookie.com/embed/${wallpaperId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${wallpaperId}&rel=0&modestbranding=1`}
          allow="autoplay; encrypted-media"
        />
      </div>
      <main className="musicDeckPage">
        <section className="deckArtworkStage">
          <img src={music.activeSong.cover} alt={`${music.activeSong.title} cover art`} />
        </section>
        <section className={`turntableDeck${scratching ? ' is-scratching' : ''}`} aria-label="Interactive turntable">
          <button
            ref={platterRef}
            className={`vinylPlatter${music.isPlaying && !scratching ? ' is-spinning' : ''}`}
            style={{ '--scratch-angle': `${scratchAngle}deg` } as CSSProperties}
            type="button"
            onPointerDown={startScratch}
            onPointerMove={moveScratch}
            onPointerUp={endScratch}
            onPointerCancel={endScratch}
            onKeyDown={keyboardSeek}
            aria-label="Scratch record to seek"
          >
            <span className="vinylLabel"><img src="/media/official-3000-studios-profile.png" alt="" /></span>
          </button>
        </section>
        <section className="deckControls" aria-label="Music controls">
          <div className="deckTitle">
            <div>
              <h1>{music.activeSong.title}</h1>
              <p>3000 Studios</p>
            </div>
          </div>
          <label className="deckSeek">
            <span className="srOnly">Song position</span>
            <input type="range" min="0" max={music.duration || 1} value={Math.min(music.currentTime, music.duration || 1)} onChange={(event) => music.seekTo(Number(event.target.value))} />
            <small>{formatTime(music.currentTime)}</small>
            <small>-{formatTime(Math.max(0, music.duration - music.currentTime))}</small>
          </label>
          <div className="transportControls">
            <button type="button" onClick={music.prev} aria-label="Previous song"><SkipBack weight="fill" /></button>
            <button className="mainTransport" type="button" onClick={music.toggle} aria-label={music.isPlaying ? 'Pause' : 'Play'}>
              {music.isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
            </button>
            <button type="button" onClick={music.next} aria-label="Next song"><SkipForward weight="fill" /></button>
          </div>
          <label className="volumeControl">
            <button type="button" onClick={() => music.setMuted(!music.muted)} aria-label={music.muted ? 'Unmute' : 'Mute'}>
              {music.muted ? <SpeakerSlash /> : <SpeakerHigh />}
            </button>
            <input type="range" min="0" max="1" step="0.01" value={music.muted ? 0 : music.volume} onChange={(event) => music.setVolume(Number(event.target.value))} />
          </label>
        </section>
        <section className="deckQueue" aria-labelledby="up-next-title">
          <div className="queueHeading"><h2 id="up-next-title">Official release deck</h2></div>
          <div className="releaseRail">
            {distrokidSongs.map((song) => {
              const index = rolloutSongs.findIndex((item) => item.slug === song.slug);
              return (
                <button className={song.slug === music.activeSong.slug ? 'releaseTile is-active' : 'releaseTile'} type="button" key={song.slug} onClick={() => music.playIndex(index)}>
                  <img src={song.cover} alt="" loading="lazy" />
                  <span><strong>{song.title}</strong></span>
                  <Play weight="fill" />
                </button>
              );
            })}
          </div>
        </section>
        <nav className="platformLinks" aria-label="Official music platforms">
          <a href={SPOTIFY_ARTIST} target="_blank" rel="noreferrer">Spotify</a>
          <a href={APPLE_ARTIST} target="_blank" rel="noreferrer">Apple Music</a>
          <a href={YT_MUSIC} target="_blank" rel="noreferrer">YouTube Music</a>
          <a href={OFFICIAL_YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer">YouTube</a>
          <Link to="/video">Videos</Link>
          <Link to="/live">Live</Link>
          <Link to="/shop">Shop</Link>
        </nav>
      </main>
    </PublicLayout>
  );
}
