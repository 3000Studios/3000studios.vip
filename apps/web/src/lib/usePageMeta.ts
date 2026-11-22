import { useEffect } from 'react';

type PageMeta = {
  title: string;
  description?: string;
  /** Set true on the 404 page: an unknown URL must not declare a canonical. */
  noCanonical?: boolean;
};

const SITE = '3000 Studios VIP';
const ORIGIN = 'https://3000studios.vip';

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(url: string | null) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (url === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

/**
 * Per-route document title + meta description/og tags.
 * The SPA ships one index.html — without this every route shares the same
 * title and search engines see a single page.
 */
export function usePageMeta({ title, description, noCanonical }: PageMeta) {
  useEffect(() => {
    const full = title === SITE ? title : `${title} — ${SITE}`;
    document.title = full;
    // Canonical + og:url must track the route. index.html ships a canonical
    // pointing at the homepage; without this every route tells search
    // engines it is a duplicate of the homepage.
    if (noCanonical) {
      upsertCanonical(null);
    } else {
      const path = window.location.pathname;
      const canonical = path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path}`;
      upsertCanonical(canonical);
      upsertMeta('og:url', canonical, 'property');
    }
    if (description) {
      upsertMeta('description', description);
      upsertMeta('og:title', full, 'property');
      upsertMeta('og:description', description, 'property');
      upsertMeta('twitter:title', full);
      upsertMeta('twitter:description', description);
    }
  }, [title, description, noCanonical]);
}
