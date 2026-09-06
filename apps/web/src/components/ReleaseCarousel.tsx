import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
} from '../data/officialReleases';

export function ReleaseCarousel({ activeIndex, onSelect }: { activeIndex: number; onSelect: (index: number) => void }) {
  const [frontIndex, setFrontIndex] = useState(activeIndex);
  const [paused, setPaused] = useState(false);
  const [containerWidth, setContainerWidth] = useState(
    typeof window !== 'undefined' ? Math.min(window.innerWidth - 24, 760) : 760
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<number | null>(null);
  const suppressClick = useRef(false);
  const resumeTimer = useRef<number | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const count = officialReleaseVideos.length;
  const step = 360 / count;

  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      } else {
        setContainerWidth(Math.min(window.innerWidth - 24, 760));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const rotationRef = useRef(activeIndex * step);

  const paintRing = (degrees: number) => {
    if (ringRef.current) ringRef.current.style.transform = `rotateY(${-degrees}deg)`;
  };

  const holdPause = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
  };
  const pauseSpin = () => {
    holdPause();
    resumeTimer.current = window.setTimeout(() => setPaused(false), 2500);
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
      rotationRef.current = (rotationRef.current + delta * 0.01) % 360;
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

  const isMobile = containerWidth < 540;
  const cardWidth = isMobile ? 140 : 210;
  const cardHeight = isMobile ? 140 : 210;

  // Maximum radius so 3D diameter (2 * radius + cardWidth) NEVER exceeds (containerWidth - 20px)
  const maxRadius = Math.max(70, Math.floor((containerWidth - cardWidth - 20) / 2));
  const radius = Math.min(maxRadius, isMobile ? 110 : 230);

  return (
    <div
      ref={containerRef}
      className="releaseCarousel"
      role="region"
      aria-label="Official release preview carousel"
      tabIndex={0}
      style={{
        '--card-width': `${cardWidth}px`,
        '--card-height': `${cardHeight}px`,
        '--carousel-radius': `${radius}px`,
      } as React.CSSProperties}
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
      <div className="releaseCarouselViewport" style={{ height: isMobile ? '230px' : '320px' }}>
        <div className="releaseCarouselRing" ref={ringRef} style={{ transform: `rotateY(${-frontIndex * step}deg)` }}>
          {officialReleaseVideos.map((release, index) => (
            <button
              type="button"
              key={release.videoId}
              className={index === activeIndex ? 'releaseCarouselCard is-playing' : 'releaseCarouselCard'}
              style={{ transform: `rotateY(${index * step}deg) translateZ(${radius}px)` }}
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
