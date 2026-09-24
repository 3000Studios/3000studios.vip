/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import { SwipeHome } from './components/SwipeHome';
import { BottomDock } from './components/BottomDock';
const MusicDock = lazy(() => import('./components/MusicDock').then((m) => ({ default: m.MusicDock })));
import { ConsentManager } from './components/ConsentManager';
import { usePrefersReducedMotion } from './lib/mediaQuery';
import { AuthProvider } from './lib/auth';
import { initVelvetMachine } from './lib/velvetEngine';
import { GlobalMusicProvider } from './components/GlobalMusic';

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
const LiveStreamPageLazy = lazy(() =>
  import('./pages/LiveStreamPage').then((module) => ({ default: module.LiveStreamPage })),
);
const AgentCommandCenter = lazy(() =>
  import('./pages/AgentCommandCenter').then((module) => ({ default: module.AgentCommandCenter })),
);
const VideoPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.VideoPage })));
const AboutPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.BlogPage })));
const CommunityPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.CommunityPage })));
const ContactPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.LegalPage })));
const RequestsPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.RequestsPage })));
const SponsorsPage = lazy(() => import('./pages/Home').then((m) => ({ default: m.SponsorsPage })));
const MusicDeck = lazy(() => import('./pages/MusicDeck').then((m) => ({ default: m.MusicDeck })));
const ShopPage = lazy(() => import('./pages/Shop').then((m) => ({ default: m.ShopPage })));
const ConceptBoard = lazy(() => import('./pages/ConceptBoard').then((m) => ({ default: m.ConceptBoard })));
const PhoneGoLive = lazy(() => import('./pages/PhoneGoLive').then((m) => ({ default: m.PhoneGoLive })));
const SampleGate = lazy(() => import('./components/SampleGate').then((m) => ({ default: m.SampleGate })));
const YouTubeSubscriberPerk = lazy(() =>
  import('./components/YouTubeSubscriberPerk').then((m) => ({ default: m.YouTubeSubscriberPerk })),
);
const SparkClickFX = lazy(() => import('./components/SparkClickFX').then((m) => ({ default: m.SparkClickFX })));
const StageFX = lazy(() => import('./components/StageFX').then((m) => ({ default: m.StageFX })));
const WallpaperPage = lazy(() =>
  import('./pages/WallpaperPage').then((m) => ({ default: m.WallpaperPage })),
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
      <Suspense fallback={null}>
        <FxGate>
          <SparkClickFX />
          <StageFX />
        </FxGate>
        <YouTubeSubscriberPerk />
        <SampleGate />
      </Suspense>
      <Outlet />
      <Suspense fallback={null}>
        <MusicDock />
      </Suspense>
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
      { path: '/', element: <SwipeHome /> },
      { path: '/music', element: <RouteLoader><MusicDeck /></RouteLoader> },
      { path: '/video', element: <RouteLoader><VideoPage /></RouteLoader> },
      {
        path: '/live',
        element: (
          <RouteLoader>
            <LiveStreamPageLazy />
          </RouteLoader>
        ),
      },
      { path: '/shop', element: <RouteLoader><ShopPage /></RouteLoader> },
      { path: '/go-live', element: <RouteLoader><PhoneGoLive /></RouteLoader> },
      { path: '/concepts', element: <RouteLoader><ConceptBoard /></RouteLoader> },
      { path: '/community', element: <RouteLoader><CommunityPage /></RouteLoader> },
      { path: '/requests', element: <RouteLoader><RequestsPage /></RouteLoader> },
      { path: '/blog', element: <RouteLoader><BlogPage /></RouteLoader> },
      { path: '/sponsors', element: <RouteLoader><SponsorsPage /></RouteLoader> },
      { path: '/wallpaper', element: <RouteLoader><WallpaperPage /></RouteLoader> },
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
      { path: '/privacy', element: <RouteLoader><LegalPage type="privacy" /></RouteLoader> },
      { path: '/terms', element: <RouteLoader><LegalPage type="terms" /></RouteLoader> },
      { path: '/copyright', element: <RouteLoader><LegalPage type="copyright" /></RouteLoader> },
      { path: '/cookies', element: <RouteLoader><LegalPage type="cookies" /></RouteLoader> },
      { path: '/disclaimer', element: <RouteLoader><LegalPage type="disclaimer" /></RouteLoader> },
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

if (typeof location !== 'undefined' && location.pathname !== '/') {
  document.documentElement.classList.add('is-app-ready');
}

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
