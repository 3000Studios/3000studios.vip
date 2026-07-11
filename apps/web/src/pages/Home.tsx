import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type PointerEvent,
} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../lib/auth';
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

const easeOut = [0.22, 1, 0.36, 1] as const;

const fadeUp: Record<string, any> = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOut } },
};

const stagger: Record<string, any> = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.12 } },
};

const softSpring = { type: 'spring' as const, stiffness: 120, damping: 18, mass: 0.8 };

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

function FloatingOrbs() {
  return (
    <div className="floatingOrbs" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="orb"
          style={
            {
              '--orb-x': `${12 + (i * 11) % 76}%`,
              '--orb-y': `${18 + (i * 17) % 62}%`,
              '--orb-size': `${28 + (i % 4) * 18}px`,
              '--orb-delay': `${i * 0.7}s`,
              '--orb-dur': `${9 + (i % 5) * 2.2}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
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
    <motion.section
      className="musicGame"
      aria-label="Tap the notes music game"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.25 }}
      variants={stagger}
    >
      <motion.div className="sectionHead" variants={fadeUp}>
        <span>Interactive Preview</span>
        <h2>Tap the Notes</h2>
        <p>Catch the floating notes and light up the rollout stage.</p>
      </motion.div>
      <motion.div className="gameStats" variants={fadeUp}>
        <strong>Score {score}</strong>
        <strong>Level {level}</strong>
      </motion.div>
      <motion.div className="noteArena" variants={fadeUp}>
        {notes.map((note) => (
          <motion.button
            className="tapNote"
            key={note.id}
            type="button"
            whileHover={{ scale: 1.18, rotate: 8 }}
            whileTap={{ scale: 0.88 }}
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
          </motion.button>
        ))}
        {sparks.map((spark) => (
          <span
            className="noteSpark"
            key={spark.id}
            style={{ '--spark-x': `${spark.x}%`, '--spark-y': `${spark.y}%` } as CSSProperties}
          />
        ))}
      </motion.div>
    </motion.section>
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

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });
  const heroY = useTransform(smoothProgress, [0, 0.35], [0, -80]);
  const heroScale = useTransform(smoothProgress, [0, 0.3], [1, 0.94]);
  const carpetOpacity = useTransform(smoothProgress, [0, 0.4], [0.78, 0.25]);

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
      <motion.div className="redCarpet" style={{ opacity: carpetOpacity }} aria-hidden="true" />
      <FloatingOrbs />
      <audio ref={audioRef} src={HOME_SONG} preload="auto" />

      <AnimatePresence>
        {introState !== 'done' ? (
          <motion.section
            className="videoOpener"
            aria-label="3000 Studios video opener"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.04, filter: 'blur(12px)' }}
            transition={{ duration: 0.9, ease: easeOut }}
          >
            <video
              ref={videoRef}
              src={INTRO_VIDEO}
              autoPlay
              playsInline
              preload="auto"
              onEnded={revealHome}
              onError={revealHome}
            />
            <div className="openerShade" />
            {(needsGesture || introState === 'pending') && (
              <motion.button
                className="enterVipButton"
                type="button"
                onClick={startIntro}
                initial={{ scale: 0.86, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                transition={softSpring}
              >
                Tap to Enter VIP
              </motion.button>
            )}
            <button className="soundToggle openerToggle" type="button" onClick={toggleMute}>
              {muted ? 'Unmute' : 'Mute'}
            </button>
            <button className="openerPause" type="button" onClick={togglePause}>
              {paused ? 'Resume' : 'Pause'}
            </button>
            <button className="mediaSkip" type="button" onClick={revealHome}>
              Skip Intro
            </button>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <div className="mediaControls" aria-label="Media controls">
        <motion.button className="soundToggle" type="button" onClick={toggleMute} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
          {muted ? 'Sound Off' : 'Sound On'}
        </motion.button>
        <motion.button className="soundToggle" type="button" onClick={togglePause} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
          {paused ? 'Resume' : 'Pause'}
        </motion.button>
        {needsGesture && introState === 'done' ? (
          <motion.button className="soundToggle" type="button" onClick={startMainSong} whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
            Start Music
          </motion.button>
        ) : null}
      </div>

      {tapSparks.map((spark) => (
        <span
          className="tapParticle"
          key={spark.id}
          style={{ '--spark-x': `${spark.x}%`, '--spark-y': `${spark.y}%` } as CSSProperties}
        />
      ))}

      <motion.header
        className="rolloutHeader"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.7, ease: easeOut }}
      >
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
      </motion.header>

      <motion.section className="rolloutHero" style={{ y: heroY, scale: heroScale }}>
        <div className="velvetRope left" aria-hidden="true" />
        <div className="velvetRope right" aria-hidden="true" />
        <div className="spotlight one" aria-hidden="true" />
        <div className="spotlight two" aria-hidden="true" />

        <motion.div className="heroCopy" initial="hidden" animate="show" variants={stagger}>
          <motion.p className="vipKicker" variants={fadeUp}>Private music rollout</motion.p>
          <motion.h1 variants={fadeUp}>
            <span className="glowText">3000 Studios</span>
            <br />
            VIP Access
          </motion.h1>
          <motion.p variants={fadeUp}>
            The full rollout is coming soon. For now, the doors are velvet-roped, the music is live,
            and VIP access is limited.
          </motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <motion.a
              href="#sound"
              className="goldButton"
              whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(255,211,106,0.45)' }}
              whileTap={{ scale: 0.97 }}
            >
              Enter the Sound
            </motion.a>
            <span>Music. Media. Motion. Built for creators who move different.</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="vipHost"
          aria-label="VIP music executive character"
          initial={{ opacity: 0, scale: 0.86, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.45, duration: 1.1, ease: easeOut }}
        >
          <div className="hostGlow" />
          <div className="hostHead" />
          <div className="hostBody">
            <span className="wavePin a" />
            <span className="wavePin b" />
            <span className="wavePin c" />
            <span className="chromeTie" />
          </div>
          <div className="hostRope" />
        </motion.div>
      </motion.section>

      <motion.section
        className="soundSection"
        id="sound"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.div className="sectionHead" variants={fadeUp}>
          <span>Coming Soon</span>
          <h2>Private Music Rollout</h2>
          <p>
            3000 Studios is building a premium creative, music, and media experience. This preview
            opens the brand direction before the full platform goes live.
          </p>
        </motion.div>
        <motion.div className="equalizer" aria-hidden="true" variants={fadeUp}>
          {Array.from({ length: 28 }, (_, index) => (
            <span key={index} style={{ '--eq-delay': `${(index % 8) * 0.08}s` } as CSSProperties} />
          ))}
        </motion.div>
      </motion.section>

      <div id="game">
        <MusicNoteGame />
      </div>

      <motion.section
        className="chartSection"
        id="songs"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <motion.div className="sectionHead" variants={fadeUp}>
          <span>Ranked Preview</span>
          <h2>3000 Studios Originals</h2>
          <p>Real available assets are shown first. More official tracks can drop into this chart.</p>
        </motion.div>
        {rolloutSongs.map((song) => (
          <motion.article
            className="songCard"
            key={song.title}
            variants={fadeUp}
            whileHover={{ y: -4, borderColor: 'rgba(30,215,96,0.55)' }}
            transition={softSpring}
          >
            <strong>#{song.rank}</strong>
            <div>
              <h3>{song.title}</h3>
              <p>{song.description}</p>
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          </motion.article>
        ))}
      </motion.section>

      <footer className="rolloutFooter">
        <button className="copyrightTrigger" type="button" onClick={handleSealTap} aria-label="Copyright">
          ©
        </button>
        <a href="mailto:Mr.jwswain@gmail.com">Mr.jwswain@gmail.com</a>
      </footer>

      <AnimatePresence>
        {adminOpen ? (
          <motion.section
            className="adminScrim"
            role="dialog"
            aria-modal="true"
            aria-label="Restricted verification"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.form
              className="adminCodeModal"
              onSubmit={handleAdminUnlock}
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={softSpring}
            >
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
            </motion.form>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
