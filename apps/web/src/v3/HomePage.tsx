import { useEffect, useState } from 'react';
import { Header } from '../v2/Header';
import { PageFade } from '../v2/Reveal';
import { AdSenseUnit } from '../pages/PublicLayout';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { Preloader, CursorFX, Grain } from './chrome';
import { EQWallpaper } from './EQWallpaper';
import { HeroEQ } from './HeroEQ';
import { Statement, ClipReveal, StudioGrid, CtaBand, Marquee } from './Sections';
import { HorizontalReleases } from './HorizontalReleases';
import { MusicSection, settlePendingPurchase } from './MusicSection';
import { PromoShorts } from './PromoShorts';
import { CoverWall } from './CoverWall';
import { LiveSection } from './LiveSection';
import { PulseFooter } from './PulseFooter';

export function HomePage() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    settlePendingPurchase();
    let cancelled = false;
    void detectIsLive().then((s) => {
      if (!cancelled) setLive(s.live);
    });
    const unsub = subscribeHostLive((v) => setLive(v));
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  return (
    <>
      <EQWallpaper />
      <div className="v3-root v3-root--eq">
        <Preloader />
        <CursorFX />
        <Grain />
        <Header />
        <PageFade routeKey="/">
          <main>
            <HeroEQ live={live} />
            <LiveSection />
            <CoverWall />
            <Marquee
              items={[
                'New singles weekly',
                'On all platforms',
                '3000 Studios',
                'Watch the films',
                'Book the studio',
              ]}
            />
            <Statement />
            <ClipReveal />
            <HorizontalReleases />
            <PromoShorts />
            <div className="v3-wrap" style={{ padding: '0 6vw' }}>
              <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
            </div>
            <MusicSection />
            <StudioGrid />
            <CtaBand />
          </main>
        </PageFade>
        <PulseFooter />
      </div>
    </>
  );
}
