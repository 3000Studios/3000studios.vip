import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Living headings for every public page:
 * - each letter of every h1/h2 in the page body dances on its own beat and
 *   cycles gold, blue, green, white and orange
 * - electric arcs jump between letters (more often, and brighter, while
 *   music plays: the global player publishes --beat on <html>)
 *
 * React-safe splitting: the original text node is kept in place (emptied),
 * the letters go in an aria-hidden span just before it, and the heading
 * keeps its words in aria-label. If React later rewrites that text, the
 * observer re-splits it, and if React removes it, the letters go too.
 */

const HEADINGS = '.em-home main h1, .em-home main h2, .v2-main h1, .v2-main h2';
const SKIP = '[data-no-split], .em-header, .em-menu, .em-footer, svg, button, input, textarea, select';
const COLORS = ['#f2c867', '#3ee8ff', '#3df2a8', '#ffffff', '#ff8a2c'];

type Split = { group: HTMLSpanElement; text: string };
const splits = new WeakMap<Text, Split>();
const owners = new WeakMap<HTMLSpanElement, Text>();

function buildGroup(text: string, seed: number): HTMLSpanElement {
  const group = document.createElement('span');
  group.className = 'hx';
  group.setAttribute('aria-hidden', 'true');
  let k = seed;
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      group.appendChild(document.createTextNode(' '));
      continue;
    }
    const word = document.createElement('span');
    word.className = 'hx-w';
    for (const ch of Array.from(part)) {
      const l = document.createElement('span');
      l.className = 'hx-l';
      l.textContent = ch;
      l.style.setProperty('--k', String(k));
      l.style.setProperty('--c0', COLORS[k % COLORS.length]);
      k += 1;
      word.appendChild(l);
    }
    group.appendChild(word);
  }
  return group;
}

function splitHeading(h: HTMLElement) {
  if (h.closest(SKIP)) return;
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n as Text;
    if (t.parentElement?.closest('.hx')) continue;
    if (t.parentElement && t.parentElement !== h && t.parentElement.closest(SKIP)) continue;
    texts.push(t);
  }
  let seed = Number(h.dataset.hxSeed || 0);
  let touched = false;
  for (const t of texts) {
    const value = t.nodeValue ?? '';
    const prev = splits.get(t);
    if (!value.trim()) {
      // Emptied by us (already split) or plain whitespace.
      continue;
    }
    if (prev) prev.group.remove();
    const group = buildGroup(value, seed);
    seed += value.length;
    t.parentNode?.insertBefore(group, t);
    splits.set(t, { group, text: value });
    owners.set(group, t);
    t.nodeValue = '';
    touched = true;
  }
  if (touched || !h.hasAttribute('aria-label')) {
    h.dataset.hxSeed = String(seed);
    h.setAttribute('aria-label', labelOf(h));
  }
  h.classList.add('hx-on');
}

/** Visible words of a split heading, for screen readers. */
function labelOf(h: HTMLElement): string {
  let out = '';
  const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      if ((n as Element).tagName === 'BR') out += ' ';
      continue;
    }
    const t = n as Text;
    const s = splits.get(t);
    if (s) out += s.text;
    else if (!t.parentElement?.closest('.hx')) out += t.nodeValue ?? '';
  }
  return out.replace(/\s+/g, ' ').trim();
}

/** Drop letter groups whose source text React removed. */
function sweepOrphans(root: ParentNode) {
  root.querySelectorAll<HTMLSpanElement>('span.hx').forEach((g) => {
    const t = owners.get(g);
    if (!t || !t.isConnected) g.remove();
  });
}

function scan() {
  document.querySelectorAll<HTMLElement>(HEADINGS).forEach(splitHeading);
}

/* ---------------- electric arcs ---------------- */

type Bolt = { pts: Array<[number, number]>; life: number; max: number; color: string; width: number };

function boltPath(x1: number, y1: number, x2: number, y2: number, rough: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x1, y1]];
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const steps = Math.max(4, Math.round(len / 14));
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < steps; i += 1) {
    const f = i / steps;
    const j = (Math.random() - 0.5) * rough * Math.sin(Math.PI * f) * 2;
    pts.push([x1 + dx * f + nx * j, y1 + dy * f + ny * j]);
  }
  pts.push([x2, y2]);
  return pts;
}

export function HeadingFX({ reduced }: { reduced: boolean }) {
  const { pathname } = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Split headings now and whenever the page changes. */
  useEffect(() => {
    if (reduced) return;
    let timer = 0;
    const run = () => {
      timer = 0;
      sweepOrphans(document);
      scan();
    };
    run();
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') {
          const t = r.target as Text;
          if (splits.has(t) && t.nodeValue) {
            const h = t.parentElement?.closest<HTMLElement>(HEADINGS);
            if (h) splitHeading(h);
          }
        }
      }
      if (!timer) timer = window.setTimeout(run, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      mo.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [pathname, reduced]);

  /* One fixed canvas draws the arcs over whichever headings are on screen. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (reduced || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target as HTMLElement);
        else visible.delete(e.target as HTMLElement);
      }
    });
    const watch = () => document.querySelectorAll<HTMLElement>('.hx-on').forEach((h) => io.observe(h));
    watch();
    const watchTimer = window.setInterval(watch, 1500);

    const bolts: Bolt[] = [];
    let raf = 0;
    let last = performance.now();
    let nextSpark = 0;
    const root = document.documentElement;

    const spark = () => {
      const list = Array.from(visible);
      if (!list.length) return;
      const h = list[Math.floor(Math.random() * list.length)];
      const letters = h.querySelectorAll<HTMLElement>('.hx-l');
      if (letters.length < 2) return;
      const a = Math.floor(Math.random() * letters.length);
      const span = 1 + Math.floor(Math.random() * Math.min(6, letters.length - 1));
      const b = Math.min(letters.length - 1, a + span);
      const ra = letters[a].getBoundingClientRect();
      const rb = letters[b === a ? Math.max(0, a - 1) : b].getBoundingClientRect();
      if (ra.bottom < 0 || ra.top > window.innerHeight) return;
      const x1 = ra.left + ra.width * Math.random();
      const y1 = ra.top + ra.height * (0.2 + Math.random() * 0.6);
      const x2 = rb.left + rb.width * Math.random();
      const y2 = rb.top + rb.height * (0.2 + Math.random() * 0.6);
      const color = Math.random() < 0.5 ? '#9ff3ff' : Math.random() < 0.5 ? '#ffffff' : '#ffd27a';
      const rough = Math.max(8, ra.height * 0.35);
      bolts.push({ pts: boltPath(x1, y1, x2, y2, rough), life: 0, max: 160 + Math.random() * 160, color, width: 1 + Math.random() * 1.6 });
      // A short fork now and then.
      if (Math.random() < 0.45) {
        const mid = bolts[bolts.length - 1].pts[Math.floor(bolts[bolts.length - 1].pts.length / 2)];
        bolts.push({
          pts: boltPath(mid[0], mid[1], mid[0] + (Math.random() - 0.5) * 60, mid[1] + (Math.random() - 0.3) * 50, rough * 0.6),
          life: 0,
          max: 120,
          color,
          width: 0.9,
        });
      }
      letters[a].classList.add('hx-zap');
      letters[b].classList.add('hx-zap');
      window.setTimeout(() => {
        letters[a].classList.remove('hx-zap');
        letters[b].classList.remove('hx-zap');
      }, 220);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - last);
      last = now;
      const beat = parseFloat(getComputedStyle(root).getPropertyValue('--beat')) || 0;
      const music = root.classList.contains('em-music-on');
      if (now > nextSpark) {
        spark();
        const base = music ? 260 - beat * 600 : 700;
        nextSpark = now + Math.max(70, base + Math.random() * 500);
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!bolts.length) return;
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      for (let i = bolts.length - 1; i >= 0; i -= 1) {
        const b = bolts[i];
        b.life += dt;
        if (b.life > b.max) {
          bolts.splice(i, 1);
          continue;
        }
        const f = 1 - b.life / b.max;
        const flicker = 0.55 + Math.random() * 0.45;
        if (Math.random() < 0.3) b.pts = b.pts.map(([x, y], k, arr) => (k === 0 || k === arr.length - 1 ? [x, y] : [x + (Math.random() - 0.5) * 3, y + (Math.random() - 0.5) * 3]));
        ctx.beginPath();
        b.pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.strokeStyle = b.color;
        ctx.globalAlpha = 0.25 * f * flicker;
        ctx.lineWidth = b.width * 6 * (1 + beat);
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.globalAlpha = f * flicker;
        ctx.lineWidth = b.width;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 12;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    };
    const start = () => {
      if (!raf && document.visibilityState === 'visible') {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.visibilityState === 'visible' ? start() : stop());
    document.addEventListener('visibilitychange', onVis);
    start();
    return () => {
      stop();
      io.disconnect();
      clearInterval(watchTimer);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [reduced, pathname]);

  if (reduced) return null;
  return <canvas ref={canvasRef} className="hx-arcs" aria-hidden="true" />;
}
