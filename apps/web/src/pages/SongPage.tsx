import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getSongBySlug } from '../data/songs';
import { motion } from 'framer-motion';

type FloatingVibe = { id: number; text: string; x: number; y: number };

export function SongPage() {
  const { slug } = useParams<{ slug: string }>(); 
  const navigate = useNavigate();
  const song = getSongBySlug(slug || '');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const vibeId = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [hearts, setHearts] = useState(124);
  const [score, setScore] = useState(0);
  const [floating, setFloating] = useState<FloatingVibe[]>([]);

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
      <div className="songDetailPage notFound">
        <div className="songPanel">
          <h1>Track unavailable</h1>
          <button className="bigAction" type="button" onClick={() => navigate('/')}>Back home</button>
        </div>
      </div>
    );
  }

  const vibeWords = song.vibe.split('•').map(w => w.trim());

  const spawnVibe = () => {
    const word = vibeWords[Math.floor(Math.random()*vibeWords.length)];
    vibeId.current += 1;
    const newItem = { id: vibeId.current, text: word, x: Math.random()*70 + 15, y: Math.random()*40 + 30 };
    setFloating(prev => [...prev.slice(-5), newItem]);
    setTimeout(() => setFloating(f => f.filter(i => i.id !== newItem.id)), 2800);
  };

  const catchVibe = (id: number) => {
    setScore(s => s + 10);
    setFloating(f => f.filter(i => i.id !== id));
    if (navigator.vibrate) navigator.vibrate(30);
  };

  return (
    <div className="songDetailPage">
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

      <section className="themedGame">
        <h2>{song.title} — Vibe Catcher</h2>
        <p>Tap the floating words that match the energy of the track. Feel it.</p>
        <div className="gameArena" onClick={spawnVibe}>
          {floating.map(item => (
            <motion.div
              key={item.id}
              className="vibeWord"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={(e) => { e.stopPropagation(); catchVibe(item.id); }}
              whileTap={{ scale: 0.8 }}
            >
              {item.text}
            </motion.div>
          ))}
          <div className="score">Score: {score}</div>
        </div>
        <p className="hint">Click anywhere in the arena to release new vibes</p>
      </section>

      <div className="songDescription">
        <h3>About this track</h3>
        <p>{song.description}</p>
        <p className="vibe">Vibe: {song.vibe}</p>
      </div>

      <footer className="songFooter">
        This track is part of the 3000 Studios VIP rollout. More official releases will be added as assets are finalized.
      </footer>
    </div>
  );
}
