import { memo } from 'react';

/**
 * CoverWall — the album-art wall.
 * Two infinite marquee rows of photographic album covers scrolling in
 * opposite directions. Pure CSS animation (GPU-friendly), lazy images,
 * smaller tiles on mobile.
 */

const COVERS_A = [
  'betty-boom-boom.jpg',
  'do-ya-think-my-shits-messy.jpg',
  'figgity-fa-kit.jpg',
  'fix-your-lane.jpg',
  'i-always-feel-like-someones.jpg',
  'i-always-feel-like.jpg',
  'i-grind-big-hustle.jpg',
  'just-do-you-boo.jpg',
  'late-night-porkchops-paige.jpg',
  'lets-hear-it-for-king-j.jpg',
  'lick-my-balls-jazz-cover.jpg',
  'lick-my-balls-remix-cover.jpg',
];

const COVERS_B = [
  'not-giving-up-tonight.jpg',
  'oooo-weee.jpg',
  'outkast-3000-studios-style.jpg',
  'ride-smooth.jpg',
  'so-fresh-so-cosmic.jpg',
  'waynes-world-laid-back-weezy-mix.jpg',
  'waynes-world.jpg',
  'wi-fi-fridge.jpg',
  'lick-my-balls-jazz.jpg',
  'lick-my-balls-remix.jpg',
  'not-giving-up-tonight-bg.jpg',
  'i-grind-big-hustle.jpg',
];

function altFor(file: string): string {
  return file
    .replace(/\.(jpg|jpeg|png|webp)$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const Row = memo(function Row({
  covers,
  reverse,
  label,
}: {
  covers: string[];
  reverse?: boolean;
  label: string;
}) {
  // Duplicate the set for a seamless loop.
  const doubled = [...covers, ...covers];
  return (
    <div className="v3-coverwall-row" aria-label={label}>
      <div className={`v3-coverwall-track${reverse ? ' is-reverse' : ''}`}>
        {doubled.map((file, i) => (
          <a
            key={`${file}-${i}`}
            href="/#music"
            className="v3-coverwall-tile"
            aria-hidden={i >= covers.length}
            tabIndex={i >= covers.length ? -1 : 0}
          >
            <img
              src={`/media/covers/${file}`}
              alt={altFor(file)}
              loading="lazy"
              decoding="async"
              draggable={false}
            />
          </a>
        ))}
      </div>
    </div>
  );
});

export function CoverWall() {
  return (
    <section className="v3-coverwall" aria-label="Album art wall">
      <div className="v3-wrap">
        <div className="v3-eyebrow">The catalog</div>
        <h2 className="v3-h2">
          Every cover tells a <em>story</em>
        </h2>
        <p className="v3-lead">
          Original artwork for every release — tap any cover to hear the music behind it.
        </p>
      </div>
      <Row covers={COVERS_A} label="Album covers row one" />
      <Row covers={COVERS_B} reverse label="Album covers row two" />
    </section>
  );
}
