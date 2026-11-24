/**
 * Tiny WebAudio click sounds: synthesized, so no audio files to download.
 * The AudioContext is created on the first user gesture only (autoplay
 * policy), and the sound can be muted; the choice is remembered.
 */
const KEY = 'em-sfx';
let ctx: AudioContext | null = null;
let enabled = readPref();

function readPref(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function isSfxOn(): boolean {
  return enabled;
}

export function setSfxOn(on: boolean): void {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* storage blocked: keep the in-memory choice */
  }
  window.dispatchEvent(new CustomEvent('em-sfx', { detail: on }));
}

export type SfxKind = 'tap' | 'nav' | 'open' | 'close' | 'hover' | 'glass';

const TONES: Record<SfxKind, { f0: number; f1: number; dur: number; type: OscillatorType; gain: number }> = {
  tap: { f0: 1180, f1: 760, dur: 0.07, type: 'triangle', gain: 0.05 },
  nav: { f0: 520, f1: 1040, dur: 0.11, type: 'sine', gain: 0.06 },
  open: { f0: 220, f1: 880, dur: 0.26, type: 'sawtooth', gain: 0.025 },
  close: { f0: 880, f1: 240, dur: 0.2, type: 'sawtooth', gain: 0.022 },
  hover: { f0: 900, f1: 1500, dur: 0.06, type: 'sine', gain: 0.035 },
  glass: { f0: 3400, f1: 2100, dur: 0.18, type: 'triangle', gain: 0.03 },
};

/** Short filtered noise burst: the crunch of breaking glass. */
function glassCrunch(c: AudioContext, now: number): void {
  const len = Math.floor(c.sampleRate * 0.16);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) {
    const env = Math.pow(1 - i / len, 3);
    data[i] = (Math.random() * 2 - 1) * env * (Math.random() < 0.08 ? 1 : 0.35);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const hp = c.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 2400;
  const amp = c.createGain();
  amp.gain.value = 0.09;
  src.connect(hp).connect(amp).connect(c.destination);
  src.start(now);
}

/** Hover sound: plays only once audio has been unlocked by a tap. */
export function playHover(pitch = 1): void {
  if (!ctx || ctx.state !== 'running') return;
  playSfx('hover', pitch);
}

/** Call only from inside a user-gesture handler. */
export function playSfx(kind: SfxKind, pitch = 1): void {
  if (!enabled) return;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      ctx = new Ctor();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    const t = TONES[kind];
    const now = ctx.currentTime;
    if (kind === 'glass') glassCrunch(ctx, now);
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;
    osc.type = t.type;
    osc.frequency.setValueAtTime(t.f0 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(t.f1 * pitch, now + t.dur);
    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(t.gain, now + 0.008);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + t.dur);
    osc.connect(filter).connect(amp).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + t.dur + 0.02);
  } catch {
    /* audio unavailable: stay silent */
  }
}
