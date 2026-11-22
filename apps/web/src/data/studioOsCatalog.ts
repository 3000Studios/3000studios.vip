import generated from './studioOsCatalog.generated.json';

export type StudioOsWebRelease = {
  slug: string;
  title: string;
  artist?: string;
  description?: string;
  releaseDate?: string;
  src?: string;
  cover?: string;
  youtubeId?: string;
  lyrics?: string;
  credits?: string[];
  streaming?: Record<string, string>;
  video?: string;
  story?: string;
  duration?: string;
  waveform?: number[];
  transcript?: string;
};

export const studioOsReleases = generated as StudioOsWebRelease[];

export function getStudioOsRelease(slug: string) {
  return studioOsReleases.find((r) => r.slug === slug);
}
