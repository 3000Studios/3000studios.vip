export type QualityTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export type QualityHints = {
  forced?: string | null;
  reducedMotion: boolean;
  saveData: boolean;
  cores: number;
  deviceMemory: number;
};

export function resolveQualityTier(hints: QualityHints): QualityTier {
  const forced = (hints.forced || '').toUpperCase();
  if (forced === 'LOW' || forced === 'MEDIUM' || forced === 'HIGH' || forced === 'ULTRA') {
    return forced;
  }
  if (hints.reducedMotion || hints.saveData || hints.cores <= 2 || hints.deviceMemory <= 2) {
    return 'LOW';
  }
  if (hints.cores <= 4 || hints.deviceMemory <= 4) return 'MEDIUM';
  if (hints.cores >= 8 && hints.deviceMemory >= 8) return 'HIGH';
  return 'MEDIUM';
}

export function detectQualityTier(): QualityTier {
  if (typeof navigator === 'undefined') return 'MEDIUM';
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const reduced =
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  let forced: string | null = null;
  try {
    forced = localStorage.getItem('3000-quality');
  } catch {
    forced = null;
  }
  return resolveQualityTier({
    forced,
    reducedMotion: reduced,
    saveData: Boolean(nav.connection?.saveData),
    cores: nav.hardwareConcurrency || 4,
    deviceMemory: nav.deviceMemory || 4,
  });
}

export function qualitySettings(tier: QualityTier) {
  switch (tier) {
    case 'LOW':
      return { dpr: 1, particles: 0, physical: false, shadows: false };
    case 'MEDIUM':
      return { dpr: 1.15, particles: 28, physical: true, shadows: false };
    case 'HIGH':
      return { dpr: 1.5, particles: 72, physical: true, shadows: false };
    case 'ULTRA':
      return { dpr: 2, particles: 140, physical: true, shadows: true };
    default:
      return { dpr: 1.15, particles: 28, physical: true, shadows: false };
  }
}
