const STRIPE: Record<string, string> = {
  hoodie: 'https://buy.stripe.com/4gMfZh1GtbL86pi0VsbAs0W',
  tee: 'https://buy.stripe.com/00w9AT4SF4iG00UbA6bAs0X',
  cap: 'https://buy.stripe.com/5kQ8wP2Kx8yW292fQmbAs0Y',
  sticker: 'https://buy.stripe.com/00w6oHetf5mKfZS9rYbAs0Z',
  track: 'https://buy.stripe.com/6oUcN52Kx8yW14YcEabAs0T',
  monthly: 'https://buy.stripe.com/28EbJ15WJg1oeVO1ZwbAs0U',
  yearly: 'https://buy.stripe.com/28E6oH4SF6qO9Bu6fMbAs0V',
  sponsor: 'https://buy.stripe.com/00w14n70NaH414YeMibAs10',
};

import type { PagesEnv } from '../env';
import { createPayArmCookie } from '../lib/pay-arm';

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
  const url = new URL(request.url);
  const sku = (url.searchParams.get('sku') || '').toLowerCase();
  if (!sku) {
    const links = Object.fromEntries(
      Object.entries(STRIPE).map(([id, href]) => [
        id,
        { site: `https://3000studios.vip/api/pay?sku=${id}`, stripe: href },
      ]),
    );
    return new Response(JSON.stringify({ ok: true, processor: 'stripe', links }, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  const href = STRIPE[sku];
  if (!href) {
    return new Response(JSON.stringify({ ok: false, error: 'unknown sku', sku }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  // Arm the purchase return (audit P0-1): a signed, HttpOnly cookie is set
  // as the buyer leaves for Stripe. The success return (?paid=1) settles
  // only when /api/pay/session validates this arm server-side against the
  // pending purchase the buyer started — a bare ?paid=1 link grants nothing.
  const headers = new Headers({ location: href });
  const armCookie = await createPayArmCookie(
    { sku, slug: (url.searchParams.get('slug') || '').toLowerCase(), ts: Date.now() },
    env,
  ).catch(() => null);
  if (armCookie) headers.set('set-cookie', armCookie);
  return new Response(null, { status: 302, headers });
};
