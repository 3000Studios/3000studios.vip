import { useEffect, useRef } from 'react';

export type WallpaperVariant =
  | 'aurora'
  | 'eq'
  | 'particles'
  | 'grid'
  | 'waves'
  | 'beams'
  | 'nebula'
  | 'static';

type Ctx = CanvasRenderingContext2D;

const TAU = Math.PI * 2;

function makeBlobs(
  n: number,
  colors: string[],
  w: number,
  h: number,
  speed: number,
  sizeMul: number,
) {
  return Array.from({ length: n }, (_, i) => ({
    color: colors[i % colors.length],
    bx: Math.random() * w,
    by: Math.random() * h,
    r: (Math.min(w, h) * (0.22 + Math.random() * 0.3)) * sizeMul,
    a: 0.5 + Math.random() * 0.9,
    b: 0.4 + Math.random() * 0.8,
    c: Math.random() * TAU,
    d: Math.random() * TAU,
    sp: speed * (0.6 + Math.random() * 0.8),
  }));
}

function drawAurora(ctx: Ctx, t: number, w: number, h: number, blobs: ReturnType<typeof makeBlobs>) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  for (const b of blobs) {
    const x = b.bx + Math.sin(t * b.sp * b.a + b.c) * w * 0.22;
    const y = b.by + Math.cos(t * b.sp * b.b + b.d) * h * 0.2;
    const g = ctx.createRadialGradient(x, y, 0, x, y, b.r);
    g.addColorStop(0, b.color + '2e');
    g.addColorStop(1, b.color + '00');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = 'source-over';
}

function drawEq(ctx: Ctx, t: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const bars = Math.max(28, Math.floor(w / 26));
  const bw = w / bars;
  // faint aurora wash behind
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, 'rgba(0,245,147,0.05)');
  wash.addColorStop(1, 'rgba(77,124,255,0.07)');
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < bars; i++) {
    const n =
      Math.sin(t * 1.7 + i * 0.55) * 0.5 +
      Math.sin(t * 3.1 + i * 1.3) * 0.3 +
      Math.sin(t * 0.6 + i * 0.21) * 0.2;
    const bh = h * 0.42 * (0.25 + 0.75 * Math.abs(n));
    const x = i * bw + bw * 0.22;
    const grad = ctx.createLinearGradient(0, h - bh, 0, h);
    const hot = i % 7 === 3;
    grad.addColorStop(0, hot ? 'rgba(77,124,255,0.75)' : 'rgba(0,245,147,0.6)');
    grad.addColorStop(1, 'rgba(0,245,147,0.04)');
    ctx.fillStyle = grad;
    const ww = bw * 0.56;
    const r = Math.min(ww / 2, 5);
    const y = h - bh;
    ctx.beginPath();
    ctx.roundRect(x, y, ww, bh, [r, r, 0, 0]);
    ctx.fill();
  }
}

function drawParticles(ctx: Ctx, t: number, w: number, h: number, ps: { x: number; y: number; r: number; s: number; o: number; c: string }[]) {
  ctx.clearRect(0, 0, w, h);
  for (const p of ps) {
    const y = (p.y - t * p.s * 22) % (h + 40);
    const yy = y < -20 ? y + h + 40 : y;
    const x = p.x + Math.sin(t * 0.5 + p.y * 0.05) * 14;
    ctx.globalAlpha = p.o * (0.6 + 0.4 * Math.sin(t * 2 + p.x));
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.arc(x, yy, p.r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGrid(ctx: Ctx, t: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const horizon = h * 0.42;
  ctx.strokeStyle = 'rgba(0,245,147,0.16)';
  ctx.lineWidth = 1;
  // vertical converging lines
  const cx = w / 2;
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * (w / 30), horizon);
    ctx.lineTo(cx + i * (w / 7), h);
    ctx.stroke();
  }
  // horizontal lines rushing toward viewer
  const rows = 12;
  for (let i = 0; i < rows; i++) {
    const p = ((i / rows + t * 0.14) % 1) ** 2.2;
    const y = horizon + p * (h - horizon);
    ctx.globalAlpha = 0.1 + p * 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // glow at horizon
  const g = ctx.createLinearGradient(0, horizon - 40, 0, horizon + 60);
  g.addColorStop(0, 'rgba(0,245,147,0)');
  g.addColorStop(0.5, 'rgba(0,245,147,0.12)');
  g.addColorStop(1, 'rgba(0,245,147,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon - 40, w, 100);
}

function drawWaves(ctx: Ctx, t: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  const lines = 7;
  for (let l = 0; l < lines; l++) {
    const baseY = h * (0.25 + (l / (lines - 1)) * 0.5);
    const amp = 26 + l * 7;
    const col = l % 2 === 0 ? '0,245,147' : '77,124,255';
    ctx.strokeStyle = `rgba(${col},${0.34 - l * 0.03})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y =
        baseY +
        Math.sin(x * 0.008 + t * (0.9 + l * 0.12) + l * 1.7) * amp +
        Math.sin(x * 0.02 - t * 0.6) * amp * 0.3;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawBeams(ctx: Ctx, t: number, w: number, h: number) {
  ctx.clearRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'lighter';
  const sources = [
    { x: w * 0.2, c: '0,245,147' },
    { x: w * 0.5, c: '77,124,255' },
    { x: w * 0.8, c: '0,245,147' },
  ];
  sources.forEach((s, i) => {
    const ang = Math.sin(t * 0.5 + i * 2.1) * 0.55;
    const len = h * 1.25;
    const dx = Math.sin(ang) * len;
    ctx.save();
    ctx.translate(s.x, -40);
    ctx.rotate(ang);
    const g = ctx.createLinearGradient(0, 0, 0, len);
    g.addColorStop(0, `rgba(${s.c},0.20)`);
    g.addColorStop(1, `rgba(${s.c},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-70, len);
    ctx.lineTo(70, len);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    void dx;
  });
  ctx.globalCompositeOperation = 'source-over';
}

/**
 * Full-viewport animated wallpaper. One cheap canvas, rAF loop, pauses when
 * the tab is hidden, static gradient when the user prefers reduced motion.
 */
export function Wallpaper({ variant = 'aurora' }: { variant?: WallpaperVariant }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (variant === 'static') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const blobs = makeBlobs(5, ['#00f593', '#4d7cff', '#00c2ff'], w, h, 0.16, 1);
    const nebulaBlobs = makeBlobs(6, ['#123a6d', '#0b3b2e', '#1b2a6b'], w, h, 0.07, 1.3);
    const parts = Array.from({ length: 70 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 2.2,
      s: 0.4 + Math.random() * 1.4,
      o: 0.25 + Math.random() * 0.6,
      c: Math.random() > 0.35 ? '#00f593' : '#8fb0ff',
    }));

    const onVis = () => {
      running = !document.hidden;
      if (running) loop(performance.now());
    };
    document.addEventListener('visibilitychange', onVis);

    const start = performance.now();
    const loop = (now: number) => {
      if (!running) return;
      const t = (now - start) / 1000;
      switch (variant) {
        case 'aurora':
          drawAurora(ctx, t, w, h, blobs);
          break;
        case 'nebula':
          drawAurora(ctx, t, w, h, nebulaBlobs);
          break;
        case 'eq':
          drawEq(ctx, t, w, h);
          break;
        case 'particles':
          drawParticles(ctx, t, w, h, parts);
          break;
        case 'grid':
          drawGrid(ctx, t, w, h);
          break;
        case 'waves':
          drawWaves(ctx, t, w, h);
          break;
        case 'beams':
          drawBeams(ctx, t, w, h);
          break;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [variant]);

  return (
    <>
      <div className="v2-wallpaper-base" aria-hidden="true" />
      {variant !== 'static' && (
        <canvas ref={ref} className="v2-wallpaper-canvas" aria-hidden="true" />
      )}
      <div className="v2-wallpaper-veil" aria-hidden="true" />
    </>
  );
}
