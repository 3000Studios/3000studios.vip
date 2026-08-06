import { useEffect, useRef } from 'react';

/** Soft magnetic cursor + trail dots for pointer devices. Disabled for coarse touch. */
export function MouseFX() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) {
      root.style.display = 'none';
      return;
    }

    const cursor = root.querySelector<HTMLElement>('.mouseFxCursor');
    const ring = root.querySelector<HTMLElement>('.mouseFxRing');
    if (!cursor || !ring) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      document.documentElement.style.setProperty('--mx', `${(x / window.innerWidth).toFixed(4)}`);
      document.documentElement.style.setProperty('--my', `${(y / window.innerHeight).toFixed(4)}`);
    };

    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const onDown = () => root.classList.add('is-down');
    const onUp = () => root.classList.remove('is-down');

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div className="mouseFx" ref={rootRef} aria-hidden="true">
      <span className="mouseFxCursor" />
      <span className="mouseFxRing" />
    </div>
  );
}
