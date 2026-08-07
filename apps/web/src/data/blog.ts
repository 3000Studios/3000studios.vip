/**
 * Auto blog — rotates daily (client-side by date seed).
 * Mix of site-update posts + SEO evergreen posts with media.
 */

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
    summary:
      'We rebuilt the public live page so fans only see the stream stage, gold LIVE header, and a Stream Inquiry path — while hosts run the full studio from admin.',
    keywords: 'live stream platform, WebRTC WHIP WHEP, Cloudflare Stream, music live page',
    image: '/media/covers/so-fresh-so-cosmic.jpg',
    video: '/media/spotify-signing.mp4',
    category: 'update',
  },
  {
    title: 'Global Music Player: Seamless Catalog Across Every Page',
    summary:
      'Now playing stays continuous when you switch tabs. Prev/next, volume, and a living wallpaper bar keep 3000 Studios tracks in the pocket sitewide.',
    keywords: 'independent music player, catalog streaming, sitewide audio UX, VIP music experience',
    image: '/media/covers/ride-smooth.jpg',
    category: 'update',
  },
  {
    title: 'Stream Studio: Crop, Rotate, Filters, and Overlay Director',
    summary:
      'Hosts can frame the camera, apply beauty and fun filters, chroma key, and push standby text plus CSS overlay layers to the public live window.',
    keywords: 'live stream overlays, camera filters, green screen stream, music broadcast tools',
    image: '/media/covers/outkast-3000-studios-style.jpg',
    category: 'update',
  },
  {
    title: 'Feature of the Week and Cover Flow Music Showcase',
    summary:
      'Original 3000 Studios tracks ship with album art, feature morph jazz/remix modes, and a CodePen-inspired cover flow for discovery.',
    keywords: 'album art music site, jazz remix feature song, independent artist showcase',
    image: '/media/covers/betty-boom-boom.jpg',
    category: 'music',
  },
];

const SEO_EVERGREEN: Omit<BlogPost, 'date' | 'id'>[] = [
  {
    title: 'How Independent Artists Build Search-Ready Music Video Sites',
    summary:
      'A modern artist site should connect streaming, SEO blog content, sponsorship inventory, and live video into one conversion path for fans and brand partners.',
    keywords: 'independent music website SEO, music video marketing, artist brand site, creator monetization',
    image: '/media/covers/i-always-feel-like.jpg',
    category: 'seo',
  },
  {
    title: 'Cloudflare Stream For Music Brands: Low Latency Live Explained',
    summary:
      'WHIP publishing and WHEP playback unlock browser-based ultra-low latency live for concerts, freestyles, and studio sessions without complex OBS-only workflows.',
    keywords: 'Cloudflare Stream live, WHIP WHEP tutorial, low latency music stream, browser live broadcast',
    image: '/media/covers/subwoofer-pressure.svg',
    category: 'live',
  },
  {
    title: 'Sponsor Packages For Music Videos, Live Streams, And Creator Tools',
    summary:
      'Brands win when placements map to real inventory: live presenters, video openers, community challenges, and newsletter mentions with clear disclosure.',
    keywords: 'music sponsorship packages, live stream sponsors, video product placement, creator brand deals',
    image: '/media/covers/waynes-world.jpg',
    category: 'seo',
  },
  {
    title: 'Atlanta Creator Media: Music, Video, And Fan Engagement Stacks',
    summary:
      'From song requests to live chat and VIP rollouts, multi-surface media systems help independent labels and solo artists grow owned audiences.',
    keywords: 'Atlanta music creators, fan engagement platform, song request board, VIP music media',
    image: '/media/covers/i-grind-big-hustle.jpg',
    category: 'seo',
  },
  {
    title: 'Album Art, Metadata, And Discoverability For Original Releases',
    summary:
      'Consistent cover art, structured data, and on-site players improve how original tracks surface across search and social previews.',
    keywords: 'album art SEO, music metadata best practices, original music release strategy',
    image: '/media/covers/just-do-you-boo.jpg',
    category: 'music',
  },
  {
    title: 'Why Audio-Reactive Web Design Helps Music Sites Convert',
    summary:
      'Beat-synced motion, animated wallpapers, and immersive players increase dwell time and brand recall for premium music destinations.',
    keywords: 'audio reactive website, music web design trends, immersive artist website',
    image: '/media/covers/so-fresh-so-cosmic.jpg',
    category: 'seo',
  },
];

function daySeed(d = new Date()) {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86400000);
}

/** Build today's auto blog feed (stable for the calendar day, rotates daily). */
export function getDailyBlogPosts(now = new Date()): BlogPost[] {
  const seed = daySeed(now);
  const posts: BlogPost[] = [];

  // Always include one rotating site update + two SEO posts for the day
  const update = SITE_UPDATES[seed % SITE_UPDATES.length];
  const seoA = SEO_EVERGREEN[seed % SEO_EVERGREEN.length];
  const seoB = SEO_EVERGREEN[(seed + 3) % SEO_EVERGREEN.length];
  const music = SITE_UPDATES[(seed + 1) % SITE_UPDATES.length];

  const pack = [update, seoA, seoB, music];
  pack.forEach((p, i) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - i);
    posts.push({
      ...p,
      id: `day-${seed}-${i}`,
      date: date.toISOString(),
    });
  });

  // Archive trail for SEO depth
  for (let i = 0; i < 6; i++) {
    const p = SEO_EVERGREEN[(seed + i * 2) % SEO_EVERGREEN.length];
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - (5 + i));
    posts.push({
      ...p,
      id: `archive-${seed}-${i}`,
      title: p.title,
      date: date.toISOString(),
    });
  }

  return posts;
}
