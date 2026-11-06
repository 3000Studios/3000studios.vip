/**
 * Follow and Subscribe — the 3000 Studios Podcast: episode catalog.
 *
 * This is the ONE place podcast episodes live for the site. To add a new
 * episode, append one entry to PODCAST_EPISODES with:
 *   - n:           the episode number (next in sequence)
 *   - title:       the episode title exactly as published
 *   - youtubeId:   the YouTube video id (the part after "watch?v=")
 *   - spotifyUrl:  the full Spotify episode URL — OPTIONAL; omit the field
 *                  until the episode is live on Spotify and the card simply
 *                  won't render a Spotify button.
 * The /podcast page renders the whole list from this file automatically.
 */

export interface PodcastEpisode {
  n: number;
  title: string;
  youtubeId: string;
  spotifyUrl?: string;
}

export const podcastWatchUrl = (ep: PodcastEpisode) =>
  `https://www.youtube.com/watch?v=${ep.youtubeId}`;

export const PODCAST_SHOW = {
  name: 'Follow and Subscribe',
  tagline: 'The 3000 Studios Podcast',
  youtubeChannel: 'https://www.youtube.com/@3000Studio',
  spotifyShow: 'https://open.spotify.com/show/033SHVotmOb7vSOUOOcmFI',
  substack: 'https://3000studios.substack.com',
} as const;

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    n: 1,
    title: 'Mentally Happy',
    youtubeId: '-I51Ka96Ux8',
    spotifyUrl: 'https://open.spotify.com/episode/4GMDLUrLV3TvfRn5qiNUJ7',
  },
  {
    n: 2,
    title: 'The Summit at Midnight',
    youtubeId: 'AlGkXttvotQ',
    spotifyUrl: 'https://open.spotify.com/episode/1vQmBEQxVaBBI1Z4xw4DsH',
  },
  { n: 3, title: 'The Library That Never Sleeps', youtubeId: 'ABrX5h0ggOY' },
  { n: 4, title: 'Radar Is Dead', youtubeId: 'PqSK90GiHYQ' },
  { n: 5, title: 'The Big Kindness', youtubeId: 'Rw3RH7K1RxQ' },
  { n: 6, title: 'Seven Listeners', youtubeId: 'NKjfY5CdgTc' },
  { n: 7, title: 'The Night Shift', youtubeId: 'UTe6lfDHIIY' },
  { n: 8, title: 'One Free Finding', youtubeId: 'ZZ5E3PzSxeQ' },
  { n: 9, title: 'Nobody Sits', youtubeId: 'nyaEn-7O9j0' },
  { n: 10, title: 'The Laws of the House', youtubeId: 'wCtiz3IXbN4' },
  { n: 11, title: 'Empire Before Breakfast', youtubeId: 'hFKgXCLsXWM' },
  { n: 12, title: 'The Morning After the Map Changed', youtubeId: 'Qtq7TdHWoV4' },
  { n: 13, title: 'Markets Throw a Parade', youtubeId: 'S0MCYcYPHu8' },
  { n: 14, title: 'AI Goes to the Ballot Box', youtubeId: '_DaWxBrjXJM' },
];
