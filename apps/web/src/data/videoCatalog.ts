/* ============================================================================
   VIDEO CATALOG MANIFEST — single source of truth for all purchasable video
   content on 3000studios.vip.
   - Music videos: preview + full stream via YouTube embeds (no files bundled).
   - Thunderdome cinematics: mp4s served from CINEMATIC_CDN so the web bundle
     stays light (Cloudflare Pages ~25MB/file limit). Point CINEMATIC_CDN at
     the real host (R2 bucket, YouTube unlisted playlist, Drive CDN, etc.)
     when the files are uploaded — no code changes needed anywhere else.
   ========================================================================== */

import { officialReleaseVideos } from './officialReleases';

/** Where the 30 Thunderdome cinematic mp4s are hosted. Swap this one value
 *  when the files move to permanent hosting. */
export const CINEMATIC_CDN = 'https://cdn.3000studios.vip/cinematics';

export type MediaRef =
  | { type: 'youtube'; videoId: string }
  | { type: 'mp4'; url: string };

export interface VideoCatalogItem {
  id: string;
  kind: 'music' | 'cinematic';
  title: string;
  subtitle: string;
  duration: string;
  /** Free inline preview (short/promo clip). */
  preview: MediaRef;
  /** Full-length content, revealed after the $1 unlock. */
  full: MediaRef;
  /** Optional full-song links bundled with the $1 unlock. */
  songLinks?: { hyperfollow?: string; spotify?: string };
  priceCents: number;
}

export const UNLOCK_PRICE_CENTS = 100;

export function youtubeEmbed(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`;
}

export function youtubeWatch(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/* ---------------- music videos (DistroKid catalog) ---------------- */

const musicVideos: VideoCatalogItem[] = officialReleaseVideos.map((v) => ({
  id: `mv-${v.videoId}`,
  kind: 'music',
  title: v.title,
  subtitle: `3000 Studios · ${v.release}`,
  duration: v.duration,
  preview: { type: 'youtube', videoId: v.videoId },
  full: { type: 'youtube', videoId: v.videoId },
  songLinks: { hyperfollow: 'https://distrokid.com/hyperfollow/3000studios' },
  priceCents: UNLOCK_PRICE_CENTS,
}));

/* ---------------- Thunderdome cinematics (30 clips) ---------------- */

const CINEMATIC_FILES: Array<{ file: string; title: string; subtitle: string }> = [
  { file: 'game-intro-v1.mp4', title: 'Game Intro — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'game-intro-v2.mp4', title: 'Game Intro — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'splash-v1.mp4', title: 'Splash Screen — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'splash-v2.mp4', title: 'Splash Screen — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'boss-incoming-v1.mp4', title: 'Boss Incoming — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'boss-incoming-v2.mp4', title: 'Boss Incoming — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'boss-victory-v1.mp4', title: 'Boss Victory — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'boss-victory-v2.mp4', title: 'Boss Victory — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'level-load-takeoff-v1.mp4', title: 'Level Load: Takeoff — V1', subtitle: 'Thunderdome cinematic' },
  { file: 'level-load-takeoff-v2.mp4', title: 'Level Load: Takeoff — V2', subtitle: 'Thunderdome cinematic' },
  { file: 'credits-finale-v1.mp4', title: 'Credits Finale — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'credits-finale-v2.mp4', title: 'Credits Finale — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'store-promo-v1.mp4', title: 'Store Promo — Variant 1', subtitle: 'Thunderdome cinematic' },
  { file: 'store-promo-v2.mp4', title: 'Store Promo — Variant 2', subtitle: 'Thunderdome cinematic' },
  { file: 'funny-barrel-roll-v1.mp4', title: 'Barrel Roll Bloopers — V1', subtitle: 'Thunderdome cinematic' },
  { file: 'funny-barrel-roll-v2.mp4', title: 'Barrel Roll Bloopers — V2', subtitle: 'Thunderdome cinematic' },
  { file: 'biome-volcanic-v1.mp4', title: 'Volcanic Biome — V1', subtitle: 'Environment showcase' },
  { file: 'biome-volcanic-v2.mp4', title: 'Volcanic Biome — V2', subtitle: 'Environment showcase' },
  { file: 'biome-arctic-v1.mp4', title: 'Arctic Biome — V1', subtitle: 'Environment showcase' },
  { file: 'biome-arctic-v2.mp4', title: 'Arctic Biome — V2', subtitle: 'Environment showcase' },
  { file: 'biome-desert-v1.mp4', title: 'Desert Biome — V1', subtitle: 'Environment showcase' },
  { file: 'biome-desert-v2.mp4', title: 'Desert Biome — V2', subtitle: 'Environment showcase' },
  { file: 'biome-cyber-ruins-v1.mp4', title: 'Cyber Ruins — V1', subtitle: 'Environment showcase' },
  { file: 'biome-cyber-ruins-v2.mp4', title: 'Cyber Ruins — V2', subtitle: 'Environment showcase' },
  { file: 'biome-jungle-temple-v1.mp4', title: 'Jungle Temple — V1', subtitle: 'Environment showcase' },
  { file: 'biome-jungle-temple-v2.mp4', title: 'Jungle Temple — V2', subtitle: 'Environment showcase' },
  { file: 'biome-space-station-v1.mp4', title: 'Space Station — V1', subtitle: 'Environment showcase' },
  { file: 'biome-space-station-v2.mp4', title: 'Space Station — V2', subtitle: 'Environment showcase' },
  { file: 'biome-underwater-city-v1.mp4', title: 'Underwater City — V1', subtitle: 'Environment showcase' },
  { file: 'biome-underwater-city-v2.mp4', title: 'Underwater City — V2', subtitle: 'Environment showcase' },
];

const cinematics: VideoCatalogItem[] = CINEMATIC_FILES.map((c) => ({
  id: `cine-${c.file.replace(/\.mp4$/, '')}`,
  kind: 'cinematic',
  title: c.title,
  subtitle: c.subtitle,
  duration: '0:08',
  preview: { type: 'mp4', url: `${CINEMATIC_CDN}/${c.file}` },
  full: { type: 'mp4', url: `${CINEMATIC_CDN}/${c.file}` },
  priceCents: UNLOCK_PRICE_CENTS,
}));

export const VIDEO_CATALOG: VideoCatalogItem[] = [...musicVideos, ...cinematics];

export const MUSIC_VIDEOS = musicVideos;
export const CINEMATIC_VIDEOS = cinematics;

export function findVideo(id: string): VideoCatalogItem | undefined {
  return VIDEO_CATALOG.find((v) => v.id === id);
}
