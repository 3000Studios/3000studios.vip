import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { Shell } from './components/Shell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Dashboard } from './pages/Dashboard';
import { Home } from './pages/Home';
import { Sites } from './pages/Sites';
import { SiteDetail } from './pages/SiteDetail';
import { Settings } from './pages/Settings';
import { AuthProvider } from './lib/auth';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/vault',
        element: <Shell />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'sites', element: <Sites /> },
          { path: 'sites/:id', element: <SiteDetail /> },
          { path: 'settings', element: <Settings /> },
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
