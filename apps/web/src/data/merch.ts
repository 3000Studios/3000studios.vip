export type MerchItem = {
  id: string;
  title: string;
  priceCents: number;
  kind: 'merch' | 'music' | 'plan' | 'sponsor';
  blurb: string;
  sku: string;
  image: string;
  stripe: string;
};

export const MERCH_ITEMS: MerchItem[] = [
  {
    id: 'hoodie',
    title: '3000 Signature Hoodie',
    priceCents: 4400,
    kind: 'merch',
    blurb: 'Black heavyweight. Gold mark.',
    sku: 'HOODIE-BLK',
    image: '/media/shop/hoodie.jpg',
    stripe: 'https://buy.stripe.com/4gMfZh1GtbL86pi0VsbAs0W',
  },
  {
    id: 'tee',
    title: '3000 Gold Tee',
    priceCents: 2400,
    kind: 'merch',
    blurb: 'Soft black tee. Circle logo.',
    sku: 'TEE-GLD',
    image: '/media/shop/tee.jpg',
    stripe: 'https://buy.stripe.com/00w9AT4SF4iG00UbA6bAs0X',
  },
  {
    id: 'cap',
    title: 'Velvet Rope Cap',
    priceCents: 2800,
    kind: 'merch',
    blurb: 'Low profile. Gold stitch.',
    sku: 'CAP-VEL',
    image: '/media/shop/cap.jpg',
    stripe: 'https://buy.stripe.com/5kQ8wP2Kx8yW292fQmbAs0Y',
  },
  {
    id: 'sticker',
    title: 'Studio Sticker Pack',
    priceCents: 800,
    kind: 'merch',
    blurb: 'Five official marks.',
    sku: 'STK-5',
    image: '/media/shop/sticker.jpg',
    stripe: 'https://buy.stripe.com/00w6oHetf5mKfZS9rYbAs0Z',
  },

  {
    id: 'monthly',
    title: 'Vault monthly',
    priceCents: 399,
    kind: 'plan',
    blurb: 'VIP Pass & stem downloads for 31 days.',
    sku: 'PLAN-MO',
    image: '/media/shop/monthly.jpg',
    stripe: 'https://buy.stripe.com/28EbJ15WJg1oeVO1ZwbAs0U',
  },
  {
    id: 'yearly',
    title: 'Vault yearly',
    priceCents: 1999,
    kind: 'plan',
    blurb: 'VIP Pass & stem downloads for 365 days.',
    sku: 'PLAN-YR',
    image: '/media/shop/yearly.jpg',
    stripe: 'https://buy.stripe.com/28E6oH4SF6qO9Bu6fMbAs0V',
  },
  {
    id: 'sponsor',
    title: 'Homepage sponsor slot',
    priceCents: 9900,
    kind: 'sponsor',
    blurb: 'Your brand on 3000studios.vip for 30 days.',
    sku: 'ADS-HOME',
    image: '/media/shop/sponsor.jpg',
    stripe: 'https://buy.stripe.com/00w14n70NaH414YeMibAs10',
  },
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
