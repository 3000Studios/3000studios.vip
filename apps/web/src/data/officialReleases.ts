export const OFFICIAL_YOUTUBE_CHANNEL_ID = 'UCTQnEFZUIutrFuDlxGj9cDA';
export const OFFICIAL_YOUTUBE_CHANNEL_URL = `https://www.youtube.com/channel/${OFFICIAL_YOUTUBE_CHANNEL_ID}`;

export interface OfficialReleaseVideo {
  title: string;
  videoId: string;
  release: '3000 Studios Originals' | 'Single';
  duration: string;
}

/**
 * Verified 2026-08-28 against the authenticated DistroKid catalog and the
 * 3000 Studios Official Artist Channel. Keep this list evidence-based: a title
 * must exist in DistroKid and its video must live on the official channel.
 */
export const officialReleaseVideos: OfficialReleaseVideo[] = [
  { title: 'Not Giving Up Tonight', videoId: 'tIY1WU9N_RU', release: 'Single', duration: '3:49' },
  { title: 'Always Feel Like', videoId: 'GRokxtfSu9s', release: 'Single', duration: '3:26' },
  { title: 'After Midnight Blues', videoId: 'Yhp1tp90Idk', release: '3000 Studios Originals', duration: '3:14' },
  { title: 'Bass Polya', videoId: 'n3kR8ya3mss', release: '3000 Studios Originals', duration: '3:20' },
  { title: 'Can You Hear Me Now', videoId: 'G8soa82tOZo', release: '3000 Studios Originals', duration: '3:20' },
  { title: 'Click Clack — 3000 Studios Original', videoId: 'U6eoUX8yf_8', release: '3000 Studios Originals', duration: '5:25' },
  { title: 'Code Red', videoId: 'olkLQ-1Tjs8', release: '3000 Studios Originals', duration: '4:45' },
  { title: 'Floor Ya', videoId: 'PSqDDT3SKCw', release: '3000 Studios Originals', duration: '3:25' },
  { title: 'Fresh Prince of Mars', videoId: 'c92jStKTxWU', release: '3000 Studios Originals', duration: '1:45' },
  { title: 'Fuhk U', videoId: 't-ZIQhzZ09A', release: '3000 Studios Originals', duration: '3:54' },
  { title: "Taqueesha Can't Never Get", videoId: 'VR9_WIjY9wg', release: '3000 Studios Originals', duration: '3:18' },
  { title: 'The Peepers', videoId: 'l5iOwuK0RcE', release: '3000 Studios Originals', duration: '2:41' },
  { title: 'Tropical Bass Land', videoId: 'sGdAIxIi1IM', release: '3000 Studios Originals', duration: '1:49' },
  { title: 'Why Do I Not Like My Songs', videoId: 'LQnb2YenltY', release: '3000 Studios Originals', duration: '1:58' },
  { title: '3000 Studios Podcast', videoId: 'n0HdKVuzNB4', release: '3000 Studios Originals', duration: '2:45' },
];

export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

export const youtubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const youtubeArtworkUrl = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
