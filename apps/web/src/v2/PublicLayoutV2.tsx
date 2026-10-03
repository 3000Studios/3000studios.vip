import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Wallpaper, type WallpaperVariant } from './Wallpaper';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageFade } from './Reveal';
import { AdSenseUnit } from '../pages/Home';

/** Per-page wallpaper identities. */
// eslint-disable-next-line react-refresh/only-export-components
export const WALLPAPERS: Record<string, WallpaperVariant> = {
  '/': 'aurora',
  '/shop': 'grid',
  '/community': 'particles',
  '/concepts': 'grid',
  '/requests': 'waves',
  '/blog': 'particles',
  '/sponsors': 'beams',
  '/about': 'nebula',
  '/contact': 'waves',
  '/go-live': 'beams',
  '/song': 'eq',
};

// eslint-disable-next-line react-refresh/only-export-components
export function wallpaperFor(pathname: string): WallpaperVariant {
  if (WALLPAPERS[pathname]) return WALLPAPERS[pathname];
  if (pathname.startsWith('/song/')) return 'eq';
  if (pathname.startsWith('/admin') || pathname.startsWith('/vault') || pathname === '/agent')
    return 'static';
  return 'nebula';
}

export function LiveLine() {
  return <hr className="v2-live-line" aria-hidden="true" />;
}

export function PublicLayoutV2({
  children,
  wallpaper,
}: {
  children: ReactNode;
  wallpaper?: WallpaperVariant;
}) {
  const location = useLocation();
  const variant = wallpaper ?? wallpaperFor(location.pathname);
  return (
    <div className="v2-root">
      <Wallpaper variant={variant} />
      <Header />
      <div className="v2-main">
        <PageFade routeKey={location.pathname}>
          <main>{children}</main>
        </PageFade>
      </div>
      <Footer />
    </div>
  );
}

/** Re-export so v2 pages keep ad slots working. */
export { AdSenseUnit };
