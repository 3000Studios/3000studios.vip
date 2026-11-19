/**
 * Podcast episode list — The 3000 Studios Podcast.
 *
 * Titles transcribed verbatim from the 3000studios.vip redesign mockup
 * (section 6 PODCAST). No durations, descriptions, or links are invented:
 * per-episode Watch goes to the 3000 Studios YouTube channel and Listen
 * goes to the Spotify show — the same two destinations the existing
 * PodcastPage already uses. If per-episode URLs are ever published,
 * extend this type with optional `watchUrl` / `listenUrl` fields and the
 * page will prefer them.
 */

export interface PodcastEpisode {
  /** Episode number, 1–26. */
  number: number;
  /** Episode title, exactly as shown in the mockup. */
  title: string;
}

export const PODCAST_EPISODES: PodcastEpisode[] = [
  { number: 26, title: 'Stars After Dark' },
  { number: 25, title: 'The Golden Depot' },
  { number: 24, title: 'Noon in the Observatory' },
  { number: 23, title: 'Sunday Starts Bright' },
  { number: 22, title: 'The Night Owl Network' },
  { number: 21, title: 'Golden Hour Full Power' },
  { number: 20, title: 'High Noon at the Empire' },
  { number: 19, title: 'Saturday Gets Loud' },
  { number: 18, title: 'The Lunch Rush Special' },
  { number: 17, title: 'Vice City Countdown' },
  { number: 16, title: 'The Robots Are Hiring Robots' },
  { number: 15, title: 'The Market Held Its Breath' },
  { number: 14, title: 'AI Goes to the Ballot Box' },
  { number: 13, title: 'Markets Throw a Parade' },
  { number: 12, title: 'The Morning After the Map Changed' },
  { number: 11, title: 'Empire Before Breakfast' },
  { number: 10, title: 'The Laws of the House' },
  { number: 9, title: 'Nobody Sits' },
  { number: 8, title: 'One Free Finding' },
  { number: 7, title: 'The Night Shift' },
  { number: 6, title: 'Seven Listeners' },
  { number: 5, title: 'The Big Kindness' },
  { number: 4, title: 'Radar Is Dead' },
  { number: 3, title: 'The Library That Never Sleeps' },
  { number: 2, title: 'The Summit at Midnight' },
  { number: 1, title: 'Mentally Happy' },
];

export const LATEST_EPISODE: PodcastEpisode = PODCAST_EPISODES[0];

/** Verified destinations (already used by the existing PodcastPage). */
export const PODCAST_SPOTIFY_SHOW_URL =
  'https://open.spotify.com/show/033SHVotmOb7vSOUOOcmFI';
export const PODCAST_SPOTIFY_EMBED_URL =
  'https://open.spotify.com/embed/show/033SHVotmOb7vSOUOOcmFI';
export const STUDIO_YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@3000Studio';
export const STUDIO_YOUTUBE_SUBSCRIBE_URL =
  'https://www.youtube.com/@3000Studio?sub_confirmation=1';

/**
 * Substack URL for the "Substack" button.
 *
 * No verified Substack URL was found anywhere in apps/web/src (searched
 * 2026-11-18). Left empty on purpose — do NOT guess a subdomain. The
 * PodcastPage renders the Substack button disabled until this is filled
 * in with the real URL. See NOTES.md open question 1.
 */
export const PODCAST_SUBSTACK_URL = '';
