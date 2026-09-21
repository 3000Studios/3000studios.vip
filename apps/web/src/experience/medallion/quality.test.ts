import { describe, expect, it } from 'vitest';
import { resolveQualityTier } from './quality';

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
