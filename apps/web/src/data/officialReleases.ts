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
const curatedReleaseVideos: OfficialReleaseVideo[] = [
  { title: "I'm Feelin' It", videoId: 'aqbImIx7S-s', release: 'Single', duration: '2:40' },
  { title: 'Not Giving Up Tonight', videoId: 'tIY1WU9N_RU', release: 'Single', duration: '3:49' },
  { title: 'Always Feel Like', videoId: 'GRokxtfSu9s', release: 'Single', duration: '3:26' },
  {
    title: 'After Midnight Blues',
    videoId: 'Yhp1tp90Idk',
    release: '3000 Studios Originals',
    duration: '3:14',
  },
  {
    title: 'Bass Polya',
    videoId: 'n3kR8ya3mss',
    release: '3000 Studios Originals',
    duration: '3:20',
  },
  {
    title: 'Can You Hear Me Now',
    videoId: 'G8soa82tOZo',
    release: '3000 Studios Originals',
    duration: '3:20',
  },
  {
    title: 'Click Clack — 3000 Studios Original',
    videoId: 'U6eoUX8yf_8',
    release: '3000 Studios Originals',
    duration: '5:25',
  },
  {
    title: 'Code Red',
    videoId: 'olkLQ-1Tjs8',
    release: '3000 Studios Originals',
    duration: '4:45',
  },
  {
    title: 'Floor Ya',
    videoId: 'PSqDDT3SKCw',
    release: '3000 Studios Originals',
    duration: '3:25',
  },
  {
    title: 'Fresh Prince of Mars',
    videoId: 'c92jStKTxWU',
    release: '3000 Studios Originals',
    duration: '1:45',
  },
  { title: 'Fuhk U', videoId: 't-ZIQhzZ09A', release: '3000 Studios Originals', duration: '3:54' },
  {
    title: "Taqueesha Can't Never Get",
    videoId: 'VR9_WIjY9wg',
    release: '3000 Studios Originals',
    duration: '3:18',
  },
  // The Peepers uses its generated video id (no curated override; keeps ids unique).
  {
    title: 'Tropical Bass Land',
    videoId: 'sGdAIxIi1IM',
    release: '3000 Studios Originals',
    duration: '1:49',
  },
  {
    title: 'Why Do I Not Like My Songs',
    videoId: 'LQnb2YenltY',
    release: '3000 Studios Originals',
    duration: '1:58',
  },
  {
    title: '3000 Studios Podcast',
    videoId: 'n0HdKVuzNB4',
    release: '3000 Studios Originals',
    duration: '2:45',
  },
];

const curatedByTitle = new Map(
  curatedReleaseVideos.map((video) => [video.title.toLowerCase(), video]),
);
const generatedReleaseVideos = (generated as OfficialReleaseVideo[]).map(
  (video) => curatedByTitle.get(video.title.toLowerCase()) ?? video,
);

const featuredRelease = curatedReleaseVideos[0];

export const officialReleaseVideos: OfficialReleaseVideo[] = [
  featuredRelease,
  ...generatedReleaseVideos.filter((video) => video.videoId !== featuredRelease.videoId),
];

export const youtubeEmbedUrl = (videoId: string) =>
  `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;

export const youtubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const youtubeArtworkUrl = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

const normalizeReleaseTitle = (value: string) =>
  value
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/3000 studios/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

export function getOfficialVideoForTitle(title: string) {
  const wanted = normalizeReleaseTitle(title);
  return officialReleaseVideos.find((video) => {
    const candidate = normalizeReleaseTitle(video.title);
    return (
      candidate === wanted ||
      (wanted.length > 5 && (candidate.includes(wanted) || wanted.includes(candidate)))
    );
  });
}
import generated from './officialReleases.generated.json';
