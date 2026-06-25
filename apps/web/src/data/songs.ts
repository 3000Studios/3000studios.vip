export interface Song {
  id: string;
  slug: string;
  title: string;
  artist: string;
  description: string;
  fullAudio: string;      // path to full track
  previewAudio?: string;  // optional shorter preview
  coverImage: string;
  duration: string;
  genre: string;
  vibe: string;
  unlockType: 'daily' | 'vip' | 'unlocked';
}

export const songs: Song[] = [
  {
    id: 's1',
    slug: 'always-feel-like',
    title: 'Always Feel Like',
    artist: '3000 Studios',
    description: 'The signature track for the VIP rollout. Emotional, driving, cinematic.',
    fullAudio: '/media/always-feel-like.mp3',
    previewAudio: '/media/always-feel-like.mp3',
    coverImage: '/favicon.svg',
    duration: '3:26',
    genre: 'Cinematic Electronic',
    vibe: 'Introspective • Driving',
    unlockType: 'unlocked',
  },
];

export const getSongBySlug = (slug: string) => songs.find(s => s.slug === slug);
