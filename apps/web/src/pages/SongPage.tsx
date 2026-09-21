import { useEffect, useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useGlobalMusic } from '../components/GlobalMusic';
import { rolloutSongs } from '../data/music';
import { getOfficialVideoForTitle, youtubeWatchUrl } from '../data/officialReleases';
import { LazyYouTube } from '../components/LazyYouTube';
import { getSongBySlug } from '../data/songs';
import { getStudioOsRelease } from '../data/studioOsCatalog';
import { PublicLayout } from './PublicLayout';

export function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const music = useGlobalMusic();
  const song = getSongBySlug(slug || '');
  const touchStart = useRef<number | null>(null);
  const officialVideo = useMemo(
    () => (song ? getOfficialVideoForTitle(song.title) : undefined),
    [song],
  );
  const osRelease = song ? getStudioOsRelease(song.slug) : undefined;

  useEffect(() => {
    if (!song) return;
    const index = rolloutSongs.findIndex((track) => track.slug === song.slug);
    if (index >= 0 && music.activeSong.slug !== song.slug) {
      music.playIndex(index, { autoplay: music.isPlaying });
    }
  }, [song, music]);

  const move = (delta: number) => {
    if (!song) return;
    const index = rolloutSongs.findIndex((track) => track.slug === song.slug);
    const next = rolloutSongs[(index + delta + rolloutSongs.length) % rolloutSongs.length];
    if (next) navigate(`/song/${next.slug}`);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') return;
    touchStart.current = event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (touchStart.current === null) return;
    const distance = event.clientX - touchStart.current;
    touchStart.current = null;
    if (distance < -56) move(1);
    if (distance > 56) move(-1);
  };

  if (!song) {
    return (
      <PublicLayout variant="blackhole">
        <main className="songDetailPage notFound">
          <div className="songPanel">
            <h1>Track unavailable</h1>
            <Link className="bigAction" to="/music">
              Back to music
            </Link>
          </div>
        </main>
      </PublicLayout>
    );
  }

  const progress = music.duration > 0 ? (music.currentTime / music.duration) * 100 : 0;

  return (
    <PublicLayout variant={song.wallpaper || 'vortex'}>
      <main
        className="songDetailPage cinematicSongPage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="songPageTopline">
          <button className="backBtn" type="button" onClick={() => navigate('/music')}>
            ← Collection
          </button>
          <span>Swipe left or right · {rolloutSongs.length} verified releases</span>
        </div>

        <section
          className="songCinema is-art"
          aria-label={`${song.title} visual experience`}
        >
          <div
            className="songCinemaGlow"
            style={{ backgroundImage: `url(${song.coverImage})` }}
            aria-hidden="true"
          />
          <img
            className="songCinemaCover"
            src={song.coverImage}
            alt={`${song.title} album artwork`}
          />
          {officialVideo ? (
            <div className="songCinemaVideo">
              <LazyYouTube
                videoId={officialVideo.videoId}
                title={`${song.title} official video`}
                playlist
                clickToPlay
              />
            </div>
          ) : null}
          <div className="songCinemaShade" aria-hidden="true" />
          <div className="songCinemaMeta">
            <span className="genrePill">
              {officialVideo ? 'Official video' : 'Official release'}
            </span>
            <h1>{song.title}</h1>
            <p>
              {song.artist} · {song.genre}
            </p>
          </div>
          <button
            className="songSwipe previous"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous song"
          >
            ‹
          </button>
          <button
            className="songSwipe next"
            type="button"
            onClick={() => move(1)}
            aria-label="Next song"
          >
            ›
          </button>
        </section>

        <section className="playerSection songControlGlass">
          <button
            className="playBig"
            type="button"
            onClick={music.toggle}
            aria-label={music.isPlaying ? 'Pause' : 'Play'}
          >
            {music.isPlaying ? '❚❚' : '▶'}
          </button>
          <div className="songProgressGroup">
            <div
              className="progressBar"
              role="progressbar"
              aria-label="Playback progress"
              aria-valuenow={Math.round(progress)}
            >
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
            <p>
              {music.isPlaying
                ? 'Audio-reactive experience live'
                : 'Press play to activate the visual environment'}
            </p>
          </div>
          {officialVideo ? (
            <a
              className="bigAction"
              href={youtubeWatchUrl(officialVideo.videoId)}
              target="_blank"
              rel="noreferrer"
            >
              Watch on YouTube
            </a>
          ) : null}
        </section>

        <section className="songDescription">
          <h2>About this release</h2>
          <p>{osRelease?.story || osRelease?.description || song.description}</p>
          {osRelease?.releaseDate ? <p>Released {osRelease.releaseDate}</p> : null}
          {osRelease?.duration ? <p>{osRelease.duration}</p> : null}
          <p className="vibe">{song.vibe}</p>
        </section>

        {osRelease?.lyrics ? (
          <section className="songDescription">
            <h2>Lyrics</h2>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{osRelease.lyrics}</pre>
          </section>
        ) : null}

        {osRelease?.credits && osRelease.credits.length > 0 ? (
          <section className="songDescription">
            <h2>Credits</h2>
            <ul>
              {osRelease.credits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {osRelease?.streaming && Object.keys(osRelease.streaming).length > 0 ? (
          <section className="songDescription">
            <h2>Listen</h2>
            <ul>
              {Object.entries(osRelease.streaming).map(([k, url]) =>
                url ? (
                  <li key={k}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {k}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}
      </main>
    </PublicLayout>
  );
}
