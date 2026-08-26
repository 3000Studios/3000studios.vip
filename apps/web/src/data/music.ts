import coverMap from './coverMap.json';

export type SongPalette = {
  a: string;
  b: string;
  c: string;
  gold: string;
};

export type CatalogSong = {
  rank: number;
  id: string;
  slug: string;
  title: string;
  description: string;
  src: string;
  cover: string;
  palette: SongPalette;
  wallpaper: string;
};

function enrich(
  rank: number,
  slug: string,
  title: string,
  description: string,
  src: string,
): CatalogSong {
  const meta = (coverMap as Record<string, { cover: string; palette: SongPalette; wallpaper: string }>)[slug] ?? {
    cover: `/media/covers/${slug}.svg`,
    palette: { a: '#1ef078', b: '#236dff', c: '#ffd700', gold: '#ffd700' },
    wallpaper: 'spiral',
  };
  return {
    rank,
    id: slug,
    slug,
    title,
    description,
    src,
    cover: meta.cover,
    palette: meta.palette,
    wallpaper: meta.wallpaper,
  };
}

/** Feature of the week — dual version (Jazz default + Remix morph) */
export const featureSong = {
  title: 'Lick My Balls, and Die in a Fire',
  artist: '3000 Studios',
  weekLabel: 'Feature Song of the Week',
  jazz: {
    id: 'lick-my-balls-jazz',
    label: 'Jazz Edition',
    description: 'Sultry jazz festival energy · Marilyn stage · Feature of the week.',
    src: '/media/lick-my-balls-jazz.mp3',
    cover: '/media/covers/lick-my-balls-jazz.jpg',
    wallpaper: 'goldwave',
  },
  remix: {
    id: 'lick-my-balls-remix',
    label: 'Remix',
    description: 'Infernal DJ remix · devil on the decks · same anthem, harder cut.',
    src: '/media/lick-my-balls-remix.mp3',
    cover: '/media/covers/lick-my-balls-remix.jpg',
    wallpaper: 'inferno',
  },
} as const;

/** DistroKid-live catalog only — used on /music. */
export const distrokidSongs: CatalogSong[] = [
  enrich(1, 'not-giving-up-tonight', 'Not Giving Up Tonight', 'Official DistroKid release · YouTube featured video.', '/media/not-giving-up-tonight.mp3'),
];

export const rolloutSongs: CatalogSong[] = [
  enrich(0, 'not-giving-up-tonight', 'Not Giving Up Tonight', 'DistroKid live · Official music video on YouTube @3000Studio.', '/media/not-giving-up-tonight.mp3'),
  enrich(1, 'lick-my-balls-jazz', 'Lick My Balls, and Die in a Fire — Jazz Edition', 'Feature song of the week · Jazz edition · 3000 Studios original.', '/media/lick-my-balls-jazz.mp3'),
  enrich(2, 'lick-my-balls-remix', 'Lick My Balls, and Die in a Fire — Remix', 'Feature song remix · Devil DJ cut · 3000 Studios original.', '/media/lick-my-balls-remix.mp3'),
  enrich(3, 'always-late', 'Always Late', '3000 Studios original from the VIP music vault.', '/media/always-late.mp3'),
  enrich(4, 'am-i-wrong-good', 'Am I Wrong Good', '3000 Studios original from the VIP music vault.', '/media/am-i-wrong-good.mp3'),
  enrich(5, 'am-i-wrong-stp', 'Am I Wrong STP', '3000 Studios original from the VIP music vault.', '/media/am-i-wrong-stp.mp3'),
  enrich(6, 'betty-boom-boom', 'Betty Boom Boom', '3000 Studios original from the VIP music vault.', '/media/betty-boom-boom.mp3'),
  enrich(7, 'click-clack-3000-studios-original', 'Click Clack - 3000 Studios Original', 'Hard-hitting original with premium 3000 Studios energy.', '/media/click-clack-3000-studios-original.mp3'),
  enrich(8, 'clogged-up-toilet-blues', 'Clogged Up (Toilet Blues)', '3000 Studios original from the VIP music vault.', '/media/clogged-up-toilet-blues.mp3'),
  enrich(9, 'code-red', 'CODE RED', 'High-energy original ready for the red carpet stage.', '/media/code-red.mp3'),
  enrich(10, 'dad', 'DAD', '3000 Studios original from the VIP music vault.', '/media/dad.mp3'),
  enrich(11, 'do-ya-think-my-shits-messy', "Do Ya Think My Shit's Messy", '3000 Studios original from the VIP music vault.', '/media/do-ya-think-my-shits-messy.mp3'),
  enrich(12, 'everlong-pretender', 'Everlong Pretender', '3000 Studios original from the VIP music vault.', '/media/everlong-pretender.mp3'),
  enrich(13, 'figgity-fa-kit', 'FIGGITY FA KIT', '3000 Studios original from the VIP music vault.', '/media/figgity-fa-kit.mp3'),
  enrich(14, 'fix-your-lane', 'FIx Your Lane', '3000 Studios original from the VIP music vault.', '/media/fix-your-lane.mp3'),
  enrich(15, 'fuck-redlights', 'Fuck Redlights', '3000 Studios original from the VIP music vault.', '/media/fuck-redlights.mp3'),
  enrich(16, 'go-the-other-way-player', 'Go the Other Way, Player', 'Abstract bars and outcast energy from the 3000 vault.', '/media/go-the-other-way-player.mp3'),
  enrich(17, 'i-always-feel-like-someones', "I Always Feel Like Someone's", '3000 Studios original from the VIP music vault.', '/media/i-always-feel-like-someones.mp3'),
  enrich(18, 'i-always-feel-like', 'I Always Feel Like', 'Signature cinematic energy for the VIP rollout.', '/media/i-always-feel-like.mp3'),
  enrich(19, 'i-bet-you-crooner', 'I Bet You Crooner', '3000 Studios original from the VIP music vault.', '/media/i-bet-you-crooner.mp3'),
  enrich(20, 'i-grind-big-hustle', 'I Grind Big Hustle', '3000 Studios original from the VIP music vault.', '/media/i-grind-big-hustle.mp3'),
  enrich(21, 'just-do-you-boo', 'Just Do You Boo', '3000 Studios original from the VIP music vault.', '/media/just-do-you-boo.mp3'),
  enrich(22, 'late-night-porkchops-paige', 'Late Night Porkchops & Paige', '3000 Studios original from the VIP music vault.', '/media/late-night-porkchops-paige.mp3'),
  enrich(23, 'let-me-be', 'LET ME BE!!', '3000 Studios original from the VIP music vault.', '/media/let-me-be.mp3'),
  enrich(24, 'lets-hear-it-for-king-j', 'Lets Hear It For King J', '3000 Studios original from the VIP music vault.', '/media/lets-hear-it-for-king-j.mp3'),
  enrich(25, 'make-em-say-uhh-bathroom-edition', 'Make Em Say Uhh (Bathroom Edition)', '3000 Studios original from the VIP music vault.', '/media/make-em-say-uhh-bathroom-edition.mp3'),
  enrich(26, 'meltdown-miestro', 'Meltdown Miestro', '3000 Studios original from the VIP music vault.', '/media/meltdown-miestro.mp3'),
  enrich(27, 'my-neck-remix', 'My Neck Remix', '3000 Studios original from the VIP music vault.', '/media/my-neck-remix.mp3'),
  enrich(28, 'oooo-weee', 'OOoo Weee', '3000 Studios original from the VIP music vault.', '/media/oooo-weee.mp3'),
  enrich(29, 'outkast-3000-studios-style', 'OUTKAST 3000 Studios Style', '3000 Studios reinterpretation with Atlanta heat.', '/media/outkast-3000-studios-style.mp3'),
  enrich(30, 'ride-smooth', 'Ride Smooth', 'Laid-back glide for the velvet rope after-party.', '/media/ride-smooth.mp3'),
  enrich(31, 'simp-bitch', 'Simp Bitch', '3000 Studios original from the VIP music vault.', '/media/simp-bitch.mp3'),
  enrich(32, 'so-fresh-so-cosmic', 'So Fresh, So Cosmic', 'Cosmic bounce built for creators who move different.', '/media/so-fresh-so-cosmic.mp3'),
  enrich(33, 'squash-that-mother', 'Squash That Mother', '3000 Studios original from the VIP music vault.', '/media/squash-that-mother.mp3'),
  enrich(34, 'subwoofer-pressure-2', 'SUBWOOFER PRESSURE 2', '3000 Studios original from the VIP music vault.', '/media/subwoofer-pressure-2.mp3'),
  enrich(35, 'subwoofer-pressure', 'SUBWOOFER PRESSURE', '3000 Studios original from the VIP music vault.', '/media/subwoofer-pressure.mp3'),
  enrich(36, 'sunset-and-bliss-jnp', 'Sunset and Bliss (JnP)', 'Smooth JnP vibes for late-night VIP lounges.', '/media/sunset-and-bliss-jnp.mp3'),
  enrich(37, 'the-opera-v1', 'The Opera v1', '3000 Studios original from the VIP music vault.', '/media/the-opera-v1.mp3'),
  enrich(38, 'waynes-world-laid-back-weezy-mix', 'Waynes World (Laid-Back Weezy Mix)', '3000 Studios original from the VIP music vault.', '/media/waynes-world-laid-back-weezy-mix.mp3'),
  enrich(39, 'waynes-world', 'Waynes World', '3000 Studios original from the VIP music vault.', '/media/waynes-world.mp3'),
  enrich(40, 'wi-fi-fridge', 'Wi-Fi Fridge', '3000 Studios original from the VIP music vault.', '/media/wi-fi-fridge.mp3'),
];

export function getSongBySrc(src: string) {
  return rolloutSongs.find((s) => s.src === src);
}

export function getSongBySlug(slug: string) {
  return rolloutSongs.find((s) => s.slug === slug);
}

export function getSongByTitle(title: string) {
  return rolloutSongs.find((s) => s.title === title);
}

export const timedLyrics: Array<{ time: number; duration: number; text: string }> = [];
