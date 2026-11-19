import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';
import type { BookWallpaperTheme } from '../data/books';

/**
 * BookWallpaper — each book's OWN live wallpaper on its detail page.
 *
 * Canvas 2D only, zero new dependencies. One animated scene per book,
 * drawn from the story/genre in its subtitle:
 *
 *  cookies      warm bakery — drifting cookies + rising steam
 *  ember       fantasy — rising embers + animated map lines, compass, X
 *  foxglove    poison garden — foxglove bells swaying on their stems
 *  larkspur    night train + mist + stars
 *  marginalia  old paper — ink flecks + handwritten margin notes
 *  hidden      keys, doors and keyhole glows
 *  grow        play buttons + rising subscriber counts
 *  compounding words and social glyphs scrolling in lanes
 *
 * Pointer magnify: elements near the pointer (mouse or touch) scale up
 * and brighten, with a soft gold glow following the pointer. The glow
 * element is moved with transform only.
 *
 * prefers-reduced-motion: one static frame is drawn and the loop never
 * starts.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  seed: number;
  alpha: number;
  kind: number;
  text: string;
}

const TAU = Math.PI * 2;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makeParticle(
  theme: BookWallpaperTheme,
  w: number,
  h: number,
  anywhere: boolean,
): Particle {
  const p: Particle = {
    x: rand(0, w),
    y: anywhere ? rand(0, h) : h + rand(0, 80),
    vx: 0,
    vy: 0,
    size: rand(6, 22),
    rot: rand(0, TAU),
    vr: rand(-0.4, 0.4),
    seed: rand(0, TAU),
    alpha: rand(0.35, 0.9),
    kind: 0,
    text: '',
  };
  switch (theme) {
    case 'cookies':
      p.kind = Math.random() < 0.55 ? 0 : 1; // 0 cookie, 1 steam wisp
      p.vy = p.kind === 0 ? -rand(8, 22) : -rand(24, 48);
      p.vx = rand(-6, 6);
      p.size = p.kind === 0 ? rand(14, 30) : rand(18, 42);
      break;
    case 'ember':
      p.kind = Math.random() < 0.7 ? 0 : 1; // 0 spark, 1 ash fleck
      p.vy = p.kind === 0 ? -rand(30, 80) : -rand(10, 26);
      p.vx = rand(-14, 14);
      p.size = p.kind === 0 ? rand(1.5, 4.5) : rand(3, 8);
      break;
    case 'foxglove':
      p.kind = Math.random() < 0.6 ? 0 : 1; // 0 bell flower, 1 pollen
      p.vy = p.kind === 0 ? 0 : -rand(6, 16);
      p.vx = rand(-4, 4);
      p.size = p.kind === 0 ? rand(16, 30) : rand(1.5, 3.5);
      break;
    case 'larkspur':
      p.kind = Math.random() < 0.65 ? 0 : 1; // 0 star, 1 mist puff
      p.vy = p.kind === 1 ? rand(-4, 4) : 0;
      p.vx = p.kind === 1 ? rand(8, 22) : 0;
      p.size = p.kind === 0 ? rand(1, 2.6) : rand(60, 140);
      break;
    case 'marginalia':
      p.kind = Math.random() < 0.5 ? 0 : 1; // 0 ink fleck, 1 margin note
      p.vy = -rand(3, 9);
      p.vx = rand(-3, 3);
      p.size = p.kind === 0 ? rand(1.5, 4) : rand(15, 26);
      p.text = ['see p. 42', 'note!', 'cf. margin', '— J.', 'important', 'verify'][Math.floor(rand(0, 6))];
      break;
    case 'hidden':
      p.kind = Math.random() < 0.5 ? 0 : 1; // 0 key, 1 door
      p.vy = -rand(6, 16);
      p.vx = rand(-5, 5);
      p.size = rand(14, 30);
      break;
    case 'grow':
      p.kind = Math.random() < 0.5 ? 0 : 1; // 0 play button, 1 sub count
      p.vy = -rand(18, 44);
      p.vx = rand(-4, 4);
      p.size = p.kind === 0 ? rand(12, 26) : rand(13, 20);
      p.text = ['+1,000', '+250', '+10k', '+42', '+7,500'][Math.floor(rand(0, 5))];
      break;
    case 'compounding':
      p.kind = 0; // scrolling word
      p.vy = 0;
      p.vx = -rand(14, 42);
      p.size = rand(15, 30);
      p.text = ['share', 'post', 'like', 'follow', 'repost', 'momentum', 'comment', 'subscribe'][Math.floor(rand(0, 8))];
      break;
  }
  return p;
}

function particleCount(theme: BookWallpaperTheme, w: number, h: number): number {
  const area = (w * h) / 10000;
  switch (theme) {
    case 'larkspur':
      return Math.min(90, Math.round(area * 1.1));
    case 'compounding':
      return Math.min(26, Math.round(area * 0.35));
    case 'foxglove':
      return Math.min(26, Math.round(area * 0.4));
    default:
      return Math.min(48, Math.round(area * 0.7));
  }
}

/** Draw one particle. `focus` is 1 at the pointer, 0 far away. */
function drawParticle(
  ctx: CanvasRenderingContext2D,
  theme: BookWallpaperTheme,
  p: Particle,
  t: number,
  focus: number,
): void {
  const mag = 1 + focus * 0.9;
  const alpha = Math.min(1, p.alpha + focus * 0.5);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.scale(mag, mag);
  ctx.rotate(p.rot + (theme === 'foxglove' && p.kind === 0 ? Math.sin(t * 0.9 + p.seed) * 0.22 : 0));
  ctx.globalAlpha = alpha;

  switch (theme) {
    case 'cookies': {
      if (p.kind === 0) {
        // Cookie: warm disc with darker chips.
        ctx.fillStyle = '#b07a3e';
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, TAU);
        ctx.fill();
        ctx.fillStyle = '#5d3a17';
        for (let i = 0; i < 4; i += 1) {
          const a = p.seed + (i * TAU) / 4;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * p.size * 0.22, Math.sin(a) * p.size * 0.22, p.size * 0.09, 0, TAU);
          ctx.fill();
        }
      } else {
        // Steam wisp: soft rising curl.
        ctx.strokeStyle = 'rgba(244, 239, 226, 0.5)';
        ctx.lineWidth = p.size * 0.12;
        ctx.beginPath();
        ctx.moveTo(0, p.size / 2);
        ctx.bezierCurveTo(
          -p.size * 0.3, 0,
          p.size * 0.3, -p.size * 0.3,
          0, -p.size / 2,
        );
        ctx.stroke();
      }
      break;
    }
    case 'ember': {
      const glow = p.kind === 0 ? 'rgba(255, 140, 40, 0.9)' : 'rgba(180, 180, 190, 0.7)';
      ctx.fillStyle = glow;
      ctx.shadowColor = '#ff7a1a';
      ctx.shadowBlur = 8 + focus * 14;
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, TAU);
      ctx.fill();
      ctx.shadowBlur = 0;
      break;
    }
    case 'foxglove': {
      if (p.kind === 0) {
        // Bell flower on a stem.
        ctx.strokeStyle = 'rgba(120, 200, 130, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, p.size);
        ctx.lineTo(0, p.size * 0.2);
        ctx.stroke();
        ctx.fillStyle = Math.sin(p.seed) > 0 ? '#b678d6' : '#e08bb0';
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.34, -p.size * 0.2);
        ctx.quadraticCurveTo(0, -p.size * 0.9, p.size * 0.34, -p.size * 0.2);
        ctx.quadraticCurveTo(0, p.size * 0.28, -p.size * 0.34, -p.size * 0.2);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(246, 221, 138, 0.8)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'larkspur': {
      if (p.kind === 0) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + p.seed);
        ctx.globalAlpha = alpha * (0.4 + 0.6 * tw);
        ctx.fillStyle = '#f4efe2';
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(167, 173, 189, 0.10)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.28, 0, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'marginalia': {
      if (p.kind === 0) {
        ctx.fillStyle = 'rgba(40, 28, 18, 0.75)';
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, TAU);
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(74, 52, 90, 0.85)';
        ctx.font = `italic ${p.size}px Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, 0, 0);
      }
      break;
    }
    case 'hidden': {
      if (p.kind === 0) {
        // Old key: bow + stem + teeth.
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-p.size * 0.32, 0, p.size * 0.24, 0, TAU);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.08, 0);
        ctx.lineTo(p.size * 0.55, 0);
        ctx.moveTo(p.size * 0.38, 0);
        ctx.lineTo(p.size * 0.38, p.size * 0.22);
        ctx.moveTo(p.size * 0.55, 0);
        ctx.lineTo(p.size * 0.55, p.size * 0.22);
        ctx.stroke();
      } else {
        // Door: dark slab with a gold knob.
        ctx.fillStyle = 'rgba(16, 19, 25, 0.85)';
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-p.size * 0.4, -p.size * 0.6, p.size * 0.8, p.size * 1.2);
        ctx.strokeRect(-p.size * 0.4, -p.size * 0.6, p.size * 0.8, p.size * 1.2);
        ctx.fillStyle = '#f6dd8a';
        ctx.beginPath();
        ctx.arc(p.size * 0.22, 0, p.size * 0.07, 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'grow': {
      if (p.kind === 0) {
        ctx.fillStyle = 'rgba(224, 38, 60, 0.85)';
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.4, -p.size * 0.5);
        ctx.lineTo(p.size * 0.55, 0);
        ctx.lineTo(-p.size * 0.4, p.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(246, 221, 138, 0.9)';
        ctx.font = `700 ${p.size}px 'Source Sans 3', system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, 0, 0);
      }
      break;
    }
    case 'compounding': {
      ctx.fillStyle = 'rgba(244, 239, 226, 0.55)';
      ctx.font = `600 ${p.size}px 'Source Sans 3', system-ui, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(p.text, 0, 0);
      break;
    }
  }
  ctx.restore();
}

/** Ember-cartographer extras: animated map lines, compass rose, X mark. */
function drawEmberMap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(246, 221, 138, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -t * 24;
  ctx.beginPath();
  ctx.moveTo(w * 0.06, h * 0.78);
  ctx.bezierCurveTo(w * 0.3, h * 0.55, w * 0.45, h * 0.9, w * 0.68, h * 0.6);
  ctx.bezierCurveTo(w * 0.82, h * 0.42, w * 0.86, h * 0.3, w * 0.94, h * 0.22);
  ctx.stroke();
  ctx.setLineDash([]);
  // X marks the spot, pulsing.
  const pulse = 1 + 0.18 * Math.sin(t * 2.4);
  const x = w * 0.94;
  const y = h * 0.22;
  ctx.strokeStyle = 'rgba(255, 122, 26, 0.9)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 9 * pulse, y - 9 * pulse);
  ctx.lineTo(x + 9 * pulse, y + 9 * pulse);
  ctx.moveTo(x + 9 * pulse, y - 9 * pulse);
  ctx.lineTo(x - 9 * pulse, y + 9 * pulse);
  ctx.stroke();
  // Compass rose, top-left.
  const cx = w * 0.12;
  const cy = h * 0.2;
  const r = Math.min(w, h) * 0.055;
  ctx.strokeStyle = 'rgba(246, 221, 138, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 1.25);
  ctx.lineTo(cx + r * 0.22, cy);
  ctx.lineTo(cx, cy + r * 1.25);
  ctx.lineTo(cx - r * 0.22, cy);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(246, 221, 138, 0.8)';
  ctx.font = `700 ${Math.max(11, r * 0.42)}px 'Source Sans 3', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('N', cx, cy - r * 1.45);
  ctx.restore();
}

/** Larkspur extras: the night train crossing the scene. */
function drawTrain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
): void {
  const trainW = w * 0.55;
  const trainH = Math.max(34, h * 0.09);
  const span = w + trainW * 2;
  const x = w + trainW - ((t * 26) % span);
  const y = h * 0.62;
  ctx.save();
  ctx.fillStyle = 'rgba(5, 6, 10, 0.9)';
  ctx.fillRect(x - trainW, y, trainW, trainH);
  ctx.fillStyle = 'rgba(246, 221, 138, 0.85)';
  const cars = 5;
  for (let i = 0; i < cars; i += 1) {
    const wx = x - trainW + (i + 0.5) * (trainW / cars);
    ctx.fillRect(wx - trainW * 0.05, y + trainH * 0.22, trainW * 0.1, trainH * 0.4);
  }
  // Headlamp beam.
  const grad = ctx.createLinearGradient(x - trainW, y + trainH / 2, x - trainW - 90, y + trainH / 2);
  grad.addColorStop(0, 'rgba(246, 221, 138, 0.35)');
  grad.addColorStop(1, 'rgba(246, 221, 138, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x - trainW, y + trainH * 0.3);
  ctx.lineTo(x - trainW - 90, y - trainH * 0.2);
  ctx.lineTo(x - trainW - 90, y + trainH * 1.2);
  ctx.lineTo(x - trainW, y + trainH * 0.7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function BookWallpaper({
  theme,
  title,
}: {
  theme: BookWallpaperTheme;
  title: string;
}) {
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let start = performance.now();
    let last = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from(
        { length: particleCount(theme, w, h) },
        () => makeParticle(theme, w, h, true),
      );
    };

    const step = (p: Particle, dt: number) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (theme === 'compounding') {
        // Words scroll left in lanes and wrap around.
        if (p.x < -160) {
          p.x = w + rand(0, 120);
          p.y = rand(0, h);
        }
      } else if (p.y < -60 || p.x < -80 || p.x > w + 80) {
        const fresh = makeParticle(theme, w, h, false);
        if (theme === 'foxglove' || theme === 'larkspur') {
          fresh.y = rand(0, h);
          fresh.x = rand(0, w);
        }
        Object.assign(p, fresh);
      }
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      const ptr = pointerRef.current;
      if (theme === 'ember') drawEmberMap(ctx, w, h, t);
      if (theme === 'larkspur') drawTrain(ctx, w, h, t);
      for (const p of particles) {
        const dx = p.x - ptr.x;
        const dy = p.y - ptr.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const focus = ptr.active && dist < 170 ? 1 - dist / 170 : 0;
        drawParticle(ctx, theme, p, t, focus);
      }
    };

    const frame = (now: number) => {
      const dt = last === 0 ? 0 : Math.min(0.05, (now - last) / 1000);
      last = now;
      for (const p of particles) step(p, dt);
      draw(now);
      raf = requestAnimationFrame(frame);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        active: true,
      };
      const glow = glowRef.current;
      if (glow) {
        glow.style.transform = `translate(${pointerRef.current.x - 110}px, ${pointerRef.current.y - 110}px)`;
        glow.style.opacity = '1';
      }
    };
    const onPointerLeave = () => {
      pointerRef.current.active = false;
      const glow = glowRef.current;
      if (glow) glow.style.opacity = '0';
    };

    resize();
    start = performance.now();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    wrap.addEventListener('pointermove', onPointer);
    wrap.addEventListener('pointerdown', onPointer);
    wrap.addEventListener('pointerleave', onPointerLeave);

    if (reduced) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      wrap.removeEventListener('pointermove', onPointer);
      wrap.removeEventListener('pointerdown', onPointer);
      wrap.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [theme, reduced]);

  return (
    <div
      ref={wrapRef}
      className={`books-wallpaper books-wallpaper--${theme}`}
      role="img"
      aria-label={`Animated wallpaper for ${title}`}
    >
      <canvas ref={canvasRef} className="books-wallpaper__canvas" aria-hidden="true" />
      <div ref={glowRef} className="books-wallpaper__glow" aria-hidden="true" />
    </div>
  );
}
