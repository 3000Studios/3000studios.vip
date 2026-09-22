import { describe, expect, it } from 'vitest';
import { frameFromByteFrequency } from './audioAnalyzer';

describe('audioAnalyzer', () => {
  it('normalizes byte bins', () => {
    const data = new Uint8Array([255, 128, 0, 64, 32]);
    const f = frameFromByteFrequency(data);
    expect(f.bass).toBeGreaterThanOrEqual(0);
    expect(f.bass).toBeLessThanOrEqual(1);
    expect(f.spectrum).toHaveLength(5);
  });
});
