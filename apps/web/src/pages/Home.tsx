import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { LockFieldBackdrop } from '../components/LockFieldBackdrop';
import { rolloutSongs } from '../data/music';

type Note = {
  id: number;
  x: number;
  y: number;
  delay: number;
  speed: number;
  glyph: string;
};

type Spark = {
  id: number;
  x: number;
  y: number;
};

const INTRO_VIDEO = '/media/spotify-signing.mp4';
const HOME_SONG = '/media/always-feel-like.mp3';
const ADMIN_TRIGGER_CODE = '5555';

function seededNotes(level: number): Note[] {
  const count = Math.min(6 + level, 14);
  const glyphs = ['♪', '♫', '♬', '♩'];
  return Array.from({ length: count }, (_, index) => ({
    id: index + level * 100,
    x: 8 + ((index * 17 + level * 11) % 82),
    y: 18 + ((index * 23 + level * 7) % 62),
    delay: (index % 5) * 0.32,
    speed: Math.max(4.2, 8.5 - level * 0.35),
    glyph: glyphs[(index + level) % glyphs.length],
  }));
}

function playTapTone() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(660, now);
  osc.frequency.exponentialRampToValueAtTime(990, now + 0.12);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.2);
  window.setTimeout(() => void ctx.close(), 320);
}

function MusicNoteGame() {
  const sparkCounter = useRef(0);
  const [score, setScore] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const level = Math.floor(score / 8) + 1;
  const notes = useMemo(() => seededNotes(level), [level]);

  function collect(note: Note) {
    playTapTone();
    setScore((current) => current + 1);
    sparkCounter.current += 1;
    const spark = { id: sparkCounter.current + note.id, x: note.x, y: note.y };
    setSparks((current) => [...current.slice(-10), spark]);
    window.setTimeout(() => {
      setSparks((current) => current.filter((item) => item.id !== spark.id));
    }, 700);
  }

  return (
    <section className="musicGame" aria-label="Tap the notes music game">
      <div className="sectionHead">
        <span>Interactive Preview</span>
        <h2>Tap the Notes</h2>
        <p>Catch the floating notes and light up the rollout stage.</p>
      </div>
      <div className="gameStats">
        <strong>Score {score}</strong>
        <strong>Level {level}</strong>
      </div>
      <div className="noteArena">
        {notes.map((note) => (
          <button
            className="tapNote"
            key={note.id}
            type="button"
            onClick={() => collect(note)}
            style={
              {
                '--note-x': `${note.x}%`,
                '--note-y': `${note.y}%`,
                '--note-delay': `${note.delay}s`,
                '--note-speed': `${note.speed}s`,
              } as CSSProperties
            }
            aria-label="Collect music note"
          >
            {note.glyph}
          </button>
        ))}
        {sparks.map((spark) => (
          <span
            className="noteSpark"
            key={spark.id}
            style={{ '--spark-x': `${spark.x}%`, '--spark-y': `${spark.y}%` } as CSSProperties}
          />
        ))}
      </div>
    </section>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { login, ownerUsername } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sealTaps = useRef(0);
  const tapReset = useRef<number | null>(null);
  const songStarted = useRef(false);
  const tapParticleId = useRef(0);
  const [introState, setIntroState] = useState<'pending' | 'playing' | 'done'>('pending');
  const [needsGesture, setNeedsGesture] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [ownerPass, setOwnerPass] = useState('');
  const [secretAnswer, setSecretAnswer] = useState('');
  const [adminError, setAdminError] = useState('');
  const [tapSparks, setTapSparks] = useState<Spark[]>([]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = 0.8;
    video.muted = muted;
    const attempt = video.play();
    if (attempt) {
      attempt
        .then(() => {
          setIntroState('playing');
          setNeedsGesture(false);
        })
        .catch(() => {
          setNeedsGesture(true);
        });
    }
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    audio.muted = muted;
  }, [muted]);

  function startIntro() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    void video.play().then(() => {
      setIntroState('playing');
      setNeedsGesture(false);
    });
  }

  function revealHome() {
    if (songStarted.current) {
      setIntroState('done');
      return;
    }
    songStarted.current = true;
    setIntroState('done');
    setPaused(false);
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.volume = 0.4;
    audio.muted = muted;
    void audio.play().catch(() => setNeedsGesture(true));
  }

  function startMainSong() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;
    audio.muted = muted;
    setNeedsGesture(false);
    setPaused(false);
    void audio.play().catch(() => setNeedsGesture(true));
  }

  function toggleMute() {
    setMuted((current) => {
      const next = !current;
      if (videoRef.current) videoRef.current.muted = next;
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  }

  function togglePause() {
    setPaused((current) => {
      const next = !current;
      if (next) {
        videoRef.current?.pause();
        audioRef.current?.pause();
      } else if (introState === 'done') {
        void audioRef.current?.play();
      } else {
        void videoRef.current?.play();
      }
      return next;
    });
  }

  function handleSealTap() {
    sealTaps.current += 1;
    if (tapReset.current) window.clearTimeout(tapReset.current);
    tapReset.current = window.setTimeout(() => {
      sealTaps.current = 0;
    }, 2200);

    if (sealTaps.current >= 10) {
      sealTaps.current = 0;
      setAdminOpen(true);
      setAdminVerified(false);
      setAdminError('');
      setAdminCode('');
      setOwnerPass('');
      setSecretAnswer('');
    }
  }

  async function handleAdminUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminVerified) {
      if (adminCode.trim() !== ADMIN_TRIGGER_CODE) {
        setAdminError('Access denied.');
        return;
      }
      setAdminVerified(true);
      setAdminError('');
      return;
    }

    const ok = await login(ownerUsername, ownerPass, secretAnswer);
    if (!ok) {
      setAdminError('Access denied.');
      return;
    }
    navigate('/vault');
  }

  function createTapParticle(event: PointerEvent<HTMLElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    tapParticleId.current += 1;
    const spark = {
      id: tapParticleId.current,
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    setTapSparks((current) => [...current.slice(-12), spark]);
    window.setTimeout(() => {
      setTapSparks((current) => current.filter((item) => item.id !== spark.id));
    }, 800);
  }

  return (
    <main className="rolloutPage" onPointerDown={createTapParticle}>
      <LockFieldBackdrop />
      <div className="rolloutAura" aria-hidden="true" />
      <div className="redCarpet" aria-hidden="true" />
      <audio ref={audioRef} src={HOME_SONG} preload="auto" />

      {introState !== 'done' ? (
        <section className="videoOpener" aria-label="3000 Studios video opener">
          <video
            ref={videoRef}
            src={INTRO_VIDEO}
            playsInline
            preload="auto"
            onEnded={revealHome}
            onError={revealHome}
          />
          <div className="openerShade" />
          {needsGesture || introState === 'pending' ? (
            <button className="enterVipButton" type="button" onClick={startIntro}>
              Tap to Enter VIP
            </button>
          ) : null}
          <button className="soundToggle openerToggle" type="button" onClick={toggleMute}>
            {muted ? 'Unmute' : 'Mute'}
          </button>
          <button className="openerPause" type="button" onClick={togglePause}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className="mediaSkip" type="button" onClick={revealHome}>
            Skip Intro
          </button>
        </section>
      ) : null}

      <div className="mediaControls" aria-label="Media controls">
        <button className="soundToggle" type="button" onClick={toggleMute}>
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
        <button className="soundToggle" type="button" onClick={togglePause}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        {needsGesture && introState === 'done' ? (
          <button className="soundToggle" type="button" onClick={startMainSong}>
            Start Music
          </button>
        ) : null}
      </div>

      {tapSparks.map((spark) => (
        <span
          className="tapParticle"
          key={spark.id}
          style={{ '--spark-x': `${spark.x}%`, '--spark-y': `${spark.y}%` } as CSSProperties}
        />
      ))}

      <header className="rolloutHeader">
        <button className="rolloutBrand" type="button" onClick={handleSealTap} aria-label="3000 Studios seal">
          <span>3K</span>
          <strong>3000 Studios</strong>
        </button>
        <nav className={menuOpen ? 'rolloutNav open' : 'rolloutNav'} aria-label="Primary navigation">
          <a href="#sound" onClick={() => setMenuOpen(false)}>Sound</a>
          <a href="#game" onClick={() => setMenuOpen(false)}>Game</a>
          <a href="#songs" onClick={() => setMenuOpen(false)}>Songs</a>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>
        <div className="streamBadge" aria-label="Music signal badge">
          <span />
          <span />
          <span />
        </div>
        <button
          className="backstagePass"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? 'Close' : 'Pass'}
        </button>
      </header>

      <section className="rolloutHero">
        <div className="velvetRope left" aria-hidden="true" />
        <div className="velvetRope right" aria-hidden="true" />
        <div className="spotlight one" aria-hidden="true" />
        <div className="spotlight two" aria-hidden="true" />

        <div className="heroCopy">
          <p className="vipKicker">Private music rollout</p>
          <h1>3000 Studios VIP Access</h1>
          <p>
            The full rollout is coming soon. For now, the doors are velvet-roped, the music is live,
            and VIP access is limited.
          </p>
          <div className="heroActions">
            <a href="#sound" className="goldButton">
              Enter the Sound
            </a>
            <span>Music. Media. Motion. Built for creators who move different.</span>
          </div>
        </div>

        <div className="vipHost" aria-label="VIP music executive character">
          <div className="hostGlow" />
          <div className="hostHead" />
          <div className="hostBody">
            <span className="wavePin a" />
            <span className="wavePin b" />
            <span className="wavePin c" />
            <span className="chromeTie" />
          </div>
          <div className="hostRope" />
        </div>
      </section>

      <section className="soundSection" id="sound">
        <div className="sectionHead">
          <span>Coming Soon</span>
          <h2>Private Music Rollout</h2>
          <p>
            3000 Studios is building a premium creative, music, and media experience. This preview
            opens the brand direction before the full platform goes live.
          </p>
        </div>
        <div className="equalizer" aria-hidden="true">
          {Array.from({ length: 28 }, (_, index) => (
            <span key={index} style={{ '--eq-delay': `${(index % 8) * 0.08}s` } as CSSProperties} />
          ))}
        </div>
      </section>

      <div id="game">
        <MusicNoteGame />
      </div>

      <section className="chartSection" id="songs">
        <div className="sectionHead">
          <span>Ranked Preview</span>
          <h2>3000 Studios Originals</h2>
          <p>Real available assets are shown first. More official tracks can drop into this chart.</p>
        </div>
        {rolloutSongs.map((song) => (
          <article className="songCard" key={song.title}>
            <strong>#{song.rank}</strong>
            <div>
              <h3>{song.title}</h3>
              <p>{song.description}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const audio = audioRef.current;
                if (!audio) return;
                audio.src = song.src;
                audio.volume = 0.4;
                audio.muted = muted;
                setPaused(false);
                void audio.play();
              }}
            >
              Play Preview
            </button>
          </article>
        ))}
      </section>

      <footer className="rolloutFooter">
        <button className="copyrightTrigger" type="button" onClick={handleSealTap} aria-label="Copyright">
          ©
        </button>
        <a href="mailto:Mr.jwswain@gmail.com">Mr.jwswain@gmail.com</a>
      </footer>

      {adminOpen ? (
        <section className="adminScrim" role="dialog" aria-modal="true" aria-label="Restricted verification">
          <form className="adminCodeModal" onSubmit={handleAdminUnlock}>
            <button className="modalClose" type="button" onClick={() => setAdminOpen(false)}>
              x
            </button>
            <span>{adminVerified ? 'Verification' : 'Access'}</span>
            <h2>Restricted</h2>
            {!adminVerified ? (
              <label>
                <span>Code</span>
                <input value={adminCode} onChange={(event) => setAdminCode(event.target.value)} autoComplete="off" />
              </label>
            ) : (
              <>
                <label>
                  <span>Email</span>
                  <input value={ownerUsername} readOnly autoComplete="username" />
                </label>
                <label>
                  <span>Passcode</span>
                  <input
                    value={ownerPass}
                    type="password"
                    onChange={(event) => setOwnerPass(event.target.value)}
                    autoComplete="current-password"
                  />
                </label>
                <label>
                  <span>Answer</span>
                  <input
                    value={secretAnswer}
                    type="password"
                    onChange={(event) => setSecretAnswer(event.target.value)}
                    autoComplete="off"
                  />
                </label>
              </>
            )}
            {adminError ? <p>{adminError}</p> : null}
            <button className="goldButton" type="submit">
              Continue
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
