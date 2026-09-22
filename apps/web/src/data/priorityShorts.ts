/** Curated Shorts for home + /video — PLAN priority IDs first, then ALL_PUBLISHED. */
export type PriorityShort = {
  videoId: string;
  title: string;
  kind: 'short';
  priority: boolean;
};

/** Hello / YouTube Growth PLAN priority Shorts (Studio IDs). */
export const PRIORITY_SHORT_IDS = [
  'QU6nWoXrTEI',
  'RtcLpAsUKAE',
  'ezzhPOFDT4A',
  'sGdAIxIi1IM',
  'Ni9L8zRL7U4',
] as const;

export const SUBSCRIBE_URL = 'https://www.youtube.com/@3000Studio?sub_confirmation=1';
export const SPOTIFY_ARTIST_URL = 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik';
export const HYPERFOLLOW_URL = 'https://distrokid.com/hyperfollow/3000studios';
export const HYPERFOLLOW_ALT_URL = 'https://hyperfollow.com/3000Studios';

export const priorityShorts: PriorityShort[] = [
  {
    "videoId": "QU6nWoXrTEI",
    "title": "The Mailman Is A Spy | 3000 Studios",
    "kind": "short",
    "priority": true
  },
  {
    "videoId": "RtcLpAsUKAE",
    "title": "Final Thought From the Cat Cave! | 3000 Studios",
    "kind": "short",
    "priority": true
  },
  {
    "videoId": "ezzhPOFDT4A",
    "title": "Fuhk U | 3000 Studios",
    "kind": "short",
    "priority": true
  },
  {
    "videoId": "sGdAIxIi1IM",
    "title": "Tropical Bass Land | 3000 Studios",
    "kind": "short",
    "priority": true
  },
  {
    "videoId": "Ni9L8zRL7U4",
    "title": "Cruise Voltage | Night Drive | 3000 Studios",
    "kind": "short",
    "priority": true
  },
  {
    "videoId": "MnoBxPuTWM0",
    "title": "3000 Studios - 3 K Swagger",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "xfyyIFmJheQ",
    "title": "3000 Studios - Bought It Online",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "avOtKlsJV-4",
    "title": "3000 Studios - Built Like A Fart",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "NAyzLGy-9Ws",
    "title": "3000 Studios - Click Clack 3000 Studios Original",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "pC2cjSGLXYA",
    "title": "3000 Studios - Clogged up toilet blues",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "G5SCkeKLTN4",
    "title": "3000 Studios - Code red",
    "kind": "short",
    "priority": false
  },
  {
    "videoId": "ynjcFVOF1Ig",
    "title": "3000 Studios - Don't Tell Me What That Is",
    "kind": "short",
    "priority": false
  }
];

export const featuredPriorityShorts = priorityShorts.filter((s) => s.priority);

export function shortsEmbedUrl(videoId: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}
