import { publishedSongs } from '../data/publishedSongs';
import { youtubeWatchUrl } from '../data/officialReleases';
import platformLinksGenerated from '../data/platformLinks.generated.json';

export type TrackLink = {
  id: 'apple' | 'youtube' | 'hyperfollow';
  label: string;
  url: string;
};

type GeneratedLinks = { apple?: string; youtubeId?: string; hyperfollow?: string };

const GENERATED = platformLinksGenerated as Record<string, GeneratedLinks>;

/**
 * "For the full song" outbound links for one track — VERIFIED SOURCES ONLY
 * (music model flip, Boss order 2026-10-27). Every URL comes from the
 * audited platform-link table (VIP-V2-PLATFORM-LINKS-2026-10-27, generated
 * into platformLinks.generated.json): per-track Apple Music URLs probed
 * 200 (51/52; `im-feelin-it` ships its verified DistroKid HyperFollow
 * instead) and YouTube IDs from the site's shipped official-release
 * records (record-verified; live probe was rate-limited, HTTP 429).
 *
 * Amazon Music and Spotify have NO per-track URLs anywhere in the site's
 * data — artist-level only — so they are never fabricated per track; they
 * appear once at catalog level (ARTIST_LINKS below), labeled as artist
 * pages. Desk conflict rulings baked into the generated table: Motel
 * Television keeps NYoaRy3i5XA, Always Feel Like uses GRokxtfSu9s,
 * passive-income uses the full-length l5iOwuK0RcE (not the 0:15 Short),
 * taqueesha-cant-never-get uses the shipped FbEijaMJs7g, and
 * still-learning ships no YouTube link (its only claim was the rejected
 * campaign file).
 */
export function getTrackLinks(slug: string): TrackLink[] {
  const gen = GENERATED[slug] ?? {};
  const song = publishedSongs.find((s) => s.slug === slug);
  const links: TrackLink[] = [];
  const apple = gen.apple ?? song?.apple ?? song?.buy;
  if (apple) links.push({ id: 'apple', label: 'Apple Music', url: apple });
  const youtubeId = gen.youtubeId ?? song?.youtubeId;
  if (youtubeId) {
    links.push({ id: 'youtube', label: 'YouTube', url: youtubeWatchUrl(youtubeId) });
  }
  if (gen.hyperfollow) {
    links.push({ id: 'hyperfollow', label: 'All platforms', url: gen.hyperfollow });
  }
  return links;
}

/** Artist-level platform pages — verified constants from lib/commerce's
 *  PLATFORMS table. Labeled as artist pages wherever they render; they
 *  are NOT per-track links. */
export const ARTIST_LINKS = [
  { id: 'spotify', label: 'Spotify — 3000 Studios artist page', url: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik' },
  { id: 'amazon', label: 'Amazon Music — 3000 Studios artist page', url: 'https://music.amazon.com/artists/B0GXLYCZXD/3000-studios' },
] as const;
