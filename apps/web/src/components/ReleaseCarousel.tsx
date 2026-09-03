import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
} from '../data/officialReleases';

export function ReleaseCarousel({ activeIndex, onSelect }: { activeIndex: number; onSelect: (index: number) => void }) {
  const [frontIndex, setFrontIndex] = useState(activeIndex);
  const [paused, setPaused] = useState(false);
  const dragStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(activeIndex * (360 / Math.max(officialReleaseVideos.length, 1)));
  const count = officialReleaseVideos.length;
  const step = 360 / count;

  const paintRing = (degrees: number) => {
    if (ringRef.current) ringRef.current.style.transform = `rotateY(${-degrees}deg)`;
  };

  const holdPause = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  };
  const pauseSpin = () => {
    holdPause();
    resumeTimer.current = window.setTimeout(() => setPaused(false), 3000);
  };

  useEffect(() => {
    rotationRef.current = frontIndex * step;
    paintRing(rotationRef.current);
  }, [frontIndex, step]);

  useEffect(() => () => {
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  }, []);

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const tick = (now: number) => {
      if (!frame) frame = now;
      const delta = Math.min(32, now - frame);
      frame = now;
      rotationRef.current = (rotationRef.current + delta * 0.012) % 360;
      paintRing(rotationRef.current);
      raf = requestAnimationFrame(tick);
    };
    let raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, count, step]);

  const move = (direction: number) => {
    pauseSpin();
    setFrontIndex((index) => (index + direction + count) % count);
  };
  const select = (index: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    pauseSpin();
    setFrontIndex(index);
    onSelect(index);
  };
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX;
    suppressClick.current = false;
    pauseSpin();
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const distance = event.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(distance) > 38) {
      suppressClick.current = true;
      move(distance < 0 ? 1 : -1);
    }
  };

  return (
    <div
      className="releaseCarousel"
      role="region"
      aria-label="Official release preview carousel"
      tabIndex={0}
      onMouseEnter={holdPause}
      onMouseLeave={pauseSpin}
      onTouchStart={pauseSpin}
      onFocusCapture={pauseSpin}
      onBlurCapture={pauseSpin}
      onPointerDown={startDrag}
      onPointerUp={endDrag}
      onPointerCancel={() => { dragStart.current = null; }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <p className="releaseCarouselHint">Swipe or use arrows · Tap a thumbnail to play</p>
      <div className="releaseCarouselViewport">
        <div className="releaseCarouselRing" ref={ringRef} style={{ transform: `rotateY(${-frontIndex * step}deg)` }}>
          {officialReleaseVideos.map((release, index) => (
            <button
              type="button"
              key={release.videoId}
              className={index === activeIndex ? 'releaseCarouselCard is-playing' : 'releaseCarouselCard'}
              style={{ transform: `rotateY(${index * step}deg) translateZ(var(--carousel-radius))` }}
              onClick={() => select(index)}
              aria-label={`Play ${release.title} in the main player`}
              aria-pressed={index === activeIndex}
              tabIndex={index === frontIndex ? 0 : -1}
            >
              <span className="releasePreviewArt">
                <img src={youtubeArtworkUrl(release.videoId)} alt={`${release.title} video thumbnail`} loading="lazy" draggable="false" />
                <span className="releasePreviewPlay" aria-hidden="true">▶</span>
                <small>{release.duration}</small>
              </span>
              <span className="releasePreviewTitle">{release.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="releaseCarouselControls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous release">‹</button>
        <span>{frontIndex + 1} / {count}</span>
        <button type="button" onClick={() => move(1)} aria-label="Next release">›</button>
      </div>
    </div>
  );
}
