import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { GlobalMusicProvider } from '../components/GlobalMusic';
import { AeroPage } from './pages/AeroPage';
import { MusicVault } from './pages/MusicVault';
import { VideoVault } from './pages/VideoVault';
import { PodcastHub } from './pages/PodcastHub';
import { LiveCommand } from './pages/LiveCommand';
import { BeatPacks } from './pages/BeatPacks';
import { AppsLab } from './pages/AppsLab';
import { ProjectsLab } from './pages/ProjectsLab';
import { VipRope } from './pages/VipRope';
import { EmpireShop } from './pages/EmpireShop';
import { SponsorDesk } from './pages/SponsorDesk';
import { ConceptBoard } from './pages/ConceptBoard';
import { StudioNotes } from './pages/StudioNotes';
import { AboutEmpire } from './pages/AboutEmpire';
import { BookingDesk } from './pages/BookingDesk';
import { AERO_BOSSES } from '../data/aeropocalypse';
import { AERO_PLAY_URL, SUPPORT_EMAIL } from './links';

beforeAll(() => {
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal('IntersectionObserver', IO);
  vi.stubGlobal('ResizeObserver', IO);
  if (!window.matchMedia) {
    vi.stubGlobal('matchMedia', (q: string) => ({
      matches: false,
      media: q,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      onchange: null,
      dispatchEvent: () => false,
    }));
  }
  HTMLCanvasElement.prototype.getContext = (() => null) as never;
});

function wrap(node: ReactNode, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <GlobalMusicProvider>{node}</GlobalMusicProvider>
    </MemoryRouter>,
  );
}

const PAGES: [string, () => ReactNode, RegExp][] = [
  ['/aeropocalypse', () => <AeroPage />, /Aeropocalypse/],
  ['/music', () => <MusicVault />, /One vault/],
  ['/video', () => <VideoVault />, /screening room/],
  ['/podcast', () => <PodcastHub />, /Follow and/],
  ['/live', () => <LiveCommand />, /On air from/],
  ['/beats', () => <BeatPacks />, /License-ready/],
  ['/apps', () => <AppsLab />, /Software/],
  ['/projects', () => <ProjectsLab />, /Featured/],
  ['/vip', () => <VipRope />, /velvet rope/],
  ['/shop', () => <EmpireShop />, /boutique/],
  ['/sponsors', () => <SponsorDesk />, /the show/],
  ['/requests', () => <ConceptBoard />, /Commission/],
  ['/blog', () => <StudioNotes />, /notes/],
  ['/about', () => <AboutEmpire />, /different/],
  ['/contact', () => <BookingDesk />, /3000 Studios/],
];

describe('EMPIRE inner pages', () => {
  it.each(PAGES)('%s renders its hero inside the empire shell', (path, page, title) => {
    const { container, unmount } = wrap(page(), path);
    const h1 = container.querySelector('h1');
    expect(h1?.textContent).toMatch(title);
    expect(container.querySelector('.ep-page header, .ep-page .em-header')).not.toBeNull();
    unmount();
  });

  it('game page states the real boss count and links to Google Play', () => {
    wrap(<AeroPage />, '/aeropocalypse');
    expect(screen.getAllByText(new RegExp(`${AERO_BOSSES.length} names to`)).length).toBeGreaterThan(0);
    const play = screen.getAllByRole('link', { name: /Download on Google Play/ });
    expect(play[0].getAttribute('href')).toBe(AERO_PLAY_URL);
  });

  it('contact page routes support to the studio address, not a personal inbox', () => {
    const { container } = wrap(<BookingDesk />, '/contact');
    expect(container.textContent).toContain(SUPPORT_EMAIL);
    expect(container.querySelector('main')?.innerHTML).not.toMatch(/gmail\.com/i);
  });
});
