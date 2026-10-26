import generated from './publishedShorts.generated.json';

export type PublishedShort = {
  videoId: string;
  title: string;
  kind: 'short';
  sourceStatus: string;
  fromUrl: boolean;
  /** Explicit title — surfaces showing this short must gate ad scripts (AdSense risk). */
  explicit?: boolean;
};

/** Real YouTube Shorts IDs from ALL_PUBLISHED (URL id preferred over legacy id field). */
export const publishedShorts: PublishedShort[] = (generated as PublishedShort[]).filter(
  (row) => typeof row.videoId === 'string' && /^[\w-]{11}$/.test(row.videoId),
);

export const publishedShortCount = publishedShorts.length;
