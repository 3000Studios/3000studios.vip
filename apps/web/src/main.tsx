/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/swipe-slider.css';
import './styles/neon-noir.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import { SparkClickFX } from './components/SparkClickFX';
import { StageFX } from './components/StageFX';
import { EmpireHome } from './empire/EmpireHome';
import { EmpireFX } from './empire/EmpireFX';
import './empire/empire.css';
import { WaterWallpaper } from './components/WaterWallpaper';

/* Route-level code splitting (fast-track 2026-10-29, audit Phase 2):
   every secondary page is lazy-loaded. Only the home page and the layout
   chrome stay in the initial bundle. */
const AboutPage = lazy(() => import('./empire/pages/AboutEmpire').then((m) => ({ default: m.AboutEmpire })));
const BlogPage = lazy(() => import('./empire/pages/StudioNotes').then((m) => ({ default: m.StudioNotes })));
const DailyPostPage = lazy(() => import('./empire/pages/DailyPostPage').then((m) => ({ default: m.DailyPostPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const ContactPage = lazy(() => import('./empire/pages/BookingDesk').then((m) => ({ default: m.BookingDesk })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const RequestsPage = lazy(() => import('./empire/pages/ConceptBoard').then((m) => ({ default: m.ConceptBoard })));
const SponsorsPage = lazy(() => import('./empire/pages/SponsorDesk').then((m) => ({ default: m.SponsorDesk })));
const AeropocalypsePage = lazy(() => import('./empire/pages/AeroPage').then((m) => ({ default: m.AeroPage })));
const AeropocalypsePrivacyPage = lazy(() => import('./pages/AeropocalypsePrivacyPage').then((m) => ({ default: m.AeropocalypsePrivacyPage })));
const AppsPage = lazy(() => import('./empire/pages/AppsLab').then((m) => ({ default: m.AppsLab })));
const ProjectsPage = lazy(() => import('./empire/pages/ProjectsLab').then((m) => ({ default: m.ProjectsLab })));
const VipPage = lazy(() => import('./empire/pages/VipRope').then((m) => ({ default: m.VipRope })));
const MusicPage = lazy(() => import('./empire/pages/MusicVault').then((m) => ({ default: m.MusicVault })));
const VideoPage = lazy(() => import('./empire/pages/VideoVault').then((m) => ({ default: m.VideoVault })));
const LiveBroadcastPage = lazy(() => import('./empire/pages/LiveCommand').then((m) => ({ default: m.LiveCommand })));
const PodcastPage = lazy(() => import('./empire/pages/PodcastHub').then((m) => ({ default: m.PodcastHub })));
const BeatsPage = lazy(() => import('./empire/pages/BeatPacks').then((m) => ({ default: m.BeatPacks })));
const BooksPage = lazy(() => import('./pages/BooksPage').then((m) => ({ default: m.BooksPage })));
const CommandDeckPage = lazy(() => import('./pages/CommandDeckPage').then((m) => ({ default: m.CommandDeckPage })));
const OfficePage = lazy(() => import('./pages/OfficePage').then((m) => ({ default: m.OfficePage })));
const PhoneGoLive = lazy(() => import('./pages/PhoneGoLive').then((m) => ({ default: m.PhoneGoLive })));
const ShopPage = lazy(() => import('./empire/pages/EmpireShop').then((m) => ({ default: m.EmpireShop })));
const ConceptBoard = lazy(() => import('./pages/ConceptBoard').then((m) => ({ default: m.ConceptBoard })));
const WallpaperPage = lazy(() => import('./pages/WallpaperPage').then((m) => ({ default: m.WallpaperPage })));
import { MusicDock } from './components/MusicDock';
import { SampleGate } from './components/SampleGate';
import { ConsentManager } from './components/ConsentManager';
import { usePrefersReducedMotion } from './lib/mediaQuery';
import { AuthProvider } from './lib/auth';
import { initVelvetMachine } from './lib/velvetEngine';
import { GlobalMusicProvider } from './components/GlobalMusic';
import { usePageMeta } from './lib/usePageMeta';
import { NotFoundPage } from './pages/NotFoundPage';

/** Wraps a route element with a per-route title + meta description. */
function Titled({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  usePageMeta({ title, description });
  return <>{children}</>;
}

const Shell = lazy(() =>
  import('./components/Shell').then((module) => ({ default: module.Shell })),
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const Sites = lazy(() => import('./pages/Sites').then((module) => ({ default: module.Sites })));
const Ops = lazy(() => import('./pages/Ops').then((module) => ({ default: module.Ops })));
const SiteDetail = lazy(() =>
  import('./pages/SiteDetail').then((module) => ({ default: module.SiteDetail })),
);
const Settings = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.Settings })),
);
const StreamVault = lazy(() =>
  import('./pages/StreamVault').then((module) => ({ default: module.StreamVault })),
);
const MusicVideoGenerator = lazy(() =>
  import('./pages/MusicVideoGenerator').then((module) => ({ default: module.MusicVideoGenerator })),
);
const SongDrop = lazy(() =>
  import('./pages/SongDrop').then((module) => ({ default: module.SongDrop })),
);
const SongPage = lazy(() =>
  import('./pages/SongPage').then((module) => ({ default: module.SongPage })),
);
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })));
const AgentCommandCenter = lazy(() =>
  import('./pages/AgentCommandCenter').then((module) => ({ default: module.AgentCommandCenter })),
);

/* Public pages are route-lazy too (v2 perf pass, 2026-10-27): the eager
   barrel import used to pull every public page — and the old PublicLayout
   with its three.js wallpaper — into the entry chunk. Same pattern the
   admin routes already used. */
function RouteLoader({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="routeLoader" aria-label="Loading" />}>{children}</Suspense>
  );
}

function FxGate({ children }: { children: React.ReactNode }) {
  const reduced = usePrefersReducedMotion();
  if (reduced) return null;
  return <>{children}</>;
}

function RootLayout() {
  return (
    <>
      {/* Water wallpaper from 3000studios.space (Boss order, 2026-10-31):
          fixed ripple canvas behind all public pages; self-excludes on
          owner/office routes. */}
      <WaterWallpaper />
      {/* VIP redesign 2026-10-27: fleet ACSS scroll progress bar (CSS-only). */}
      <div className="acss-progress" aria-hidden="true" />
      {/* EMPIRE redesign 2026-11-18: per-page live aura, touch glow, click
          sounds + rings, scroll reveals, music-reactive headers, phone tilt. */}
      <EmpireFX />
      <FxGate>
        <SparkClickFX />
        <StageFX />
      </FxGate>
      {/* Exactly one subscribe CTA on the site: the header nav Subscribe
          button (v2/Header). The old floating Subscribe FAB component was
          removed as dead code (Boss order, 2026-10-26). */}
      <SampleGate />
      <Outlet />
      <MusicDock />
      <AdminFab />
      <ConsentManager />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <EmpireHome /> },
      {
        path: '/music',
        element: (
          <Titled
            title="Music Vault"
            description="The 3000 Studios catalog — 1-minute previews on this site, full tracks on Apple Music, Spotify, and every major platform."
          >
            <RouteLoader><MusicPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/video',
        element: (
          <Titled
            title="Video Vault"
            description="Official 3000 Studios music videos and Aeropocalypse cinematics — free to watch via YouTube."
          >
            <RouteLoader><VideoPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/live',
        element: (
          <Titled
            title="Live Command"
            description="Watch 3000 Studios live — broadcast deck, schedule, and chat."
          >
            <RouteLoader><LiveBroadcastPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/podcast',
        element: (
          <Titled
            title="Podcast"
            description="The 3000 Studios Podcast — stream every episode with Follow and Subscribe."
          >
            <RouteLoader><PodcastPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/books',
        element: (
          <Titled
            title="Books"
            description="All 93 books by Jeremy Swain from 3000 Studios Press: fantasy, mystery, cookbooks, creator playbooks and more, $9.99 each direct from the studio store."
          >
            <RouteLoader><BooksPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/beats',
        element: (
          <Titled
            title="Beat Packs"
            description="License 3000 Studios beat packs — instrumentals and bundles with instant delivery."
          >
            <RouteLoader><BeatsPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/command-deck',
        element: (
          <Titled
            title="Command Deck"
            description="Owner dashboard — content stats and unlock payment controls."
          >
            <RouteLoader><CommandDeckPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/office',
        element: (
          <Titled
            title="The Office"
            description="Owner's office — private live window."
          >
            <RouteLoader><OfficePage /></RouteLoader>
          </Titled>
        ),
      },
      {
        // Canonical game privacy URL under the game's current name
        // (AEROPOCALYPSE: ONLINE, renamed 2026-11-04). The two legacy
        // paths below stay live because the Play Console listing and
        // older links still point at them.
        path: '/aeropocalypse/privacy',
        element: (
          <Titled
            title="AEROPOCALYPSE: ONLINE Privacy Policy"
            description="Privacy Policy for AEROPOCALYPSE: ONLINE by 3000 Studios."
          >
            <RouteLoader><AeropocalypsePrivacyPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/thunder-dome/privacy',
        element: (
          <Titled
            title="AEROPOCALYPSE: ONLINE Privacy Policy"
            description="Privacy Policy for AEROPOCALYPSE: ONLINE by 3000 Studios."
          >
            <RouteLoader><AeropocalypsePrivacyPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        // Play Console URL: same canonical policy component as
        // /aeropocalypse/privacy, served at the listing's hyphenated URL.
        path: '/thunderdome-privacy',
        element: (
          <Titled
            title="AEROPOCALYPSE: ONLINE Privacy Policy"
            description="Privacy Policy for AEROPOCALYPSE: ONLINE by 3000 Studios."
          >
            <RouteLoader><AeropocalypsePrivacyPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/aeropocalypse',
        element: (
          <Titled
            title="AEROPOCALYPSE: ONLINE — Cinematic Theater"
            description="The official home of AEROPOCALYPSE: ONLINE by 3000 Studios — 25 stages, 24 bosses and 25 original songs. Free to play on Google Play, with party co-op and 1v1 duels."
          >
            <RouteLoader><AeropocalypsePage /></RouteLoader>
          </Titled>
        ),
      },
      // The game was renamed Thunder Dome -> AEROPOCALYPSE: ONLINE
      // (Boss order, 2026-11-04). The old /thunder-dome path is NOT a
      // router entry: it 301s at the edge via src/data/redirects.json
      // (the meta generator turns it into a middleware redirect).
      {
        path: '/apps',
        element: (
          <Titled
            title="Apps"
            description="Apps and interactive projects from 3000 Studios."
          >
            <RouteLoader><AppsPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/projects',
        element: (
          <Titled
            title="Projects"
            description="Studio projects from 3000 Studios — music, video, software, and games."
          >
            <RouteLoader><ProjectsPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/vip',
        element: (
          <Titled
            title="VIP"
            description="3000 Studios VIP — early drops, vault tracks, and member perks."
          >
            <RouteLoader><VipPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/shop',
        element: (
          <Titled
            title="Shop"
            description="3000 Studios shop — merch, VIP passes, and sponsor slots."
          >
            <RouteLoader><ShopPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/go-live',
        element: (
          <Titled
            title="Go Live"
            description="Start a 3000 Studios live broadcast from your phone."
          >
            <RouteLoader><PhoneGoLive /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/concepts',
        element: (
          <Titled
            title="Concepts"
            description="3000 Studios concept board — ideas in progress, vote on what gets made."
          >
            <RouteLoader><ConceptBoard /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/wallpaper',
        element: (
          <Titled
            title="Live Wallpaper"
            description="3000 Studios live video wallpaper — the studio stage as your backdrop."
          >
            <RouteLoader><WallpaperPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/community',
        element: (
          <Titled
            title="Community"
            description="The 3000 Studios community — requests, discussions, and fans."
          >
            <RouteLoader><CommunityPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/requests',
        element: (
          <Titled
            title="Requests"
            description="Request a song, video, or cover from 3000 Studios."
          >
            <RouteLoader><RequestsPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/blog',
        element: (
          <Titled
            title="Blog"
            description="News, stories, and studio notes from 3000 Studios."
          >
            <RouteLoader><BlogPage /></RouteLoader>
          </Titled>
        ),
      },
      { path: '/blog/daily/:date', element: <RouteLoader><DailyPostPage /></RouteLoader> },
      { path: '/blog/:slug', element: <RouteLoader><BlogPostPage /></RouteLoader> },
      {
        path: '/sponsors',
        element: (
          <Titled
            title="Sponsors"
            description="Sponsor a 3000 Studios homepage slot — 30 days on the front page."
          >
            <RouteLoader><SponsorsPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/song/:slug',
        element: (
          <RouteLoader>
            <SongPage />
          </RouteLoader>
        ),
      },
      { path: '/about', element: <RouteLoader><AboutPage /></RouteLoader> },
      { path: '/contact', element: <RouteLoader><ContactPage /></RouteLoader> },
      {
        path: '/privacy',
        element: (
          <Titled
            title="Privacy Policy"
            description="Privacy Policy for 3000studios.vip — how 3000 Studios collects, uses, and protects your information."
          >
            <RouteLoader><PrivacyPolicyPage /></RouteLoader>
          </Titled>
        ),
      },
      // Canonical privacy URL is /privacy — keep the old path as an alias only.
      { path: '/privacy-policy', element: <Navigate to="/privacy" replace /> },
      { path: '/terms', element: <RouteLoader><LegalPage type="terms" /></RouteLoader> },
      { path: '/copyright', element: <RouteLoader><LegalPage type="copyright" /></RouteLoader> },
      { path: '/cookies', element: <RouteLoader><LegalPage type="cookies" /></RouteLoader> },
      { path: '/disclaimer', element: <RouteLoader><LegalPage type="disclaimer" /></RouteLoader> },
      { path: '/shipping', element: <RouteLoader><LegalPage type="shipping" /></RouteLoader> },
      { path: '/returns', element: <RouteLoader><LegalPage type="returns" /></RouteLoader> },
      { path: '*', element: <NotFoundPage /> },
      {
        path: '/admin',
        element: (
          <RouteLoader>
            <Admin />
          </RouteLoader>
        ),
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/agent',
            element: (
              <RouteLoader>
                <AgentCommandCenter />
              </RouteLoader>
            ),
          },
          {
            path: '/vault',
            element: (
              <RouteLoader>
                <Shell />
              </RouteLoader>
            ),
            children: [
              {
                index: true,
                element: (
                  <RouteLoader>
                    <Dashboard />
                  </RouteLoader>
                ),
              },
              {
                path: 'song-drop',
                element: (
                  <RouteLoader>
                    <SongDrop />
                  </RouteLoader>
                ),
              },
              {
                path: 'sites',
                element: (
                  <RouteLoader>
                    <Sites />
                  </RouteLoader>
                ),
              },
              {
                path: 'sites/:id',
                element: (
                  <RouteLoader>
                    <SiteDetail />
                  </RouteLoader>
                ),
              },
              {
                path: 'ops',
                element: (
                  <RouteLoader>
                    <Ops />
                  </RouteLoader>
                ),
              },
              {
                path: 'stream',
                element: (
                  <RouteLoader>
                    <StreamVault />
                  </RouteLoader>
                ),
              },
              {
                path: 'music-video',
                element: (
                  <RouteLoader>
                    <MusicVideoGenerator />
                  </RouteLoader>
                ),
              },
              {
                path: 'settings',
                element: (
                  <RouteLoader>
                    <Settings />
                  </RouteLoader>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
]);

initVelvetMachine();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <GlobalMusicProvider>
          <RouterProvider router={router} />
        </GlobalMusicProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
