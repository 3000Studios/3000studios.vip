import { useEffect, useRef } from 'react';
import { playSfx } from './sfx';

/**
 * Smashing-glass layer for the header bar. Wherever the pointer or a finger
 * moves across the header, the "glass" cracks from that point: radial and
 * ring cracks at full device resolution, a white impact flash and shards
 * that fall and spin away. A tap gives a bigger break and a glass sound.
 * Draws only while something is happening; idle costs nothing.
 */

type Crack = { pts: Array<[number, number]>; life: number; max: number; w: number };
type Shard = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; life: number; max: number; pts: Array<[number, number]> };
type Flash = { x: number; y: number; life: number; max: number; r: number };

function crackFrom(x: number, y: number, len: number, angle: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x, y]];
  let cx = x;
  let cy = y;
  let a = angle;
  const steps = 4 + Math.floor(Math.random() * 4);
  for (let i = 0; i < steps; i += 1) {
    a += (Math.random() - 0.5) * 0.7;
    const l = (len / steps) * (0.6 + Math.random() * 0.8);
    cx += Math.cos(a) * l;
    cy += Math.sin(a) * l;
    pts.push([cx, cy]);
  }
  return pts;
}

export function GlassShatter({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    if (!canvas || !host || reduced) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const cracks: Crack[] = [];
    const shards: Shard[] = [];
    const flashes: Flash[] = [];
    let raf = 0;
    let last = 0;
    let lastHit = 0;
    let lastPt: [number, number] | null = null;

    const impact = (x: number, y: number, power: number) => {
      const n = Math.round(5 + power * 7);
      const base = Math.random() * Math.PI * 2;
      for (let i = 0; i < n; i += 1) {
        const a = base + (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        cracks.push({ pts: crackFrom(x, y, (24 + Math.random() * 46) * (0.7 + power), a), life: 0, max: 900 + Math.random() * 500, w: 0.6 + Math.random() * 0.9 });
      }
      // A ring crack joining the spokes.
      const ring: Array<[number, number]> = [];
      const rr = 10 + power * 14;
      for (let i = 0; i <= 14; i += 1) {
        const a = (i / 14) * Math.PI * 2;
        const k = rr * (0.8 + Math.random() * 0.4);
        ring.push([x + Math.cos(a) * k, y + Math.sin(a) * k]);
      }
      cracks.push({ pts: ring, life: 0, max: 900, w: 0.7 });
      flashes.push({ x, y, life: 0, max: 220, r: 30 + power * 40 });
      const sCount = Math.round(3 + power * 9);
      for (let i = 0; i < sCount; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.06 + Math.random() * 0.22 * (0.6 + power);
        const s = 3 + Math.random() * 7 * (0.6 + power);
        const pts: Array<[number, number]> = [];
        const sides = 3 + Math.floor(Math.random() * 2);
        for (let k = 0; k < sides; k += 1) {
          const aa = (k / sides) * Math.PI * 2 + Math.random() * 0.6;
          pts.push([Math.cos(aa) * s * (0.6 + Math.random() * 0.6), Math.sin(aa) * s * (0.6 + Math.random() * 0.6)]);
        }
        shards.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 0.05, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.02, s, life: 0, max: 700 + Math.random() * 600, pts });
      }
      if (cracks.length > 220) cracks.splice(0, cracks.length - 220);
      if (shards.length > 160) shards.splice(0, shards.length - 160);
      start();
    };

    const frame = (now: number) => {
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = flashes.length - 1; i >= 0; i -= 1) {
        const f = flashes[i];
        f.life += dt;
        if (f.life > f.max) { flashes.splice(i, 1); continue; }
        const t = 1 - f.life / f.max;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, `rgba(255,255,255,${0.55 * t})`);
        g.addColorStop(0.4, `rgba(190,235,255,${0.25 * t})`);
        g.addColorStop(1, 'rgba(190,235,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      }
      for (let i = cracks.length - 1; i >= 0; i -= 1) {
        const c = cracks[i];
        c.life += dt;
        if (c.life > c.max) { cracks.splice(i, 1); continue; }
        const grow = Math.min(1, c.life / 90);
        const fade = 1 - Math.max(0, (c.life - c.max * 0.5) / (c.max * 0.5));
        const upto = Math.max(1, Math.ceil((c.pts.length - 1) * grow));
        ctx.beginPath();
        for (let k = 0; k <= upto; k += 1) {
          const [x, y] = c.pts[k];
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        // Dark edge then a bright refracted highlight, offset by half a pixel.
        ctx.strokeStyle = `rgba(10,14,22,${0.55 * fade})`;
        ctx.lineWidth = c.w + 1.2;
        ctx.stroke();
        ctx.save();
        ctx.translate(0.5, -0.5);
        ctx.strokeStyle = `rgba(235,248,255,${0.9 * fade})`;
        ctx.lineWidth = c.w;
        ctx.stroke();
        ctx.restore();
      }
      for (let i = shards.length - 1; i >= 0; i -= 1) {
        const s = shards[i];
        s.life += dt;
        if (s.life > s.max) { shards.splice(i, 1); continue; }
        s.vy += 0.0009 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.r += s.vr * dt;
        const t = 1 - s.life / s.max;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.r);
        ctx.beginPath();
        s.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.closePath();
        const g = ctx.createLinearGradient(-s.s, -s.s, s.s, s.s);
        g.addColorStop(0, `rgba(255,255,255,${0.75 * t})`);
        g.addColorStop(0.5, `rgba(170,220,255,${0.25 * t})`);
        g.addColorStop(1, `rgba(255,255,255,${0.6 * t})`);
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = `rgba(255,255,255,${0.8 * t})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
        ctx.restore();
      }
      if (cracks.length || shards.length || flashes.length) raf = requestAnimationFrame(frame);
      else {
        raf = 0;
        last = 0;
      }
    };
    function start() {
      if (!raf) raf = requestAnimationFrame(frame);
    }

    const local = (e: PointerEvent): [number, number] => {
      const r = host.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const p = local(e);
      const dist = lastPt ? Math.hypot(p[0] - lastPt[0], p[1] - lastPt[1]) : 999;
      if (now - lastHit < 70 || dist < 28) return;
      lastHit = now;
      lastPt = p;
      impact(p[0], p[1], 0.25 + Math.min(0.5, dist / 400));
    };
    const onDown = (e: PointerEvent) => {
      const p = local(e);
      lastPt = p;
      lastHit = performance.now();
      impact(p[0], p[1], 1);
      if (!(e.target as Element | null)?.closest('a, button')) playSfx('glass');
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerdown', onDown, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onDown);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="em-glass" aria-hidden="true" />;
}
