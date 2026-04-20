import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './index.css';
import { Shell } from './components/Shell';
import { Dashboard } from './pages/Dashboard';
import { Sites } from './pages/Sites';
import { SiteDetail } from './pages/SiteDetail';
import { Settings } from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'sites', element: <Sites /> },
      { path: 'sites/:id', element: <SiteDetail /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
