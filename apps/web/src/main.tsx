/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/neon-noir.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import { SparkClickFX } from './components/SparkClickFX';
import { StageFX } from './components/StageFX';
import { YouTubeSubscriberPerk } from './components/YouTubeSubscriberPerk';
/* Route pages are lazy-loaded so the entry bundle only carries the homepage;
   every other page ships as its own chunk and loads on navigation. */
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })),
);
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() =>
  import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })),
);
const CommunityPage = lazy(() =>
  import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })),
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const PrivacyPolicyPage = lazy(() =>
  import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })),
);
const RequestsPage = lazy(() =>
  import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })),
);
const SponsorsPage = lazy(() =>
  import('./pages/SponsorsPage').then((m) => ({ default: m.SponsorsPage })),
);
const ThunderDomePage = lazy(() =>
  import('./pages/ThunderDomePage').then((m) => ({ default: m.ThunderDomePage })),
);
const ThunderDomePrivacyPage = lazy(() =>
  import('./pages/ThunderDomePrivacyPage').then((m) => ({ default: m.ThunderDomePrivacyPage })),
);
const AppsPage = lazy(() => import('./pages/AppsPage').then((m) => ({ default: m.AppsPage })));
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const VipPage = lazy(() => import('./pages/VipPage').then((m) => ({ default: m.VipPage })));
const MusicPage = lazy(() => import('./pages/MusicPage').then((m) => ({ default: m.MusicPage })));
const VideoPage = lazy(() => import('./pages/VideoPage').then((m) => ({ default: m.VideoPage })));
const LiveBroadcastPage = lazy(() =>
  import('./pages/LiveBroadcastPage').then((m) => ({ default: m.LiveBroadcastPage })),
);
const PodcastPage = lazy(() =>
  import('./pages/PodcastPage').then((m) => ({ default: m.PodcastPage })),
);
const BeatsPage = lazy(() => import('./pages/BeatsPage').then((m) => ({ default: m.BeatsPage })));
const CommandDeckPage = lazy(() =>
  import('./pages/CommandDeckPage').then((m) => ({ default: m.CommandDeckPage })),
);
const PhoneGoLive = lazy(() =>
  import('./pages/PhoneGoLive').then((m) => ({ default: m.PhoneGoLive })),
);
const ShopPage = lazy(() => import('./pages/Shop').then((m) => ({ default: m.ShopPage })));
const ConceptBoard = lazy(() =>
  import('./pages/ConceptBoard').then((m) => ({ default: m.ConceptBoard })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
import { HomePage } from './v3/HomePage';
import { BottomDock } from './components/BottomDock';
import { MusicDock } from './components/MusicDock';
import { SampleGate } from './components/SampleGate';
import { ConsentManager } from './components/ConsentManager';
import { usePrefersReducedMotion } from './lib/mediaQuery';
import { AuthProvider } from './lib/auth';
import { initVelvetMachine } from './lib/velvetEngine';
import { GlobalMusicProvider } from './components/GlobalMusic';
import { usePageMeta } from './lib/usePageMeta';

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
      <FxGate>
        <SparkClickFX />
        <StageFX />
      </FxGate>
      <YouTubeSubscriberPerk />
      <SampleGate />
      <RouteLoader>
        <Outlet />
      </RouteLoader>
      <MusicDock />
      <BottomDock />
      <AdminFab />
      <ConsentManager />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      {
        path: '/music',
        element: (
          <Titled
            title="Music Vault"
            description="The full 3000 Studios DistroKid catalog — stream every official release free."
          >
            <MusicPage />
          </Titled>
        ),
      },
      {
        path: '/video',
        element: (
          <Titled
            title="Video Vault"
            description="Official 3000 Studios music videos and Thunderdome cinematics — free previews, $1 full unlocks."
          >
            <VideoPage />
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
            <LiveBroadcastPage />
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
            <PodcastPage />
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
            <BeatsPage />
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
            <CommandDeckPage />
          </Titled>
        ),
      },
      {
        path: '/thunder-dome/privacy',
        element: (
          <Titled
            title="Thunderdome: AeroStrike Privacy Policy"
            description="Privacy Policy for Thunderdome: AeroStrike by 3000 Studios."
          >
            <ThunderDomePrivacyPage />
          </Titled>
        ),
      },
      {
        path: '/thunder-dome',
        element: (
          <Titled
            title="Thunderdome"
            description="Thunderdome by 3000 Studios — the top-down arena shooter. Play the build, watch the trailer."
          >
            <ThunderDomePage />
          </Titled>
        ),
      },
      {
        path: '/apps',
        element: (
          <Titled
            title="Apps"
            description="Apps and interactive projects from 3000 Studios."
          >
            <AppsPage />
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
            <ProjectsPage />
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
            <VipPage />
          </Titled>
        ),
      },
      {
        path: '/shop',
        element: (
          <Titled
            title="Shop"
            description="3000 Studios shop — merch, singles, and studio services."
          >
            <ShopPage />
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
            <PhoneGoLive />
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
            <ConceptBoard />
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
            <CommunityPage />
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
            <RequestsPage />
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
            <BlogPage />
          </Titled>
        ),
      },
      { path: '/blog/:slug', element: <BlogPostPage /> },
      {
        path: '/sponsors',
        element: (
          <Titled
            title="Sponsors"
            description="Sponsor a 3000 Studios homepage slot — 30 days on the front page."
          >
            <SponsorsPage />
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
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/privacy', element: <LegalPage type="privacy" /> },
      {
        path: '/privacy-policy',
        element: (
          <Titled
            title="Privacy Policy"
            description="Privacy Policy for 3000studios.vip — how 3000 Studios collects, uses, and protects your information."
          >
            <PrivacyPolicyPage />
          </Titled>
        ),
      },
      { path: '/terms', element: <LegalPage type="terms" /> },
      { path: '/copyright', element: <LegalPage type="copyright" /> },
      { path: '/cookies', element: <LegalPage type="cookies" /> },
      { path: '/disclaimer', element: <LegalPage type="disclaimer" /> },
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
