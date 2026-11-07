/**
 * Follow and Subscribe — the 3000 Studios Podcast: episode catalog.
 *
 * This is the ONE place podcast episodes live for the site. To add a new
 * episode, append one entry to PODCAST_EPISODES with:
 *   - n:           the episode number (next in sequence)
 *   - title:       the episode title exactly as published
 *   - description: what the episode is about — drawn from the episode's own
 *                  production script (set, featured song, surprise caller)
 *   - youtubeId:   the YouTube video id (the part after "watch?v=")
 *   - spotifyUrl:  the full Spotify episode URL — OPTIONAL; omit the field
 *                  until the episode is live on Spotify and the card simply
 *                  won't render a Spotify button.
 * The /podcast page renders the whole list from this file automatically.
 */

export interface PodcastEpisode {
  n: number;
  title: string;
  description: string;
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
    description:
      'The premiere of Follow and Subscribe, the 3000 Studios podcast — hosts Follow and Subscribe open the studio for the first time.',
    youtubeId: '-I51Ka96Ux8',
    spotifyUrl: 'https://open.spotify.com/episode/4GMDLUrLV3TvfRn5qiNUJ7',
  },
  {
    n: 2,
    title: 'The Summit at Midnight',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, your favorite alien, broadcasting from the top floor of the empire. Featuring the song “Got A Lot Going On” and a surprise call from Duchess Wanda from Tallahassee.',
    youtubeId: 'AlGkXttvotQ',
    spotifyUrl: 'https://open.spotify.com/episode/1vQmBEQxVaBBI1Z4xw4DsH',
  },
  {
    n: 3,
    title: 'The Library That Never Sleeps',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and today we broadcast from my favorite room in the empire: the library. Featuring the song “After Hours Heaven” and a surprise call from Professor Noodle from Chicago.',
    youtubeId: 'ABrX5h0ggOY',
    spotifyUrl: 'https://open.spotify.com/episode/0B0FQNeXKp7M8BaAPHkXx9',
  },
  {
    n: 4,
    title: 'Radar Is Dead',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, coming to you from the hangar studio, where the sky is close enough to high-five. Featuring the song “Electric Skies” and a surprise call from Captain Biscuit from Denver.',
    youtubeId: 'PqSK90GiHYQ',
    spotifyUrl: 'https://open.spotify.com/episode/1mPO9b8FFNquvV3UjnjDuH',
  },
  {
    n: 5,
    title: 'The Big Kindness',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and today the studio smells like cinnamon and good decisions. Featuring the song “I\'m Feelin\' It” and a surprise call from Grandma Pearl from Savannah.',
    youtubeId: 'Rw3RH7K1RxQ',
    spotifyUrl: 'https://open.spotify.com/episode/4LgIKXtFdaXdWXULOJqfHC',
  },
  {
    n: 6,
    title: 'Seven Listeners',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and I would like to begin with a formal announcement: we have listeners. Featuring the song “Midnight Haunt” and a surprise call from Tommy Two-Tones from Nashville.',
    youtubeId: 'NKjfY5CdgTc',
    spotifyUrl: 'https://open.spotify.com/episode/2VmhrbuFe0fxmZiMBosyEV',
  },
  {
    n: 7,
    title: 'The Night Shift',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, reporting for duty on the most noble shift of all: the night shift. Featuring the song “Room Goes Cold” and a surprise call from Nurse Nightingale from Phoenix.',
    youtubeId: 'UTe6lfDHIIY',
    spotifyUrl: 'https://open.spotify.com/episode/7yozWRXxsstbxE938rHIQD',
  },
  {
    n: 8,
    title: 'One Free Finding',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, broadcasting on the spookiest night of the year — and I am wearing my formal cape. Featuring the song “Why Do I” and a surprise call from Count Snacc-ula from Transylvania, Ohio.',
    youtubeId: 'ZZ5E3PzSxeQ',
    spotifyUrl: 'https://open.spotify.com/episode/3iaIfv6TYphozJ59oQW8kM',
  },
  {
    n: 9,
    title: 'Nobody Sits',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and I am legally required to say it: we got an extra hour today, and I have already spent mine twice. Featuring the song “Go Get the Shovel” and a surprise call from Pastor Pancake from Memphis.',
    youtubeId: 'nyaEn-7O9j0',
    spotifyUrl: 'https://open.spotify.com/episode/0dNtsdBoGJgHnGCTwD1nOP',
  },
  {
    n: 10,
    title: 'The Laws of the House',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and tonight this court — I mean this studio — is in session. Featuring the song “If You Don\'t Play” and a surprise call from Judge Rudy from Austin.',
    youtubeId: 'wCtiz3IXbN4',
    spotifyUrl: 'https://open.spotify.com/episode/67iWRWirxz2AxYZPwvp6ac',
  },
  {
    n: 11,
    title: 'Empire Before Breakfast',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, and today is a double feature: the biggest civic day of the year, and the grand finale of our catch-up season. Featuring the song “Legit Funky” and a surprise call from First-Time Fran from Erie.',
    youtubeId: 'hFKgXCLsXWM',
    spotifyUrl: 'https://open.spotify.com/episode/3pdPtu6GzSQAsg0X53evD1',
  },
  {
    n: 12,
    title: 'The Morning After the Map Changed',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, your favorite alien, broadcasting live from the morning loft of the empire. Featuring the song “Got A Lot Going On” and a surprise call from Sergeant Sunshine from Biloxi.',
    youtubeId: 'Qtq7TdHWoV4',
    spotifyUrl: 'https://open.spotify.com/episode/3G78iWzyvzP9woH9DYNdJH',
  },
  {
    n: 13,
    title: 'Markets Throw a Parade',
    description:
      'Welcome back to Follow and Subscribe, the 3000 Studios podcast! I\'m Follow, your favorite alien, broadcasting from the rooftop studio where the sunset does our lighting for free. Featuring the song “After Hours Heaven” and a surprise call from Madame Zaza from Las Vegas.',
    youtubeId: 'S0MCYcYPHu8',
    spotifyUrl: 'https://open.spotify.com/episode/4cR9Ibs2CF2Xyy93AZU2sP',
  },
  {
    n: 14,
    title: 'AI Goes to the Ballot Box',
    description:
      'Broadcasting from the night library studio, where the books are awake so we don\'t have to be quiet. Featuring the song “Electric Skies” and a surprise call from Uncle Pickles from Kalamazoo.',
    youtubeId: '_DaWxBrjXJM',
    spotifyUrl: 'https://open.spotify.com/episode/1maxjZQjGlJ3UzrBBVwjCx',
  },
  {
    n: 15,
    title: 'The Market Held Its Breath',
    description:
      'Broadcasting from the lake sunrise studio, where the water is calm, the coffee is not, and neither am I. Featuring the song “I\'m Feelin\' It” and a surprise call from Coach Biscotti from Buffalo.',
    youtubeId: '4fCy2WB4fT0',
    spotifyUrl: 'https://open.spotify.com/episode/21pTgDP1HEcXu5rmtyUc6X',
  },
  {
    n: 16,
    title: 'The Robots Are Hiring Robots',
    description:
      'Broadcasting from the greenhouse studio, where the plants are thriving, the light is perfect, and I have been photosynthesizing compliments all afternoon. Featuring the song “Midnight Haunt” and a surprise call from Princess Pickle from Portland.',
    youtubeId: 'YMNuY5FAr1g',
    spotifyUrl: 'https://open.spotify.com/episode/4iwOorlft2dPJm692U352z',
  },
  {
    n: 17,
    title: 'Vice City Countdown',
    description:
      'Broadcasting from the deco theater studio, where the marquee is lit, the microphones are vintage, and I am dressed like I own the balcony. I do not. Featuring the song “Room Goes Cold” and a surprise call from Detective Donut from Detroit.',
    youtubeId: 'gUI6--JqCmw',
    spotifyUrl: 'https://open.spotify.com/episode/26UC2PEmRxWwQimyDo71l1',
  },
  {
    n: 18,
    title: 'The Lunch Rush Special',
    description:
      'Broadcasting from the diner studio, where the coffee is bottomless, the counter seats are spinning, and I have already been offered two specials and a side of hash browns. Featuring the song “Go Get the Shovel” and a surprise call from Captain Waffles from Wichita.',
    youtubeId: '-KnvUTwlBgk',
    spotifyUrl: 'https://open.spotify.com/episode/2cLH5Xvamh0aARHgUbwGSp',
  },
];
