import { useEffect, useRef } from 'react';
import type { SongPalette } from '../data/music';

export type WallpaperVariant = string;

type Props = {
  variant?: WallpaperVariant;
  palette?: SongPalette;
  coverUrl?: string;
  intensity?: number;
};

const DEFAULT_PALETTE: SongPalette = { a: '#1ef078', b: '#236dff', c: '#ff4d6d', gold: '#ffd700' };

export function LiveWallpaper({ variant = 'spiral', palette = DEFAULT_PALETTE }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const calm =
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.innerWidth < 900;
    if (calm) {
      canvas.width = 1;
      canvas.height = 1;
      return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    let raf = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const motes = Array.from({ length: 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.3 + Math.random() * 0.7,
      s: 0.4 + Math.random() * 1.4,
    }));
    const draw = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mx = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--mx') || '0.5') || 0.5;
      const my = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--my') || '0.35') || 0.35;
      ctx.fillStyle = 'rgba(4, 3, 8, 0.22)';
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * mx, h * my, 12, w * 0.5, h * 0.5, Math.max(w, h) * 0.85);
      g.addColorStop(0, `${palette.gold}33`);
      g.addColorStop(0.35, `${palette.b}1c`);
      g.addColorStop(1, '#050506');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `${palette.gold}40`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, 90 + Math.sin(t * 0.0007) * 16, 0, Math.PI * 2);
      ctx.stroke();
      for (const mote of motes) {
        const x = ((mote.x + t * 0.00002 * mote.s) % 1) * w;
        const y = ((mote.y + Math.sin(t * 0.0004 + mote.z) * 0.02) % 1) * h;
        ctx.fillStyle = `${palette.gold}${Math.floor(40 + mote.z * 80).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(x, y, mote.s, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [variant, palette]);

  return (
    <div className={`liveWallpaper liveWallpaper-${variant}`} aria-hidden="true">
      <canvas ref={canvasRef} className="liveWallpaperCanvas" />
      <div className="liveWallpaperVignette" />
    </div>
  );
}
