import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { useGlobalMusic } from './GlobalMusic';
import { publishedSongs, publishedToCatalog } from '../data/publishedSongs';
import { youtubeArtworkUrl } from '../data/officialReleases';
import { PublicLayout } from '../pages/Home';

function SlideViz() {
  return (
    <div className="viz" aria-hidden="true">
      {Array.from({ length: 24 }, (_, i) => (
        <i key={i} style={{ animationDelay: `${i * 40}ms` }} />
      ))}
    </div>
  );
}

export function SwipeHome() {
  const music = useGlobalMusic();
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = publishedSongs.length;
  const song = publishedSongs[index];

  const go = useCallback(
    (next: number, play = true) => {
      const i = ((next % n) + n) % n;
      setIndex(i);
      setDrag(0);
      const s = publishedSongs[i];
      if (!s) return;
      const cat = publishedToCatalog(s);
      const src = s.preview || cat.src;
      if (play && (music.isPlaying || localStorage.getItem('3000-music-on') !== '0')) {
        window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title: s.title, slug: s.slug } }));
      }
    },
    [n, music.isPlaying],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, index]);

  const onPointerDown = (e: ReactPointerEvent) => {
    dragging.current = true;
    setIsDragging(true);
    startX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    setDrag(e.clientX - startX.current);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const w = trackRef.current?.parentElement?.clientWidth || 1;
    if (drag < -w * 0.12) go(index + 1);
    else if (drag > w * 0.12) go(index - 1);
    else setDrag(0);
  };

  return (
    <PublicLayout variant="spiral" compact>
      <div className="slickHome">
        <section
          className="main-slider slick-initialized"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="slickTrack"
            style={{
              transform: `translateX(calc(${-index * 100}% + ${drag}px))`,
              transition: isDragging ? 'none' : 'transform 0.55s cubic-bezier(0.4, 0.29, 0.01, 1)',
            }}
          >
            {publishedSongs.map((s, i) => {
              const cover = s.cover || (s.youtubeId ? youtubeArtworkUrl(s.youtubeId) : '/media/official-3000-studios-profile.png');
              const active = i === index;
              return (
                <div key={s.slug} className={`slick-slide item image${active ? ' slick-active' : ''}`}>
                  <figure>
                    <div className={`slide-image slide-media show`} style={{ backgroundImage: `url('${cover}')` }} />
                    <figcaption className={`caption cap-${i % 4}`}>{s.title}</figcaption>
                    {active ? <SlideViz /> : null}
                    {active ? (
                      <a
                        className="buyBtn"
                        href={s.buy || s.apple || 'https://distrokid.com/hyperfollow/3000studios'}
                        target="_blank"
                        rel="noreferrer"
                        onPointerDown={(ev) => ev.stopPropagation()}
                      >
                        Buy / stream
                      </a>
                    ) : null}
                  </figure>
                </div>
              );
            })}
          </div>
          <button type="button" className="slickArrow prev" aria-label="Previous song" onClick={() => go(index - 1)}>
            ‹
          </button>
          <button type="button" className="slickArrow next" aria-label="Next song" onClick={() => go(index + 1)}>
            ›
          </button>
        </section>
        <ul className="slick-dots" aria-label="Songs">
          {publishedSongs.map((s, i) => (
            <li key={s.slug} className={i === index ? 'slick-active' : undefined}>
              <button type="button" aria-label={s.title} onClick={() => go(i)} />
            </li>
          ))}
        </ul>
        <section className="container slickCopy">
          <div className="content">
            <p>
              {song ? (
                <>
                  <strong>{song.title}</strong> — swipe or use the arrows. Audio plays on each slide unless Music is off in the nav.
                  {n} DistroKid-live tracks.
                </>
              ) : null}
            </p>
            <p>
              <Link to="/music">Full catalog</Link>
              {' · '}
              <a href="https://distrokid.com/hyperfollow/3000studios">HyperFollow</a>
              {' · '}
              <Link to="/privacy">Privacy</Link>
              {' · '}
              <Link to="/terms">Terms</Link>
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
