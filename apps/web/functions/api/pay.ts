const CATALOG: Record<string, { name: string; amount: string; sku: string; shipping: '0' | '1' | '2' }> = {
  hoodie: { name: '3000 Signature Hoodie', amount: '44.00', sku: 'HOODIE-BLK', shipping: '0' },
  tee: { name: '3000 Gold Tee', amount: '24.00', sku: 'TEE-GLD', shipping: '0' },
  cap: { name: 'Velvet Rope Cap', amount: '28.00', sku: 'CAP-VEL', shipping: '0' },
  sticker: { name: 'Studio Sticker Pack', amount: '8.00', sku: 'STK-5', shipping: '2' },
  track: { name: 'Official track unlock', amount: '0.99', sku: 'TRK-001', shipping: '1' },
  monthly: { name: 'Vault monthly', amount: '3.99', sku: 'PLAN-MO', shipping: '1' },
  yearly: { name: 'Vault yearly', amount: '19.99', sku: 'PLAN-YR', shipping: '1' },
  sponsor: { name: 'Homepage sponsor slot', amount: '99.00', sku: 'ADS-HOME', shipping: '1' },
};

function paypalUrl(item: (typeof CATALOG)[string]) {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: 'mr.jwswain@gmail.com',
    item_name: `${item.name} · 3000 Studios`,
    item_number: item.sku,
    amount: item.amount,
    currency_code: 'USD',
    no_shipping: item.shipping,
    return: 'https://3000studios.vip/shop?paid=1',
    cancel_return: 'https://3000studios.vip/shop',
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}

export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url);
  const sku = (url.searchParams.get('sku') || '').toLowerCase();
  if (!sku) {
    const links = Object.fromEntries(
      Object.entries(CATALOG).map(([id, item]) => [
        id,
        { name: item.name, amount: item.amount, site: `https://3000studios.vip/api/pay?sku=${id}`, paypal: paypalUrl(item) },
      ]),
    );
    return new Response(JSON.stringify({ ok: true, processor: 'paypal', links }, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
  const item = CATALOG[sku];
  if (!item) {
    return new Response(JSON.stringify({ ok: false, error: 'unknown sku', sku }), {
      status: 404,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
  return Response.redirect(paypalUrl(item), 302);
};
