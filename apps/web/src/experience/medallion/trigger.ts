export type FractureGate = {
  fired: boolean;
  lastEnergy: number;
  lastFireAt: number;
};

export function createFractureGate(): FractureGate {
  return { fired: false, lastEnergy: 0, lastFireAt: 0 };
}

/** One cinematic fracture per sequence. Needs a rising energy transient, not every bass tick. */
export function shouldFireFracture(
  gate: FractureGate,
  sample: { energy: number; beat: number; playing: boolean; enhanced: boolean; now: number },
  cooldownMs = 14000,
): boolean {
  if (gate.fired) return false;
  if (!sample.playing || !sample.enhanced) {
    gate.lastEnergy = sample.energy;
    return false;
  }
  const rise = sample.energy - gate.lastEnergy;
  gate.lastEnergy = sample.energy;
  if (gate.lastFireAt > 0 && sample.now - gate.lastFireAt < cooldownMs) return false;
  const drop = sample.energy >= 0.58 && sample.beat >= 0.5 && rise >= 0.11;
  if (!drop) return false;
  gate.fired = true;
  gate.lastFireAt = sample.now;
  return true;
}

export function resetFractureGate(gate: FractureGate) {
  gate.fired = false;
  gate.lastEnergy = 0;
  gate.lastFireAt = 0;
}
