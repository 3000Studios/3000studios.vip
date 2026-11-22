import { describe, expect, it } from 'vitest';
import { qualitySettings, resolveQualityTier } from './quality';

describe('resolveQualityTier', () => {
  it('honors an explicit force', () => {
    expect(
      resolveQualityTier({
        forced: 'ULTRA',
        reducedMotion: true,
        saveData: true,
        cores: 2,
        deviceMemory: 2,
      }),
    ).toBe('ULTRA');
  });

  it('drops to LOW for reduced motion or save-data', () => {
    expect(
      resolveQualityTier({
        forced: null,
        reducedMotion: true,
        saveData: false,
        cores: 8,
        deviceMemory: 8,
      }),
    ).toBe('LOW');
  });

  it('keeps LOW at zero fragments', () => {
    expect(qualitySettings('LOW').fragments).toBe(0);
    expect(qualitySettings('LOW').dissolve).toBe(true);
    expect(qualitySettings('MEDIUM').fragments).toBe(24);
    expect(qualitySettings('HIGH').fragments).toBe(64);
    expect(qualitySettings('ULTRA').fragments).toBe(112);
  });

  it('uses MEDIUM on typical phones', () => {
    expect(
      resolveQualityTier({
        forced: null,
        reducedMotion: false,
        saveData: false,
        cores: 4,
        deviceMemory: 4,
      }),
    ).toBe('MEDIUM');
  });
});
