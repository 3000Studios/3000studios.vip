export type BlogPost = {
  id: string;
  title: string;
  summary: string;
  keywords: string;
  date: string;
  image: string;
  video?: string;
  category: 'update' | 'seo' | 'music' | 'live';
};

const SITE_UPDATES: Omit<BlogPost, 'date' | 'id'>[] = [
  {
    title: '3000 Studios Live Window: Viewer-First Stream Experience',
    summary: 'Public /live keeps the Cloudflare player mounted. Hosts go live from /admin. No player swap flicker.',
    keywords: 'live stream, Cloudflare Stream, 3000 Studios live',
    image: '/media/covers/so-fresh-so-cosmic.jpg',
    category: 'live',
  },
  {
    title: 'Shop, Samples, And Vault Plans Are Live',
    summary: '30-second samples stay free. Full tracks $0.99. Vault $3.99/mo or $19.99/year. Merch and sponsor slots check out on Stripe.',
    keywords: '3000 Studios shop, music paywall, merch',
    image: '/media/covers/ride-smooth.jpg',
    category: 'update',
  },
  {
    title: 'Discover Home: Video Wallpaper Cards And Games',
    summary: 'Homepage cards run official videos behind the copy. Games tab opens getnexa.space.',
    keywords: '3000 Studios homepage, official videos, getnexa.space',
    image: '/media/covers/betty-boom-boom.jpg',
    category: 'update',
  },
  {
    title: 'Official Catalog On YouTube And DistroKid',
    summary: 'Not Giving Up Tonight and the Originals list stay matched to the official artist channel.',
    keywords: 'DistroKid, YouTube official artist, 3000 Studio',
    image: '/media/covers/outkast-3000-studios-style.jpg',
    category: 'music',
  },
];

const SEO_EVERGREEN: Omit<BlogPost, 'date' | 'id'>[] = [
  {
    title: 'How Independent Artists Build Search-Ready Music Video Sites',
    summary: 'Connect streaming, SEO posts, sponsorship inventory, and live video on one domain.',
    keywords: 'independent music website SEO',
    image: '/media/covers/i-always-feel-like.jpg',
    category: 'seo',
  },
  {
    title: 'Cloudflare Stream For Music Brands',
    summary: 'Browser live with WHIP in and a stable iframe player out.',
    keywords: 'Cloudflare Stream live WHIP',
    image: '/media/covers/subwoofer-pressure.svg',
    category: 'live',
  },
  {
    title: 'Sponsor Packages For Music Videos And Live',
    summary: 'Homepage slot, live presenter, and video opener inventory with a $99 starter buy.',
    keywords: 'music sponsorship packages',
    image: '/media/covers/waynes-world.jpg',
    category: 'seo',
  },
  {
    title: 'Atlanta Creator Media Stack',
    summary: 'Song requests, live chat, VIP drops, and owned-audience tools for independent artists.',
    keywords: 'Atlanta music creators',
    image: '/media/covers/i-grind-big-hustle.jpg',
    category: 'seo',
  },
];

function slotSeed(d = new Date()) {
  return Math.floor(d.getTime() / (6 * 60 * 60 * 1000));
}

/** New mix every 6 hours. Stable inside a slot. */
export function getDailyBlogPosts(now = new Date()): BlogPost[] {
  const seed = slotSeed(now);
  const pack = [
    SITE_UPDATES[seed % SITE_UPDATES.length],
    SEO_EVERGREEN[seed % SEO_EVERGREEN.length],
    SEO_EVERGREEN[(seed + 2) % SEO_EVERGREEN.length],
    SITE_UPDATES[(seed + 1) % SITE_UPDATES.length],
  ];
  return pack.map((p, i) => {
    const date = new Date((seed - i) * 6 * 60 * 60 * 1000);
    return { ...p, id: `slot-${seed}-${i}`, date: date.toISOString() };
  });
}
