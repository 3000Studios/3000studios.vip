/**
 * GET /api/pay/session — server-side check of the checkout arm cookie.
 *
 * The client calls this on a Stripe success return (?paid=1) before any
 * entitlement settles. { ok:false } means: no grant. See lib/pay-arm.ts
 * for exactly what the arm does and does not prove.
 */
import type { PagesEnv } from '../../env';
import { payArmConfigured, readPayArm } from '../../lib/pay-arm';

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  };
  if (!payArmConfigured(env)) {
    return new Response(JSON.stringify({ ok: false, reason: 'arm_not_configured' }), {
      headers,
    });
  }
  const arm = await readPayArm(request, env);
  if (!arm) {
    return new Response(JSON.stringify({ ok: false, reason: 'no_valid_arm' }), { headers });
  }
  return new Response(
    JSON.stringify({ ok: true, sku: arm.sku, slug: arm.slug, ts: arm.ts }),
    { headers },
  );
};
