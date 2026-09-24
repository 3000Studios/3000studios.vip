import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

type VideoSource = {
  src: string;
  poster?: string;
  mimeType?: string;
};

const DEFAULT_SOURCES: VideoSource[] = [
  { src: '/media/spotify-signing.mp4', poster: '/media/hero-lcp.webp', mimeType: 'video/mp4' },
];

const GRADIENT_OVERLAY =
  'radial-gradient(ellipse at 50% 40%, rgba(16, 18, 35, 0.08) 0%, transparent 45%), ' +
  'radial-gradient(circle at 20% 10%, rgba(111, 244, 255, 0.06) 0%, transparent 35%), ' +
  'radial-gradient(circle at 80% 12%, rgba(241, 183, 78, 0.06) 0%, transparent 35%), ' +
  'radial-gradient(circle at 50% 120%, rgba(255, 106, 61, 0.05) 0%, transparent 40%), ' +
  'linear-gradient(to bottom, rgba(4, 3, 8, 0.75) 0%, transparent 40%, transparent 60%, rgba(4, 3, 8, 0.85) 100%)';

export function VideoLiveWallpaper({
  sources = DEFAULT_SOURCES,
  className = '',
  muted = true,
}: {
  sources?: VideoSource[];
  className?: string;
  muted?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reduced || isMobile) {
      video.pause();
      video.src = '';
      return;
    }

    const play = () => {
      void video.play().catch(() => {
        /* autoplay can be blocked; silent no-op */
      });
    };

    video.addEventListener('loadeddata', play);
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener('loadeddata', play);
      video.pause();
    };
  }, [reduced, isMobile]);

  if (reduced || isMobile) {
    return (
      <div
        className={`videoLiveWallpaper ${className}`.trim()}
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(241, 183, 78, 0.12) 0%, transparent 50%), ' +
            'radial-gradient(circle at 20% 10%, rgba(111, 244, 255, 0.08) 0%, transparent 40%), ' +
            'radial-gradient(circle at 80% 12%, rgba(255, 106, 61, 0.08) 0%, transparent 40%), ' +
            'linear-gradient(180deg, #020405, #060914 50%, #020405)',
        }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={`videoLiveWallpaper ${className}`.trim()} ref={containerRef} aria-hidden="true">
      <video
        ref={videoRef}
        className="videoLiveWallpaperMedia"
        autoPlay
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        {sources.map((s, i) => (
          <source key={i} src={s.src} type={s.mimeType ?? 'video/mp4'} />
        ))}
      </video>
      <div
        className="videoLiveWallpaperOverlay"
        style={{ backgroundImage: GRADIENT_OVERLAY }}
        aria-hidden="true"
      />
      <div className="videoLiveWallpaperVignette" aria-hidden="true" />
      <div className="videoLiveWallpaperScan" aria-hidden="true" />
    </div>
  );
}
