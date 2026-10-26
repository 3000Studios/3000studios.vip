import { useEffect, useRef } from 'react';
import { getAnalyser, subscribeAnalyser } from '../lib/audioAnalyserBus';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/**
 * Circular EQ live wallpaper — fixed full-viewport canvas behind all v3
 * content. A high-resolution radial ("circular") equalizer with 3D depth:
 * extruded blades around a glassy centre disc, an inward counter-ring,
 * orbiting dashed rings, peak-hold caps and tip glow.
 *
 * - When a track is playing through the site player, the ring dances to
 *   the REAL frequency data from the shared AnalyserNode.
 * - When idle, it grooves on a simulated 128 BPM pulse so the page is
 *   never dead.
 * - Drawn at device pixel ratio (up to 2x) so the ring stays razor sharp
 *   on retina displays. Pauses when the tab is hidden; one static frame
 *   when the user prefers reduced motion.
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

/* Brand palette stops around the ring: pink -> gold -> cyan -> pink. */
const PALETTE: Array<[number, [number, number, number]]> = [
  [0, [255, 47, 179]],
  [0.33, [241, 183, 78]],
  [0.66, [111, 244, 255]],
  [1, [255, 47, 179]],
];

function paletteAt(f: number): [number, number, number] {
  for (let s = 0; s < PALETTE.length - 1; s++) {
    const [f0, c0] = PALETTE[s];
    const [f1, c1] = PALETTE[s + 1];
    if (f >= f0 && f <= f1) {
      const k = f1 === f0 ? 0 : (f - f0) / (f1 - f0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * k),
        Math.round(c0[1] + (c1[1] - c0[1]) * k),
        Math.round(c0[2] + (c1[2] - c0[2]) * k),
      ];
    }
  }
  return PALETTE[0][1];
}

function makeGlowSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const s = document.createElement('canvas');
  s.width = 96;
  s.height = 96;
  const c = s.getContext('2d')!;
  const grad = c.createRadialGradient(48, 48, 0, 48, 48, 48);
  grad.addColorStop(0, `rgba(255,255,255,0.9)`);
  grad.addColorStop(0.25, `rgba(${r},${g},${b},0.55)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  c.fillStyle = grad;
  c.fillRect(0, 0, 96, 96);
  return s;
}

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
    let barCount = 160;
    let particles: Particle[] = [];
    let lastKick = 0;
    let kickEnergy = 0;
    const freq = new Uint8Array(128);
    const simLevels = new Float32Array(128);

    /* Per-bar precomputed state (rebuilt on resize). */
    let barRGB: Array<[number, number, number]> = [];
    let barSide: string[] = [];
    let glowSprites: HTMLCanvasElement[] = [];
    let barGlow: number[] = [];

    const MAXB = 192;
    const target = new Float32Array(MAXB);
    const smooth = new Float32Array(MAXB);
    const peak = new Float32Array(MAXB);

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
      barCount = mobile ? 96 : 160;
      barRGB = [];
      barSide = [];
      barGlow = [];
      for (let i = 0; i < barCount; i++) {
        const f = i / barCount;
        const rgb = paletteAt(f);
        barRGB.push(rgb);
        barSide.push(
          `rgb(${Math.round(rgb[0] * 0.32)},${Math.round(rgb[1] * 0.32)},${Math.round(
            rgb[2] * 0.38,
          )})`,
        );
        barGlow.push(f < 0.33 ? 0 : f < 0.66 ? 1 : 2);
      }
      /* Glow sprites in palette order: pink, gold, cyan. */
      glowSprites = [
        makeGlowSprite(255, 47, 179),
        makeGlowSprite(241, 183, 78),
        makeGlowSprite(111, 244, 255),
      ];
      const pCount = mobile ? 30 : 60;
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

    /**
     * Fill `target` for every bar. The spectrum is mirrored around the
     * ring: bass at the top, sweeping down both sides to treble at the
     * bottom, so the circle stays symmetric like a real radial analyser.
     */
    function sampleLevels(t: number) {
      const analyser = getAnalyser();
      if (analyser) {
        analyser.getByteFrequencyData(freq);
        for (let i = 0; i < barCount; i++) {
          const tri =
            i <= barCount / 2 ? i / (barCount / 2) : (barCount - i) / (barCount / 2);
          const idx = Math.floor(Math.pow(tri, 1.6) * (freq.length - 1));
          target[i] = freq[idx] / 255;
        }
      } else {
        simulatedLevels(t, simLevels);
        for (let i = 0; i < barCount; i++) {
          const tri =
            i <= barCount / 2 ? i / (barCount / 2) : (barCount - i) / (barCount / 2);
          const idx = Math.floor(Math.pow(tri, 1.6) * (simLevels.length - 1));
          target[i] = simLevels[idx];
        }
      }
    }

    function draw(t: number, snap: boolean) {
      sampleLevels(t);

      let energy = 0;
      for (let i = 0; i < barCount; i++) {
        if (snap) {
          smooth[i] = target[i];
          peak[i] = target[i];
        } else {
          const k = target[i] > smooth[i] ? 0.55 : 0.16;
          smooth[i] += (target[i] - smooth[i]) * k;
          if (smooth[i] > peak[i]) peak[i] = smooth[i];
          else peak[i] = Math.max(smooth[i], peak[i] - 0.005);
        }
        energy += smooth[i];
      }
      energy /= barCount;

      /* Kick detection on the bass bars (top of the ring, i ~ 0 / N). */
      const low = (smooth[0] + smooth[1] + smooth[barCount - 1]) / 3;
      if (low > 0.62 && t - lastKick > 240) {
        lastKick = t;
        kickEnergy = 1;
      }
      kickEnergy *= 0.94;
      const pulse = Math.min(1, energy * 1.7);

      /* Geometry. */
      const cx = w / 2;
      const cy = h * (isMobile() ? 0.4 : 0.44);
      const minDim = Math.min(w, h);
      const baseR = minDim * (isMobile() ? 0.3 : 0.27);
      const maxLen = minDim * 0.21;
      const innerR = baseR * 0.8;

      /* Base. */
      ctx!.fillStyle = '#05060a';
      ctx!.fillRect(0, 0, w, h);

      /* Beat-reactive aura centred on the ring. */
      const auraR = baseR * (2.3 + pulse * 0.5 + kickEnergy * 0.25);
      const aura = ctx!.createRadialGradient(cx, cy, 0, cx, cy, auraR);
      aura.addColorStop(0, `rgba(255,47,179,${0.1 + pulse * 0.1 + kickEnergy * 0.08})`);
      aura.addColorStop(0.5, `rgba(111,244,255,${0.05 + pulse * 0.05})`);
      aura.addColorStop(1, 'rgba(5,6,10,0)');
      ctx!.fillStyle = aura;
      ctx!.fillRect(0, 0, w, h);

      /* Floor glow under the disc (grounds the 3D float). */
      const floor = ctx!.createRadialGradient(
        cx, cy + baseR * 1.28, 0,
        cx, cy + baseR * 1.28, baseR * 1.5,
      );
      floor.addColorStop(0, `rgba(255,47,179,${0.1 + pulse * 0.12})`);
      floor.addColorStop(1, 'rgba(5,6,10,0)');
      ctx!.fillStyle = floor;
      ctx!.fillRect(0, 0, w, h);

      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.scale(1, 0.94); // gentle perspective squash — the disc floats

      /* Orbit rings (behind the bars), counter-rotating dashes. */
      const rot = (t / 120000) * Math.PI * 2;
      ctx!.lineWidth = 1;
      for (const [rr, dash, speed, col] of [
        [baseR * 1.06, 26, 1, 'rgba(111,244,255,0.20)'],
        [baseR * 1.13, 4, -1.6, 'rgba(241,183,78,0.16)'],
      ] as Array<[number, number, number, string]>) {
        ctx!.beginPath();
        ctx!.setLineDash([dash, dash * 0.7]);
        ctx!.lineDashOffset = rot * 60 * speed;
        ctx!.strokeStyle = col;
        ctx!.arc(0, 0, rr, 0, Math.PI * 2);
        ctx!.stroke();
      }
      ctx!.setLineDash([]);

      /* Centre disc — dark glass with a gold rim and a bass-breathing core. */
      const discR = baseR * 0.64;
      const disc = ctx!.createRadialGradient(0, -discR * 0.3, discR * 0.1, 0, 0, discR);
      disc.addColorStop(0, '#141a2e');
      disc.addColorStop(0.7, '#0a0d18');
      disc.addColorStop(1, '#05060a');
      ctx!.beginPath();
      ctx!.arc(0, 0, discR, 0, Math.PI * 2);
      ctx!.fillStyle = disc;
      ctx!.fill();
      ctx!.lineWidth = 1.5;
      ctx!.strokeStyle = `rgba(241,183,78,${0.35 + kickEnergy * 0.3})`;
      ctx!.stroke();
      const coreR = discR * (0.52 + low * 0.1 + kickEnergy * 0.05);
      const core = ctx!.createRadialGradient(0, 0, 0, 0, 0, coreR);
      core.addColorStop(0, `rgba(255,47,179,${0.16 + pulse * 0.14})`);
      core.addColorStop(1, 'rgba(255,47,179,0)');
      ctx!.beginPath();
      ctx!.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx!.fillStyle = core;
      ctx!.fill();

      /* The bars themselves, slowly rotating as one ring. */
      ctx!.save();
      ctx!.rotate(rot * 0.35);
      const barW = Math.max(1.6, (Math.PI * 2 * baseR) / barCount * 0.52);
      for (let i = 0; i < barCount; i++) {
        const a = -Math.PI / 2 + (i / barCount) * Math.PI * 2;
        const v = Math.min(1, smooth[i] * 1.3);
        const len = 5 + v * maxLen;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const [r, g, b] = barRGB[i];

        /* 3D side face: the blade's dark extruded edge, offset down-left. */
        ctx!.strokeStyle = barSide[i];
        ctx!.lineWidth = barW;
        ctx!.globalAlpha = 0.55;
        ctx!.beginPath();
        ctx!.moveTo(cos * baseR - 2.5, sin * baseR + 3);
        ctx!.lineTo(cos * (baseR + len) - 2.5, sin * (baseR + len) + 3);
        ctx!.stroke();

        /* Main blade. */
        ctx!.strokeStyle = `rgb(${r},${g},${b})`;
        ctx!.globalAlpha = 0.34 + v * 0.6;
        ctx!.beginPath();
        ctx!.moveTo(cos * baseR, sin * baseR);
        ctx!.lineTo(cos * (baseR + len), sin * (baseR + len));
        ctx!.stroke();

        /* Peak-hold cap. */
        const pv = Math.min(1, peak[i] * 1.3);
        if (pv > 0.05) {
          const px = cos * (baseR + 5 + pv * maxLen);
          const py = sin * (baseR + 5 + pv * maxLen);
          ctx!.globalAlpha = 0.85;
          ctx!.fillStyle = `rgb(${r},${g},${b})`;
          ctx!.beginPath();
          ctx!.arc(px, py, Math.max(1.3, barW * 0.32), 0, Math.PI * 2);
          ctx!.fill();
        }

        /* Inner counter-ring: shorter blades pointing inward (depth). */
        const iv = Math.min(1, smooth[(i + barCount / 2) % barCount] * 1.15);
        const ilen = 3 + iv * maxLen * 0.34;
        ctx!.globalAlpha = 0.16 + iv * 0.3;
        ctx!.lineWidth = barW * 0.7;
        ctx!.beginPath();
        ctx!.moveTo(cos * innerR, sin * innerR);
        ctx!.lineTo(cos * (innerR - ilen), sin * (innerR - ilen));
        ctx!.stroke();
      }
      ctx!.globalAlpha = 1;

      /* Tip glow pass (additive sprites, no per-bar shadowBlur cost). */
      ctx!.globalCompositeOperation = 'lighter';
      for (let i = 0; i < barCount; i += 2) {
        const v = Math.min(1, smooth[i] * 1.3);
        if (v < 0.3) continue;
        const a = -Math.PI / 2 + (i / barCount) * Math.PI * 2 + rot * 0.35;
        const len = 5 + v * maxLen;
        const gx = Math.cos(a) * (baseR + len);
        const gy = Math.sin(a) * (baseR + len);
        const gs = 14 + v * 52;
        ctx!.globalAlpha = 0.16 + v * 0.3;
        ctx!.drawImage(glowSprites[barGlow[i]], gx - gs / 2, gy - gs / 2, gs, gs);
      }
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.globalAlpha = 1;
      ctx!.restore(); // un-rotate
      ctx!.restore(); // un-translate/squash

      /* Rising dust particles, faster when the music hits. */
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

      /* Kick flash vignette. */
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

      /* Cinematic top shade so nav stays readable. */
      const top = ctx!.createLinearGradient(0, 0, 0, h * 0.22);
      top.addColorStop(0, 'rgba(3,4,8,0.72)');
      top.addColorStop(1, 'rgba(3,4,8,0)');
      ctx!.fillStyle = top;
      ctx!.fillRect(0, 0, w, h * 0.22);
    }

    function frame(t: number) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      draw(t, false);
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
      draw(1200, true);
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
