import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, ArrowRight } from '@phosphor-icons/react';
import { MagneticButton } from '../components/MagneticButton';
import { usePrefersReducedMotion } from '../lib/mediaQuery';
import { useGlobalMusic } from '../components/GlobalMusic';
import { publishedSongs } from '../data/publishedSongs';
import { CircularEQ } from './CircularEQ';

function Word({ children, index, gold }: { children: string; index: number; gold?: boolean }) {
  return (
    <span className={`v3-w${gold ? ' v3-gold' : ''}`}>
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.55 + index * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* Premium circular equalizer — canvas radial visualizer, dances to real audio. */
function HeroVisualizer() {
  return <CircularEQ size={210} />;
}

/* Featured drop — the newest release, playable straight from the hero. */
function LatestDrop() {
  const music = useGlobalMusic();
  const song = publishedSongs[0];
  if (!song) return null;
  const isActive =
    music.activeSong?.slug === song.slug ||
    music.activeTitle.toLowerCase() === song.title.toLowerCase();
  const playing = isActive && music.isPlaying;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.45 }}
      style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}
    >
      <button
        type="button"
        className="v3-drop-pill"
        onClick={() => (playing ? music.pause() : music.playTrack(song.src, song.title))}
        aria-label={playing ? `Pause ${song.title}` : `Play the latest drop: ${song.title}`}
      >
        <img src={song.cover} alt="" aria-hidden="true" />
        <span className="v3-drop-meta">
          <i>Latest drop</i>
          <b>{song.title}</b>
        </span>
        <span className="v3-drop-play" aria-hidden="true">
          {playing ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
        </span>
      </button>
    </motion.div>
  );
}

export function HeroEQ({ live }: { live: boolean }) {
  const reduce = usePrefersReducedMotion();
  const [beat, setBeat] = useState(false);

  /* 128 BPM headline pulse — the brand heartbeat. */
  useEffect(() => {
    if (reduce) return;
    const iv = window.setInterval(() => setBeat((b) => !b), 234);
    return () => window.clearInterval(iv);
  }, [reduce]);

  const words: Array<{ t: string; gold?: boolean }> = [
    { t: 'SOUND' },
    { t: 'YOU' },
    { t: 'CAN' },
    { t: 'SEE.', gold: true },
  ];

  return (
    <header className="v3-hero">
      <div className="v3-hero-shade" aria-hidden="true" />

      <div className="v3-hero-inner">
        <motion.span
          className="v3-kicker"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          {live && <span className="v3-live-dot" aria-hidden="true" />}
          {live ? 'On air now' : 'Independent label · Acworth, Georgia'}
        </motion.span>

        <motion.h1
          className="v3-display v3-beat"
          animate={reduce ? undefined : { scale: beat ? 1.022 : 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {words.map((w, i) => (
            <span key={w.t}>
              <Word index={i} gold={w.gold}>
                {w.t}
              </Word>{' '}
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.9 }}
          style={{ display: 'flex', justifyContent: 'center', marginTop: 26 }}
        >
          <HeroVisualizer />
        </motion.div>

        <motion.p
          className="v3-lede"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05 }}
        >
          Original music, cinematic videos, and live broadcasts — produced in-house,
          released worldwide. This is the whole universe on one page.
        </motion.p>

        <motion.div
          className="v3-cta-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25 }}
        >
          <MagneticButton href="#music" className="v3-btn v3-btn--gold">
            <Play size={17} weight="fill" /> Listen now
          </MagneticButton>
          <MagneticButton href="#videos" className="v3-btn v3-btn--ghost">
            Watch videos <ArrowRight size={16} />
          </MagneticButton>
        </motion.div>

        <LatestDrop />

        <motion.p
          className="v3-hero-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          Hit play on any track — the whole page moves with the music.
        </motion.p>
      </div>

      <a href="#live" className="v3-scroll-cue">
        Scroll
      </a>
    </header>
  );
}
