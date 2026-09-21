import type { CostClass } from '../types.js';

export type WorkerOffer = {
  id: string;
  costClass: CostClass;
  available: boolean;
  reason?: string;
};

/** Pick the cheapest available worker. Level 0 (deterministic) always wins when available. */
export function selectCheapestWorker(offers: WorkerOffer[]): WorkerOffer {
  const available = offers.filter((o) => o.available);
  if (available.length === 0) {
    const first = offers[0];
    if (!first) throw new Error('No workers registered for task');
    return { ...first, available: false, reason: first.reason ?? 'no available worker' };
  }
  return [...available].sort((a, b) => a.costClass - b.costClass || a.id.localeCompare(b.id))[0];
}

export function costClassName(c: CostClass): string {
  return ['deterministic', 'local-ai', 'free-connected', 'premium-ai'][c] ?? String(c);
}
