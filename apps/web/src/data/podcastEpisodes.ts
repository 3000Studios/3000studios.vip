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
  {
    n: 3,
    title: 'The Library That Never Sleeps',
    youtubeId: 'ABrX5h0ggOY',
    spotifyUrl: 'https://open.spotify.com/episode/0B0FQNeXKp7M8BaAPHkXx9',
  },
  {
    n: 4,
    title: 'Radar Is Dead',
    youtubeId: 'PqSK90GiHYQ',
    spotifyUrl: 'https://open.spotify.com/episode/1mPO9b8FFNquvV3UjnjDuH',
  },
  {
    n: 5,
    title: 'The Big Kindness',
    youtubeId: 'Rw3RH7K1RxQ',
    spotifyUrl: 'https://open.spotify.com/episode/4LgIKXtFdaXdWXULOJqfHC',
  },
  {
    n: 6,
    title: 'Seven Listeners',
    youtubeId: 'NKjfY5CdgTc',
    spotifyUrl: 'https://open.spotify.com/episode/2VmhrbuFe0fxmZiMBosyEV',
  },
  {
    n: 7,
    title: 'The Night Shift',
    youtubeId: 'UTe6lfDHIIY',
    spotifyUrl: 'https://open.spotify.com/episode/7yozWRXxsstbxE938rHIQD',
  },
  {
    n: 8,
    title: 'One Free Finding',
    youtubeId: 'ZZ5E3PzSxeQ',
    spotifyUrl: 'https://open.spotify.com/episode/3iaIfv6TYphozJ59oQW8kM',
  },
  {
    n: 9,
    title: 'Nobody Sits',
    youtubeId: 'nyaEn-7O9j0',
    spotifyUrl: 'https://open.spotify.com/episode/0dNtsdBoGJgHnGCTwD1nOP',
  },
  {
    n: 10,
    title: 'The Laws of the House',
    youtubeId: 'wCtiz3IXbN4',
    spotifyUrl: 'https://open.spotify.com/episode/67iWRWirxz2AxYZPwvp6ac',
  },
  {
    n: 11,
    title: 'Empire Before Breakfast',
    youtubeId: 'hFKgXCLsXWM',
    spotifyUrl: 'https://open.spotify.com/episode/3pdPtu6GzSQAsg0X53evD1',
  },
  { n: 12, title: 'The Morning After the Map Changed', youtubeId: 'Qtq7TdHWoV4' },
  { n: 13, title: 'Markets Throw a Parade', youtubeId: 'S0MCYcYPHu8' },
  { n: 14, title: 'AI Goes to the Ballot Box', youtubeId: '_DaWxBrjXJM' },
  { n: 15, title: 'The Market Held Its Breath', youtubeId: '4fCy2WB4fT0' },
];
