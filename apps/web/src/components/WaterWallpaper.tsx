import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/* WaterWallpaper — the "LIQUID SPLASH" water from 3000studios.space, ported
   to 3000studios.vip as the site wallpaper (Boss order, 2026-10-31).
   Same ripple-tank simulation as the space splash: a 200x112 height field,
   classic 4-neighbour propagation with 0.985 damping, slope-shaded into an
   offscreen ImageData and upscaled to the viewport. Rain drops keep it alive.
   VIP additions: a slow base-colour cycle (deep blue -> teal -> violet ->
   indigo), pause when the tab is hidden, and a static pre-rippled frame for
   prefers-reduced-motion. Pointer-events are off — it is wallpaper, not a
   widget — and it never renders on owner/office routes. */

const EXCLUDED_PREFIXES = ['/office', '/admin', '/agent', '/vault', '/command-deck', '/go-live'];

const GW = 200;
const GH = 112;

/* Base water colours the wallpaper slowly drifts through (RGB). */
const PALETTE: ReadonlyArray<readonly [number, number, number]> = [
  [7, 17, 36], // deep blue (the space original)
  [3, 27, 34], // teal
  [17, 10, 38], // violet
  [6, 13, 40], // indigo
  [7, 17, 36], // back to deep blue
];
const CYCLE_SECONDS = 72;

function paletteAt(tSeconds: number): [number, number, number] {
  const phase = ((tSeconds % CYCLE_SECONDS) + CYCLE_SECONDS) % CYCLE_SECONDS;
  const seg = (phase / CYCLE_SECONDS) * (PALETTE.length - 1);
  const i = Math.min(PALETTE.length - 2, Math.floor(seg));
  const f = seg - i;
  const a = PALETTE[i];
  const b = PALETTE[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

export function WaterWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const { pathname } = useLocation();
  const excluded = EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  useEffect(() => {
    if (excluded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cur = new Float32Array(GW * GH);
    let prev = new Float32Array(GW * GH);
    const off = document.createElement('canvas');
    off.width = GW;
    off.height = GH;
    const ox = off.getContext('2d');
    if (!ox) return;
    const img = ox.createImageData(GW, GH);

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.floor(window.innerWidth * dpr));
      canvas.height = Math.max(1, Math.floor(window.innerHeight * dpr));
    };
    size();
    window.addEventListener('resize', size);

    const disturb = (cx: number, cy: number, str: number) => {
      const gx = Math.round((cx / window.innerWidth) * GW);
      const gy = Math.round((cy / window.innerHeight) * GH);
      for (let y = -3; y <= 3; y++) {
        for (let x = -3; x <= 3; x++) {
          const xx = gx + x;
          const yy = gy + y;
          if (xx < 1 || yy < 1 || xx >= GW - 1 || yy >= GH - 1) continue;
          const d = Math.sqrt(x * x + y * y);
          if (d <= 3) prev[yy * GW + xx] += str * (1 - d / 4);
        }
      }
    };

    const step = () => {
      for (let y = 1; y < GH - 1; y++) {
        const row = y * GW;
        for (let x = 1; x < GW - 1; x++) {
          const i = row + x;
          cur[i] = ((prev[i - 1] + prev[i + 1] + prev[i - GW] + prev[i + GW]) / 2 - cur[i]) * 0.985;
        }
      }
      const tmp = prev;
      prev = cur;
      cur = tmp;
    };

    const paint = (base: [number, number, number]) => {
      const data = img.data;
      for (let y = 0; y < GH; y++) {
        const row = y * GW;
        for (let x = 0; x < GW; x++) {
          const i = row + x;
          const dx = (x < GW - 1 ? prev[i + 1] : 0) - (x > 0 ? prev[i - 1] : 0);
          const dy = (y < GH - 1 ? prev[i + GW] : 0) - (y > 0 ? prev[i - GW] : 0);
          const spec = Math.max(0, dx + dy) * 5;
          const o = i * 4;
          data[o] = Math.max(0, Math.min(255, base[0] + dx * 2.2 + spec * 0.7));
          data[o + 1] = Math.max(0, Math.min(255, base[1] + dx * 3 + dy * 1.2 + spec * 0.9));
          data[o + 2] = Math.max(0, Math.min(255, base[2] + dx * 4 + dy * 2 + spec));
          data[o + 3] = 255;
        }
      }
      ox.putImageData(img, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
    };

    if (reduced) {
      /* Static fallback: pre-ripple the tank, settle it, paint one frame. */
      for (let k = 0; k < 7; k++) {
        disturb(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 16);
      }
      for (let k = 0; k < 42; k++) step();
      paint(paletteAt(0));
      window.removeEventListener('resize', size);
      return;
    }

    let raf = 0;
    let running = true;
    const start = performance.now();
    const frame = () => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      step();
      paint(paletteAt((performance.now() - start) / 1000));
    };
    raf = requestAnimationFrame(frame);

    const rain = window.setInterval(() => {
      if (running && Math.random() < 0.75) {
        disturb(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 13);
      }
    }, 850);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.clearInterval(rain);
      window.removeEventListener('resize', size);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [excluded, reduced]);

  if (excluded) return null;
  return <canvas ref={canvasRef} className="water-wallpaper" aria-hidden="true" />;
}
