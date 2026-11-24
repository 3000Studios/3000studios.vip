import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/**
 * The footer rises out of the sea. While you scroll toward the bottom of a
 * page the water line follows you down the footer: everything above it is
 * dry, lit and clickable; everything below it is still underwater (dim,
 * blurred and not clickable). At the very bottom the sea drains to a pool
 * along the bottom edge. The water is a spring-simulated surface with
 * gradient depth, caustics, light shafts, foam and a specular rim; moving a
 * mouse or finger anywhere in the footer makes bubbles (they rise in the
 * water and float as iridescent bubbles in the air) and stirs the surface.
 */

const BLOCKS = '.em-footer-big, .em-kicker, .em-contact, .em-socials, .em-cols > div, .em-legal';
const POOL = 96;

type Bubble = { x: number; y: number; r: number; vx: number; vy: number; wob: number; life: number; air: boolean; pop: number };

export function FooterSea() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    const footer = canvas?.closest('footer') as HTMLElement | null;
    if (!canvas || !footer) return;
    const blocks = Array.from(footer.querySelectorAll<HTMLElement>(BLOCKS));
    if (reduced) {
      footer.classList.remove('em-sea-on');
      blocks.forEach((b) => b.classList.add('is-dry'));
      return;
    }
    footer.classList.add('em-sea-on');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = 0;
    let H = 0;
    const COLS_GAP = 6;
    let n = 0;
    let hgt = new Float32Array(0);
    let vel = new Float32Array(0);
    const resize = () => {
      W = footer.clientWidth;
      H = footer.clientHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      n = Math.ceil(W / COLS_GAP) + 2;
      hgt = new Float32Array(n);
      vel = new Float32Array(n);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(footer);

    let surface = 0; // footer-local y of the calm water line
    let target = 0;
    let forced = false;
    const bubbles: Bubble[] = [];
    let lastScroll = window.scrollY;

    const splash = (x: number, power: number) => {
      const i = Math.max(1, Math.min(n - 2, Math.round(x / COLS_GAP)));
      for (let k = -3; k <= 3; k += 1) {
        const j = i + k;
        if (j > 0 && j < n - 1) vel[j] += power * (1 - Math.abs(k) / 4);
      }
    };
    const spawn = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i += 1) {
        const air = y < surface + hgt[Math.max(0, Math.min(n - 1, Math.round(x / COLS_GAP)))];
        bubbles.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          r: air ? 5 + Math.random() * 16 : 2 + Math.random() * 7,
          vx: (Math.random() - 0.5) * 0.04,
          vy: air ? -(0.02 + Math.random() * 0.05) : -(0.06 + Math.random() * 0.1),
          wob: Math.random() * 6,
          life: 0,
          air,
          pop: 0,
        });
      }
      if (bubbles.length > 240) bubbles.splice(0, bubbles.length - 240);
    };

    const measureTarget = () => {
      const rect = footer.getBoundingClientRect();
      const vh = window.innerHeight;
      const remaining = document.documentElement.scrollHeight - (window.scrollY + vh);
      const max = Math.max(0, H - POOL);
      target = forced || remaining <= 4 ? max : Math.max(0, Math.min(max, vh * 0.62 - rect.top));
    };

    const updateBlocks = () => {
      const top = footer.getBoundingClientRect().top;
      for (const b of blocks) {
        const r = b.getBoundingClientRect();
        const by = r.top - top + Math.min(r.height, 60);
        const dry = forced || by <= surface + 4;
        if (dry !== b.classList.contains('is-dry')) b.classList.toggle('is-dry', dry);
      }
    };

    let visible = false;
    let raf = 0;
    let last = 0;
    let t = 0;
    const frame = (now: number) => {
      raf = visible && document.visibilityState === 'visible' ? requestAnimationFrame(frame) : 0;
      const dt = last ? Math.min(40, now - last) : 16;
      last = now;
      t += dt;
      measureTarget();
      const prevSurface = surface;
      surface += (target - surface) * Math.min(1, dt * 0.006);
      if (Math.abs(surface - prevSurface) > 0.8) splash(W * (0.2 + Math.random() * 0.6), (surface - prevSurface) * 0.08);
      updateBlocks();

      // Spring surface: each column pulled home, neighbours spread the wave.
      for (let i = 0; i < n; i += 1) {
        vel[i] += -hgt[i] * 0.012 * (dt / 16);
        vel[i] *= 0.985;
      }
      for (let pass = 0; pass < 2; pass += 1) {
        for (let i = 1; i < n - 1; i += 1) {
          const d = (hgt[i - 1] + hgt[i + 1] - 2 * hgt[i]) * 0.12;
          vel[i] += d;
        }
      }
      for (let i = 0; i < n; i += 1) hgt[i] += vel[i] * (dt / 16);
      // Ambient swell.
      if (Math.random() < 0.05) splash(Math.random() * W, (Math.random() - 0.5) * 1.6);

      ctx.clearRect(0, 0, W, H);
      const yAt = (i: number) => surface + hgt[i] + Math.sin(i * 0.18 + t * 0.0016) * 2.2 + Math.sin(i * 0.05 - t * 0.0009) * 3.5;

      // Water body.
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (let i = 0; i < n; i += 1) ctx.lineTo(i * COLS_GAP, yAt(i));
      ctx.lineTo(W, H);
      ctx.closePath();
      const deep = ctx.createLinearGradient(0, surface - 10, 0, H);
      deep.addColorStop(0, 'rgba(40,190,230,0.62)');
      deep.addColorStop(0.08, 'rgba(14,110,160,0.74)');
      deep.addColorStop(0.4, 'rgba(6,52,96,0.86)');
      deep.addColorStop(1, 'rgba(2,14,34,0.95)');
      ctx.fillStyle = deep;
      ctx.fill();

      ctx.save();
      ctx.clip();
      // Light shafts from the surface.
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 6; k += 1) {
        const x = ((k + 0.5) / 6) * W + Math.sin(t * 0.0004 + k * 2) * 60;
        const g = ctx.createLinearGradient(0, surface, 0, surface + 420);
        g.addColorStop(0, 'rgba(150,230,255,0.12)');
        g.addColorStop(1, 'rgba(150,230,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(x - 18, surface);
        ctx.lineTo(x + 18, surface);
        ctx.lineTo(x + 110, surface + 420);
        ctx.lineTo(x - 40, surface + 420);
        ctx.closePath();
        ctx.fill();
      }
      // Caustics: interference lines that drift under the surface.
      ctx.strokeStyle = 'rgba(170,240,255,0.09)';
      ctx.lineWidth = 1.2;
      for (let row = 0; row < 7; row += 1) {
        const y0 = surface + 20 + row * 34;
        if (y0 > H) break;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const y = y0 + Math.sin(x * 0.03 + t * 0.002 + row) * 6 + Math.sin(x * 0.011 - t * 0.0013 + row * 1.7) * 9;
          if (x) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
      ctx.globalCompositeOperation = 'source-over';

      // Specular rim and foam along the surface.
      ctx.beginPath();
      for (let i = 0; i < n; i += 1) {
        const y = yAt(i);
        if (i) ctx.lineTo(i * COLS_GAP, y);
        else ctx.moveTo(0, y);
      }
      ctx.strokeStyle = 'rgba(225,250,255,0.85)';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(120,230,255,0.9)';
      ctx.shadowBlur = 12;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 1; i < n - 1; i += 1) {
        const slope = Math.abs(hgt[i + 1] - hgt[i - 1]);
        if (slope > 2.4 && Math.random() < 0.5) {
          ctx.beginPath();
          ctx.arc(i * COLS_GAP + (Math.random() - 0.5) * 4, yAt(i) - Math.random() * 3, Math.random() * 1.6 + 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Bubbles.
      for (let i = bubbles.length - 1; i >= 0; i -= 1) {
        const b = bubbles[i];
        b.life += dt;
        if (b.pop) {
          b.pop += dt;
          const a = 1 - b.pop / 220;
          if (a <= 0) { bubbles.splice(i, 1); continue; }
          ctx.strokeStyle = `rgba(255,255,255,${a})`;
          ctx.lineWidth = 1;
          for (let k = 0; k < 6; k += 1) {
            const ang = (k / 6) * Math.PI * 2;
            const r1 = b.r * (1 + b.pop / 120);
            ctx.beginPath();
            ctx.moveTo(b.x + Math.cos(ang) * r1, b.y + Math.sin(ang) * r1);
            ctx.lineTo(b.x + Math.cos(ang) * (r1 + 4), b.y + Math.sin(ang) * (r1 + 4));
            ctx.stroke();
          }
          continue;
        }
        b.wob += dt * 0.006;
        b.x += (b.vx + Math.sin(b.wob) * 0.03) * dt;
        b.y += b.vy * dt;
        const col = Math.max(0, Math.min(n - 1, Math.round(b.x / COLS_GAP)));
        const sy = yAt(col);
        if (!b.air && b.y - b.r <= sy) {
          // Breaks the surface: a little splash, then pops or floats up.
          splash(b.x, -0.6 - b.r * 0.08);
          if (Math.random() < 0.6) { b.pop = 1; continue; }
          b.air = true;
          b.vy = -0.03;
          b.r *= 1.6;
        }
        if (b.y < -b.r || b.life > 9000 || (b.air && Math.random() < 0.0015 * (dt / 16))) { b.pop = 1; continue; }
        if (b.air) {
          const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.1, b.x, b.y, b.r);
          g.addColorStop(0, 'rgba(255,255,255,0.0)');
          g.addColorStop(0.7, `hsla(${(b.wob * 40) % 360},90%,75%,0.10)`);
          g.addColorStop(0.92, `hsla(${(b.wob * 40 + 120) % 360},95%,78%,0.45)`);
          g.addColorStop(1, 'rgba(255,255,255,0.65)');
          ctx.fillStyle = g;
        } else {
          const g = ctx.createRadialGradient(b.x - b.r * 0.3, b.y - b.r * 0.3, 0, b.x, b.y, b.r);
          g.addColorStop(0, 'rgba(255,255,255,0.7)');
          g.addColorStop(0.5, 'rgba(160,235,255,0.18)');
          g.addColorStop(1, 'rgba(200,245,255,0.55)');
          ctx.fillStyle = g;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.38, b.y - b.r * 0.4, Math.max(0.8, b.r * 0.18), 0, Math.PI * 2);
        ctx.fill();
      }
      // Idle bubbles from the deep.
      if (Math.random() < 0.06 * (dt / 16)) spawn(Math.random() * W, H - 10, 1);
    };

    const start = () => {
      if (!raf && visible && document.visibilityState === 'visible') {
        last = 0;
        raf = requestAnimationFrame(frame);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(footer);

    const local = (e: PointerEvent) => {
      const r = footer.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    let lastSpawn = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastSpawn < 40) return;
      lastSpawn = now;
      const [x, y] = local(e);
      spawn(x, y, e.pointerType === 'mouse' ? 1 : 2);
      const col = Math.max(0, Math.min(n - 1, Math.round(x / COLS_GAP)));
      if (Math.abs(y - (surface + hgt[col])) < 60) splash(x, (Math.random() - 0.5) * 3);
    };
    const onDown = (e: PointerEvent) => {
      const [x, y] = local(e);
      spawn(x, y, 10);
      splash(x, 4);
    };
    const onScroll = () => {
      const y = window.scrollY;
      const v = y - lastScroll;
      lastScroll = y;
      if (visible && Math.abs(v) > 2) splash(Math.random() * W, Math.max(-5, Math.min(5, v * 0.06)));
    };
    const onFocus = () => {
      forced = true;
    };
    footer.addEventListener('pointermove', onMove, { passive: true });
    footer.addEventListener('pointerdown', onDown, { passive: true });
    footer.addEventListener('focusin', onFocus);
    window.addEventListener('scroll', onScroll, { passive: true });
    const onVis = () => start();
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      footer.removeEventListener('pointermove', onMove);
      footer.removeEventListener('pointerdown', onDown);
      footer.removeEventListener('focusin', onFocus);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVis);
      footer.classList.remove('em-sea-on');
      blocks.forEach((b) => b.classList.add('is-dry'));
    };
  }, [reduced]);

  return <canvas ref={ref} className="em-sea" aria-hidden="true" />;
}
