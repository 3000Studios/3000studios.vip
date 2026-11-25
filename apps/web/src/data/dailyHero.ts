/**
 * The hero video for each daily blog post. One per day, chosen from the
 * studio's own clean videos (explicit titles are never used, because the
 * blog carries ads). Pure data: the edge middleware imports this too.
 */
import { MUSIC_VIDEOS } from './videoCatalog';

export type DailyHero =
  | { kind: 'mp4'; title: string; src: string; poster: string }
  | { kind: 'youtube'; title: string; videoId: string; poster: string };

const TRAILER: DailyHero = {
  kind: 'mp4',
  title: 'Aeropocalypse: Online trailer',
  src: '/media/aeropocalypse/trailer-v3b.mp4',
  poster: '/media/aeropocalypse/trailer-v3b-poster.jpg',
};

export const DAILY_HERO_POOL: DailyHero[] = [
  TRAILER,
  ...MUSIC_VIDEOS.filter((v) => !v.explicit && v.preview.type === 'youtube').map<DailyHero>((v) => {
    const id = v.preview.type === 'youtube' ? v.preview.videoId : '';
    return { kind: 'youtube', title: v.title, videoId: id, poster: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  }),
];

/** Same date, same video. Day numbers count from 1970-01-01 (UTC). */
export function heroForDate(dateKey: string): DailyHero {
  const day = Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / 86_400_000);
  const n = DAILY_HERO_POOL.length;
  return DAILY_HERO_POOL[((day % n) + n) % n];
}

export function heroEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0&modestbranding=1`;
}
