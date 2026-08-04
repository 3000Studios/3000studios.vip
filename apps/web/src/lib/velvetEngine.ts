/**
 * Velvet Machine — audio-reactive CSS variables + anonymous listener signature.
 * Drives --beat, --energy, --warmth, --velvet-x/y sitewide from any playing audio.
 */

const SIGNATURE_KEY = '3000-listener-signature-v1';
const PREF_KEY = '3000-morph-pref-v1';

export type MorphScene = 'jazz' | 'remix';

export type ListenerSignature = {
  seed: number;
  jazzBias: number;
  liveAffinity: number;
  threads: number[];
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function buildThreads(seed: number, count = 7): number[] {
  const out: number[] = [];
  let s = seed || 1;
  for (let i = 0; i < count; i += 1) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    out.push((s % 1000) / 1000);
  }
  return out;
}

export function getListenerSignature(): ListenerSignature {
  try {
    const raw = localStorage.getItem(SIGNATURE_KEY);
    if (raw) return JSON.parse(raw) as ListenerSignature;
  } catch {
    /* ignore */
  }
  const seed = hashString(`${Date.now()}-${Math.random()}-${navigator.userAgent.slice(0, 40)}`);
  const sig: ListenerSignature = {
    seed,
    jazzBias: 0.5,
    liveAffinity: 0.15,
    threads: buildThreads(seed),
  };
  try {
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(sig));
  } catch {
    /* ignore */
  }
  return sig;
}

export function recordMorphPreference(scene: MorphScene) {
  try {
    localStorage.setItem(PREF_KEY, scene);
    const sig = getListenerSignature();
    sig.jazzBias = scene === 'jazz' ? Math.min(1, sig.jazzBias + 0.08) : Math.max(0, sig.jazzBias - 0.08);
    sig.threads = buildThreads(sig.seed ^ Math.floor(sig.jazzBias * 1000));
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(sig));
    applySignatureCss(sig);
  } catch {
    /* ignore */
  }
}

export function recordLivePresence(seconds = 30) {
  try {
    const sig = getListenerSignature();
    sig.liveAffinity = Math.min(1, sig.liveAffinity + seconds / 600);
    localStorage.setItem(SIGNATURE_KEY, JSON.stringify(sig));
    applySignatureCss(sig);
  } catch {
    /* ignore */
  }
}

export function applySignatureCss(sig = getListenerSignature()) {
  const root = document.documentElement;
  root.style.setProperty('--sig-seed', String(sig.seed % 360));
  root.style.setProperty('--sig-jazz', sig.jazzBias.toFixed(3));
  root.style.setProperty('--sig-live', sig.liveAffinity.toFixed(3));
  sig.threads.forEach((t, i) => {
    root.style.setProperty(`--sig-t${i}`, t.toFixed(3));
  });
}

export function setScene(scene: MorphScene) {
  document.documentElement.dataset.velvetScene = scene;
  document.documentElement.style.setProperty('--warmth', scene === 'jazz' ? '0.72' : '0.28');
  recordMorphPreference(scene);
}

class BeatEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private data: Uint8Array | null = null;
  private raf = 0;
  private attachedEl: HTMLAudioElement | null = null;
  private reduced =
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  attach(audio: HTMLAudioElement) {
    if (this.reduced || !audio) return;
    if (this.attachedEl === audio && this.analyser) return;
    this.detach();
    this.attachedEl = audio;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.source = this.ctx.createMediaElementSource(audio);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.82;
      this.source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.data = new Uint8Array(this.analyser.frequencyBinCount);
      const tick = () => {
        if (!this.analyser || !this.data) return;
        this.analyser.getByteFrequencyData(this.data);
        const bins = this.data;
        let sum = 0;
        let bass = 0;
        const third = Math.floor(bins.length / 3);
        for (let i = 0; i < bins.length; i += 1) {
          sum += bins[i];
          if (i < third) bass += bins[i];
        }
        const beat = sum / bins.length / 255;
        const energy = bass / third / 255;
        const root = document.documentElement;
        root.style.setProperty('--beat', beat.toFixed(3));
        root.style.setProperty('--energy', energy.toFixed(3));
        this.raf = requestAnimationFrame(tick);
      };
      this.raf = requestAnimationFrame(tick);
      void this.ctx.resume().catch(() => undefined);
    } catch {
      /* autoplay / CORS / already connected */
    }
  }

  detach() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    try {
      this.source?.disconnect();
      this.analyser?.disconnect();
      void this.ctx?.close();
    } catch {
      /* ignore */
    }
    this.source = null;
    this.analyser = null;
    this.ctx = null;
    this.data = null;
    this.attachedEl = null;
  }
}

export const beatEngine = new BeatEngine();

export function initVelvetMachine() {
  if (typeof document === 'undefined') return;
  applySignatureCss();
  const scene = (localStorage.getItem(PREF_KEY) as MorphScene | null) || 'jazz';
  setScene(scene);

  const onMove = (e: PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    document.documentElement.style.setProperty('--velvet-x', `${x.toFixed(2)}%`);
    document.documentElement.style.setProperty('--velvet-y', `${y.toFixed(2)}%`);
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  // Feature morph / track plays drive full-site scene grade
  window.addEventListener('3000-play-track', ((e: CustomEvent<{ src?: string; title?: string }>) => {
    const title = (e.detail?.title || '').toLowerCase();
    const src = (e.detail?.src || '').toLowerCase();
    if (title.includes('remix') || src.includes('remix')) setScene('remix');
    else if (title.includes('jazz') || src.includes('jazz')) setScene('jazz');
  }) as EventListener);

  const tryAttach = () => {
    const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[];
    const playing = audios.find((a) => !a.paused && !a.muted);
    if (playing) beatEngine.attach(playing);
  };
  document.addEventListener(
    'play',
    (e) => {
      const t = e.target;
      if (t instanceof HTMLAudioElement) beatEngine.attach(t);
    },
    true,
  );
  window.setInterval(tryAttach, 4000);
  tryAttach();
}
