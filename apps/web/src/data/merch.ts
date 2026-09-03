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
    image: 'https://pixabay.com/get/g3903e2e66d07975998fd880bb899289531f6b82842473f043a934175ed0707a8d07c624fc8929fd975b4853b77ecdf722400f3f3147f03c298e9df5ad4f5bcd8_1280.jpg',
    stripe: 'https://buy.stripe.com/4gMfZh1GtbL86pi0VsbAs0W',
  },
  {
    id: 'tee',
    title: '3000 Gold Tee',
    priceCents: 2400,
    kind: 'merch',
    blurb: 'Soft black tee. Circle logo.',
    sku: 'TEE-GLD',
    image: 'https://pixabay.com/get/ga815b0505071b56909892188df63a4cb34474ca175be20aa92db2bca53a00b63d80d3b143f03bc5560ce824965a1704d8d6e53fa5f28652cee75ac700175805b_1280.jpg',
    stripe: 'https://buy.stripe.com/00w9AT4SF4iG00UbA6bAs0X',
  },
  {
    id: 'cap',
    title: 'Velvet Rope Cap',
    priceCents: 2800,
    kind: 'merch',
    blurb: 'Low profile. Gold stitch.',
    sku: 'CAP-VEL',
    image: 'https://pixabay.com/get/g93b73862d7d1a67b1a19d27ef32d3ba4abc8ced3042bc2583628355b9a6254006f177d1ebb205e18809261532b4cab4fad086a66f51757664e759c6f09b93d2c_1280.jpg',
    stripe: 'https://buy.stripe.com/5kQ8wP2Kx8yW292fQmbAs0Y',
  },
  {
    id: 'sticker',
    title: 'Studio Sticker Pack',
    priceCents: 800,
    kind: 'merch',
    blurb: 'Five official marks.',
    sku: 'STK-5',
    image: 'https://pixabay.com/get/g0456505ee1cb4cf2bc4dc4109b6d1bfa0ff4df77cd8e8ccfbb18f04e152a140fab7832f5d39f95f4e380fa269c4582231eda6a859864fbd8aa1d6730fa7cb1fd_1280.jpg',
    stripe: 'https://buy.stripe.com/00w6oHetf5mKfZS9rYbAs0Z',
  },
  {
    id: 'track',
    title: 'Any official track',
    priceCents: 99,
    kind: 'music',
    blurb: 'Full song unlock. 30s sample is free.',
    sku: 'TRK-001',
    image: 'https://pixabay.com/get/g745a3ab6cbcad934b2f22c73b1395e9c9a3688ff346db9d3a9b37c5fadedfc8a66b74220326bda30a5d03b38ec675aa51d61d186b7923cf021798c0ddb538658_1280.jpg',
    stripe: 'https://buy.stripe.com/6oUcN52Kx8yW14YcEabAs0T',
  },
  {
    id: 'monthly',
    title: 'Vault monthly',
    priceCents: 399,
    kind: 'plan',
    blurb: 'Unlock every sample for 31 days.',
    sku: 'PLAN-MO',
    image: 'https://pixabay.com/get/g05f7133a8f372ec39178638039f972966af9fe6a235d20a5fa97db10b8899904ce2cb6ce6ce1a8226dbeae8a29234c7b4b876cc60568ebcb41be2cde5aa623d3_1280.jpg',
    stripe: 'https://buy.stripe.com/28EbJ15WJg1oeVO1ZwbAs0U',
  },
  {
    id: 'yearly',
    title: 'Vault yearly',
    priceCents: 1999,
    kind: 'plan',
    blurb: 'Unlock every sample for 365 days.',
    sku: 'PLAN-YR',
    image: 'https://pixabay.com/get/g3119d265a729c7b7211002a004112f46f8994d2b9eb5c4506399d5d184b87b106bcf848d2f473d7b0779ead9a21ef73ca310f21752d0c936fc37c34301c136b6_1280.jpg',
    stripe: 'https://buy.stripe.com/28E6oH4SF6qO9Bu6fMbAs0V',
  },
  {
    id: 'sponsor',
    title: 'Homepage sponsor slot',
    priceCents: 9900,
    kind: 'sponsor',
    blurb: 'Your brand on 3000studios.vip for 30 days.',
    sku: 'ADS-HOME',
    image: 'https://pixabay.com/get/gd1b9d21baa0e28753e352bba9fd3d0209e7e3199a4791c06d1a16765eeaba647d738fa46bde2e024db918ae42d5877a3e398c1f8a788f7a8a9761e862da5bffd_1280.jpg',
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
