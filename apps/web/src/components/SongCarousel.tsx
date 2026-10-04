import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export interface CarouselSong {
  slug: string;
  title: string;
  cover?: string;
  preview?: string;
  src?: string;
  buy?: string;
}

interface SongCarouselProps<T> {
  songs: T[];
  onPlay: (song: T) => void;
  activeTitle: string;
  isPlaying: boolean;
}

function usePerView() {
  const [perView, setPerView] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w < 560 ? 1 : w < 900 ? 2 : w < 1280 ? 3 : 4);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return perView;
}

function SongCard<T extends CarouselSong>({
  song,
  index,
  onPlay,
  isCurrentPlaying,
}: {
  song: T;
  index: number;
  onPlay: (song: T) => void;
  isCurrentPlaying: boolean;
}) {
  return (
    <article
      className="vip-glass-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderColor: isCurrentPlaying ? 'rgba(255, 215, 0, 0.8)' : undefined,
        boxShadow: isCurrentPlaying ? '0 0 25px rgba(255, 215, 0, 0.35)' : undefined,
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
        <img
          src={song.cover || `/media/covers/${song.slug}.jpg`}
          alt={song.title}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/media/official-3000-studios-profile.png';
          }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <button
          type="button"
          onClick={() => onPlay(song)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            border: 'none',
            color: '#fff',
            fontSize: 36,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isCurrentPlaying ? 1 : 0.85,
            transition: 'all 0.2s ease',
          }}
          aria-label={`Play ${song.title}`}
        >
          <span
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'rgba(255, 215, 0, 0.95)',
              color: '#05060a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              paddingLeft: isCurrentPlaying ? 0 : 3,
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
            }}
          >
            {isCurrentPlaying ? '❚❚' : '▶'}
          </span>
        </button>
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            background: 'rgba(5, 6, 10, 0.8)',
            color: '#ffd700',
            fontSize: 11,
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: 4,
          }}
        >
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ color: '#fff', fontSize: 16, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {song.title}
        </h3>
        <span style={{ color: 'var(--vip-text-muted)', fontSize: 13, marginBottom: 12 }}>
          3000 Studios · Official Drop
        </span>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
          <Link
            to={`/song/${song.slug}`}
            className="vip-btn-obsidian"
            style={{ padding: '6px 12px', fontSize: 12, flex: 1, textAlign: 'center' }}
          >
            Details
          </Link>
          <a
            href={song.buy || 'https://distrokid.com/hyperfollow/3000studios'}
            target="_blank"
            rel="noreferrer"
            className="vip-btn-gold"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            Stream / Own
          </a>
        </div>
      </div>
    </article>
  );
}

export function SongCarousel<T extends CarouselSong>({ songs, onPlay, activeTitle, isPlaying }: SongCarouselProps<T>) {
  const perView = usePerView();
  const n = songs.length;
  const [pos, setPos] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [hovering, setHovering] = useState(false);
  const posRef = useRef(pos);
  posRef.current = pos;

  // Reset when the song list or viewport changes
  useEffect(() => {
    setAnimate(false);
    setPos(0);
  }, [n, perView]);

  const goTo = useCallback((newPos: number) => {
    setAnimate(true);
    setPos(newPos);
  }, []);

  const next = useCallback(() => goTo(posRef.current + perView), [perView, goTo]);
  const prev = useCallback(() => goTo(posRef.current - perView), [perView, goTo]);

  // Infinite loop: snap back to the real slides after landing on clones
  const handleTransitionEnd = useCallback(() => {
    const p = posRef.current;
    if (p >= n) {
      setAnimate(false);
      setPos(p - n);
    } else if (p < 0) {
      setAnimate(false);
      setPos(p + n);
    }
  }, [n]);

  // Autoplay: 4000ms delay, pauses on hover
  useEffect(() => {
    if (!autoplay || hovering || n <= perView) return;
    const t = setInterval(() => {
      setAnimate(true);
      setPos((p) => p + perView);
    }, 4000);
    return () => clearInterval(t);
  }, [autoplay, hovering, n, perView]);

  if (n === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--vip-text-muted)', padding: '40px 0' }}>
        No tracks match your search.
      </div>
    );
  }

  // Too few songs for a carousel — show them plainly
  if (n <= perView) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))`, gap: 20 }}>
        {songs.map((s, i) => (
          <SongCard
            key={s.slug || s.title}
            song={s}
            index={i}
            onPlay={onPlay}
            isCurrentPlaying={activeTitle === s.title && isPlaying}
          />
        ))}
      </div>
    );
  }

  // Infinite track: [tail clones] [real songs] [head clones]
  const tail = songs.slice(-perView).map((song, i) => ({ song, realIdx: n - perView + i }));
  const head = songs.slice(0, perView).map((song, i) => ({ song, realIdx: i }));
  const track = [
    ...tail,
    ...songs.map((song, i) => ({ song, realIdx: i })),
    ...head,
  ];
  const offset = pos + perView;
  const pages = Math.ceil(n / perView);
  const activePage = Math.floor((((pos % n) + n) % n) / perView);

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    top: '38%',
    transform: 'translateY(-50%)',
    zIndex: 2,
    width: 46,
    height: 46,
    borderRadius: '50%',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    background: 'rgba(5, 6, 10, 0.85)',
    color: '#ffd700',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(255, 215, 0, 0.25)',
  };

  return (
    <div>
      {/* Carousel header: autoplay toggle + dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <button
          type="button"
          onClick={() => setAutoplay((a) => !a)}
          className="vip-btn-obsidian"
          style={{
            fontSize: 12,
            padding: '6px 14px',
            borderColor: autoplay ? '#ffd700' : undefined,
            color: autoplay ? '#ffd700' : undefined,
          }}
        >
          {autoplay ? '❚❚ Autoplay On' : '▶ Autoplay'}
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i * perView)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === activePage ? 26 : 10,
                height: 10,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: i === activePage ? '#ffd700' : 'rgba(255, 255, 255, 0.25)',
                boxShadow: i === activePage ? '0 0 10px rgba(255, 215, 0, 0.6)' : undefined,
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Slider viewport */}
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <button type="button" onClick={prev} aria-label="Previous slides" style={{ ...arrowStyle, left: -8 }}>
          ‹
        </button>

        <div style={{ overflow: 'hidden', margin: '0 34px', borderRadius: 12 }}>
          <div
            onTransitionEnd={handleTransitionEnd}
            style={{
              display: 'flex',
              transform: `translateX(-${offset * (100 / perView)}%)`,
              transition: animate ? 'transform 500ms ease' : 'none',
            }}
          >
            {track.map(({ song, realIdx }, k) => (
              <div
                key={`${song.slug || song.title}-${k}`}
                style={{ flex: `0 0 ${100 / perView}%`, padding: '0 10px', boxSizing: 'border-box' }}
              >
                <SongCard
                  song={song}
                  index={realIdx}
                  onPlay={onPlay}
                  isCurrentPlaying={activeTitle === song.title && isPlaying}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={next} aria-label="Next slides" style={{ ...arrowStyle, right: -8 }}>
          ›
        </button>
      </div>
    </div>
  );
}
