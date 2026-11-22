import type { WorkerOffer } from '../cost/router.js';

export function fallbackChain(offers: WorkerOffer[]): WorkerOffer[] {
  return [...offers];
}

export async function runWithFallback<T>(
  offers: WorkerOffer[],
  exec: (offer: WorkerOffer) => Promise<T>,
): Promise<{ result: T; used: WorkerOffer; attempts: string[] }> {
  const chain = fallbackChain(offers);
  const attempts: string[] = [];
  let lastError: unknown;
  for (const offer of chain) {
    if (!offer.available) {
      attempts.push(`${offer.id}:unavailable:${offer.reason ?? ''}`);
      continue;
    }
    try {
      const result = await exec(offer);
      attempts.push(`${offer.id}:ok`);
      return { result, used: offer, attempts };
    } catch (err) {
      lastError = err;
      attempts.push(`${offer.id}:fail:${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(`All workers failed: ${attempts.join(' | ')} | last=${String(lastError)}`);
}
