import { lazy, StrictMode, Suspense, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { AuthProvider } from './lib/auth';

const Shell = lazy(() => import('./components/Shell').then((module) => ({ default: module.Shell })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const Sites = lazy(() => import('./pages/Sites').then((module) => ({ default: module.Sites })));
const Ops = lazy(() => import('./pages/Ops').then((module) => ({ default: module.Ops })));
const SiteDetail = lazy(() => import('./pages/SiteDetail').then((module) => ({ default: module.SiteDetail })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const StreamVault = lazy(() => import('./pages/StreamVault').then((module) => ({ default: module.StreamVault })));
const SongPage = lazy(() => import('./pages/SongPage').then((module) => ({ default: module.SongPage })));
const About = lazy(() => import('./pages/Legal').then((module) => ({ default: module.About })));
const Contact = lazy(() => import('./pages/Legal').then((module) => ({ default: module.Contact })));
const Privacy = lazy(() => import('./pages/Legal').then((module) => ({ default: module.Privacy })));
const Terms = lazy(() => import('./pages/Legal').then((module) => ({ default: module.Terms })));

function RouteLoader({ children }: { children: ReactNode }) {
  return <Suspense fallback={<div className="routeLoader" aria-label="Loading" />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/song/:slug', element: <RouteLoader><SongPage /></RouteLoader> },
  { path: '/about', element: <RouteLoader><About /></RouteLoader> },
  { path: '/contact', element: <RouteLoader><Contact /></RouteLoader> },
  { path: '/privacy', element: <RouteLoader><Privacy /></RouteLoader> },
  { path: '/terms', element: <RouteLoader><Terms /></RouteLoader> },
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
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
