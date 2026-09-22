export type AnalyzerFrame = {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  beat: number;
  waveform: number[];
  spectrum: number[];
};

export function frameFromByteFrequency(data: Uint8Array): AnalyzerFrame {
  const n = data.length || 1;
  const at = (a: number, b: number) => {
    let s = 0;
    let c = 0;
    const start = Math.floor(a * n);
    const end = Math.floor(b * n);
    for (let i = start; i < end; i++) {
      s += data[i] / 255;
      c++;
    }
    return c ? s / c : 0;
  };
  const bass = at(0, 0.12);
  const mid = at(0.12, 0.45);
  const treble = at(0.45, 1);
  const energy = (bass + mid + treble) / 3;
  const spectrum = Array.from(data, (v) => v / 255);
  return {
    bass,
    mid,
    treble,
    energy,
    beat: bass * 0.7 + energy * 0.3,
    waveform: spectrum.slice(0, 32),
    spectrum,
  };
}
