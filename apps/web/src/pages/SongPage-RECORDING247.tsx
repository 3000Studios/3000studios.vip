import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getSongBySlug } from '../data/songs';
import { PublicLayout } from './Home';

export function SongPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const song = getSongBySlug(slug || '');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState(124);

  useEffect(() => {
    if (!song) return;
    window.dispatchEvent(
      new CustomEvent('3000-play-track', {
        detail: { src: song.fullAudio, title: song.title },
      }),
    );
  }, [song]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !song) return;

    const update = () => setProgress((audio.currentTime / audio.duration) * 100 || 0);
    const onPlay = () => {
      setIsPlaying(true);
      setNeedsGesture(false);
    };
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.volume = 0.4;
    audio.loop = true;

    void audio.play().catch(() => setNeedsGesture(true));

    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [song]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play().catch(() => setNeedsGesture(true));
    }
  };

  if (!song) {
    return (
      <PublicLayout variant="blackhole">
        <main className="songDetailPage notFound">
          <div className="songPanel">
            <h1>Track unavailable</h1>
            <button className="bigAction" type="button" onClick={() => navigate('/music')}>
              Back to music
            </button>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout variant={song.wallpaper || 'vortex'}>
      <main className="songDetailPage">
        <button className="backBtn" type="button" onClick={() => navigate('/music')}>
          ← Back to Collection
        </button>

        <div className="songHero">
          <div
            className="heroVisual songHeroArt"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.15), rgba(2,4,5,0.92)), url(${song.coverImage})`,
            }}
          >
            <img className="songHeroCover" src={song.coverImage} alt={`${song.title} album art`} />
            <div className="songMetaBig">
              <div className="genrePill">{song.genre}</div>
              <h1 className="glitchText" data-text={song.title}>
                {song.title}
              </h1>
              <p>
                {song.artist} • {song.duration}
              </p>
            </div>
          </div>
        </div>

        <div className="playerSection" data-reveal>
          <audio ref={audioRef} src={song.fullAudio} preload="auto" loop />

          <div className="playerControls">
            <button className="playBig" type="button" onClick={togglePlay}>
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <div className="progressBar">
              <div className="fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="playerMeta">
              {needsGesture ? 'Tap play to start audio' : 'Full track looping · wallpaper synced to this song'}
            </div>
          </div>

          <div className="interactionsBig">
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                if (!liked) setHearts((h) => h + 1);
              }}
              className={`bigAction ${liked ? 'active' : ''}`}
            >
              ❤️ {hearts}
            </button>
            <button type="button" onClick={() => window.location.reload()} className="bigAction">
              ↻ Restart Vibe
            </button>
            <Link className="bigAction" to="/music">
              Full catalog
            </Link>
          </div>
        </div>

        <div className="songDescription" data-reveal>
          <h3>About this track</h3>
          <p>{song.description}</p>
          <p className="vibe">Vibe: {song.vibe}</p>
        </div>
      </main>
    </PublicLayout>
  );
}
