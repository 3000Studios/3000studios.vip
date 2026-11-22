import { publishedSongs, type PublishedSong } from './publishedSongs';
import { officialReleaseVideos } from './officialReleases';

export type { PublishedSong } from './publishedSongs';

/**
 * vaultSongs — the public Music Vault catalog (merged HOME + MUSIC lanes).
 *
 * Single source of truth for every song count and song list on the site:
 * Home, Music, About, and Song pages all read this module. Never hardcode
 * a song total anywhere — render `VAULT_SONG_COUNT` / `vaultSongs.length`.
 *
 * Source: the repo's own `publishedSongs` (DistroKid-published songs only —
 * every row carries a real Apple Music / store link, local media paths and
 * YouTube IDs already resolved). Anything not in that list never appears
 * on the public page: the private library songs from the mockup's 51-song
 * list stay off this page by construction.
 *
 * Dedupe: the generated list has 55 rows. Three pairs are the same song
 * under a different title spelling and collapse to one row each, so the
 * public vault has 52 songs. Winners are the canonical titles (they match
 * the mockup catalog and the live song-page slugs):
 * - "Am I wrong" / "AM I WRONG!!" -> "Am I wrong" (slug `am-i-wrong`)
 * - "Taqueesha Cant Never Get Right" / "Taqueesha Can't Never Get"
 *   -> "Taqueesha Can't Never Get" (slug `taqueesha-cant-never-get`)
 * - "I always feel Like" / "Always Feel like" -> "Always Feel like"
 *   (slug `always-feel-like`, the live song-page slug)
 * - "I'm Feelin' It" is kept: verified live on Spotify even though it has
 *   no Apple Music link or Apple preview in the generated list.
 *
 * Video: `videoId` comes from exact normalized-title matching over the
 * unified release list (see `getVaultVideoId`). The repo's substring
 * fallback mis-assigns videos ("Black Hole Thumb" would get the mashup
 * video), so it is never used for the vault. `youtubeId` (the repo's
 * substring-matched value) is carried through only because `PublishedSong`
 * has the field — nothing in the vault reads it for video.
 *
 * "The Hangar Forge" is NOT in the generated file and appears nowhere in
 * the vault. The mockup's "51" is superseded by the real DistroKid count;
 * the one extra vault song is "Deep Space Hum".
 */

export interface VaultSong {
  /** Display title of the kept row. */
  title: string;
  slug: string;
  /** Local master / preview path, resolved by `publishedSongs`. */
  src: string;
  /** Apple Music preview clip URL. Empty string for one song (see below). */
  preview: string;
  cover: string;
  /** Repo's substring-matched YouTube id — carried, never used for video. */
  youtubeId?: string;
  /** Apple Music album link. Empty string when the row has none. */
  apple: string;
  /** Buy link (Apple link, or the HyperFollow hub). */
  buy: string;
  /** Official YouTube video id, when the unified release list has one. */
  videoId?: string;
}

function normTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

/** Title variants that are the same song but normalize to different keys. */
const TITLE_ALIASES: Readonly<Record<string, string>> = {
  'i always feel like': 'always feel like',
  'taqueesha cant never get right': 'taqueesha cant never get',
};

function canonicalKey(title: string): string {
  const key = normTitle(title);
  return TITLE_ALIASES[key] ?? key;
}

/**
 * Normalizes a title for video matching.
 *
 * - Case-insensitive; apostrophes are removed, not spaced ("Can't" and
 *   "Cant" are the same word, "I'm" stays one token).
 * - A leading "I " is dropped: "I always feel Like" is "Always Feel Like".
 * - A trailing " Right" is dropped: "Taqueesha Cant Never Get Right" is
 *   "Taqueesha Can't Never Get".
 * These three rules exist only because the generated file spells those
 * three songs two ways each. They do not merge anything else in the file:
 * "3000 Studios Podcast theme song" and "3000 Studios Podcast" stay two
 * distinct songs, as do "Am I wrong" and "AM I?".
 */
export function normalizeVaultTitle(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return cleaned
    .replace(/^i\s+/, '')
    .replace(/\s+right$/, '');
}

/**
 * Official-video lookup by exact normalized-title match over the unified
 * release list (curated entries in officialReleases.ts first, then
 * officialReleases.generated.json). First match wins on the one remaining
 * normalized collision: both the curated "Taqueesha Can't Never Get"
 * (VR9_WIjY9wg) and the generated "Taqueesha Cant Never Get Right"
 * (gJQcIWaGHBc) normalize to the same key, and the curated entry comes
 * first in the unified list.
 */
function buildVideoIndex(): Map<string, string> {
  const index = new Map<string, string>();
  for (const video of officialReleaseVideos) {
    const key = normalizeVaultTitle(video.title);
    if (!index.has(key)) index.set(key, video.videoId);
  }
  return index;
}

const VIDEO_BY_TITLE = buildVideoIndex();

export function getVaultVideoId(title: string): string | undefined {
  return VIDEO_BY_TITLE.get(normalizeVaultTitle(title));
}

function dedupeSongs(rows: PublishedSong[]): VaultSong[] {
  const groups = new Map<string, PublishedSong[]>();
  for (const row of rows) {
    const key = canonicalKey(row.title);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }
  const kept: VaultSong[] = [];
  for (const [key, group] of groups) {
    // Keep the row with an Apple Music link; on a tie keep the row whose
    // normalized title equals the group key (the canonical title); on a
    // further tie keep the first row in file order.
    let best = group[0];
    for (const row of group.slice(1)) {
      const bestScore =
        (best.apple ? 1 : 0) * 2 + (normTitle(best.title) === key ? 1 : 0);
      const rowScore =
        (row.apple ? 1 : 0) * 2 + (normTitle(row.title) === key ? 1 : 0);
      if (rowScore > bestScore) best = row;
    }
    kept.push({
      title: best.title,
      slug: best.slug,
      src: best.src ?? '',
      preview: best.preview ?? '',
      cover: best.cover ?? '',
      youtubeId: best.youtubeId,
      apple: best.apple ?? '',
      buy: best.buy ?? '',
      videoId: getVaultVideoId(best.title),
    });
  }
  return kept;
}

/** The full public vault: 52 DistroKid songs, deduped, in file order. */
export const vaultSongs: VaultSong[] = dedupeSongs(publishedSongs);

/** Public song total. Never hardcode this number anywhere on the site. */
export const VAULT_SONG_COUNT: number = vaultSongs.length;

/**
 * The eight latest releases, in the order the home page presents them.
 * Resolved from the deduped list by slug so a regenerated catalog cannot
 * silently drop one — a missing slug is filtered out rather than crashing
 * the page, and the home page renders however many resolve.
 */
const LATEST_RELEASE_SLUGS: readonly string[] = [
  'always-feel-like',
  'im-feelin-it',
  'motel-television',
  'room-goes-cold',
  'keep-ridin',
  'not-giving-up-tonight',
  'fresh-prince-of-mars',
  'cruise-voltage',
];

export const latestVaultReleases: VaultSong[] = LATEST_RELEASE_SLUGS.map((slug) =>
  vaultSongs.find((song) => song.slug === slug),
).filter((song): song is VaultSong => song !== undefined);

/** Slugs of the eight featured songs, in mockup order. */
export const FEATURED_SLUGS = [
  'always-feel-like',
  'im-feelin-it',
  'motel-television',
  'room-goes-cold',
  'keep-ridin',
  'not-giving-up-tonight',
  'fresh-prince-of-mars',
  'cruise-voltage',
] as const;

/** The eight featured songs, in mockup order. */
export const featuredVaultSongs: VaultSong[] = FEATURED_SLUGS.map((slug) =>
  vaultSongs.find((song) => song.slug === slug),
).filter((song): song is VaultSong => song !== undefined);

export function getVaultSongBySlug(slug: string): VaultSong | undefined {
  return vaultSongs.find((song) => song.slug === slug);
}

/**
 * Vault songs with no official video in the unified release list. Their
 * detail pages show the preview player only — no video id is ever invented.
 * ("I'm Feelin' It" is NOT in this list: its video comes from the curated
 * entries in officialReleases.ts.)
 */
export const vaultSongsWithoutVideo: VaultSong[] = vaultSongs.filter(
  (song) => !song.videoId,
);

/**
 * The one song with no Apple preview clip and no Apple Music link.
 * Its preview falls back to the local file in `src`; its Apple Music
 * button is omitted on the detail page (its `buy` link is the HyperFollow
 * hub, not an Apple link).
 */
export const VAULT_PREVIEW_FALLBACK_SLUG = 'im-feelin-it';
