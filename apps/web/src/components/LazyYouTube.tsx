import { useEffect, useRef, useState } from 'react';

/**
 * Lazy-loading YouTube iframe. Shows a poster + play button until the user
 * explicitly opts in, avoiding mobile data waste and autoplay-policy failures.
 */
export function LazyYouTube({
  videoId,
  title,
  playlist,
  autoLoad = false,
  muted = true,
  className = '',
}: {
  videoId: string;
  title: string;
  playlist?: boolean;
  autoLoad?: boolean;
  muted?: boolean;
  className?: string;
}) {
  const [load, setLoad] = useState(autoLoad);
  const shouldLoad = autoLoad || load;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shouldLoad) return;
    if (!('IntersectionObserver' in window)) {
      const id = setTimeout(() => setLoad(true), 0);
      return () => clearTimeout(id);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    const el = ref.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [shouldLoad]);

  const src = `https://www.youtube-nocookie.com/embed/${videoId}?${[
    'autoplay=1',
    `mute=${muted ? 1 : 0}`,
    'controls=1',
    'loop=1',
    playlist ? `playlist=${videoId}` : '',
    'playsinline=1',
    'rel=0',
    'modestbranding=1',
  ]
    .filter(Boolean)
    .join('&')}`;

  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div ref={ref} className={`lazyYouTube ${className}`.trim()}>
      {shouldLoad ? (
        <iframe
          title={title}
          src={src}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      ) : (
        <button
          type="button"
          className="lazyYouTubePoster"
          onClick={() => setLoad(true)}
          aria-label={`Play ${title}`}
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <span className="lazyYouTubePlay" aria-hidden="true">
            ▶
          </span>
        </button>
      )}
    </div>
  );
}
