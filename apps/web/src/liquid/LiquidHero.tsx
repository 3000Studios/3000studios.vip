import { useEffect, useRef, type RefObject } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadCarouselAssets, startBeatPump } from './loader';

export type LiquidPanel = {
  slug: string;
  src?: string;
  poster?: string;
  label: string;
};

/**
 * Liquid A hero stage (v2, 2026-10-27). The liquid surface + floating
 * preview carousel were built by the fleet's liquid specialist as
 * standalone files (vendored verbatim under public/js/: liquid.js,
 * carousel.js, carousel.css — see their INTEGRATION.md) and are wired
 * here, not re-implemented: one canvas in the hero only, pointer ripples
 * forwarded from anywhere on the hero, panels bob on the shared
 * LiquidBeat groove, and the beat pump reads the site's single
 * AnalyserNode (lib/audioAnalyserBus, owned by GlobalMusic).
 *
 * Panels are the produced 1-minute preview videos (cover-art videos with
 * the track's real audio — not the official music videos). A click (tap
 * without drag, per the carousel's own contract) opens the song page.
 */
export function LiquidHero({
  panels,
  heroRef,
}: {
  panels: LiquidPanel[];
  heroRef: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let surface: { destroy: () => void; spawnRipple: (x: number, y: number, s?: number) => void } | null =
      null;
    let carousel: { destroy: () => void } | null = null;
    let disposed = false;
    const hero = heroRef.current;

    const forwardPointer = (e: PointerEvent) => {
      if (!surface || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      surface.spawnRipple(e.clientX - r.left, e.clientY - r.top, 0.9);
    };

    (async () => {
      try {
        await loadCarouselAssets();
      } catch {
        return; // engine unavailable: the hero stays a static aurora stage
      }
      if (disposed || !canvasRef.current || !stageRef.current) return;
      if (!window.LiquidSurface || !window.LiquidCarousel) return;
      surface = new window.LiquidSurface(canvasRef.current);
      carousel = new window.LiquidCarousel(stageRef.current, panels, {
        liquid: surface,
        rotateMs: 4200,
        onSelect: (slug: string) => navigate(`/song/${slug}`),
      });
      startBeatPump();
      hero?.addEventListener('pointerdown', forwardPointer);
    })();

    return () => {
      disposed = true;
      hero?.removeEventListener('pointerdown', forwardPointer);
      carousel?.destroy();
      surface?.destroy();
    };
    // Panels are build-time data (preview manifest + catalog) — mount once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <>
      <canvas ref={canvasRef} className="liquid-canvas" aria-hidden="true" />
      <div ref={stageRef} className="liquid-stage" aria-label="Latest previews on the water" />
    </>
  );
}
