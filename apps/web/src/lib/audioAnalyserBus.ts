/**
 * Shared audio analyser bus.
 *
 * The site's global music player (GlobalMusic) owns the single
 * MediaElementAudioSourceNode -> AnalyserNode chain for its <audio>
 * element (an audio element can only be tapped once). It publishes the
 * analyser here so visual components — like the EQ live wallpaper —
 * can render true music-reactive visuals from the actual playing track.
 *
 * When nothing is published (no track playing yet), visuals should fall
 * back to an ambient simulated groove.
 */

let analyser: AnalyserNode | null = null;
const listeners = new Set<() => void>();

export function publishAnalyser(a: AnalyserNode | null): void {
  analyser = a;
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore listener errors */
    }
  });
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}

export function subscribeAnalyser(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
