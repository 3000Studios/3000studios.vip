import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../v2/Reveal';
import { MagneticLink } from './chrome';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/* Canvas EQ visualizer that breathes with the cursor */
function Visualizer() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv || reduce) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let W = 0;
    let H = 0;
    const size = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(1, Math.floor(r.width));
      H = cv.height = Math.max(1, Math.floor(r.height));
    };
    size();
    window.addEventListener('resize', size);
    let mx = 0.5;
    let energy = 0.25;
    const onMove = (e: MouseEvent) => {
      const r = cv.getBoundingClientRect();
      const nx = (e.clientX - r.left) / Math.max(1, r.width);
      energy = Math.min(1, energy + Math.abs(nx - mx) * 3);
      mx = nx;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    const BARS = 56;
    const bars = new Array<number>(BARS).fill(0.12);
    const frame = () => {
      energy *= 0.965;
      ctx.fillStyle = 'rgba(5,6,10,0.32)';
      ctx.fillRect(0, 0, W, H);
      const bw = W / BARS;
      for (let i = 0; i < BARS; i++) {
        const d = Math.abs(mx - i / BARS);
        const target =
          0.1 + Math.max(0, 1 - d * 3.2) * energy * (0.55 + 0.45 * Math.sin(Date.now() / 190 + i * 0.55));
        bars[i] += (target - bars[i]) * 0.35;
        const h = bars[i] * H * 0.9;
        const g = ctx.createLinearGradient(0, H, 0, H - h);
        g.addColorStop(0, '#6ff4ff');
        g.addColorStop(1, '#ff2fb3');
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = g;
        ctx.fillRect(i * bw + 1, H - h, bw - 2, h);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('mousemove', onMove);
    };
  }, [reduce]);

  return <canvas ref={ref} aria-hidden="true" />;
}

export function PulseFooter() {
  return (
    <footer className="v3-pulse-foot">
      <Visualizer />
      <div className="v3-foot-inner">
        <Reveal>
          <div className="v3-eyebrow">Your move</div>
          <h2>
            Let&apos;s make something <em>loud</em>
          </h2>
          <p>Features, scores, full production or a complete visual package — one message starts it.</p>
          <MagneticLink to="/contact" className="v3-btn v3-btn--gold">
            Start a project
          </MagneticLink>
        </Reveal>
        <nav className="v3-foot-links" aria-label="Footer">
          <Link to="/music">Music</Link>
          <Link to="/about">Studio</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/legal">Legal</Link>
        </nav>
        <div className="v3-foot-base">3000 STUDIOS · NEON NOIR × CINEMATIC × PULSE</div>
      </div>
    </footer>
  );
}
