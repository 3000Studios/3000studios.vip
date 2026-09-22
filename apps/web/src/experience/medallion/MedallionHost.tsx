import { lazy, Suspense, useEffect, useState } from 'react';
import type { AnalyzerFrame } from '../../lib/audioAnalyzer';
import { usePrefersReducedMotion } from '../../lib/mediaQuery';
import { detectQualityTier, type QualityTier } from './quality';
import {
  medallionRuntime,
  requestForcedFracture,
  setMedallionAudio,
  setMedallionEnhanced,
  setMedallionPointer,
  setMedallionScroll,
} from './runtime';
import { hasWebGL } from './webgl';

const MedallionScene = lazy(() => import('./MedallionScene'));

export function MedallionHost({ coverUrl }: { coverUrl: string }) {
  const reduced = usePrefersReducedMotion();
  const [tier] = useState<QualityTier>(() => detectQualityTier());
  const [webgl] = useState(() => hasWebGL());
  const [art, setArt] = useState(coverUrl);
  const ready = true;

  useEffect(() => {
    const onPlay = () => setMedallionEnhanced(true);
    const onTheme = (e: Event) => {
      const cover = (e as CustomEvent<{ cover?: string }>).detail?.cover;
      if (cover) setArt(cover);
    };
    const onForce = () => requestForcedFracture();
    window.addEventListener('3000-play-track', onPlay);
    window.addEventListener('3000-song-theme', onTheme);
    window.addEventListener('3000-fracture-force', onForce);
    return () => {
      window.removeEventListener('3000-play-track', onPlay);
      window.removeEventListener('3000-song-theme', onTheme);
      window.removeEventListener('3000-fracture-force', onForce);
    };
  }, []);

  useEffect(() => {
    const onPointer = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      setMedallionPointer(nx, ny);
    };
    const onScroll = () => {
      const t = window.scrollY / Math.max(1, window.innerHeight * 0.92);
      setMedallionScroll(t);
    };
    const onAudio = (e: Event) => {
      const frame = (e as CustomEvent<AnalyzerFrame>).detail;
      if (!frame) return;
      const playing = !document.documentElement.classList.contains('is-music-paused');
      setMedallionAudio(
        {
          bass: frame.bass,
          mid: frame.mid,
          treble: frame.treble,
          energy: frame.energy,
          beat: frame.beat,
        },
        playing,
      );
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('3000-analyzer-frame', onAudio as EventListener);
    onScroll();
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('3000-analyzer-frame', onAudio as EventListener);
    };
  }, []);

  if (reduced || !webgl || !ready) {
    return <div className="medallionHost medallionHost--fallback" aria-hidden="true" />;
  }

  return (
    <div
      className={`medallionHost is-${tier.toLowerCase()}${medallionRuntime.enhanced ? ' is-enhanced' : ''}`}
      data-quality={tier}
      aria-hidden="true"
    >
      <Suspense fallback={null}>
        <MedallionScene tier={tier} coverUrl={art} />
      </Suspense>
    </div>
  );
}
