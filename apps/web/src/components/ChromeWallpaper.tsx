import { useEffect, useRef } from 'react';

type Zone = 'header' | 'footer';

export function ChromeWallpaper({ zone }: { zone: Zone }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const motes = Array.from({ length: reduced ? 8 : 22 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: 0.25 + Math.random() * 0.75,
      s: 0.6 + Math.random() * 1.8,
      hue: Math.random() > 0.55 ? '#ffd700' : '#6ff4ff',
    }));

    let raf = 0;
    const draw = (t: number) => {
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const base = ctx.createLinearGradient(0, 0, w, h);
      if (zone === 'header') {
        base.addColorStop(0, 'rgba(8, 6, 2, 0.55)');
        base.addColorStop(0.45, 'rgba(18, 10, 4, 0.28)');
        base.addColorStop(1, 'rgba(4, 8, 14, 0.5)');
      } else {
        base.addColorStop(0, 'rgba(4, 8, 14, 0.42)');
        base.addColorStop(0.5, 'rgba(12, 8, 2, 0.32)');
        base.addColorStop(1, 'rgba(2, 4, 8, 0.62)');
      }
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);

      const vanishY = zone === 'header' ? h * 1.35 : -h * 0.35;
      const horizon = zone === 'header' ? h * 0.15 : h * 0.82;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.14)';
      ctx.lineWidth = 1;
      const cols = 14;
      for (let i = 0; i <= cols; i++) {
        const x = (w * i) / cols;
        ctx.beginPath();
        ctx.moveTo(x, zone === 'header' ? 0 : h);
        ctx.lineTo(w / 2 + (x - w / 2) * 0.18, vanishY);
        ctx.stroke();
      }
      for (let r = 1; r <= 6; r++) {
        const y = zone === 'header'
          ? (horizon * r) / 6
          : h - ((h - horizon) * r) / 6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();

      const pulse = 0.5 + Math.sin(t * 0.0011) * 0.5;
      ctx.save();
      ctx.translate(w * 0.5, zone === 'header' ? h * 0.62 : h * 0.38);
      ctx.rotate(t * 0.00018);
      ctx.scale(1, 0.38);
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.22 + pulse * 0.18})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(w, 720) * 0.38, Math.min(w, 720) * 0.38, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(111, 244, 255, ${0.12 + pulse * 0.12})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, Math.min(w, 720) * 0.26, Math.min(w, 720) * 0.26, Math.PI / 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      for (const mote of motes) {
        const drift = reduced ? 0 : t * 0.00004 * mote.s;
        const x = ((mote.x + drift) % 1) * w;
        const y = ((mote.y + Math.sin(t * 0.0005 + mote.z * 6) * 0.04) % 1) * h;
        const depth = 0.35 + mote.z;
        const r = mote.s * depth;
        ctx.fillStyle = mote.hue === '#ffd700'
          ? `rgba(255, 215, 0, ${0.18 + mote.z * 0.28})`
          : `rgba(111, 244, 255, ${0.12 + mote.z * 0.22})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [zone]);

  return (
    <div className={`chromeWall chromeWall--${zone}`} aria-hidden="true">
      <canvas ref={canvasRef} className="chromeWallCanvas" />
      <div className="chromeWallDepth" />
    </div>
  );
}
