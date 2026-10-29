import { useEffect, useState } from 'react';
import { Header } from '../v2/Header';
import { PageFade } from '../v2/Reveal';
import { detectIsLive, subscribeHostLive } from '../lib/streamLiveDetect';
import { CockpitDossier, MissionTimeline, CommandRail } from './Cockpit';
import { Preloader, CursorFX, Grain } from './chrome';
import { HeroEQ } from './HeroEQ';
import { Statement, ClipReveal, StudioGrid, CtaBand, Marquee } from './Sections';
import { HorizontalReleases } from './HorizontalReleases';
import { MusicSection, settlePendingPurchase } from './MusicSection';
import { PromoShorts } from './PromoShorts';
import { CoverWall } from './CoverWall';
import { LiveSection } from './LiveSection';
import { ThunderdomeFeature } from './ThunderdomeFeature';
import { Footer } from '../v2/Footer';

import { usePageMeta } from '../lib/usePageMeta';

export function HomePage() {
  const [live, setLive] = useState(false);

  usePageMeta({
    title: 'Official Music & Live Stage',
    description:
      '3000 Studios — original music, cinematic videos, and live broadcasts from Acworth, Georgia. New singles weekly, on all platforms.',
  });

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
      <div className="v3-root">
        <Preloader />
        <CursorFX />
        <Grain />
        <Header />
        <PageFade routeKey="/">
          <main>
            <HeroEQ live={live} />
            <CockpitDossier live={live} />
            <MissionTimeline />
            <ThunderdomeFeature />
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
            {/* No AdSense unit on home (fast-track 2026-10-29, audit §4.3):
                home is an aggregate surface listing explicit titles, so it
                is ads-off by route in explicitAdsGate — the unit is not
                even mounted here. */}
            <MusicSection />
            <StudioGrid />
            <CtaBand />
          </main>
        </PageFade>
        <Footer />
        <CommandRail />
      </div>
    </>
  );
}
