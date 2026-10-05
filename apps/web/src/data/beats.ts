/**
 * beats.ts — 3000 Studios digital instrumental catalog.
 *
 * Sold through the Shopify storefront (primary domain boughtitonline.com).
 * These are digital-only products: instant MP3 download after checkout.
 * Merch lives separately — see data/merch.ts and the /shop page.
 */

export type BeatItem = {
  id: string;
  title: string;
  handle: string;
  priceCents: number;
  kind: 'instrumental' | 'bundle';
  blurb: string;
};

export const BEAT_ITEMS: BeatItem[] = [
  {
    id: 'room-goes-cold',
    title: 'Room Goes Cold (Instrumental)',
    handle: 'room-goes-cold-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Cold-weather mood. Instant MP3 download.',
  },
  {
    id: 'not-giving-up-tonight',
    title: 'Not Giving Up Tonight (Instrumental)',
    handle: 'not-giving-up-tonight-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Late-night anthem energy. Instant MP3 download.',
  },
  {
    id: 'motel-television',
    title: 'Motel Television (Instrumental)',
    handle: 'motel-television-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Neon-noir roadside story. Instant MP3 download.',
  },
  {
    id: 'more-mass',
    title: 'More Mass (Instrumental)',
    handle: 'more-mass-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Heavyweight low end. Instant MP3 download.',
  },
  {
    id: 'midnight-haunt-dnb',
    title: 'Midnight Haunt Drum and Bass (Instrumental)',
    handle: 'midnight-haunt-drum-and-bass-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Breakneck drums, haunted keys. Instant MP3 download.',
  },
  {
    id: 'midnight-haunt',
    title: 'Midnight Haunt (Instrumental)',
    handle: 'midnight-haunt-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'The original midnight creeper. Instant MP3 download.',
  },
  {
    id: 'keep-ridin',
    title: 'Keep Ridin (Instrumental)',
    handle: 'keep-ridin-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Windows-down cruiser. Instant MP3 download.',
  },
  {
    id: 'if-you-dont-play',
    title: "If You Don't Play (Instrumental)",
    handle: 'if-you-dont-play-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Call-and-response groove. Instant MP3 download.',
  },
  {
    id: 'entertain-us',
    title: 'Entertain Us (Instrumental)',
    handle: 'entertain-us-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Showtime opener. Instant MP3 download.',
  },
  {
    id: 'dont-tell-me-what-that-is',
    title: "Don't Tell Me What That Is (Instrumental)",
    handle: 'dont-tell-me-what-that-is-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Mystery-box bounce. Instant MP3 download.',
  },
  {
    id: 'die-in-a-fire',
    title: 'Die in a Fire (Instrumental)',
    handle: 'die-in-a-fire-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Full-throttle scorcher. Instant MP3 download.',
  },
  {
    id: 'crabs-n-aidas',
    title: 'Crabs N Aidas (Instrumental)',
    handle: 'crabs-n-aidas-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Off-kilter street cut. Instant MP3 download.',
  },
  {
    id: 'burn-up-the-bass',
    title: 'Burn Up the Bass (Instrumental)',
    handle: 'burn-up-the-bass-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Sub-system stress test. Instant MP3 download.',
  },
  {
    id: 'amazon',
    title: 'Amazon (Instrumental)',
    handle: 'amazon-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Deep-jungle expedition. Instant MP3 download.',
  },
  {
    id: 'am-i',
    title: 'Am I (Instrumental)',
    handle: 'am-i-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: 'Introspective late-night cut. Instant MP3 download.',
  },
  {
    id: 'after-hours-heaven',
    title: 'After Hours Heaven (Instrumental)',
    handle: 'after-hours-heaven-instrumental',
    priceCents: 700,
    kind: 'instrumental',
    blurb: '2AM slow-burn closer. Instant MP3 download.',
  },
];

export const BEAT_BUNDLE: BeatItem = {
  id: 'complete-bundle',
  title: '3000 Studios Complete Instrumental Bundle (16 Tracks)',
  handle: '3000-studios-complete-instrumental-bundle-16-tracks',
  priceCents: 4900,
  kind: 'bundle',
  blurb: 'Every instrumental in the catalog. One download. One price.',
};

/** 16 × $7.00 = $112.00 individual vs $49.00 bundle. */
export const BEAT_BUNDLE_SAVINGS_CENTS = BEAT_ITEMS.length * 700 - BEAT_BUNDLE.priceCents;

export function beatBuyUrl(item: BeatItem): string {
  return `https://boughtitonline.com/products/${item.handle}`;
}
