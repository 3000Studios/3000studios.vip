import { useEffect } from 'react';

const COLORS = ['#ffd36a', '#1ed760', '#ff4d6d', '#5b8cff', '#ff8a3d', '#e879f9', '#00e5ff'];
const BUTTON_SEL =
  'button, a.studioButton, a.vipNavLink, a.vipNavCta, a.ytCta, [role="button"], input[type="submit"], input[type="button"], .studioButton, .dkArrow, .trackSelectButton, .vipMenu';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnSparks(x: number, y: number, color: string) {
  const layer = document.querySelector('.sparkFxLayer');
  if (!layer) return;
  const burst = document.createElement('div');
  burst.className = 'sparkBurst';
  burst.style.left = `${x}px`;
  burst.style.top = `${y}px`;
  burst.style.setProperty('--spark-color', color);
  const count = 16;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('span');
    spark.className = 'sparkParticle';
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
    const dist = 36 + Math.random() * 72;
    spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    spark.style.setProperty('--rot', `${Math.random() * 360}deg`);
    spark.style.setProperty('--size', `${3 + Math.random() * 7}px`);
    burst.appendChild(spark);
  }
  layer.appendChild(burst);
  window.setTimeout(() => burst.remove(), 720);
}

export function SparkClickFX() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let clickIndex = 0;

    const fire = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.(BUTTON_SEL) as HTMLElement | null;
      if (!target) return;
      if (target.closest('.sparkFxLayer, .zombieFxLayer')) return;
      const color = COLORS[clickIndex % COLORS.length];
      clickIndex += 1;
      document.documentElement.style.setProperty('--spark-cycle', color);
      target.style.setProperty('--spark-cycle', color);
      spawnSparks(event.clientX, event.clientY, color);
    };

    document.addEventListener('pointerdown', fire, { capture: true, passive: true });
    return () => document.removeEventListener('pointerdown', fire, true);
  }, []);

  return <div className="sparkFxLayer" aria-hidden="true" />;
}
