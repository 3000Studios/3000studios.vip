import data from './homeHero.json';

/** Shared by the static HTML shell and React SwipeHome so they cannot drift. */
export const HOME_HERO = data as {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
  kicker: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  playLabel: string;
  playTitle: string;
  playSrc: string;
  playCover: string;
};
