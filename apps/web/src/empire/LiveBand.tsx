import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';
import { tilt } from './tilt';

type Variant = 'header' | 'footer';

function readAccents(): [string, string] {
  const cs = getComputedStyle(document.documentElement);
  const a = cs.getPropertyValue('--em-accent').trim() || '#f2c867';
  const b = cs.getPropertyValue('--em-accent-2').trim() || '#3ee8ff';
  return [a, b];
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace('#', '');
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m.padEnd(6, '0');
  const n = parseInt(full.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Global live wallpaper for the header ("liquid light") and the footer
 * ("aurora embers"). Both react to phone tilt like liquid: the light slides
 * toward the low side. Rendered at half resolution (it is all soft light,
 * so it looks identical) with DPR capped, paused when offscreen or the tab
 * is hidden, and a single static frame under reduced motion.
 */
export function LiveBand({ variant }: { variant: Variant }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.5;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width * scale));
      h = Math.max(1, Math.round(r.height * scale));
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    let [ca, cb] = readAccents().map(hexToRgb) as [[number, number, number], [number, number, number]];
    const onRoute = () => {
      window.setTimeout(() => {
        [ca, cb] = readAccents().map(hexToRgb) as [[number, number, number], [number, number, number]];
      }, 30);
    };
    window.addEventListener('em-route', onRoute);

    /* Header: liquid light blobs on springs. */
    const blobs = Array.from({ length: 6 }, (_, i) => ({
      base: (i + 0.5) / 6,
      x: (i + 0.5) / 6,
      vx: 0,
      phase: i * 1.7,
      r: 0.5 + (i % 3) * 0.22,
      c: i % 2,
    }));
    /* Footer: embers that drift with gravity (tilt). */
    const embers = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      v: 0.0006 + Math.random() * 0.0016,
      s: 0.6 + Math.random() * 1.8,
      a: 0.3 + Math.random() * 0.6,
    }));

    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    const drawHeader = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (const b of blobs) {
        // Spring toward the tilted rest position: light pools on the low side.
        const target = b.base + tilt.x * 0.32 + Math.sin(t * 0.00035 + b.phase) * 0.07;
        b.vx += (target - b.x) * 0.02;
        b.vx *= 0.9;
        b.x += b.vx;
        const cx = b.x * w;
        const cy = h * (0.5 + Math.sin(t * 0.0006 + b.phase) * 0.35 + tilt.y * 0.15);
        const rad = h * (1.1 + b.r) * (1 + Math.sin(t * 0.0009 + b.phase) * 0.12);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const col = b.c ? cb : ca;
        g.addColorStop(0, rgba(col, 0.34));
        g.addColorStop(0.45, rgba(col, 0.12));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fillRect(cx - rad, 0, rad * 2, h);
      }
      // Sweeping highlight line.
      const sx = ((t * 0.00012) % 1.4 - 0.2) * w;
      const lg = ctx.createLinearGradient(sx - w * 0.08, 0, sx + w * 0.08, 0);
      lg.addColorStop(0, 'rgba(255,255,255,0)');
      lg.addColorStop(0.5, 'rgba(255,255,255,0.09)');
      lg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    };

    const drawFooter = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      // Aurora ribbons that lean with the tilt.
      for (let k = 0; k < 3; k++) {
        const col = k === 1 ? cb : ca;
        ctx.beginPath();
        const base = h * (0.28 + k * 0.17);
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += Math.max(4, w / 60)) {
          const u = x / w;
          const y =
            base +
            Math.sin(u * 5 + t * 0.0005 * (k + 1) + k) * h * 0.08 +
            Math.sin(u * 13 - t * 0.0008) * h * 0.025 +
            (u - 0.5) * tilt.x * h * 0.3;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, base - h * 0.12, 0, h);
        g.addColorStop(0, rgba(col, 0.16));
        g.addColorStop(0.35, rgba(col, 0.05));
        g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g;
        ctx.fill();
      }
      // Embers rise; tilt is gravity, so they drift toward the raised side.
      for (const p of embers) {
        p.y -= p.v * (1 - tilt.y * 0.6);
        p.x += tilt.x * 0.0012 + Math.sin(t * 0.001 + p.s * 4) * 0.0004;
        if (p.y < -0.02) {
          p.y = 1.02;
          p.x = Math.random();
        }
        if (p.x < -0.02) p.x = 1.02;
        if (p.x > 1.02) p.x = -0.02;
        const px = p.x * w;
        const py = p.y * h;
        const rad = p.s * scale * 2.2;
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad * 3);
        g.addColorStop(0, rgba(ca, p.a));
        g.addColorStop(1, rgba(ca, 0));
        ctx.fillStyle = g;
        ctx.fillRect(px - rad * 3, py - rad * 3, rad * 6, rad * 6);
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    const draw = variant === 'header' ? drawHeader : drawFooter;
    if (reduced) {
      draw(4000);
      return () => {
        ro?.disconnect();
        window.removeEventListener('em-route', onRoute);
      };
    }

    let raf = 0;
    let visible = true;
    let last = 0;
    const loop = (t: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      // ~40fps is plenty for soft light and halves the paint cost.
      if (t - last >= 24) {
        last = t;
        draw(t);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const io =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            start();
          })
        : null;
    io?.observe(canvas);
    document.addEventListener('visibilitychange', start);
    start();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener('visibilitychange', start);
      window.removeEventListener('em-route', onRoute);
    };
  }, [variant, reduced]);

  return <canvas ref={ref} className={`em-band em-band--${variant}`} aria-hidden="true" />;
}
