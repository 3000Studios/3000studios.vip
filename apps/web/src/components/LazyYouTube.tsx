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
  controls = true,
  decorative = false,
  className = '',
}: {
  videoId: string;
  title: string;
  playlist?: boolean;
  autoLoad?: boolean;
  muted?: boolean;
  controls?: boolean;
  decorative?: boolean;
  className?: string;
}) {
  const [load, setLoad] = useState(autoLoad);
  // Guard (2026-10-11 bug fix): an empty/invalid videoId builds a dead
  // youtube-nocookie embed (embed/) and a broken poster — render nothing
  // (checked again after hooks below; no player/link is ever produced).
  const hasValidId = typeof videoId === 'string' && /^[\w-]{11}$/.test(videoId.trim());
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
    `controls=${controls ? 1 : 0}`,
    'loop=1',
    playlist ? `playlist=${videoId}` : '',
    'playsinline=1',
    'rel=0',
    'modestbranding=1',
  ]
    .filter(Boolean)
    .join('&')}`;

  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  if (!hasValidId) return null;

  return (
    <div ref={ref} className={`lazyYouTube ${className}`.trim()}>
      {shouldLoad ? (
        <iframe
          title={title}
          src={src}
          aria-hidden={decorative || undefined}
          tabIndex={decorative ? -1 : undefined}
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
