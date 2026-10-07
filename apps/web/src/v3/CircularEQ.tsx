import { useEffect, useRef } from 'react';
import { getAnalyser } from '../lib/audioAnalyserBus';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/**
 * CircularEQ — premium radial audio visualizer for the homepage hero.
 *
 * A high-end circular equalizer: 72 smooth radial bars in champagne-gold,
 * glowing core, slow cinematic rotation. Dances to REAL frequency data
 * from the shared AnalyserNode when a track plays; otherwise grooves on
 * a simulated 128 BPM pulse.
 *
 * Performance: DPR capped (1.5 mobile / 2 desktop), pauses when offscreen
 * (IntersectionObserver) or tab-hidden, single static frame for
 * prefers-reduced-motion. No shadowBlur — glow is faked with layered
 * alpha strokes + 'lighter' compositing, which is dramatically cheaper.
 */

const BARS = 72;
const BPM = 128;
const BEAT_MS = 60000 / BPM;
// Brand golds: deep -> champagne -> hot white
const GOLD_STOPS: Array<[number, string]> = [
  [0, '#8a5a10'],
  [0.45, '#f1b74e'],
  [0.8, '#ffe9b8'],
  [1, '#fffdf4'],
];

export function CircularEQ({ size = 210 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let dpr = 1;
    let S = size; // css px
    let cx = 0;
    let cy = 0;
    let R = 0; // outer radius for bar tips
    const freq = new Uint8Array(128);
    const levels = new Float32Array(BARS);
    const smooth = new Float32Array(BARS); // lerped bar values (buttery motion)
    let rotation = 0;
    let kickEnergy = 0;
    let lastKick = 0;

    const isMobile = () => Math.min(window.innerWidth, window.innerHeight) < 720;

    function resize() {
      const mobile = isMobile();
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      // Fit the wrap; keep it square.
      const rect = wrap!.getBoundingClientRect();
      S = Math.min(rect.width || size, 320);
      canvas!.width = Math.floor(S * dpr);
      canvas!.height = Math.floor(S * dpr);
      canvas!.style.width = `${S}px`;
      canvas!.style.height = `${S}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = S / 2;
      cy = S / 2;
      R = S * 0.46;
    }

    function simulated(t: number) {
      const beat = (t % BEAT_MS) / BEAT_MS;
      const bar = Math.floor(t / BEAT_MS);
      for (let i = 0; i < BARS; i++) {
        const f = i / BARS;
        const kick = Math.exp(-beat * 6.5) * (1 - f * 0.7);
        const groove =
          0.5 +
          0.5 * Math.sin(t / 1100 + i * 0.42 + Math.sin(bar * 0.6 + i * 0.19) * 1.5);
        const sparkle = 0.5 + 0.5 * Math.sin(t / 173 + i * 1.31);
        levels[i] = 0.16 + kick * 0.72 + groove * 0.24 * (1 - f * 0.35) + sparkle * 0.1 * f;
      }
    }

    function hexRgb(hex: string): [number, number, number] {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    // Precomputed 64-step gold ramp — zero per-frame allocation/color math.
    const GOLD_LUT: string[] = (() => {
      const stops = GOLD_STOPS.map(([x, c]) => [x, hexRgb(c)] as const);
      const lut: string[] = [];
      for (let i = 0; i < 64; i++) {
        const x = i / 63;
        let s = 1;
        while (s < stops.length - 1 && x > stops[s][0]) s++;
        const [x0, c0] = stops[s - 1];
        const [x1, c1] = stops[s];
        const t = (x - x0) / (x1 - x0 || 1);
        const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
        const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
        const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
        lut.push(`rgb(${r},${g},${b})`);
      }
      return lut;
    })();

    function goldColor(v: number): string {
      const i = Math.max(0, Math.min(63, (v * 63) | 0));
      return GOLD_LUT[i];
    }

    function drawStatic() {
      ctx!.clearRect(0, 0, S, S);
      // One elegant frame: faint ring + short bars.
      ctx!.strokeStyle = 'rgba(241,183,78,0.28)';
      ctx!.lineWidth = 1.5;
      ctx!.beginPath();
      ctx!.arc(cx, cy, R * 0.62, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.lineCap = 'round';
      for (let i = 0; i < BARS; i++) {
        const a = (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const v = 0.22 + 0.1 * Math.sin(i * 0.9);
        const r0 = R * 0.66;
        const r1 = r0 + v * R * 0.3;
        ctx!.strokeStyle = goldColor(v);
        ctx!.lineWidth = 2.5;
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx!.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx!.stroke();
      }
    }

    function frame(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      const analyser = getAnalyser();
      if (analyser) {
        analyser.getByteFrequencyData(freq);
        for (let i = 0; i < BARS; i++) {
          const idx = Math.floor(Math.pow(i / BARS, 1.5) * (freq.length - 1));
          levels[i] = freq[idx] / 255;
        }
      } else {
        simulated(t);
      }

      // Butter-smooth: critically-damped lerp toward targets.
      for (let i = 0; i < BARS; i++) {
        const target = Math.min(1, levels[i] * 1.15);
        smooth[i] += (target - smooth[i]) * 0.28;
        if (Math.abs(target - smooth[i]) < 0.001) smooth[i] = target;
      }

      // Kick pulse on the low band.
      const low = (smooth[0] + smooth[1] + smooth[2]) / 3;
      if (low > 0.55 && t - lastKick > 240) {
        lastKick = t;
        kickEnergy = 1;
      }
      kickEnergy *= 0.93;

      rotation += 0.00045; // slow cinematic drift
      const pulse = 1 + kickEnergy * 0.06;

      ctx!.clearRect(0, 0, S, S);

      // --- outer halo ring (cheap glow: two alpha strokes) ---
      ctx!.save();
      ctx!.globalCompositeOperation = 'lighter';
      for (const [alpha, width] of [[0.10, 7], [0.22, 2.5]] as const) {
        ctx!.strokeStyle = `rgba(241,183,78,${alpha})`;
        ctx!.lineWidth = width;
        ctx!.beginPath();
        ctx!.arc(cx, cy, R * pulse, 0, Math.PI * 2);
        ctx!.stroke();
      }

      // --- radial bars: glow pass then core pass ---
      const rBase = R * 0.62;
      const rMax = R * 0.34;
      ctx!.lineCap = 'round';
      for (let i = 0; i < BARS; i++) {
        const a = rotation + (i / BARS) * Math.PI * 2 - Math.PI / 2;
        const v = smooth[i];
        const len = v * rMax * pulse;
        const r0 = rBase;
        const r1 = r0 + 2 + len;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const x0 = cx + cos * r0;
        const y0 = cy + sin * r0;
        const x1 = cx + cos * r1;
        const y1 = cy + sin * r1;
        // Glow pass (wide, faint).
        ctx!.strokeStyle = `rgba(241,183,78,${0.16 + v * 0.22})`;
        ctx!.lineWidth = 7;
        ctx!.beginPath();
        ctx!.moveTo(x0, y0);
        ctx!.lineTo(x1, y1);
        ctx!.stroke();
        // Core pass (thin, hot gold).
        ctx!.strokeStyle = goldColor(0.25 + v * 0.75);
        ctx!.lineWidth = 2.6;
        ctx!.beginPath();
        ctx!.moveTo(x0, y0);
        ctx!.lineTo(x1, y1);
        ctx!.stroke();
      }
      ctx!.restore();

      // --- core: dark disc, gold ring, pulsing inner glow ---
      const coreR = R * 0.52;
      const coreGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      coreGrad.addColorStop(0, '#0d0a04');
      coreGrad.addColorStop(0.75, '#080705');
      coreGrad.addColorStop(1, 'rgba(8,7,5,0)');
      ctx!.fillStyle = coreGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.strokeStyle = `rgba(241,183,78,${0.55 + kickEnergy * 0.4})`;
      ctx!.lineWidth = 1.6;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR * 0.92 * pulse, 0, Math.PI * 2);
      ctx!.stroke();

      // Inner shimmer ring, counter-rotating.
      ctx!.strokeStyle = 'rgba(255,233,184,0.30)';
      ctx!.lineWidth = 1;
      ctx!.setLineDash([2, 9]);
      ctx!.lineDashOffset = -t / 60;
      ctx!.beginPath();
      ctx!.arc(cx, cy, coreR * 0.68, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.setLineDash([]);
    }

    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        const nowVisible = entries[0]?.isIntersecting ?? true;
        if (nowVisible === visible) return;
        visible = nowVisible;
        if (reduce) return;
        if (visible && !document.hidden) {
          running = true;
          raf = requestAnimationFrame(frame);
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    const onVis = () => {
      if (reduce) return;
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (visible) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    if (reduce) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduce, size]);

  return (
    <div
      ref={wrapRef}
      className="v3-circular-eq"
      role="img"
      aria-label="Audio visualizer"
      style={{ width: size, height: size }}
    >
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
