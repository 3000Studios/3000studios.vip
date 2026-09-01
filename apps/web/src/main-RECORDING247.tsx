/* eslint-disable react-refresh/only-export-components */

import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminFab } from './components/AdminFab';
import {
  AboutPage,
  BlogPage,
  CommunityPage,
  ContactPage,
  Home,
  LegalPage,
  MusicShowcase,
  RequestsPage,
  SponsorsPage,
  VideoPage,
} from './pages/Home';
import { LiveStreamPage } from './pages/LiveStreamPage';
import { ConceptBoard } from './pages/ConceptBoard';
import { AuthProvider } from './lib/auth';
import { initVelvetMachine } from './lib/velvetEngine';
import { GlobalMusicBar, GlobalMusicProvider } from './components/GlobalMusic';

const Shell = lazy(() => import('./components/Shell').then((module) => ({ default: module.Shell })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Sites = lazy(() => import('./pages/Sites').then((module) => ({ default: module.Sites })));
const Ops = lazy(() => import('./pages/Ops').then((module) => ({ default: module.Ops })));
const SiteDetail = lazy(() => import('./pages/SiteDetail').then((module) => ({ default: module.SiteDetail })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const StreamVault = lazy(() => import('./pages/StreamVault').then((module) => ({ default: module.StreamVault })));
const SongPage = lazy(() => import('./pages/SongPage').then((module) => ({ default: module.SongPage })));
const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })));

function RouteLoader({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="routeLoader" aria-label="Loading" />}>{children}</Suspense>;
}

function RootLayout() {
  return (
    <>
      <Outlet />
      <AdminFab />
      <GlobalMusicBar />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/music', element: <MusicShowcase /> },
      { path: '/video', element: <VideoPage /> },
      { path: '/live', element: <LiveStreamPage /> },
      { path: '/concepts', element: <ConceptBoard /> },
      { path: '/community', element: <CommunityPage /> },
      { path: '/requests', element: <RequestsPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/sponsors', element: <SponsorsPage /> },
      { path: '/song/:slug', element: <RouteLoader><SongPage /></RouteLoader> },
      { path: '/about', element: <AboutPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/privacy', element: <LegalPage type="privacy" /> },
      { path: '/terms', element: <LegalPage type="terms" /> },
      { path: '/copyright', element: <LegalPage type="copyright" /> },
      { path: '/cookies', element: <LegalPage type="cookies" /> },
      { path: '/disclaimer', element: <LegalPage type="disclaimer" /> },
      { path: '/admin', element: <RouteLoader><Admin /></RouteLoader> },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: '/vault',
            element: <RouteLoader><Shell /></RouteLoader>,
            children: [
              { index: true, element: <RouteLoader><Dashboard /></RouteLoader> },
              { path: 'sites', element: <RouteLoader><Sites /></RouteLoader> },
              { path: 'sites/:id', element: <RouteLoader><SiteDetail /></RouteLoader> },
              { path: 'ops', element: <RouteLoader><Ops /></RouteLoader> },
              { path: 'stream', element: <RouteLoader><StreamVault /></RouteLoader> },
              { path: 'settings', element: <RouteLoader><Settings /></RouteLoader> },
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
