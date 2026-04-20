export type AudioPrefs = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
};

const KEY = 'apex_citadel_prefs_v1';

export function loadAudioPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    const v = JSON.parse(raw) as Partial<AudioPrefs>;
    return {
      musicEnabled: Boolean(v.musicEnabled),
      sfxEnabled: Boolean(v.sfxEnabled),
      musicVolume: clampNumber(v.musicVolume, 0.2),
      sfxVolume: clampNumber(v.sfxVolume, 0.35),
    };
  } catch {
    return defaults();
  }
}

export function saveAudioPrefs(p: AudioPrefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

function defaults(): AudioPrefs {
  return { musicEnabled: false, sfxEnabled: false, musicVolume: 0.2, sfxVolume: 0.35 };
}

function clampNumber(v: unknown, fallback: number) {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fallback;
  return Math.max(0, Math.min(1, n));
}

