import { useEffect, useRef, useState, type ReactNode } from 'react';

export function BelowFold({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: '240px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show ? children : <div style={{ minHeight: 280 }} aria-hidden="true" />}</div>;
}
