import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Play } from '@phosphor-icons/react';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeWatchUrl,
  type OfficialReleaseVideo,
} from '../data/officialReleases';

const AUTOROTATE_MS = 4500;
const RESUME_MS = 10000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

function usePerView(viewportRef: React.RefObject<HTMLDivElement | null>) {
  const [perView, setPerView] = useState(1);
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [viewportRef]);
  return perView;
}

function VideoCard({ v, i }: { v: OfficialReleaseVideo; i: number }) {
  return (
    <a
      className="v3-hcard"
      href={youtubeWatchUrl(v.videoId)}
      target="_blank"
      rel="noreferrer"
      draggable={false}
      style={{ textDecoration: 'none', color: 'inherit' }}
      aria-label={`Watch ${v.title} on YouTube`}
    >
      <div
        className="v3-hph"
        style={{ backgroundImage: `url('${youtubeArtworkUrl(v.videoId)}')` }}
      />
      <h3>
        <i>{String(i + 1).padStart(2, '0')}</i>
        {v.title}
      </h3>
      <p>
        {v.release} · {v.duration}
      </p>
      <div className="v3-hmeta">
        <Play size={13} weight="fill" style={{ verticalAlign: -2 }} /> Watch on YouTube
      </div>
    </a>
  );
}

/* Auto-rotating carousel: no scroll-driven animation anywhere.
   Rotates on a timer, pauses on tap/swipe/button press, resumes after idle.
   Touch swipe + drag via pointer events; 48px prev/next buttons. */
export function HorizontalReleases() {
  const videos = officialReleaseVideos.slice(0, 8);
  const viewportRef = useRef<HTMLDivElement>(null);
  const perView = usePerView(viewportRef);
  const reducedMotion = usePrefersReducedMotion();
  const maxIndex = Math.max(0, videos.length - perView);

  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);

  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragState = useRef<{ startX: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  const paused = userPaused || reducedMotion;

  // keep index in range when perView changes
  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // auto-rotate timer
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, AUTOROTATE_MS);
    return () => clearInterval(id);
  }, [paused, maxIndex]);

  // cleanup resume timer on unmount
  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );

  const poke = useCallback(() => {
    setUserPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setUserPaused(false), RESUME_MS);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      poke();
      setIndex((i) => {
        const span = maxIndex + 1;
        return (((i + dir) % span) + span) % span;
      });
    },
    [poke, maxIndex],
  );

  const goTo = useCallback(
    (n: number) => {
      poke();
      const span = maxIndex + 1;
      setIndex((((n % span) + span) % span));
    },
    [poke, maxIndex],
  );

  const cardPx = () => {
    const el = viewportRef.current;
    return el ? el.clientWidth / perView : 1;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    poke();
    dragState.current = { startX: e.clientX, moved: false };
    setDragging(true);
    setDragPx(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer already released — ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 8) d.moved = true;
    setDragPx(dx);
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragState.current;
    if (!d) return;
    dragState.current = null;
    setDragging(false);
    const threshold = cardPx() * 0.22;
    const dx = e.clientX - d.startX;
    setDragPx(0);
    if (d.moved) suppressClick.current = true;
    if (dx <= -threshold) step(1);
    else if (dx >= threshold) step(-1);
    // otherwise snap back to current index
  };

  const onClickCapture = (e: React.SyntheticEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };

  return (
    <section
      id="videos"
      className="v3-vidwrap"
      aria-roledescription="carousel"
      aria-label="Official videos"
    >
      <div className="v3-vidhead">
        <div className="v3-eyebrow">Cinema</div>
        <h2 className="v3-h2">
          Official <em>videos</em>
        </h2>
        <p className="v3-lead">
          Every release ships with a full visual world. The filmstrip keeps
          rolling — tap a card to watch, swipe or use the arrows to browse.
        </p>
      </div>

      <div
        className="v3-vidviewport"
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={`v3-vidtrack${dragging ? '' : ' is-anim'}`}
          style={{
            transform: `translateX(calc(-${(index * 100) / perView}% + ${dragPx}px))`,
          }}
        >
          {videos.map((v, i) => (
            <div
              className="v3-vidslide"
              key={v.videoId}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${videos.length}`}
            >
              <VideoCard v={v} i={i} />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="v3-vidbtn v3-vidbtn-prev"
          onClick={() => step(-1)}
          aria-label="Previous video"
        >
          <ArrowLeft size={20} weight="bold" />
        </button>
        <button
          type="button"
          className="v3-vidbtn v3-vidbtn-next"
          onClick={() => step(1)}
          aria-label="Next video"
        >
          <ArrowRight size={20} weight="bold" />
        </button>
      </div>

      <div className="v3-viddots" aria-label="Choose slide">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="v3-viddot"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          >
            <span />
          </button>
        ))}
      </div>

      <div className="v3-vidmore">
        <a
          href="https://www.youtube.com/@3000Studio/videos"
          target="_blank"
          rel="noreferrer"
          className="v3-hint"
          style={{
            color: 'inherit',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          Browse them all <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}
