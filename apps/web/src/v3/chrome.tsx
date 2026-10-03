import { useEffect, useRef, useState, type ReactNode, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

/* ---------------- cinematic preloader (once per session) ---------------- */
export function Preloader() {
  const [count, setCount] = useState(0);
  const reduce = usePrefersReducedMotion();
  const [done, setDone] = useState(() => {
    // Reduced motion: skip the preloader immediately (no setState-in-effect).
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    try {
      return sessionStorage.getItem('v3-preloader-seen') === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (done || reduce) return;
    let n = 0;
    const iv = window.setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 12));
      setCount(n);
      if (n >= 100) {
        window.clearInterval(iv);
        window.setTimeout(() => {
          setDone(true);
          try {
            sessionStorage.setItem('v3-preloader-seen', '1');
          } catch {
            /* private mode */
          }
        }, 420);
      }
    }, 95);
    return () => window.clearInterval(iv);
  }, [done, reduce]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="v3-loader"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          aria-hidden="true"
        >
          <div className="v3-loader-n">{count}</div>
          <div className="v3-loader-l">Loading the experience</div>
          <div className="v3-loader-bar">
            <i style={{ width: `${count}%`, transition: 'width .12s' }} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- neon cursor ---------------- */
export function CursorFX() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce || !window.matchMedia('(pointer:fine)').matches) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
      const t = e.target as HTMLElement | null;
      ring.classList.toggle('is-hot', !!t?.closest('a,button,.v3-card,.v3-track'));
    };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx - 19}px, ${ry - 19}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  if (reduce) return null;
  return (
    <>
      <div ref={dotRef} className="v3-cursor" aria-hidden="true" />
      <div ref={ringRef} className="v3-ring" aria-hidden="true" />
    </>
  );
}

/* ---------------- film grain ---------------- */
export function Grain() {
  return <div className="v3-grain" aria-hidden="true" />;
}

/* ---------------- marquee ---------------- */
export function Marquee({ items }: { items: string[] }) {
  const seq = [...items, ...items, ...items, ...items];
  return (
    <div className="v3-marquee" aria-hidden="true">
      <div className="v3-marquee-track">
        {[0, 1].map((half) => (
          <span key={half}>
            {seq.map((t, i) => (
              <span key={i}>
                {t} <b>&#9670;</b>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- magnetic in-app link ---------------- */
export function MagneticLink({
  to,
  className = '',
  children,
}: {
  to: string;
  className?: string;
  children: ReactNode;
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e: ReactMouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ x: (e.clientX - r.left - r.width / 2) * 0.18, y: (e.clientY - r.top - r.height / 2) * 0.28 });
  };
  return (
    <Link
      to={to}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
    >
      <motion.span
        animate={pos}
        transition={{ type: 'spring', stiffness: 180, damping: 14 }}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}

/* ---------------- tilt card ---------------- */
export function TiltCard({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !window.matchMedia('(pointer:fine)').matches) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduce]);

  return (
    <div ref={ref} className={`v3-card ${className}`} style={style}>
      {children}
    </div>
  );
}
