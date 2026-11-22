export type AnalyzerFrame = {
  bass: number;
  mid: number;
  treble: number;
  energy: number;
  beat: number;
  waveform: number[];
  spectrum: number[];
};

export function normalizeBands(spectrum: number[]): AnalyzerFrame {
  const n = spectrum.length || 1;
  const slice = (a: number, b: number) => {
    const s = spectrum.slice(Math.floor(a * n), Math.floor(b * n));
    if (!s.length) return 0;
    return s.reduce((x, y) => x + y, 0) / s.length;
  };
  const bass = clamp01(slice(0, 0.12));
  const mid = clamp01(slice(0.12, 0.45));
  const treble = clamp01(slice(0.45, 1));
  const energy = clamp01((bass + mid + treble) / 3);
  const beat = clamp01(bass * 0.7 + energy * 0.3);
  return {
    bass,
    mid,
    treble,
    energy,
    beat,
    waveform: spectrum.slice(0, 32).map(clamp01),
    spectrum: spectrum.map(clamp01),
  };
}

function clamp01(v: number) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(1, Math.max(0, v));
}
