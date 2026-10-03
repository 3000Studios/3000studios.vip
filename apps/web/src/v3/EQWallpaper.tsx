import { useEffect, useRef } from 'react';
import { getAnalyser, subscribeAnalyser } from '../lib/audioAnalyserBus';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/**
 * EQ live wallpaper — fixed full-viewport canvas behind all v3 content.
 *
 * - When a track is playing through the site player, bars dance to the
 *   REAL frequency data from the shared AnalyserNode.
 * - When idle, it grooves on a simulated 128 BPM pulse so the page is
 *   never dead.
 * - Mobile-first: fewer bars/particles and capped pixel ratio on small
 *   screens. Pauses when the tab is hidden. One static frame when the
 *   user prefers reduced motion.
 */

const BPM = 128;
const BEAT_MS = 60000 / BPM;

type Particle = {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  hue: number;
  life: number;
};

export function EQWallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let barCount = 56;
    let particles: Particle[] = [];
    let barGradient: CanvasGradient | null = null;
    let lastKick = 0;
    let kickEnergy = 0;
    const freq = new Uint8Array(128);

    const isMobile = () => Math.min(window.innerWidth, window.innerHeight) < 720;

    function resize() {
      const mobile = isMobile();
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      barCount = mobile ? 36 : 60;
      barGradient = ctx!.createLinearGradient(0, h, 0, h * 0.25);
      barGradient.addColorStop(0, '#ff2fb3');
      barGradient.addColorStop(0.45, '#f1b74e');
      barGradient.addColorStop(1, '#6ff4ff');
      const pCount = mobile ? 36 : 70;
      particles = Array.from({ length: pCount }, () => spawnParticle(true));
    }

    function spawnParticle(anywhere = false): Particle {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 10,
        r: 0.6 + Math.random() * 2.2,
        vy: 0.15 + Math.random() * 0.55,
        vx: (Math.random() - 0.5) * 0.3,
        hue: Math.random() < 0.5 ? 187 : Math.random() < 0.5 ? 318 : 42,
        life: 0.25 + Math.random() * 0.6,
      };
    }

    /* Simulated 128 BPM groove for when no real audio is playing. */
    function simulatedLevels(t: number, out: Float32Array) {
      const beat = (t % BEAT_MS) / BEAT_MS; // 0..1 within the beat
      const bar = Math.floor(t / BEAT_MS);
      for (let i = 0; i < out.length; i++) {
        const f = i / out.length;
        const kick = Math.exp(-beat * 7) * (1 - f * 0.75);
        const groove =
          0.5 +
          0.5 *
            Math.sin(t / 1000 + i * 0.55 + Math.sin(bar * 0.7 + i * 0.21) * 1.4);
        const sparkle = 0.5 + 0.5 * Math.sin(t / 167 + i * 1.7);
        out[i] =
          0.14 +
          kick * 0.75 +
          groove * 0.22 * (1 - f * 0.4) +
          sparkle * 0.1 * f;
      }
    }

    const levels = new Float32Array(128);

    function drawStatic() {
      // One calm frame for prefers-reduced-motion.
      ctx!.fillStyle = '#05060a';
      ctx!.fillRect(0, 0, w, h);
      const g = ctx!.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#05060a');
      g.addColorStop(0.6, '#0a0c16');
      g.addColorStop(1, '#120a18');
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
      ctx!.fillStyle = barGradient!;
      const bw = w / barCount;
      for (let i = 0; i < barCount; i++) {
        const bh = h * 0.08 + Math.sin(i * 0.7) * h * 0.03;
        ctx!.fillRect(i * bw + bw * 0.22, h - bh, bw * 0.56, bh);
      }
    }

    function frame(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);

      const analyser = getAnalyser();
      let energy = 0;
      if (analyser) {
        analyser.getByteFrequencyData(freq);
        const n = Math.min(barCount * 2, freq.length);
        for (let i = 0; i < barCount; i++) {
          // Log-ish sampling: favour lows, stretch across the spectrum.
          const idx = Math.floor(Math.pow(i / barCount, 1.6) * (freq.length - 1));
          levels[i] = freq[idx] / 255;
        }
        void n;
        for (let i = 0; i < barCount; i++) energy += levels[i];
        energy /= barCount;
      } else {
        simulatedLevels(t, levels);
        for (let i = 0; i < barCount; i++) energy += levels[i];
        energy /= barCount;
      }

      // Kick detection on the low band for pulse flashes.
      const low = (levels[0] + levels[1] + levels[2]) / 3;
      if (low > 0.62 && t - lastKick > 240) {
        lastKick = t;
        kickEnergy = 1;
      }
      kickEnergy *= 0.94;
      const pulse = Math.min(1, energy * 1.6);

      // Base.
      ctx!.fillStyle = '#05060a';
      ctx!.fillRect(0, 0, w, h);

      // Beat-reactive aura.
      const auraR = Math.max(w, h) * (0.42 + pulse * 0.22 + kickEnergy * 0.1);
      const aura = ctx!.createRadialGradient(
        w / 2, h * 0.72, 0,
        w / 2, h * 0.72, auraR,
      );
      aura.addColorStop(0, `rgba(255,47,179,${0.10 + pulse * 0.10 + kickEnergy * 0.08})`);
      aura.addColorStop(0.5, `rgba(111,244,255,${0.05 + pulse * 0.06})`);
      aura.addColorStop(1, 'rgba(5,6,10,0)');
      ctx!.fillStyle = aura;
      ctx!.fillRect(0, 0, w, h);

      // EQ bars, bottom-anchored.
      const bw = w / barCount;
      const maxH = h * 0.52;
      ctx!.fillStyle = barGradient!;
      for (let i = 0; i < barCount; i++) {
        const v = Math.min(1, levels[i] * 1.25);
        const bh = 4 + v * maxH;
        const x = i * bw + bw * 0.24;
        const y = h - bh;
        // Soft halo pass.
        ctx!.globalAlpha = 0.16 + pulse * 0.1;
        ctx!.fillRect(x - bw * 0.16, y, bw * 0.88, bh);
        // Core pass.
        ctx!.globalAlpha = 0.85;
        ctx!.fillRect(x, y, bw * 0.56, bh);
      }
      ctx!.globalAlpha = 1;

      // Waveform ribbon tracing the bar tops.
      ctx!.beginPath();
      for (let i = 0; i < barCount; i++) {
        const v = Math.min(1, levels[i] * 1.25);
        const x = i * bw + bw * 0.5;
        const y = h - (4 + v * maxH);
        if (i === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = `rgba(111,244,255,${0.35 + pulse * 0.3})`;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // Rising dust particles, faster when the music hits.
      const speed = 0.6 + pulse * 2.2;
      for (const p of particles) {
        p.y -= p.vy * speed;
        p.x += p.vx + Math.sin(t / 900 + p.y / 60) * 0.25;
        if (p.y < -12) Object.assign(p, spawnParticle());
        ctx!.fillStyle = `hsla(${p.hue}, 95%, 68%, ${p.life * (0.35 + pulse * 0.5)})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Kick flash vignette.
      if (kickEnergy > 0.03) {
        const vg = ctx!.createRadialGradient(
          w / 2, h / 2, Math.min(w, h) * 0.3,
          w / 2, h / 2, Math.max(w, h) * 0.75,
        );
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(1, `rgba(255,47,179,${kickEnergy * 0.14})`);
        ctx!.fillStyle = vg;
        ctx!.fillRect(0, 0, w, h);
      }

      // Cinematic top shade so nav stays readable.
      const top = ctx!.createLinearGradient(0, 0, 0, h * 0.22);
      top.addColorStop(0, 'rgba(3,4,8,0.72)');
      top.addColorStop(1, 'rgba(3,4,8,0)');
      ctx!.fillStyle = top;
      ctx!.fillRect(0, 0, w, h * 0.22);
    }

    resize();
    window.addEventListener('resize', resize);

    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!reduce) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    // Re-render loop starts when an analyser appears, but the ambient
    // groove means we always animate (unless reduced motion).
    const unsub = subscribeAnalyser(() => {
      /* analyser presence is polled per-frame; no restart needed */
    });

    if (reduce) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
      unsub();
    };
  }, [reduce]);

  return (
    <canvas
      ref={canvasRef}
      className="v3-eq-wallpaper"
      aria-hidden="true"
    />
  );
}
