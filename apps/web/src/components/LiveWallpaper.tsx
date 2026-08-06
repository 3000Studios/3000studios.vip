import { useEffect, useRef } from 'react';
import type { SongPalette } from '../data/music';

export type WallpaperVariant =
  | 'spiral'
  | 'vortex'
  | 'electric'
  | 'blackhole'
  | 'pulse'
  | 'goldwave'
  | 'nebula'
  | 'chrome'
  | 'aurora'
  | 'inferno'
  | 'glitch'
  | 'ocean'
  | 'global'
  | string;

type Props = {
  variant?: WallpaperVariant;
  palette?: SongPalette;
  coverUrl?: string;
  intensity?: number;
};

const DEFAULT_PALETTE: SongPalette = {
  a: '#1ef078',
  b: '#236dff',
  c: '#ff4d6d',
  gold: '#ffd700',
};

/**
 * Canvas wallpaper: unique motion per page variant, reacts to mouse + touch,
 * and recolors with the active song palette / beat CSS var.
 */
export function LiveWallpaper({
  variant = 'spiral',
  palette = DEFAULT_PALETTE,
  coverUrl,
  intensity = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: false });
  const coverRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!coverUrl) {
      coverRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = coverUrl;
    img.onload = () => {
      coverRef.current = img;
    };
    img.onerror = () => {
      coverRef.current = null;
    };
  }, [coverUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
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

    const onMove = (clientX: number, clientY: number) => {
      pointer.current.tx = clientX / Math.max(w, 1);
      pointer.current.ty = clientY / Math.max(h, 1);
      pointer.current.active = true;
    };

    const onPointer = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    const particles = Array.from({ length: 48 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      r: 1.2 + (i % 5) * 0.7,
      sp: 0.15 + (i % 7) * 0.04,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = (t: number) => {
      const p = pointer.current;
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;

      const beatRaw = getComputedStyle(document.documentElement).getPropertyValue('--beat').trim();
      const beat = Number.parseFloat(beatRaw || '0') || 0;
      const time = reduced ? 0 : t * 0.001;
      const energy = (0.35 + beat * 0.9) * intensity;

      ctx.clearRect(0, 0, w, h);

      // base wash
      const g = ctx.createRadialGradient(
        w * p.x,
        h * p.y,
        20,
        w * 0.5,
        h * 0.45,
        Math.max(w, h) * 0.85,
      );
      g.addColorStop(0, withAlpha(palette.gold, 0.12 + beat * 0.12));
      g.addColorStop(0.35, withAlpha(palette.a, 0.16 + beat * 0.1));
      g.addColorStop(0.7, withAlpha(palette.b, 0.1));
      g.addColorStop(1, 'rgba(2,4,5,0.92)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // soft album art bloom behind UI
      const cover = coverRef.current;
      if (cover && cover.complete) {
        const size = Math.max(w, h) * (0.55 + beat * 0.08);
        const cx = w * (0.5 + (p.x - 0.5) * 0.12);
        const cy = h * (0.42 + (p.y - 0.5) * 0.1);
        ctx.save();
        ctx.globalAlpha = 0.14 + beat * 0.1;
        ctx.filter = 'blur(28px) saturate(1.35)';
        ctx.drawImage(cover, cx - size / 2, cy - size / 2, size, size);
        ctx.restore();
      }

      // variant-specific fields
      ctx.save();
      if (variant === 'spiral' || variant === 'vortex') {
        drawSpiral(ctx, w, h, p.x, p.y, time, energy, palette, variant === 'vortex');
      } else if (variant === 'electric' || variant === 'glitch') {
        drawElectric(ctx, w, h, p.x, p.y, time, energy, palette, variant === 'glitch');
      } else if (variant === 'blackhole' || variant === 'nebula') {
        drawNebula(ctx, w, h, p.x, p.y, time, energy, palette);
      } else if (variant === 'pulse' || variant === 'goldwave') {
        drawRings(ctx, w, h, p.x, p.y, time, energy, palette, variant === 'goldwave');
      } else if (variant === 'chrome' || variant === 'aurora') {
        drawAurora(ctx, w, h, p.x, p.y, time, energy, palette);
      } else if (variant === 'inferno') {
        drawInferno(ctx, w, h, p.x, p.y, time, energy, palette);
      } else if (variant === 'ocean') {
        drawOcean(ctx, w, h, p.x, p.y, time, energy, palette);
      } else {
        drawSpiral(ctx, w, h, p.x, p.y, time, energy, palette, false);
      }
      ctx.restore();

      // floating particles pulled toward pointer
      for (const pt of particles) {
        const ang = time * pt.sp + pt.phase;
        const px = (pt.x + Math.sin(ang) * 0.04 + (p.x - 0.5) * 0.06) * w;
        const py = (pt.y + Math.cos(ang * 0.9) * 0.05 + (p.y - 0.5) * 0.05) * h;
        ctx.beginPath();
        ctx.fillStyle = withAlpha(palette.gold, 0.25 + beat * 0.35);
        ctx.arc(px, py, pt.r * (1 + beat), 0, Math.PI * 2);
        ctx.fill();
      }

      // cursor spotlight
      const spot = ctx.createRadialGradient(w * p.x, h * p.y, 0, w * p.x, h * p.y, 180 + beat * 80);
      spot.addColorStop(0, withAlpha(palette.gold, 0.18 + beat * 0.12));
      spot.addColorStop(0.45, withAlpha(palette.a, 0.08));
      spot.addColorStop(1, 'transparent');
      ctx.fillStyle = spot;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [variant, palette.a, palette.b, palette.c, palette.gold, intensity]);

  return (
    <div className={`liveWallpaper liveWallpaper-${variant}`} aria-hidden="true">
      <canvas ref={canvasRef} className="liveWallpaperCanvas" />
      <div className="liveWallpaperVignette" />
      <div className="liveWallpaperScan" />
    </div>
  );
}

function withAlpha(color: string, alpha: number) {
  if (color.startsWith('hsl')) {
    return color.replace('hsl(', 'hsla(').replace(')', ` / ${alpha})`);
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex;
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
}

function drawSpiral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
  reverse: boolean,
) {
  const cx = w * (0.5 + (px - 0.5) * 0.2);
  const cy = h * (0.48 + (py - 0.5) * 0.2);
  const dir = reverse ? -1 : 1;
  ctx.lineWidth = 1.5;
  for (let arm = 0; arm < 4; arm++) {
    ctx.beginPath();
    for (let i = 0; i < 160; i++) {
      const a = dir * (i * 0.12 + time * (0.6 + arm * 0.08) + arm);
      const r = i * (1.8 + energy) + arm * 12;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.72;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = withAlpha(arm % 2 ? palette.a : palette.b, 0.18 + energy * 0.08);
    ctx.stroke();
  }
}

function drawElectric(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
  glitch: boolean,
) {
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    const y = ((i / 10 + time * 0.05) % 1) * h;
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 24) {
      const n = Math.sin(x * 0.02 + time * 3 + i) * (12 + energy * 20);
      const jx = glitch ? Math.sin(time * 40 + i) * 8 : 0;
      ctx.lineTo(x + jx, y + n * (py + 0.3));
    }
    ctx.strokeStyle = withAlpha(i % 2 ? palette.a : palette.gold, 0.12 + energy * 0.1);
    ctx.lineWidth = 1 + energy;
    ctx.stroke();
  }
  ctx.fillStyle = withAlpha(palette.b, 0.08 + energy * 0.05);
  ctx.fillRect(w * px - 40, 0, 80, h);
}

function drawNebula(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
) {
  for (let i = 0; i < 6; i++) {
    const x = w * (0.2 + ((i * 0.17 + Math.sin(time + i) * 0.05 + (px - 0.5) * 0.1) % 0.7));
    const y = h * (0.2 + ((i * 0.13 + Math.cos(time * 0.8 + i) * 0.06 + (py - 0.5) * 0.1) % 0.65));
    const r = 80 + i * 30 + energy * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, withAlpha(i % 2 ? palette.a : palette.c, 0.28));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawRings(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
  gold: boolean,
) {
  const cx = w * px;
  const cy = h * py;
  for (let i = 1; i <= 8; i++) {
    const r = i * (28 + energy * 18) + Math.sin(time * 2 + i) * 8;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(gold ? palette.gold : palette.a, 0.1 + (8 - i) * 0.02);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawAurora(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
) {
  for (let band = 0; band < 5; band++) {
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y =
        h * (0.25 + band * 0.1 + py * 0.1) +
        Math.sin(x * 0.008 + time * 1.2 + band) * (30 + energy * 40) +
        Math.cos(x * 0.02 - time + band) * 16;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = withAlpha(band % 2 ? palette.a : palette.b, 0.06 + energy * 0.04);
    ctx.fill();
  }
  void px;
}

function drawInferno(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
) {
  for (let i = 0; i < 14; i++) {
    const x = ((i / 14 + Math.sin(time + i) * 0.03 + (px - 0.5) * 0.05) % 1) * w;
    const rise = ((time * 0.15 + i * 0.07) % 1) * h;
    const y = h - rise;
    const r = 20 + (i % 5) * 10 + energy * 20;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, withAlpha(palette.gold, 0.35));
    g.addColorStop(0.4, withAlpha(palette.c || '#ff4d4d', 0.2));
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y + py * 20, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawOcean(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  px: number,
  py: number,
  time: number,
  energy: number,
  palette: SongPalette,
) {
  for (let row = 0; row < 7; row++) {
    ctx.beginPath();
    const baseY = h * (0.35 + row * 0.08);
    for (let x = 0; x <= w; x += 10) {
      const y =
        baseY +
        Math.sin(x * 0.012 + time * 1.4 + row + px * 2) * (10 + energy * 18) +
        Math.sin(x * 0.03 - time * 0.8) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = withAlpha(palette.b, 0.14 + energy * 0.06);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  void py;
}
