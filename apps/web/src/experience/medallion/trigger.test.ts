import { describe, expect, it } from 'vitest';
import { createFractureGate, resetFractureGate, shouldFireFracture } from './trigger';

describe('shouldFireFracture', () => {
  it('ignores bass chatter until a rising drop while playing', () => {
    const g = createFractureGate();
    expect(
      shouldFireFracture(g, { energy: 0.2, beat: 0.2, playing: true, enhanced: true, now: 1000 }),
    ).toBe(false);
    expect(
      shouldFireFracture(g, { energy: 0.72, beat: 0.66, playing: true, enhanced: true, now: 1080 }),
    ).toBe(true);
    expect(
      shouldFireFracture(g, { energy: 0.9, beat: 0.9, playing: true, enhanced: true, now: 2000 }),
    ).toBe(false);
  });

  it('does not fire when paused', () => {
    const g = createFractureGate();
    expect(
      shouldFireFracture(g, { energy: 0.9, beat: 0.9, playing: false, enhanced: true, now: 50 }),
    ).toBe(false);
  });

  it('can reset for a new sequence', () => {
    const g = createFractureGate();
    shouldFireFracture(g, { energy: 0.2, beat: 0.2, playing: true, enhanced: true, now: 0 });
    shouldFireFracture(g, { energy: 0.8, beat: 0.7, playing: true, enhanced: true, now: 40 });
    resetFractureGate(g);
    shouldFireFracture(g, { energy: 0.2, beat: 0.2, playing: true, enhanced: true, now: 80 });
    expect(
      shouldFireFracture(g, { energy: 0.8, beat: 0.7, playing: true, enhanced: true, now: 120 }),
    ).toBe(true);
  });
});
