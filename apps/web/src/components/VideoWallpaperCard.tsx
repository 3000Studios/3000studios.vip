import { useEffect, useRef, useState, type ReactNode } from 'react';
import { youtubeArtworkUrl, youtubeEmbedUrl } from '../data/officialReleases';

export function VideoWallpaperCard({
  videoId,
  title,
  kicker,
  href,
  to,
  children,
  className = '',
}: {
  videoId: string;
  title: string;
  kicker?: string;
  href?: string;
  to?: string;
  children?: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.35);
        setActive(hit);
      },
      { threshold: [0, 0.35, 0.7] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const poster = youtubeArtworkUrl(videoId);
  const src = `${youtubeEmbedUrl(videoId)}&autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&modestbranding=1`;
  const inner = (
    <>
      <div className="vwPoster" style={{ backgroundImage: `url(${poster})` }} aria-hidden="true" />
      {active ? (
        <iframe className="vwFrame" src={src} title="" tabIndex={-1} allow="autoplay; encrypted-media" />
      ) : null}
      <div className="vwShade" aria-hidden="true" />
      <div className="vwCopy">
        {kicker ? <span>{kicker}</span> : null}
        <strong>{title}</strong>
        {children}
      </div>
    </>
  );

  const cls = `vwCard ${className}`.trim();
  if (href) {
    return (
      <a ref={ref as never} className={cls} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {inner}
      </a>
    );
  }
  return (
    <article ref={ref} className={cls} data-to={to}>
      {inner}
    </article>
  );
}
