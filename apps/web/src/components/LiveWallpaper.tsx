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
    const draw = (t: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const g = ctx.createRadialGradient(w * 0.5, h * 0.35, 20, w * 0.5, h * 0.5, Math.max(w, h) * 0.8);
      g.addColorStop(0, `${palette.gold}22`);
      g.addColorStop(0.45, `${palette.b}18`);
      g.addColorStop(1, '#050506');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = `${palette.gold}33`;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, 80 + Math.sin(t * 0.0006) * 10, 0, Math.PI * 2);
      ctx.stroke();
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
