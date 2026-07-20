import { useParams, useNavigate } from 'react-router-dom';
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
    const audio = audioRef.current;
    if (!audio) return;

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
  }, []);

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
            <button className="bigAction" type="button" onClick={() => navigate('/')}>Back home</button>
          </div>
        </main>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout variant="vortex">
    <main className="songDetailPage">
      <button className="backBtn" onClick={() => navigate('/')}>← Back to Collection</button>

      <div className="songHero">
        <div className="heroVisual" style={{ background: 'linear-gradient(180deg, #111 0%, #0a0a0f 100%)' }}>
          <div className="songMetaBig">
            <div className="genrePill">{song.genre}</div>
            <h1>{song.title}</h1>
            <p>{song.artist} • {song.duration}</p>
          </div>
        </div>
      </div>

      <div className="playerSection">
        <audio ref={audioRef} src={song.fullAudio} preload="auto" autoPlay loop />

        <div className="playerControls">
          <button className="playBig" onClick={togglePlay}>{isPlaying ? '❚❚' : '▶'}</button>
          <div className="progressBar"><div className="fill" style={{width: `${progress}%`}} /></div>
          <div className="playerMeta">
            {needsGesture ? 'Tap play to start audio' : 'Full track looping at 40% volume'}
          </div>
        </div>

        <div className="interactionsBig">
          <button onClick={() => { setLiked(!liked); if (!liked) setHearts(h => h+1); }} className={`bigAction ${liked ? 'active' : ''}`}>❤️ {hearts}</button>
          <button onClick={() => window.location.reload()} className="bigAction">↻ Restart Vibe</button>
        </div>
      </div>

      <div className="songDescription">
        <h3>About this track</h3>
        <p>{song.description}</p>
        <p className="vibe">Vibe: {song.vibe}</p>
      </div>
    </main>
    </PublicLayout>
  );
}
