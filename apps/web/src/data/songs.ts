export interface Song {
  id: string;
  slug: string;
  title: string;
  artist: string;
  description: string;
  fullAudio: string;      // path to full track
  previewAudio?: string;  // optional shorter preview
  coverImage: string;     // high quality image path or url
  duration: string;
  genre: string;
  vibe: string;
  unlockType: 'daily' | 'vip' | 'unlocked';
}

// Master song list - extend this as new tracks are added
// Only "always-feel-like" has real audio file currently
export const songs: Song[] = [
  {
    id: 's1',
    slug: 'always-feel-like',
    title: 'Always Feel Like',
    artist: '3000 Studios',
    description: 'The signature track for the VIP rollout. Emotional, driving, cinematic.',
    fullAudio: '/media/always-feel-like.mp3',
    previewAudio: '/media/always-feel-like.mp3', // same file for now; can replace with 10s trim later
    coverImage: '/images/always-feel-like-cover.jpg', // placeholder - will be added
    duration: '3:26',
    genre: 'Cinematic Electronic',
    vibe: 'Introspective • Driving',
    unlockType: 'unlocked',
  },
  {
    id: 's2',
    slug: 'neon-velvet',
    title: 'Neon Velvet',
    artist: '3000 Studios',
    description: 'Late night red carpet energy. Smooth bass and glowing synths.',
    fullAudio: '/media/always-feel-like.mp3', // placeholder until real track added
    previewAudio: '/media/always-feel-like.mp3',
    coverImage: '/images/neon-velvet-cover.jpg',
    duration: '4:12',
    genre: 'Synthwave / Chillwave',
    vibe: 'Luxury • Night Drive',
    unlockType: 'daily',
  },
  {
    id: 's3',
    slug: 'red-carpet-rain',
    title: 'Red Carpet Rain',
    artist: '3000 Studios',
    description: 'Emotional piano meets modern 808s. Made for the quiet moments after the lights go down.',
    fullAudio: '/media/always-feel-like.mp3',
    previewAudio: '/media/always-feel-like.mp3',
    coverImage: '/images/red-carpet-rain-cover.jpg',
    duration: '3:48',
    genre: 'Alternative R&B / Cinematic',
    vibe: 'Melancholic • Cinematic',
    unlockType: 'daily',
  },
  {
    id: 's4',
    slug: 'gold-standard',
    title: 'Gold Standard',
    artist: '3000 Studios',
    description: 'Triumphant, confident, made for winners. Heavy 808s and soaring melodies.',
    fullAudio: '/media/always-feel-like.mp3',
    previewAudio: '/media/always-feel-like.mp3',
    coverImage: '/images/gold-standard-cover.jpg',
    duration: '2:59',
    genre: 'Trap / Cinematic Hip-Hop',
    vibe: 'Confident • Victorious',
    unlockType: 'daily',
  },
];

// Helper to get song by slug
export const getSongBySlug = (slug: string) => songs.find(s => s.slug === slug);
