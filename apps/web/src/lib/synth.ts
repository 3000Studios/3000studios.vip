type Mode = 'music' | 'sfx';

export class Synth {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  ensure() {
    if (this.ctx) return;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);

    const musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(master);

    const sfxGain = ctx.createGain();
    sfxGain.gain.value = 0;
    sfxGain.connect(master);

    this.ctx = ctx;
    this.musicGain = musicGain;
    this.sfxGain = sfxGain;
  }

  async resume() {
    this.ensure();
    if (!this.ctx) return;
    if (this.ctx.state !== 'running') await this.ctx.resume();
  }

  setVolumes(params: { musicEnabled: boolean; sfxEnabled: boolean; musicVolume: number; sfxVolume: number }) {
    this.ensure();
    if (!this.musicGain || !this.sfxGain) return;
    this.musicGain.gain.value = params.musicEnabled ? params.musicVolume : 0;
    this.sfxGain.gain.value = params.sfxEnabled ? params.sfxVolume : 0;
  }

  blip(mode: Mode, freq = 440, durationMs = 120) {
    this.ensure();
    if (!this.ctx) return;
    const gain = mode === 'music' ? this.musicGain : this.sfxGain;
    if (!gain) return;

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    g.gain.value = 0.0001;

    osc.connect(g);
    g.connect(gain);

    const t0 = this.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000 + 0.01);
  }

  startAmbientPulse(): () => void {
    this.ensure();
    if (!this.ctx || !this.musicGain) return () => {};

    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = 82.41; // E2
    g.gain.value = 0.0001;

    lfo.type = 'sine';
    lfo.frequency.value = 0.18;
    lfoGain.gain.value = 0.12;

    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);

    osc.connect(g);
    g.connect(this.musicGain);

    const t0 = this.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t0);
    osc.start();
    lfo.start();

    return () => {
      try {
        osc.stop();
        lfo.stop();
      } catch {
        // ignore
      }
    };
  }
}
