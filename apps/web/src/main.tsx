/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import './styles/swipe-slider.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import { SparkClickFX } from './components/SparkClickFX';
import { StageFX } from './components/StageFX';
import { YouTubeSubscriberPerk } from './components/YouTubeSubscriberPerk';
import {
  AboutPage,
  BlogPage,
  BlogPostPage,
  CommunityPage,
  ContactPage,
  LegalPage,
  RequestsPage,
  SponsorsPage,
  ThunderDomePage,
  AppsPage,
  ProjectsPage,
  VipPage,
} from './pages/Home';
import { HomePage } from './v3/HomePage';
import { BottomDock } from './components/BottomDock';
import { MusicDock } from './components/MusicDock';
import { SampleGate } from './components/SampleGate';
import { ConsentManager } from './components/ConsentManager';
import { usePrefersReducedMotion } from './lib/mediaQuery';
import { PhoneGoLive } from './pages/PhoneGoLive';
import { ShopPage } from './pages/Shop';
import { ConceptBoard } from './pages/ConceptBoard';
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
      <Outlet />
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
      { path: '/music', element: <Navigate to="/#music" replace /> },
      { path: '/video', element: <Navigate to="/" replace /> },
      { path: '/live', element: <Navigate to="/#live" replace /> },
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
