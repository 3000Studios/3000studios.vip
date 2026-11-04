import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/* WaterWallpaper — the "3000 SPACE WATER" from 3000studios.space, running as
   the 3000studios.vip site wallpaper (Boss order, 2026-10-31; restored to the
   canonical shading 2026-11-03, Boss order — the first VIP port had flattened
   the paint into a base colour + weak slope offsets and drifted the palette
   through teal/violet/indigo, which is not the space water).

   The simulation and shading below are the canonical implementation from
   3000Studios/3000-space-water (src/space-water.js, itself verbatim from the
   .space splash): a 200x112 height field, classic 4-neighbour propagation
   with 0.985 damping, and the rich paint pass — height-mixed deep-blue
   palette (dark trough -> lit crest), light-facing diffuse, tight + broad
   specular, fresnel sky lift, caustic crest sparkle, motion glow, trough
   shadow. Fixed deep-blue identity: no colour cycle.

   Wallpaper adaptations only: rain drops keep it alive (same 850ms / 0.75 /
   strength-13 as the original's ambient drops), the pointer still ripples
   the water (window listeners — the canvas itself stays pointer-events:
   none and page interaction is untouched), it pauses when the tab is
   hidden, renders one static pre-rippled frame for prefers-reduced-motion,
   and never renders on owner/office routes. */

const EXCLUDED_PREFIXES = ['/office', '/admin', '/agent', '/vault', '/command-deck', '/go-live'];

const GW = 200;
const GH = 112;

/* Deterministic shimmer table for caustic sparkle (canonical). */
const NOISE = new Uint8Array(256);
for (let nI = 0; nI < 256; nI++) {
  const sv = Math.sin(nI * 127.1) * 43758.5453;
  NOISE[nI] = Math.floor((sv - Math.floor(sv)) * 256);
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

    let frameN = 0;
    /* Canonical paint — verbatim shading math from 3000-space-water
       (src/space-water.js, the RICH SHADING pass of the .space original). */
    const paint = () => {
      const data = img.data;
      const shim = (frameN >> 1) * 7;
      for (let y = 0; y < GH; y++) {
        const row = y * GW;
        for (let x = 0; x < GW; x++) {
          const i = row + x;
          const dx = (x < GW - 1 ? prev[i + 1] : 0) - (x > 0 ? prev[i - 1] : 0);
          const dy = (y < GH - 1 ? prev[i + GW] : 0) - (y > 0 ? prev[i - GW] : 0);
          const h = prev[i];
          const lap =
            (x > 0 ? prev[i - 1] : h) +
            (x < GW - 1 ? prev[i + 1] : h) +
            (y > 0 ? prev[i - GW] : h) +
            (y < GH - 1 ? prev[i + GW] : h) -
            4 * h;
          const o = i * 4;
          let t = 0.5 + h * 0.014;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          let r: number;
          let g: number;
          let b: number;
          if (t < 0.5) {
            const u = t * 2;
            r = 5 + 4 * u;
            g = 11 + 19 * u;
            b = 30 + 38 * u;
          } else {
            const u = (t - 0.5) * 2;
            r = 9 + 19 * u;
            g = 30 + 52 * u;
            b = 68 + 66 * u;
          }
          const dif = 1 + (dx * 0.85 + dy * 0.5) * 0.011;
          const dc = dif < 0.55 ? 0.55 : dif > 1.45 ? 1.45 : dif;
          r *= dc;
          g *= dc;
          b *= dc;
          const sa = dx * 0.83 + dy * 0.55;
          const su = sa > 0 ? (sa * 0.05 > 1 ? 1 : sa * 0.05) : 0;
          const su2 = su * su;
          const spec = su2 * su2 * 185 + su2 * 34;
          r += spec * 0.75;
          g += spec * 0.92;
          b += spec;
          const q = dx * dx + dy * dy;
          const fr = q * 0.0035 > 0.55 ? 0.55 : q * 0.0035;
          r += fr * 46;
          g += fr * 88;
          b += fr * 118; /* fresnel — grazing slopes catch the sky */
          const cr = -lap * 0.016;
          if (cr > 0) {
            const cf = cr > 1 ? 1 : cr;
            const nz = NOISE[(x * 31 + y * 57 + shim) & 255] / 255;
            const sp = cf * cf * (0.5 + 0.5 * nz) * 118;
            r += sp * 0.8;
            g += sp * 0.95;
            b += sp;
          } /* caustic sparkle riding the crests */
          const en = Math.min(1, q / 150); /* motion glow — wave energy lights the surface */
          if (en > 0.02) {
            const gl = en * en * 105;
            r += gl * 0.45;
            g += gl * 0.85;
            b += gl;
          }
          if (h < 0) {
            const sm = 1 + h * 0.006;
            const smc = sm < 0.62 ? 0.62 : sm;
            r *= smc;
            g *= smc;
            b *= smc;
          } /* troughs fall into shadow */
          data[o] = r < 0 ? 0 : r > 255 ? 255 : r;
          data[o + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
          data[o + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
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
      paint();
      window.removeEventListener('resize', size);
      return;
    }

    /* Pointer interaction — same strengths as the .space original (press 30,
       drag 11 along the path). Window-level + passive: the wallpaper never
       intercepts input, clicks and text selection behave exactly as before. */
    let lastX = -1;
    let lastY = -1;
    const onPointerDown = (e: PointerEvent) => {
      disturb(e.clientX, e.clientY, 30);
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (lastX < 0) return;
      const x = e.clientX;
      const y = e.clientY;
      const steps = Math.max(1, Math.round(Math.hypot(x - lastX, y - lastY) / 16));
      for (let s = 0; s <= steps; s++) {
        disturb(lastX + ((x - lastX) * s) / steps, lastY + ((y - lastY) * s) / steps, 11);
      }
      lastX = x;
      lastY = y;
    };
    const onPointerUp = () => {
      lastX = -1;
      lastY = -1;
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp);

    let raf = 0;
    let running = true;
    const frame = () => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      frameN++;
      step();
      paint();
    };
    raf = requestAnimationFrame(frame);

    const rain = window.setInterval(() => {
      if (running && Math.random() < 0.75) {
        disturb(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 13);
      }
    }, 850);

    /* Ambient swell (wallpaper adaptation, 2026-11-04, Boss order — the
       water must read as a living surface all the way up to the nav bar,
       not just where a pointer has touched it): every ~2.8s a soft
       wavefront rolls through — a line of gentle drops across the width
       at a random height, so the surface is always visibly moving. */
    const swell = window.setInterval(() => {
      if (!running) return;
      const y = Math.random() * window.innerHeight;
      const n = 7;
      for (let k = 0; k < n; k++) {
        disturb(((k + 0.5) / n) * window.innerWidth, y, 9);
      }
    }, 2800);

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
      window.clearInterval(swell);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [excluded, reduced]);

  if (excluded) return null;
  return <canvas ref={canvasRef} className="water-wallpaper" aria-hidden="true" />;
}
