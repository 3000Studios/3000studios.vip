import type { AnalyzerFrame } from '../../lib/audioAnalyzer';

export type MedallionRuntime = {
  pointerX: number;
  pointerY: number;
  scroll: number;
  playing: boolean;
  enhanced: boolean;
  audio: Pick<AnalyzerFrame, 'bass' | 'mid' | 'treble' | 'energy' | 'beat'>;
};

export const medallionRuntime: MedallionRuntime = {
  pointerX: 0,
  pointerY: 0,
  scroll: 0,
  playing: false,
  enhanced: false,
  audio: { bass: 0, mid: 0, treble: 0, energy: 0, beat: 0 },
};

export function setMedallionPointer(nx: number, ny: number) {
  medallionRuntime.pointerX = nx;
  medallionRuntime.pointerY = ny;
}

export function setMedallionScroll(t: number) {
  medallionRuntime.scroll = Math.max(0, Math.min(1, t));
}

export function setMedallionAudio(frame: MedallionRuntime['audio'], playing: boolean) {
  medallionRuntime.audio = frame;
  medallionRuntime.playing = playing;
}

export function setMedallionEnhanced(on: boolean) {
  medallionRuntime.enhanced = on;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('is-cinematic-active', on);
  }
}
