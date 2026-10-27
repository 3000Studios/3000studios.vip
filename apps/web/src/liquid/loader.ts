import { getAnalyser } from '../lib/audioAnalyserBus';

/**
 * Liquid A integration loader (v2, 2026-10-27).
 *
 * The liquid engine itself was built by the fleet's liquid specialist as
 * dependency-free standalone files (liquid.js / carousel.js / navdance.js
 * + their CSS) and is vendored VERBATIM under public/js/. This module is
 * the only glue: it lazy-loads those files where they're used, feeds the
 * shared LiquidBeat hub from the site's ONE existing AnalyserNode, and
 * attaches the nav dance to the nav roots.
 *
 * Beat honesty: the single analyser lives in components/GlobalMusic.tsx
 * (created once, on first user gesture, on the site's one <audio>
 * element, published via lib/audioAnalyserBus). This pump only READS it.
 * No second AudioContext, no second analyser is ever created here. When
 * nothing is playing there is no analyser to read, the pump feeds
 * nothing, and the hub falls back to its own gentle idle rhythm — idle
 * is idle, never dressed up as music reaction.
 */

type LiquidBeatHub = {
  setBeat: (v: number) => void;
  pulse: (s?: number) => void;
};

declare global {
  interface Window {
    LiquidBeat?: LiquidBeatHub;
    LiquidSurface?: new (canvas: HTMLCanvasElement) => { destroy: () => void; spawnRipple: (x: number, y: number, s?: number) => void };
    LiquidCarousel?: new (
      el: HTMLElement,
      panels: unknown[],
      opts: Record<string, unknown>,
    ) => { destroy: () => void };
    NavDance?: { attach: (root: Element) => unknown };
  }
}

const scriptPromises = new Map<string, Promise<void>>();
const cssLoaded = new Set<string>();

function loadScript(src: string): Promise<void> {
  const existing = scriptPromises.get(src);
  if (existing) return existing;
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(el);
  });
  scriptPromises.set(src, promise);
  return promise;
}

function loadCss(href: string): void {
  if (cssLoaded.has(href)) return;
  cssLoaded.add(href);
  const el = document.createElement('link');
  el.rel = 'stylesheet';
  el.href = href;
  document.head.appendChild(el);
}

export function loadLiquidCore(): Promise<void> {
  return loadScript('/js/liquid.js');
}

export async function loadCarouselAssets(): Promise<void> {
  await loadLiquidCore();
  loadCss('/js/carousel.css');
  await loadScript('/js/carousel.js');
}

export async function loadNavDanceAssets(): Promise<void> {
  await loadLiquidCore();
  loadCss('/js/navdance.css');
  await loadScript('/js/navdance.js');
}

/* ---------------- the beat pump: analyser -> LiquidBeat ---------------- */

let pumpStarted = false;

export function startBeatPump(): void {
  if (pumpStarted) return;
  pumpStarted = true;
  const freq = new Uint8Array(128);
  let lastKickAt = 0;
  const tick = () => {
    requestAnimationFrame(tick);
    const hub = window.LiquidBeat;
    if (!hub) return;
    const analyser = getAnalyser();
    if (!analyser) return; // nothing playing: feed nothing, hub idles
    analyser.getByteFrequencyData(freq);
    let sum = 0;
    for (let i = 2; i < 24; i++) sum += freq[i]; // lows = the groove
    hub.setBeat(Math.min(1, sum / 22 / 190));
    const now = performance.now();
    if (freq[3] > 205 && now - lastKickAt > 180) {
      lastKickAt = now;
      hub.pulse(freq[3] / 255);
    }
  };
  requestAnimationFrame(tick);
}

/* ---------------- nav dance attach + current-link sync ---------------- */

const attachedRoots = new WeakSet<Element>();

export function syncNavCurrent(root: Element): void {
  root.querySelectorAll('a').forEach((a) => {
    const current =
      a.getAttribute('aria-current') === 'page' || a.classList.contains('is-active');
    a.classList.toggle('is-current', current);
  });
}

export async function attachNavDance(root: Element | null): Promise<void> {
  if (!root || attachedRoots.has(root)) return;
  attachedRoots.add(root);
  try {
    await loadNavDanceAssets();
  } catch {
    return; // files unavailable: nav simply stays static, no fake dance
  }
  syncNavCurrent(root);
  window.NavDance?.attach(root);
  startBeatPump();
}

export function syncAllNavCurrent(): void {
  document.querySelectorAll('.navdance').forEach((root) => syncNavCurrent(root));
}
