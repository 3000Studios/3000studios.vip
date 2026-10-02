import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Pause, YoutubeLogo } from '@phosphor-icons/react';
import { useGlobalMusic } from '../components/GlobalMusic';
import { LazyYouTube } from '../components/LazyYouTube';
import { rolloutSongs } from '../data/music';
import {
  getOfficialVideoForTitle,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { priorityShorts } from '../data/priorityShorts';
import { publishedShorts } from '../data/publishedShorts';
import { getSongBySlug } from '../data/songs';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import '../v2/song-page.css';

const REVEAL_DELAY_MS = 2000;

const normalizeTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/3000 studios/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const music = useGlobalMusic();
  const { playIndex } = music;
  const song = getSongBySlug(slug || '');
  const [readyVideoId, setReadyVideoId] = useState('');
  const [revealedVideoId, setRevealedVideoId] = useState('');
  const touchStart = useRef<number | null>(null);
  const officialVideo = useMemo(
    () => (song ? getOfficialVideoForTitle(song.title) : undefined),
    [song],
  );
  const relatedShorts = useMemo(() => {
    if (!song) return [];
    const title = normalizeTitle(song.title);
    const matching = publishedShorts.filter((short) => {
      const candidate = normalizeTitle(short.title);
      return title.length > 3 && (candidate.includes(title) || title.includes(candidate));
    });
    const candidates = matching.length ? matching : priorityShorts;
    return candidates
      .filter((short) => short.videoId !== officialVideo?.videoId)
      .slice(0, 3);
  }, [song, officialVideo]);

  useEffect(() => {
    if (!song) return;
    const index = rolloutSongs.findIndex((track) => track.slug === song.slug);
    if (index >= 0) playIndex(index, { autoplay: true });
  }, [song, playIndex]);

  useEffect(() => {
    if (!officialVideo) return;
    const timer = window.setTimeout(() => {
      setRevealedVideoId(officialVideo.videoId);
    }, REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [officialVideo]);

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
      <PublicLayoutV2 wallpaper="eq">
        <main className="v2-song-page">
          <div className="v2-card v2-song-notfound">
            <h1>
              Track <span className="v2-grad-text">unavailable</span>
            </h1>
            <Link className="v2-btn" to="/music">
              Back to music
            </Link>
          </div>
        </main>
      </PublicLayoutV2>
    );
  }

  const progress = music.duration > 0 ? (music.currentTime / music.duration) * 100 : 0;
  const embed = officialVideo
    ? `${youtubeEmbedUrl(officialVideo.videoId)}&autoplay=1&mute=1&controls=0&loop=1&playlist=${officialVideo.videoId}&playsinline=1`
    : '';

  return (
    <PublicLayoutV2 wallpaper="eq">
      <main
        className="v2-song-page"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <div className="v2-song-topline">
          <button className="v2-song-back" type="button" onClick={() => navigate('/music')}>
            <ArrowLeft size={15} weight="bold" />
            Collection
          </button>
          <span>Swipe left or right · {rolloutSongs.length} verified releases</span>
        </div>

        <section
          className={`v2-song-cinema ${
            officialVideo &&
            revealedVideoId === officialVideo.videoId &&
            readyVideoId === officialVideo.videoId
              ? 'is-video'
              : 'is-art'
          }`}
          aria-label={`${song.title} visual experience`}
        >
          <div
            className="v2-song-cinema-glow"
            style={{ backgroundImage: `url(${song.coverImage})` }}
            aria-hidden="true"
          />
          <img
            className="v2-song-cinema-cover"
            src={song.coverImage}
            alt={`${song.title} album artwork`}
          />
          {officialVideo ? (
            <iframe
              className="v2-song-cinema-video"
              src={embed}
              title={`${song.title} official video`}
              allow="autoplay; encrypted-media; picture-in-picture"
              onLoad={() => setReadyVideoId(officialVideo.videoId)}
            />
          ) : null}
          <div className="v2-song-cinema-shade" aria-hidden="true" />
          <div className="v2-song-cinema-meta">
            <span className="v2-chip">
              {officialVideo ? 'Official video' : 'Official release'}
            </span>
            <h1>{song.title}</h1>
            <p>
              {song.artist} · {song.genre}
            </p>
          </div>
          <button
            className="v2-song-swipe previous"
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous song"
          >
            ‹
          </button>
          <button
            className="v2-song-swipe next"
            type="button"
            onClick={() => move(1)}
            aria-label="Next song"
          >
            ›
          </button>
        </section>

        <section className="v2-card v2-song-player">
          <button
            className="v2-song-play"
            type="button"
            onClick={music.toggle}
            aria-label={music.isPlaying ? 'Pause' : 'Play'}
          >
            {music.isPlaying ? <Pause size={24} weight="fill" /> : <Play size={24} weight="fill" />}
          </button>
          <div className="v2-song-progress-group">
            <div
              className="v2-song-progress"
              role="progressbar"
              aria-label="Playback progress"
              aria-valuenow={Math.round(progress)}
            >
              <div className="v2-song-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p>
              {music.isPlaying
                ? 'Audio-reactive experience live'
                : 'Press play to activate the visual environment'}
            </p>
          </div>
          {officialVideo ? (
            <a
              className="v2-btn v2-btn--blue v2-btn--sm"
              href={youtubeWatchUrl(officialVideo.videoId)}
              target="_blank"
              rel="noreferrer"
            >
              <YoutubeLogo size={18} weight="fill" />
              Watch on YouTube
            </a>
          ) : null}
        </section>

        <section className="v2-card v2-song-about">
          <h2>About this release</h2>
          <p>{song.description}</p>
          <p className="v2-song-vibe">{song.vibe}</p>
        </section>

        <section className="v2-card v2-song-shorts" aria-labelledby="song-shorts-title">
          <div className="v2-song-shorts-head">
            <div>
              <span>Official channel</span>
              <h2 id="song-shorts-title">Shorts & clips</h2>
            </div>
            <a href="https://www.youtube.com/@3000Studio/shorts" target="_blank" rel="noreferrer">
              All Shorts ↗
            </a>
          </div>
          <div className="v2-song-shorts-rail">
            {relatedShorts.map((short) => (
              <article className="v2-song-short-card" key={short.videoId}>
                <LazyYouTube
                  className="v2-song-short-frame"
                  videoId={short.videoId}
                  title={short.title}
                  muted
                />
                <a href={youtubeWatchUrl(short.videoId)} target="_blank" rel="noreferrer">
                  {short.title}
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>
      <div className="v2-wrap">
        <LiveLine />
      </div>
    </PublicLayoutV2>
  );
}
