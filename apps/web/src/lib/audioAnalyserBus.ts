/**
 * Shared audio analyser bus.
 *
 * The site's global music player (GlobalMusic) owns the single
 * MediaElementAudioSourceNode -> AnalyserNode chain for its <audio>
 * element (an audio element can only be tapped once). It publishes the
 * analyser here so visual components — like the hero CircularEQ — can
 * render true music-reactive visuals from the actual playing track.
 *
 * When nothing is published (no track playing yet), visuals fall back
 * to an ambient simulated groove.
 */

let analyser: AnalyserNode | null = null;

export function publishAnalyser(a: AnalyserNode | null): void {
  analyser = a;
}

export function getAnalyser(): AnalyserNode | null {
  return analyser;
}
