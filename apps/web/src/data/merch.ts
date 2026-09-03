export type MerchItem = {
  id: string;
  title: string;
  priceCents: number;
  kind: 'merch' | 'music' | 'plan' | 'sponsor';
  blurb: string;
  sku: string;
};

export const MERCH_ITEMS: MerchItem[] = [
  { id: 'hoodie', title: '3000 Signature Hoodie', priceCents: 4400, kind: 'merch', blurb: 'Black heavyweight. Gold mark.', sku: 'HOODIE-BLK' },
  { id: 'tee', title: '3000 Gold Tee', priceCents: 2400, kind: 'merch', blurb: 'Soft black tee. Circle logo.', sku: 'TEE-GLD' },
  { id: 'cap', title: 'Velvet Rope Cap', priceCents: 2800, kind: 'merch', blurb: 'Low profile. Gold stitch.', sku: 'CAP-VEL' },
  { id: 'sticker', title: 'Studio Sticker Pack', priceCents: 800, kind: 'merch', blurb: 'Five official marks.', sku: 'STK-5' },
  { id: 'track', title: 'Any official track', priceCents: 99, kind: 'music', blurb: 'Full song unlock. 30s sample is free.', sku: 'TRK-001' },
  { id: 'monthly', title: 'Vault monthly', priceCents: 399, kind: 'plan', blurb: 'Unlock every sample for 31 days.', sku: 'PLAN-MO' },
  { id: 'yearly', title: 'Vault yearly', priceCents: 1999, kind: 'plan', blurb: 'Unlock every sample for 365 days.', sku: 'PLAN-YR' },
  { id: 'sponsor', title: 'Homepage sponsor slot', priceCents: 9900, kind: 'sponsor', blurb: 'Your brand on 3000studios.vip for 30 days.', sku: 'ADS-HOME' },
];

export function paypalBuyUrl(item: MerchItem) {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: 'mr.jwswain@gmail.com',
    item_name: `${item.title} · 3000 Studios`,
    item_number: item.sku,
    amount: (item.priceCents / 100).toFixed(2),
    currency_code: 'USD',
    no_shipping: item.kind === 'merch' ? '0' : '1',
    return: 'https://3000studios.vip/shop?paid=1',
    cancel_return: 'https://3000studios.vip/shop',
  });
  return `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`;
}
