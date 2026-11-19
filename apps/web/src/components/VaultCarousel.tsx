import {
  useCallback,
  useEffect,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Link } from 'react-router-dom';
import type { VaultSong } from '../data/vaultSongs';

/**
 * VaultCarousel — the ONE carousel on the /music route.
 *
 * - Auto-advances the slides (never the audio) every 5 seconds.
 * - Pauses on hover, on touch/pointer press, when the tab is hidden, when
 *   the visitor presses the pause control, and permanently when the visitor
 *   prefers reduced motion (in that case it renders as a static grid —
 *   no timer, no sliding, no arrows or dots).
 * - Arrows + dots + keyboard arrows. Cards link to /song/:slug; the cover
 *   button starts the 1:00 preview through the shared `onPlay` handler.
 */

const ADVANCE_MS = 5000;
const COVER_FALLBACK = '/media/official-3000-studios-profile.png';

function usePerView(): number {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setPerView(width < 560 ? 1 : width < 900 ? 2 : width < 1280 ? 3 : 4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return perView;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function CarouselCard({
  song,
  index,
  onPlay,
  isCurrentPlaying,
}: {
  song: VaultSong;
  index: number;
  onPlay: (song: VaultSong) => void;
  isCurrentPlaying: boolean;
}) {
  return (
    <article className="mv-card">
      <div className="mv-card-cover">
        <img
          src={song.cover}
          alt={`${song.title} cover art`}
          loading="lazy"
          decoding="async"
          onError={(event) => {
            (event.target as HTMLImageElement).src = COVER_FALLBACK;
          }}
        />
        <button
          type="button"
          className="mv-card-play"
          onClick={() => onPlay(song)}
          aria-label={
            isCurrentPlaying
              ? `Pause ${song.title} preview`
              : `Play ${song.title} preview`
          }
        >
          <span aria-hidden="true">{isCurrentPlaying ? '❚❚' : '▶'}</span>
        </button>
        <span className="mv-card-index" aria-hidden="true">
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="mv-card-body">
        <h3>
          <Link to={`/song/${song.slug}`}>{song.title}</Link>
        </h3>
        <span>3000 Studios · Single</span>
        <div className="mv-card-actions">
          <Link className="mv-btn mv-btn-ghost mv-btn-sm" to={`/song/${song.slug}`}>
            Details
          </Link>
          {song.apple ? (
            <a
              className="mv-btn mv-btn-gold mv-btn-sm"
              href={song.apple}
              target="_blank"
              rel="noreferrer"
            >
              Apple Music
            </a>
          ) : (
            <a
              className="mv-btn mv-btn-gold mv-btn-sm"
              href={song.buy}
              target="_blank"
              rel="noreferrer"
            >
              Stream
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function VaultCarousel({
  songs,
  onPlay,
  activeTitle,
  isPlaying,
}: {
  songs: VaultSong[];
  onPlay: (song: VaultSong) => void;
  activeTitle: string;
  isPlaying: boolean;
}) {
  const perView = usePerView();
  const reducedMotion = usePrefersReducedMotion();
  const count = songs.length;
  const maxIndex = Math.max(0, count - perView);
  const [index, setIndex] = useState(0);
  // Keep the slide index in range when perView changes (e.g. resize).
  // Adjusted during render — the React-endorsed pattern for syncing state
  // to a value change — never setState inside an effect for this.
  const [prevMaxIndex, setPrevMaxIndex] = useState(maxIndex);
  if (prevMaxIndex !== maxIndex) {
    setPrevMaxIndex(maxIndex);
    setIndex((current) => Math.min(current, maxIndex));
  }
  const [hovering, setHovering] = useState(false);
  const [touching, setTouching] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [hidden, setHidden] = useState(
    () => typeof document !== 'undefined' && document.hidden,
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const paused = reducedMotion || hovering || touching || userPaused || hidden;

  // Auto-advance: one chained timeout, re-armed after every slide change,
  // so a manual move restarts the 5-second clock. Slides only — never audio.
  useEffect(() => {
    if (paused || count <= perView) return;
    const timer = window.setTimeout(() => {
      setIndex((current) => (current >= maxIndex ? 0 : current + 1));
    }, ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [paused, index, maxIndex, count, perView]);

  const step = useCallback(
    (direction: 1 | -1) => {
      setIndex((current) => {
        const span = maxIndex + 1;
        return (((current + direction) % span) + span) % span;
      });
    },
    [maxIndex],
  );

  const goTo = useCallback(
    (target: number) => {
      const span = maxIndex + 1;
      setIndex((((target % span) + span) % span));
    },
    [maxIndex],
  );

  const onKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    }
  };

  if (count === 0) {
    return <p className="mv-empty">No featured songs yet.</p>;
  }

  // Reduced motion: a static grid. No timer, no sliding, no controls.
  if (reducedMotion) {
    return (
      <div className="mv-carousel-grid" aria-label="Featured songs">
        {songs.map((song, i) => (
          <CarouselCard
            key={song.slug}
            song={song}
            index={i}
            onPlay={onPlay}
            isCurrentPlaying={activeTitle === song.title && isPlaying}
          />
        ))}
      </div>
    );
  }

  const pages = maxIndex + 1;

  return (
    <div className="mv-carousel" onKeyDown={onKeyDown}>
      <div className="mv-carousel-head">
        <button
          type="button"
          className="mv-btn mv-btn-ghost mv-btn-sm"
          onClick={() => setUserPaused((pausedState) => !pausedState)}
          aria-pressed={userPaused}
        >
          {userPaused ? '▶ Resume carousel' : '❚❚ Pause carousel'}
        </button>
        <div
          className="mv-dots"
          role="tablist"
          aria-label="Choose featured slide"
        >
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              className={`mv-dot${i === index ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      <div
        className="mv-carousel-viewport"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onPointerDown={() => setTouching(true)}
        onPointerUp={() => setTouching(false)}
        onPointerCancel={() => setTouching(false)}
      >
        <button
          type="button"
          className="mv-arrow mv-arrow-prev"
          onClick={() => step(-1)}
          aria-label="Previous featured songs"
        >
          ‹
        </button>
        <div className="mv-carousel-window">
          <div
            className="mv-carousel-track"
            style={{
              transform: `translateX(-${index * (100 / perView)}%)`,
            }}
          >
            {songs.map((song, i) => (
              <div
                key={song.slug}
                className="mv-carousel-slide"
                style={{ flex: `0 0 ${100 / perView}%` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
              >
                <CarouselCard
                  song={song}
                  index={i}
                  onPlay={onPlay}
                  isCurrentPlaying={activeTitle === song.title && isPlaying}
                />
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          className="mv-arrow mv-arrow-next"
          onClick={() => step(1)}
          aria-label="Next featured songs"
        >
          ›
        </button>
      </div>
    </div>
  );
}
