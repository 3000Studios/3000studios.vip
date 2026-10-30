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
import { HomePage } from './v3/HomePage';

/* Route-level code splitting (fast-track 2026-10-29, audit Phase 2):
   every secondary page is lazy-loaded. Only the home page and the layout
   chrome stay in the initial bundle. */
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const BlogPage = lazy(() => import('./pages/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then((m) => ({ default: m.BlogPostPage })));
const CommunityPage = lazy(() => import('./pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage })));
const RequestsPage = lazy(() => import('./pages/RequestsPage').then((m) => ({ default: m.RequestsPage })));
const SponsorsPage = lazy(() => import('./pages/SponsorsPage').then((m) => ({ default: m.SponsorsPage })));
const ThunderDomePage = lazy(() => import('./pages/ThunderDomePage').then((m) => ({ default: m.ThunderDomePage })));
const ThunderDomePrivacyPage = lazy(() => import('./pages/ThunderDomePrivacyPage').then((m) => ({ default: m.ThunderDomePrivacyPage })));
const AppsPage = lazy(() => import('./pages/AppsPage').then((m) => ({ default: m.AppsPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const VipPage = lazy(() => import('./pages/VipPage').then((m) => ({ default: m.VipPage })));
const MusicPage = lazy(() => import('./pages/MusicPage').then((m) => ({ default: m.MusicPage })));
const VideoPage = lazy(() => import('./pages/VideoPage').then((m) => ({ default: m.VideoPage })));
const LiveBroadcastPage = lazy(() => import('./pages/LiveBroadcastPage').then((m) => ({ default: m.LiveBroadcastPage })));
const PodcastPage = lazy(() => import('./pages/PodcastPage').then((m) => ({ default: m.PodcastPage })));
const BeatsPage = lazy(() => import('./pages/BeatsPage').then((m) => ({ default: m.BeatsPage })));
const CommandDeckPage = lazy(() => import('./pages/CommandDeckPage').then((m) => ({ default: m.CommandDeckPage })));
const PhoneGoLive = lazy(() => import('./pages/PhoneGoLive').then((m) => ({ default: m.PhoneGoLive })));
const ShopPage = lazy(() => import('./pages/Shop').then((m) => ({ default: m.ShopPage })));
const ConceptBoard = lazy(() => import('./pages/ConceptBoard').then((m) => ({ default: m.ConceptBoard })));
import { BottomDock } from './components/BottomDock';
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
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
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
      {/* VIP redesign 2026-10-27: fleet ACSS scroll progress bar (CSS-only). */}
      <div className="acss-progress" aria-hidden="true" />
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
            description="Official 3000 Studios music videos and Thunder Dome cinematics — free to watch via YouTube."
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
        path: '/thunder-dome/privacy',
        element: (
          <Titled
            title="Thunder Dome: AeroStrike Privacy Policy"
            description="Privacy Policy for Thunder Dome: AeroStrike by 3000 Studios."
          >
            <RouteLoader><ThunderDomePrivacyPage /></RouteLoader>
          </Titled>
        ),
      },
      {
        path: '/thunder-dome',
        element: (
          <Titled
            title="Thunder Dome"
            description="Thunder Dome by 3000 Studios — the top-down arena shooter, in closed testing. Meet the bosses, watch the trailer, join the launch list."
          >
            <RouteLoader><ThunderDomePage /></RouteLoader>
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
