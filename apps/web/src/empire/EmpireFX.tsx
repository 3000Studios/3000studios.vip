import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGlobalMusic } from '../components/GlobalMusic';
import { usePrefersReducedMotion } from '../lib/mediaQuery';
import { playSfx } from './sfx';
import { tilt } from './tilt';

/** Owner/office routes keep their own backdrop (mirrors WaterWallpaper). */
const EXCLUDED = ['/office', '/admin', '/agent', '/vault', '/command-deck', '/go-live'];

const ROUTE_KEYS: Record<string, string> = {
  '': 'home',
  aeropocalypse: 'aeropocalypse',
  music: 'music',
  song: 'song',
  video: 'video',
  videos: 'video',
  podcast: 'podcast',
  books: 'books',
  beats: 'beats',
  live: 'live',
  shop: 'shop',
  vip: 'vip',
  blog: 'blog',
  contact: 'contact',
  about: 'about',
  apps: 'apps',
  projects: 'projects',
};

function routeKey(pathname: string): string {
  const seg = pathname.split('/')[1] ?? '';
  return ROUTE_KEYS[seg] ?? 'page';
}

/** Elements that get the scroll reveal. Headers, sections and cards. */
const REVEAL_SELECTOR = [
  '.v2-main h1',
  '.v2-main h2',
  '.v2-main section',
  '.v2-main article',
  '.v2-main .nn-glass',
  '.em-card',
  '.em-sec-head',
  '.em-thumb',
  '[data-em-reveal]',
].join(',');

const INTERACTIVE = 'a[href], button, [role="button"], summary, label[for]';

/**
 * EMPIRE effects layer, mounted once in the root layout:
 * - per-page live aura over the space water, tinted per route
 * - touch/pointer glow that follows the finger
 * - click ring + synthesized click sound on every tap
 * - scroll reveal for headers, sections and cards (auto-tagged)
 * - headers dance while music plays (html.em-music-on)
 * - phone tilt (DeviceOrientation, iOS permission on first tap) with a
 *   pointer fallback, shared with the live header/footer bands
 */
export function EmpireFX() {
  const { pathname } = useLocation();
  const { isPlaying } = useGlobalMusic();
  const reduced = usePrefersReducedMotion();
  const glowRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const excluded = EXCLUDED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  /* Route palette. */
  useEffect(() => {
    const key = routeKey(pathname);
    document.documentElement.dataset.emRoute = key;
    window.dispatchEvent(new CustomEvent('em-route', { detail: key }));
  }, [pathname]);

  /* Headers dance only while music is actually playing. */
  useEffect(() => {
    document.documentElement.classList.toggle('em-music-on', isPlaying && !reduced);
  }, [isPlaying, reduced]);

  /* Scroll reveal: tag new elements as pages lazy-load, reveal on view. */
  useEffect(() => {
    if (reduced || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    const seen = new WeakSet<Element>();
    const scan = () => {
      const found = document.querySelectorAll(REVEAL_SELECTOR);
      let n = 0;
      found.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        // Never hide something already inside a revealed parent, and skip
        // fixed chrome (header, menu, docks).
        if (el.closest('.em-header, .em-menu, .em-nostagger')) return;
        if (el.parentElement?.closest('.em-reveal')) return;
        el.classList.add('em-reveal');
        (el as HTMLElement).style.setProperty('--em-delay', `${Math.min(n, 6) * 60}ms`);
        n += 1;
        io.observe(el);
      });
    };
    let raf = 0;
    const queue = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        scan();
      });
    };
    scan();
    const mo = new MutationObserver(queue);
    mo.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* Taps: ring, sound, press pulse, touch glow. */
  useEffect(() => {
    let idle = 0;
    let gx = -400;
    let gy = -400;
    let raf = 0;
    const paint = () => {
      raf = 0;
      if (glowRef.current) glowRef.current.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
    };
    const moveGlow = (e: PointerEvent) => {
      gx = e.clientX;
      gy = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
      document.documentElement.classList.add('em-touching');
      window.clearTimeout(idle);
      idle = window.setTimeout(
        () => document.documentElement.classList.remove('em-touching'),
        e.pointerType === 'mouse' ? 1400 : 500,
      );
    };
    const onDown = (e: PointerEvent) => {
      moveGlow(e);
      const target = e.target as HTMLElement | null;
      const hit = target?.closest?.(INTERACTIVE) as HTMLElement | null;
      if (hit && !hit.closest('[data-em-silent]')) {
        const inNav = !!hit.closest('.em-nav, .em-menu, .em-shelfnav');
        playSfx(inNav ? 'nav' : 'tap');
        const card = hit.closest('.em-card, .em-btn, .em-tile') as HTMLElement | null;
        if (card && !reduced) {
          card.classList.remove('em-pressed');
          void card.offsetWidth;
          card.classList.add('em-pressed');
          window.setTimeout(() => card.classList.remove('em-pressed'), 450);
        }
      }
      if (reduced) return;
      const ring = document.createElement('span');
      ring.className = 'em-ring';
      ring.style.left = `${e.clientX}px`;
      ring.style.top = `${e.clientY}px`;
      document.body.appendChild(ring);
      window.setTimeout(() => ring.remove(), 620);
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', moveGlow, { passive: true });
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', moveGlow);
      window.clearTimeout(idle);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  /* Tilt: device orientation on phones, pointer position on desktop. */
  useEffect(() => {
    if (reduced) return;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let running = true;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.source = 'device';
      tx = Math.max(-1, Math.min(1, e.gamma / 40));
      ty = Math.max(-1, Math.min(1, (e.beta - 40) / 40));
    };
    const onPointer = (e: PointerEvent) => {
      if (tilt.source === 'device' || e.pointerType !== 'mouse') return;
      tilt.source = 'pointer';
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    // iOS asks for motion permission; it can only be requested from a tap.
    type IOSOrientation = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    const DOE = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : null) as IOSOrientation | null;
    let asked = false;
    const askOnce = () => {
      if (asked || !DOE?.requestPermission) return;
      asked = true;
      DOE.requestPermission()
        .then((state) => {
          if (state === 'granted') window.addEventListener('deviceorientation', onOrient, { passive: true });
        })
        .catch(() => undefined);
    };
    if (DOE && !DOE.requestPermission) window.addEventListener('deviceorientation', onOrient, { passive: true });
    if (DOE?.requestPermission) window.addEventListener('touchend', askOnce, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    let lastX = 9;
    let lastY = 9;
    const loop = () => {
      if (!running) return;
      tilt.x += (tx - tilt.x) * 0.08;
      tilt.y += (ty - tilt.y) * 0.08;
      if (Math.abs(tilt.x - lastX) > 0.01 || Math.abs(tilt.y - lastY) > 0.01) {
        lastX = tilt.x;
        lastY = tilt.y;
        // Only the few elements that move with tilt get the variables, so a
        // tilt never forces a style recalc of the whole page.
        document.querySelectorAll<HTMLElement>('.em-aura, [data-em-tilt]').forEach((el) => {
          el.style.setProperty('--tilt-x', tilt.x.toFixed(3));
          el.style.setProperty('--tilt-y', tilt.y.toFixed(3));
        });
      }
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('deviceorientation', onOrient);
      window.removeEventListener('touchend', askOnce);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced]);

  if (excluded) return null;
  return (
    <>
      <div className="em-aura" ref={auraRef} aria-hidden="true">
        <div className="grid" />
        <i className="a1" />
        <i className="a2" />
        <i className="a3" />
      </div>
      <div className="em-touch-glow" ref={glowRef} aria-hidden="true" />
    </>
  );
}
