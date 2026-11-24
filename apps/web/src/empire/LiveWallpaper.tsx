import { useEffect, useRef } from 'react';

/**
 * Live wallpapers: a different animated scene for every main page (and
 * one for the menu), each with its own reaction to the mouse, a touch or a
 * dragged finger. Drawn on one canvas behind the page; pauses when the tab
 * is hidden; scales its particle counts to the screen so phones stay smooth.
 */

export type SceneId =
  | 'home' | 'aeropocalypse' | 'music' | 'video' | 'podcast' | 'books' | 'beats'
  | 'live' | 'shop' | 'blog' | 'contact' | 'apps' | 'page' | 'menu';

type Ptr = { x: number; y: number; vx: number; vy: number; on: boolean; down: boolean };
type Ctx = CanvasRenderingContext2D;
type Scene = { step: (c: Ctx, w: number, h: number, dt: number, t: number, p: Ptr, beat: number) => void; poke?: (x: number, y: number) => void };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const TAU = Math.PI * 2;

/* ---------- home: hyperspace warp that steers toward the pointer ---------- */
function warp(w: number, h: number, n: number): Scene {
  const stars = Array.from({ length: n }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1), hue: Math.random() < 0.2 ? 30 : 200 }));
  let cx = w / 2;
  let cy = h / 2;
  let boost = 0;
  return {
    poke: () => { boost = 1; },
    step(c, W, H, dt, _t, p, beat) {
      cx += ((p.on ? p.x : W / 2) - cx) * 0.04;
      cy += ((p.on ? p.y : H / 2) - cy) * 0.04;
      boost *= 0.96;
      const speed = (0.00018 + beat * 0.0012 + boost * 0.0016) * dt;
      c.fillStyle = 'rgba(4,3,10,0.28)';
      c.fillRect(0, 0, W, H);
      const s = Math.max(W, H) * 0.6;
      for (const st of stars) {
        const pz = st.z;
        st.z -= speed;
        if (st.z <= 0.02) { st.x = rnd(-1, 1); st.y = rnd(-1, 1); st.z = 1; continue; }
        const x1 = cx + (st.x / pz) * s * 0.5;
        const y1 = cy + (st.y / pz) * s * 0.5;
        const x2 = cx + (st.x / st.z) * s * 0.5;
        const y2 = cy + (st.y / st.z) * s * 0.5;
        if (x2 < -50 || x2 > W + 50 || y2 < -50 || y2 > H + 50) { st.z = 1; continue; }
        const a = Math.min(1, (1 - st.z) * 1.4);
        c.strokeStyle = st.hue === 30 ? `rgba(242,200,103,${a})` : `rgba(180,225,255,${a})`;
        c.lineWidth = (1 - st.z) * 2.6 + 0.3;
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.stroke();
      }
      void w; void h;
    },
  };
}

/* ---------- aeropocalypse: tracer fire and flak bursts at the crosshair ---------- */
function tracers(w: number, h: number, n: number): Scene {
  const shots = Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), v: rnd(0.3, 0.9), l: rnd(18, 60), red: Math.random() < 0.5 }));
  const bursts: Array<{ x: number; y: number; r: number; life: number }> = [];
  let ang = 0;
  return {
    poke: (x, y) => { for (let i = 0; i < 3; i += 1) bursts.push({ x: x + rnd(-30, 30), y: y + rnd(-30, 30), r: 0, life: 0 }); },
    step(c, W, H, dt, t, p) {
      c.fillStyle = 'rgba(8,3,4,0.3)';
      c.fillRect(0, 0, W, H);
      for (const s of shots) {
        s.y -= s.v * dt;
        if (s.y < -s.l) { s.y = H + s.l; s.x = rnd(0, W); }
        const g = c.createLinearGradient(s.x, s.y, s.x, s.y + s.l);
        g.addColorStop(0, s.red ? 'rgba(255,120,60,0.95)' : 'rgba(120,235,255,0.95)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        c.strokeStyle = g;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(s.x, s.y);
        c.lineTo(s.x, s.y + s.l);
        c.stroke();
      }
      if (p.on && Math.random() < 0.03 * (dt / 16)) bursts.push({ x: p.x + rnd(-80, 80), y: p.y + rnd(-80, 80), r: 0, life: 0 });
      for (let i = bursts.length - 1; i >= 0; i -= 1) {
        const b = bursts[i];
        b.life += dt;
        b.r = b.life * 0.12;
        const a = 1 - b.life / 520;
        if (a <= 0) { bursts.splice(i, 1); continue; }
        const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, `rgba(255,240,200,${a})`);
        g.addColorStop(0.35, `rgba(255,120,40,${a * 0.7})`);
        g.addColorStop(1, 'rgba(255,60,20,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(b.x, b.y, b.r, 0, TAU);
        c.fill();
      }
      if (p.on) {
        ang += dt * 0.002;
        c.save();
        c.translate(p.x, p.y);
        c.rotate(ang);
        c.strokeStyle = 'rgba(255,90,44,0.85)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(0, 0, 26 + Math.sin(t * 0.008) * 3, 0, TAU);
        c.stroke();
        for (let k = 0; k < 4; k += 1) {
          c.rotate(TAU / 4);
          c.beginPath();
          c.moveTo(14, 0);
          c.lineTo(40, 0);
          c.stroke();
        }
        c.restore();
      }
    },
  };
}

/* ---------- music / beats: radial equaliser that bends toward the pointer ---------- */
function equaliser(w: number, h: number, bars: number, hueA: number, hueB: number): Scene {
  const levels = new Float32Array(bars);
  let kick = 0;
  return {
    poke: () => { kick = 1; },
    step(c, W, H, _dt, t, p, beat) {
      c.fillStyle = 'rgba(5,3,12,0.25)';
      c.fillRect(0, 0, W, H);
      kick *= 0.94;
      const cx = p.on ? W / 2 + (p.x - W / 2) * 0.35 : W / 2;
      const cy = p.on ? H / 2 + (p.y - H / 2) * 0.35 : H / 2;
      const base = Math.min(W, H) * 0.2;
      const pa = Math.atan2(p.y - cy, p.x - cx);
      for (let i = 0; i < bars; i += 1) {
        const a = (i / bars) * TAU;
        const wave = 0.5 + 0.5 * Math.sin(t * 0.003 + i * 0.45) * Math.sin(t * 0.0017 + i * 0.13);
        let target = wave * (0.4 + beat * 2.2) + kick * 0.8;
        if (p.on) {
          const d = Math.abs(Math.atan2(Math.sin(a - pa), Math.cos(a - pa)));
          target += Math.max(0, 1 - d / 0.7) * 0.9;
        }
        levels[i] += (target - levels[i]) * 0.2;
        const len = base * (0.3 + levels[i] * 1.4);
        const hue = hueA + ((hueB - hueA) * i) / bars;
        c.strokeStyle = `hsla(${hue},95%,65%,0.85)`;
        c.lineWidth = Math.max(2, (TAU * base) / bars - 3);
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * base, cy + Math.sin(a) * base);
        c.lineTo(cx + Math.cos(a) * (base + len), cy + Math.sin(a) * (base + len));
        c.stroke();
      }
      c.strokeStyle = `rgba(255,255,255,${0.15 + beat})`;
      c.lineWidth = 2;
      c.beginPath();
      c.arc(cx, cy, base * (0.92 + beat * 0.3), 0, TAU);
      c.stroke();
      void w; void h;
    },
  };
}

/* ---------- video: projector beams that follow the pointer, film dust ---------- */
function projector(w: number, h: number, n: number): Scene {
  const dust = Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.02, 0.02), vy: rnd(-0.02, 0.02), s: rnd(0.5, 2) }));
  let lx = w * 0.8;
  let ly = h * 0.3;
  return {
    step(c, W, H, dt, t, p) {
      c.clearRect(0, 0, W, H);
      lx += ((p.on ? p.x : W * 0.5 + Math.sin(t * 0.0003) * W * 0.3) - lx) * 0.05;
      ly += ((p.on ? p.y : H * 0.35) - ly) * 0.05;
      const ox = W / 2;
      const oy = -40;
      for (let k = 0; k < 3; k += 1) {
        const spread = 120 + k * 90;
        const ang = Math.atan2(ly - oy, lx - ox);
        const len = Math.hypot(W, H);
        const nx = Math.cos(ang + Math.PI / 2) * spread;
        const ny = Math.sin(ang + Math.PI / 2) * spread;
        const ex = ox + Math.cos(ang) * len;
        const ey = oy + Math.sin(ang) * len;
        const g = c.createLinearGradient(ox, oy, ex, ey);
        g.addColorStop(0, `rgba(255,${200 - k * 60},${140 + k * 40},0.22)`);
        g.addColorStop(1, 'rgba(255,61,127,0)');
        c.fillStyle = g;
        c.beginPath();
        c.moveTo(ox, oy);
        c.lineTo(ex + nx, ey + ny);
        c.lineTo(ex - nx, ey - ny);
        c.closePath();
        c.fill();
      }
      c.fillStyle = 'rgba(255,240,220,0.8)';
      for (const d of dust) {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (p.on) {
          const dx = d.x - p.x;
          const dy = d.y - p.y;
          const r2 = dx * dx + dy * dy;
          if (r2 < 14000) { d.vx += (dx / Math.sqrt(r2 + 1)) * 0.004; d.vy += (dy / Math.sqrt(r2 + 1)) * 0.004; }
        }
        d.vx *= 0.99; d.vy *= 0.99;
        if (d.x < 0) d.x = W; if (d.x > W) d.x = 0; if (d.y < 0) d.y = H; if (d.y > H) d.y = 0;
        c.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 0.004 + d.s * 10));
        c.fillRect(d.x, d.y, d.s, d.s);
      }
      c.globalAlpha = 1;
      // Film flicker.
      if (Math.random() < 0.04) { c.fillStyle = 'rgba(255,255,255,0.03)'; c.fillRect(0, 0, W, H); }
    },
  };
}

/* ---------- podcast: stacked sound waves that ripple where you touch ---------- */
function soundwaves(): Scene {
  const ripples: Array<{ x: number; life: number }> = [];
  return {
    poke: (x) => ripples.push({ x, life: 0 }),
    step(c, W, H, dt, t, p, beat) {
      c.clearRect(0, 0, W, H);
      if (p.on && Math.random() < 0.08) ripples.push({ x: p.x, life: 0 });
      for (let i = ripples.length - 1; i >= 0; i -= 1) { ripples[i].life += dt; if (ripples[i].life > 2200) ripples.splice(i, 1); }
      const lines = 9;
      for (let k = 0; k < lines; k += 1) {
        const y0 = H * (0.2 + (k / lines) * 0.65);
        c.beginPath();
        for (let x = 0; x <= W; x += 8) {
          let y = y0 + Math.sin(x * 0.012 + t * 0.002 + k) * (10 + beat * 60) * Math.sin(t * 0.0007 + k * 0.6);
          for (const r of ripples) {
            const front = r.life * 0.45;
            const d = Math.abs(Math.abs(x - r.x) - front);
            if (d < 90) y += Math.cos((d / 90) * Math.PI) * 40 * (1 - r.life / 2200) * Math.sign(Math.sin(k));
          }
          if (p.on && Math.abs(p.y - y0) < 120) y += Math.exp(-((x - p.x) ** 2) / 9000) * (p.y - y0) * 0.6;
          if (x) c.lineTo(x, y); else c.moveTo(x, y);
        }
        const hue = 150 + k * 12;
        c.strokeStyle = `hsla(${hue},90%,62%,${0.25 + (k / lines) * 0.5})`;
        c.lineWidth = 1.6;
        c.stroke();
      }
    },
  };
}

/* ---------- books: drifting glowing letters that scatter from the pointer ---------- */
function letters(w: number, h: number, n: number): Scene {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ&?!';
  const ls = Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.01, 0.01), vy: rnd(-0.03, -0.008), ch: chars[Math.floor(Math.random() * chars.length)], s: rnd(12, 34), r: rnd(0, TAU), vr: rnd(-0.0006, 0.0006), gold: Math.random() < 0.6 }));
  return {
    poke: (x, y) => { for (const l of ls) { const dx = l.x - x; const dy = l.y - y; const d = Math.hypot(dx, dy) + 1; if (d < 260) { l.vx += (dx / d) * 0.5; l.vy += (dy / d) * 0.5; } } },
    step(c, W, H, dt, _t, p) {
      c.clearRect(0, 0, W, H);
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      for (const l of ls) {
        if (p.on) {
          const dx = l.x - p.x;
          const dy = l.y - p.y;
          const d = Math.hypot(dx, dy) + 1;
          if (d < 150) { l.vx += (dx / d) * 0.02; l.vy += (dy / d) * 0.02; l.vr += 0.0004; }
        }
        l.vx *= 0.985; l.vy = l.vy * 0.985 + -0.0003;
        l.x += l.vx * dt; l.y += l.vy * dt; l.r += l.vr * dt;
        if (l.y < -40) { l.y = H + 40; l.x = rnd(0, W); l.vy = rnd(-0.03, -0.008); }
        if (l.x < -40) l.x = W + 40; if (l.x > W + 40) l.x = -40; if (l.y > H + 60) l.y = -30;
        c.save();
        c.translate(l.x, l.y);
        c.rotate(l.r);
        c.font = `700 ${l.s}px 'Big Shoulders Display', Georgia, serif`;
        c.fillStyle = l.gold ? 'rgba(242,200,103,0.55)' : 'rgba(170,140,255,0.45)';
        c.shadowColor = l.gold ? '#f2c867' : '#9b6bff';
        c.shadowBlur = 12;
        c.fillText(l.ch, 0, 0);
        c.restore();
      }
    },
  };
}

/* ---------- live: broadcast radar with signal rings from every touch ---------- */
function radar(): Scene {
  const rings: Array<{ x: number; y: number; life: number }> = [];
  let sweep = 0;
  return {
    poke: (x, y) => rings.push({ x, y, life: 0 }),
    step(c, W, H, dt, _t, p, beat) {
      c.fillStyle = 'rgba(10,2,4,0.22)';
      c.fillRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H * 0.55;
      const R = Math.hypot(W, H) * 0.6;
      sweep += dt * 0.0012;
      c.strokeStyle = 'rgba(255,61,61,0.14)';
      c.lineWidth = 1;
      for (let r = 80; r < R; r += 110) { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); }
      const g = c.createConicGradient ? c.createConicGradient(sweep, cx, cy) : null;
      if (g) {
        g.addColorStop(0, 'rgba(255,61,61,0.32)');
        g.addColorStop(0.08, 'rgba(255,61,61,0)');
        g.addColorStop(1, 'rgba(255,61,61,0)');
        c.fillStyle = g;
        c.beginPath();
        c.arc(cx, cy, R, 0, TAU);
        c.fill();
      }
      if (p.on && Math.random() < 0.05) rings.push({ x: p.x, y: p.y, life: 0 });
      for (let i = rings.length - 1; i >= 0; i -= 1) {
        const r = rings[i];
        r.life += dt;
        const a = 1 - r.life / 1600;
        if (a <= 0) { rings.splice(i, 1); continue; }
        c.strokeStyle = `rgba(255,${90 + 100 * a},${90 * a},${a})`;
        c.lineWidth = 2;
        c.beginPath();
        c.arc(r.x, r.y, r.life * 0.18, 0, TAU);
        c.stroke();
      }
      c.fillStyle = `rgba(255,61,61,${0.6 + beat})`;
      c.beginPath();
      c.arc(cx, cy, 6 + Math.sin(performance.now() * 0.008) * 2, 0, TAU);
      c.fill();
    },
  };
}

/* ---------- shop: gold coins and gems drawn toward the pointer ---------- */
function treasure(w: number, h: number, n: number): Scene {
  const items = Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: 0, vy: rnd(0.01, 0.05), r: rnd(0, TAU), s: rnd(5, 13), gem: Math.random() < 0.3, spin: rnd(0.002, 0.006) }));
  return {
    poke: (x, y) => { for (const it of items) { const d = Math.hypot(it.x - x, it.y - y) + 1; if (d < 220) { it.vx += ((it.x - x) / d) * 0.6; it.vy += ((it.y - y) / d) * 0.6; } } },
    step(c, W, H, dt, t, p) {
      c.clearRect(0, 0, W, H);
      for (const it of items) {
        if (p.on) {
          const dx = p.x - it.x;
          const dy = p.y - it.y;
          const d = Math.hypot(dx, dy) + 1;
          if (d < 300) { it.vx += (dx / d) * 0.006; it.vy += (dy / d) * 0.006; }
        }
        it.vx *= 0.97; it.vy = it.vy * 0.97 + 0.0012;
        it.x += it.vx * dt; it.y += it.vy * dt; it.r += it.spin * dt;
        if (it.y > H + 20) { it.y = -20; it.x = rnd(0, W); it.vy = rnd(0.01, 0.05); }
        const squash = Math.abs(Math.cos(it.r));
        c.save();
        c.translate(it.x, it.y);
        if (it.gem) {
          c.rotate(it.r * 0.3);
          c.beginPath();
          c.moveTo(0, -it.s); c.lineTo(it.s * 0.8, 0); c.lineTo(0, it.s); c.lineTo(-it.s * 0.8, 0); c.closePath();
          c.fillStyle = 'rgba(61,242,168,0.55)';
          c.shadowColor = '#3df2a8';
          c.shadowBlur = 14;
          c.fill();
        } else {
          c.scale(squash * 0.9 + 0.1, 1);
          const g = c.createLinearGradient(-it.s, -it.s, it.s, it.s);
          g.addColorStop(0, '#8a6a24'); g.addColorStop(0.45, '#fff3c9'); g.addColorStop(1, '#c98a1a');
          c.fillStyle = g;
          c.shadowColor = '#f2c867';
          c.shadowBlur = 10;
          c.beginPath();
          c.arc(0, 0, it.s, 0, TAU);
          c.fill();
        }
        c.restore();
        if (Math.sin(t * 0.004 + it.x) > 0.995) { c.fillStyle = '#fff'; c.fillRect(it.x - 1, it.y - it.s - 4, 2, 2); }
      }
    },
  };
}

/* ---------- blog: rain of SEO words that parts around the pointer ---------- */
function wordRain(w: number, n: number): Scene {
  const words = ['MUSIC', 'GAME', 'BOOKS', 'LIVE', 'PODCAST', 'STUDIO', 'CREATE', 'STREAM', 'PLAY', 'READ', 'NEW', 'DAILY'];
  const cols = Array.from({ length: n }, (_, i) => ({ x: ((i + 0.5) / n) * w, y: rnd(-800, 0), v: rnd(0.04, 0.14), word: words[i % words.length], off: 0 }));
  return {
    step(c, W, H, dt, _t, p) {
      c.fillStyle = 'rgba(4,6,12,0.18)';
      c.fillRect(0, 0, W, H);
      c.font = "600 14px 'JetBrains Mono', monospace";
      c.textAlign = 'center';
      cols.forEach((col, i) => {
        col.x = ((i + 0.5) / cols.length) * W;
        col.y += col.v * dt;
        const letters = col.word.split('');
        if (col.y - letters.length * 18 > H) { col.y = rnd(-300, 0); col.word = words[Math.floor(Math.random() * words.length)]; }
        const push = p.on ? Math.max(0, 1 - Math.abs(col.x - p.x) / 140) * Math.sign(col.x - p.x || 1) * 60 : 0;
        col.off += (push - col.off) * 0.1;
        letters.forEach((ch, k) => {
          const y = col.y - k * 18;
          if (y < -20 || y > H + 20) return;
          const near = p.on ? Math.max(0, 1 - Math.hypot(col.x - p.x, y - p.y) / 200) : 0;
          c.fillStyle = k === 0 ? `rgba(220,250,255,${0.9})` : `rgba(62,232,255,${0.5 - k * 0.04 + near * 0.4})`;
          c.fillText(ch, col.x + col.off * near * 1.5, y);
        });
      });
    },
  };
}

/* ---------- contact / apps / other pages: constellation that wires up to the pointer ---------- */
function constellation(w: number, h: number, n: number, rgb: string): Scene {
  const pts = Array.from({ length: n }, () => ({ x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.03, 0.03), vy: rnd(-0.03, 0.03) }));
  return {
    poke: (x, y) => { for (const q of pts) { const d = Math.hypot(q.x - x, q.y - y) + 1; if (d < 240) { q.vx += ((q.x - x) / d) * 0.35; q.vy += ((q.y - y) / d) * 0.35; } } },
    step(c, W, H, dt, _t, p) {
      c.clearRect(0, 0, W, H);
      for (const q of pts) {
        q.x += q.vx * dt; q.y += q.vy * dt;
        q.vx = q.vx * 0.995 + rnd(-0.0006, 0.0006); q.vy = q.vy * 0.995 + rnd(-0.0006, 0.0006);
        if (q.x < 0 || q.x > W) q.vx *= -1;
        if (q.y < 0 || q.y > H) q.vy *= -1;
      }
      const max = 130;
      c.lineWidth = 1;
      for (let i = 0; i < pts.length; i += 1) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j += 1) {
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < max) { c.strokeStyle = `rgba(${rgb},${(1 - d / max) * 0.35})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); }
        }
        if (p.on) {
          const d = Math.hypot(a.x - p.x, a.y - p.y);
          if (d < 200) { c.strokeStyle = `rgba(255,255,255,${(1 - d / 200) * 0.7})`; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(p.x, p.y); c.stroke(); }
        }
        c.fillStyle = `rgba(${rgb},0.9)`;
        c.beginPath();
        c.arc(a.x, a.y, 1.8, 0, TAU);
        c.fill();
      }
    },
  };
}

/* ---------- menu: plasma vortex that swirls around the finger ---------- */
function vortex(w: number, h: number, n: number): Scene {
  const ps = Array.from({ length: n }, () => ({ a: rnd(0, TAU), r: rnd(20, Math.max(w, h) * 0.7), s: rnd(0.0002, 0.0009), hue: rnd(0, 360), z: rnd(0.4, 1.6) }));
  let cx = w / 2;
  let cy = h / 2;
  return {
    step(c, W, H, dt, _t, p, beat) {
      c.fillStyle = 'rgba(4,3,10,0.2)';
      c.fillRect(0, 0, W, H);
      cx += ((p.on ? p.x : W / 2) - cx) * 0.06;
      cy += ((p.on ? p.y : H / 2) - cy) * 0.06;
      for (const q of ps) {
        q.a += q.s * dt * (1 + 220 / (q.r + 40)) * (1 + beat * 3);
        q.r -= dt * 0.01 * q.z;
        if (q.r < 8) q.r = Math.max(W, H) * 0.7;
        q.hue = (q.hue + dt * 0.02) % 360;
        const x = cx + Math.cos(q.a) * q.r;
        const y = cy + Math.sin(q.a) * q.r * 0.7;
        c.fillStyle = `hsla(${q.hue},95%,65%,0.75)`;
        c.beginPath();
        c.arc(x, y, q.z * 1.6, 0, TAU);
        c.fill();
      }
    },
  };
}

function makeScene(id: SceneId, w: number, h: number): Scene {
  const area = (w * h) / (1440 * 900);
  const k = Math.max(0.35, Math.min(1.2, area));
  switch (id) {
    case 'home': return warp(w, h, Math.round(420 * k));
    case 'aeropocalypse': return tracers(w, h, Math.round(70 * k));
    case 'music': return equaliser(w, h, 72, 260, 190);
    case 'beats': return equaliser(w, h, 56, 185, 20);
    case 'video': return projector(w, h, Math.round(160 * k));
    case 'podcast': return soundwaves();
    case 'books': return letters(w, h, Math.round(60 * k));
    case 'live': return radar();
    case 'shop': return treasure(w, h, Math.round(60 * k));
    case 'blog': return wordRain(w, Math.max(10, Math.round(w / 46)));
    case 'contact': return constellation(w, h, Math.round(90 * k), '155,107,255');
    case 'apps': return constellation(w, h, Math.round(90 * k), '61,242,168');
    case 'menu': return vortex(w, h, Math.round(520 * k));
    default: return constellation(w, h, Math.round(80 * k), '242,200,103');
  }
}

export function LiveWallpaper({ scene, className = 'em-wall', target }: { scene: SceneId; className?: string; target?: 'window' | 'parent' }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    let s: Scene;
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      s = makeScene(scene, W, H);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const p: Ptr = { x: W / 2, y: H / 2, vx: 0, vy: 0, on: false, down: false };
    const evTarget: Window | HTMLElement = target === 'parent' && canvas.parentElement ? canvas.parentElement : window;
    const toLocal = (cx: number, cy: number) => {
      const r = canvas.getBoundingClientRect();
      return [cx - r.left, cy - r.top] as const;
    };
    const onMove = (e: Event) => {
      const ev = e as PointerEvent;
      const [x, y] = toLocal(ev.clientX, ev.clientY);
      p.vx = x - p.x; p.vy = y - p.y; p.x = x; p.y = y; p.on = true;
    };
    const onDown = (e: Event) => {
      onMove(e);
      p.down = true;
      s.poke?.(p.x, p.y);
    };
    const onUp = (e: Event) => {
      p.down = false;
      if ((e as PointerEvent).pointerType !== 'mouse') p.on = false;
    };
    const onLeave = () => { p.on = false; };
    evTarget.addEventListener('pointermove', onMove, { passive: true });
    evTarget.addEventListener('pointerdown', onDown, { passive: true });
    evTarget.addEventListener('pointerup', onUp, { passive: true });
    evTarget.addEventListener('pointercancel', onUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const root = document.documentElement;
    let raf = 0;
    let last = 0;
    let beatCache = 0;
    let beatAt = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      if (now - beatAt > 50) {
        beatAt = now;
        beatCache = root.classList.contains('em-music-on') ? parseFloat(getComputedStyle(root).getPropertyValue('--beat')) || 0 : 0;
      }
      s.step(ctx, W, H, dt, now, p, beatCache);
    };
    const start = () => { if (!raf && document.visibilityState === 'visible') { last = 0; raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.visibilityState === 'visible' ? start() : stop());
    document.addEventListener('visibilitychange', onVis);
    start();
    return () => {
      stop();
      ro.disconnect();
      evTarget.removeEventListener('pointermove', onMove);
      evTarget.removeEventListener('pointerdown', onDown);
      evTarget.removeEventListener('pointerup', onUp);
      evTarget.removeEventListener('pointercancel', onUp);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [scene, target]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
