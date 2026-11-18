import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { GlobalMusicProvider } from '../components/GlobalMusic';
import { EmpireHome } from './EmpireHome';
import { BooksPage } from '../pages/BooksPage';
import { STORE_BOOKS } from '../data/storeBooks';
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

describe('empire redesign', () => {
  it('renders the home page with the game feature, covers and contact card', () => {
    const { container } = wrap(<EmpireHome />);
    const play = [...container.querySelectorAll('a')].filter((a) => a.getAttribute('href') === AERO_PLAY_URL);
    expect(play.length).toBeGreaterThan(0);
    expect(container.querySelectorAll('a[href^="https://payhip.com/b/"]').length).toBeGreaterThanOrEqual(STORE_BOOKS.length);
    expect(container.querySelector(`a[href="mailto:${SUPPORT_EMAIL}"]`)).not.toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('renders every book on the Books page', () => {
    wrap(<BooksPage />, '/books');
    expect(screen.getByRole('heading', { level: 1, name: 'Books' })).toBeInTheDocument();
    expect(document.querySelectorAll('.em-shelf a.em-book').length).toBe(STORE_BOOKS.length);
  });
});
