let audioCtx: AudioContext | null = null;

function ctx() {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

export function playSwoosh(dir: 'fwd' | 'rev') {
  try {
    const ac = ctx();
    if (ac.state === 'suspended') void ac.resume();
    const o = ac.createOscillator();
    const g = ac.createGain();
    const f = ac.createBiquadFilter();
    o.type = 'sawtooth';
    f.type = 'lowpass';
    const t = ac.currentTime;
    if (dir === 'fwd') {
      o.frequency.setValueAtTime(420, t);
      o.frequency.exponentialRampToValueAtTime(140, t + 0.22);
    } else {
      o.frequency.setValueAtTime(140, t);
      o.frequency.exponentialRampToValueAtTime(480, t + 0.22);
    }
    f.frequency.setValueAtTime(1800, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    o.connect(f);
    f.connect(g);
    g.connect(ac.destination);
    o.start(t);
    o.stop(t + 0.26);
  } catch {
    /* ignore autoplay block until first gesture */
  }
}
