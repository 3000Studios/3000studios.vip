import { useEffect } from 'react';
import { getAnalyser } from './audioAnalyserBus';
import { usePrefersReducedMotion } from './mediaQuery';

/**
 * Drives the `--header-beat` CSS custom property (0..1) on
 * `document.documentElement` from the live analyser published by
 * GlobalMusic on `audioAnalyserBus`.
 *
 * - The value is the smoothed average frequency level of whatever is
 *   currently playing (global music or a vault preview — both run through
 *   the same shared analyser chain).
 * - When nothing is playing the analyser returns silence, so the level
 *   decays to 0 and the header sits perfectly still.
 * - No React state is touched: the value is written straight to the CSS
 *   variable, so the header can pulse at animation-frame rate without
 *   re-rendering.
 * - Under `prefers-reduced-motion` the loop never starts and the variable
 *   is forced to 0, so the header never moves.
 *
 * The header consumes it with transform/opacity only, e.g.
 * `transform: scale(calc(1 + var(--header-beat, 0) * 0.05))`.
 */
export function useAudioBeat(): void {
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const root = document.documentElement;
    if (reduce) {
      root.style.setProperty('--header-beat', '0');
      return;
    }

    let raf = 0;
    let level = 0;
    let data: Uint8Array<ArrayBuffer> | null = null;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const analyser = getAnalyser();
      if (analyser) {
        if (!data || data.length !== analyser.frequencyBinCount) {
          data = new Uint8Array(analyser.frequencyBinCount);
        }
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const target = data.length > 0 ? sum / data.length / 255 : 0;
        // Attack fast, release slow: the header breathes with the music
        // instead of snapping to silence between beats.
        level += (target - level) * (target > level ? 0.45 : 0.08);
      } else {
        level *= 0.9;
      }
      if (level < 0.004) level = 0;
      root.style.setProperty('--header-beat', level.toFixed(3));
      raf = requestAnimationFrame(tick);
    };

    // The loop polls getAnalyser() every frame, so it picks up the
    // analyser the moment GlobalMusic publishes one — no subscription
    // needed (HEAD's audioAnalyserBus exposes getAnalyser only).
    raf = requestAnimationFrame(tick);

    const onHidden = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!stopped) {
        raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onHidden);

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onHidden);
      root.style.setProperty('--header-beat', '0');
    };
  }, [reduce]);
}
