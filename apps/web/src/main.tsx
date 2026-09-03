/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import { SparkClickFX } from './components/SparkClickFX';
import { YouTubeSubscriberPerk } from './components/YouTubeSubscriberPerk';
import {
  AboutPage,
  BlogPage,
  CommunityPage,
  ContactPage,
  LegalPage,
  RequestsPage,
  SponsorsPage,
  VideoPage,
} from './pages/Home';
import { DiscoverHome } from './components/DiscoverHome';
import { BottomDock } from './components/BottomDock';
import { SampleGate } from './components/SampleGate';
import { LiveStreamPage } from './pages/LiveStreamPage';
import { PhoneGoLive } from './pages/PhoneGoLive';
import { MusicDeck } from './pages/MusicDeck';
import { ConceptBoard } from './pages/ConceptBoard';
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

function RootLayout() {
  return (
    <>
      <SparkClickFX />
      <YouTubeSubscriberPerk />
      <SampleGate />
      <Outlet />
      <BottomDock />
      <AdminFab />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <DiscoverHome /> },
      { path: '/music', element: <MusicDeck /> },
      { path: '/video', element: <VideoPage /> },
      { path: '/live', element: <LiveStreamPage /> },
      { path: '/go-live', element: <PhoneGoLive /> },
      { path: '/concepts', element: <ConceptBoard /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/requests', element: <RequestsPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/sponsors', element: <SponsorsPage /> },
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
