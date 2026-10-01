export interface MusicPlatform {
  name: string;
  url: string;
  icon: string;
  badge: string;
  color: string;
}

export const OFFICIAL_PLATFORM_LINKS: MusicPlatform[] = [
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@3000Studio',
    icon: '▶',
    badge: 'Official Artist Channel',
    color: '#ff0000',
  },
  {
    name: 'DistroKid HyperFollow',
    url: 'https://distrokid.com/hyperfollow/3000studios',
    icon: '✦',
    badge: 'Universal Music Hub',
    color: '#ffd700',
  },
  {
    name: 'Spotify',
    url: 'https://distrokid.com/hyperfollow/3000studios',
    icon: '●',
    badge: 'Stream on Spotify',
    color: '#1db954',
  },
  {
    name: 'Apple Music',
    url: 'https://distrokid.com/hyperfollow/3000studios',
    icon: '',
    badge: 'Listen in Spatial Audio',
    color: '#fa2d48',
  },
  {
    name: 'Amazon Music',
    url: 'https://distrokid.com/hyperfollow/3000studios',
    icon: '▲',
    badge: 'Ultra HD Audio',
    color: '#00a8e1',
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@3000studios',
    icon: '♬',
    badge: 'Official Sounds & Clips',
    color: '#00f2fe',
  },
  {
    name: 'Cash App Tip Jar',
    url: 'https://cash.app/$addcashGift',
    icon: '$',
    badge: 'Direct Artist Tip ($addcashGift)',
    color: '#00d632',
  },
];
