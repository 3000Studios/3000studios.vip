import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { playSwoosh } from './StageFX';
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
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);
  const dragRef = useRef(0);
  const indexRef = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const n = publishedSongs.length;
  const song = publishedSongs[index];
  indexRef.current = index;

  const go = useCallback(
    (next: number, dir?: 'fwd' | 'rev') => {
      if (!n) return;
      const i = ((next % n) + n) % n;
      indexRef.current = i;
      setIndex(i);
      dragRef.current = 0;
      setDrag(0);
      if (dir) playSwoosh(dir);
      const s = publishedSongs[i];
      if (!s) return;
      const cat = publishedToCatalog(s);
      const src = s.preview || cat.src;
      if (src && localStorage.getItem('3000-music-on') !== '0') {
        window.dispatchEvent(
          new CustomEvent('3000-play-track', { detail: { src, title: s.title, slug: s.slug } }),
        );
      }
    },
    [n],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(indexRef.current + 1, 'fwd');
      if (e.key === 'ArrowLeft') go(indexRef.current - 1, 'rev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    dragging.current = true;
    setIsDragging(true);
    startX.current = e.clientX;
    dragRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    dragRef.current = dx;
    setDrag(dx);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const w = trackRef.current?.parentElement?.clientWidth || window.innerWidth || 1;
    const dx = dragRef.current;
    const cur = indexRef.current;
    if (dx < -Math.max(36, w * 0.1)) go(cur + 1, 'fwd');
    else if (dx > Math.max(36, w * 0.1)) go(cur - 1, 'rev');
    else {
      dragRef.current = 0;
      setDrag(0);
    }
  };

  return (
    <PublicLayout variant="spiral" compact>
      <div className="slickHome">
        <hr className="liveDivider" />
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
              transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.4, 0.29, 0.01, 1)',
            }}
          >
            {publishedSongs.map((s, i) => {
              const cover =
                s.cover ||
                (s.youtubeId
                  ? youtubeArtworkUrl(s.youtubeId)
                  : '/media/official-3000-studios-profile.png');
              const active = i === index;
              return (
                <div key={`${s.slug}-${i}`} className={`slick-slide item image${active ? ' slick-active' : ''}`}>
                  <figure>
                    <div className="slide-image slide-media show" style={{ backgroundImage: `url('${cover}')` }} />
                    {active && s.youtubeId ? (
                      <iframe
                        className="slideVideo"
                        title={s.title}
                        src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${s.youtubeId}&playsinline=1&rel=0`}
                        allow="autoplay; encrypted-media"
                      />
                    ) : null}
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
          <button type="button" className="slickArrow prev" aria-label="Previous song" onClick={() => go(indexRef.current - 1, 'rev')}>‹</button>
          <button type="button" className="slickArrow next" aria-label="Next song" onClick={() => go(indexRef.current + 1, 'fwd')}>›</button>
        </section>
        <hr className="liveDivider" />
        <ul className="slick-dots" aria-label="Songs">
          {publishedSongs.map((s, i) => (
            <li key={`${s.slug}-${i}`} className={i === index ? 'slick-active' : undefined}>
              <button type="button" aria-label={s.title} onClick={() => go(i)} />
            </li>
          ))}
        </ul>
        <section className="container slickCopy">
          <div className="content">
            <p>
              {song ? (
                <>
                  <strong>{song.title}</strong> — swipe for the next video. {n} DistroKid-live tracks.
                </>
              ) : null}
            </p>
            <p>
              <Link to="/music">Full catalog</Link>
              {' · '}
              <a href="https://distrokid.com/hyperfollow/3000studios">HyperFollow</a>
            </p>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
