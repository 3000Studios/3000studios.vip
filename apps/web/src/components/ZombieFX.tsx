import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const TARGET_SEL = '.studioButton, .vipNavLink, .vipNavCta, .morphBtn, .liveInquiryBtn';
const HOVER_SEL = '.studioButton, .vipNavCta, .liveInquiryBtn, .morphBtn';
const SUCK_MS = 720;
const RESTORE_MS = 2000;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function playZombieGrowl() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(55, now);
  osc.frequency.exponentialRampToValueAtTime(28, now + 0.55);
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(420, now);
  filter.frequency.exponentialRampToValueAtTime(90, now + 0.6);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.72);

  const bufferSize = Math.floor(ctx.sampleRate * 0.45);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const nGain = ctx.createGain();
  const nFilter = ctx.createBiquadFilter();
  nFilter.type = 'bandpass';
  nFilter.frequency.value = 180;
  nFilter.Q.value = 0.8;
  nGain.gain.setValueAtTime(0.18, now);
  nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  noise.connect(nFilter);
  nFilter.connect(nGain);
  nGain.connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.5);

  window.setTimeout(() => void ctx.close(), 900);
}

function spawnDustCloud(x: number, y: number) {
  const layer = document.querySelector('.zombieFxLayer');
  if (!layer) return;
  const cloud = document.createElement('div');
  cloud.className = 'zombieDustCloud';
  cloud.style.left = `${x}px`;
  cloud.style.top = `${y}px`;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'zombieDustParticle';
    const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
    const dist = 40 + Math.random() * 90;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.setProperty('--delay', `${Math.random() * 80}ms`);
    p.style.setProperty('--size', `${4 + Math.random() * 10}px`);
    cloud.appendChild(p);
  }
  layer.appendChild(cloud);
  window.setTimeout(() => cloud.remove(), 1400);
}

const HAND_SVG = `<svg viewBox="0 0 64 64" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M18 38c-2-8 2-18 8-22 2-1 4 1 3 3-1 3-2 7 0 10 1 2 4 1 4-1 0-6 1-12 4-16 2-2 5 0 4 3-1 5-1 11 1 15 1 2 4 2 4 0 1-5 3-10 7-12 3-1 5 2 3 4-3 4-4 10-3 15 1 3 0 6-2 8-4 5-12 8-20 7-7-1-12-5-13-14z" fill="#3d5c3a"/>
  <path d="M22 40c2 6 8 10 15 10 6 0 11-3 13-8" stroke="#1a2e18" stroke-width="2" stroke-linecap="round"/>
  <circle cx="26" cy="28" r="1.5" fill="#1a2e18"/>
  <circle cx="34" cy="24" r="1.5" fill="#1a2e18"/>
  <circle cx="42" cy="26" r="1.5" fill="#1a2e18"/>
  <path d="M20 44c4 2 10 3 16 2" stroke="#6b8f5e" stroke-width="1.5" opacity=".6"/>
</svg>`;

function attachHands(el: HTMLElement) {
  if (el.querySelector('.zombieHands')) return;
  const wrap = document.createElement('span');
  wrap.className = 'zombieHands';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML = `
    <span class="zombieHand zombieHand--tl">${HAND_SVG}</span>
    <span class="zombieHand zombieHand--tr">${HAND_SVG}</span>
    <span class="zombieHand zombieHand--bl">${HAND_SVG}</span>
    <span class="zombieHand zombieHand--br">${HAND_SVG}</span>
  `;
  el.classList.add('zombie-hand-host');
  el.appendChild(wrap);
}

function detachHands(el: HTMLElement) {
  el.querySelector('.zombieHands')?.remove();
  el.classList.remove('zombie-hand-host');
}

export function ZombieFX() {
  const navigate = useNavigate();
  const busy = useRef(new WeakSet<Element>());

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const skip = (el: HTMLElement | null) =>
      Boolean(
        el?.closest(
          '.ytSubModal, .ytSubModalScrim, .ytSubFab, .ytSubBanner, .ytPerkSafe, .adminUnlockBtn, .adminFab, form, .gpCollapseBtn',
        ),
      );

    const onEnter = (e: Event) => {
      const t = (e.target as Element | null)?.closest?.(HOVER_SEL) as HTMLElement | null;
      if (!t || busy.current.has(t) || skip(t)) return;
      attachHands(t);
    };
    const onLeave = (e: Event) => {
      const me = e as MouseEvent;
      const t = (e.target as Element | null)?.closest?.(HOVER_SEL) as HTMLElement | null;
      if (!t || skip(t)) return;
      const related = me.relatedTarget as Node | null;
      if (related && t.contains(related)) return;
      detachHands(t);
    };

    const onClick = (e: MouseEvent) => {
      const t = (e.target as Element | null)?.closest?.(TARGET_SEL) as HTMLElement | null;
      if (!t || busy.current.has(t) || skip(t)) return;

      busy.current.add(t);
      const rect = t.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const suckX = window.innerWidth / 2 - cx;
      const suckY = window.innerHeight / 2 - cy;

      const isAnchor = t.tagName === 'A' || t.classList.contains('vipNavLink');
      const href = isAnchor ? t.getAttribute('href') : null;
      const isInternal = Boolean(href && href.startsWith('/') && !href.startsWith('//'));
      const isExternal = Boolean(href && (/^https?:/i.test(href) || href.startsWith('mailto:')));

      if (isInternal || (isAnchor && href && !isExternal)) {
        e.preventDefault();
        e.stopPropagation();
      }

      t.style.setProperty('--suck-x', `${suckX}px`);
      t.style.setProperty('--suck-y', `${suckY}px`);
      t.classList.add('zombie-sucking');
      detachHands(t);
      attachHands(t);
      playZombieGrowl();
      spawnDustCloud(cx, cy);
      document.documentElement.classList.add('zombie-dust-warp');
      window.dispatchEvent(
        new CustomEvent('3000-zombie-dust', {
          detail: { x: cx / window.innerWidth, y: cy / window.innerHeight },
        }),
      );

      window.setTimeout(() => {
        t.classList.add('zombie-vanished');
        t.classList.remove('zombie-sucking');
        detachHands(t);
        document.documentElement.classList.remove('zombie-dust-warp');

        if (isInternal && href) {
          navigate(href);
        } else if (isExternal && href) {
          if (href.startsWith('mailto:')) {
            window.location.href = href;
          } else {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      }, SUCK_MS);

      window.setTimeout(() => {
        t.classList.remove('zombie-vanished');
        t.style.removeProperty('--suck-x');
        t.style.removeProperty('--suck-y');
        busy.current.delete(t);
      }, RESTORE_MS);
    };

    document.addEventListener('mouseover', onEnter, true);
    document.addEventListener('mouseout', onLeave, true);
    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('mouseover', onEnter, true);
      document.removeEventListener('mouseout', onLeave, true);
      document.removeEventListener('click', onClick, true);
      document.documentElement.classList.remove('zombie-dust-warp');
    };
  }, [navigate]);

  return <div className="zombieFxLayer" aria-hidden="true" />;
}
