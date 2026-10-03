import { useEffect } from 'react';

type PageMeta = {
  title: string;
  description?: string;
};

const SITE = '3000 Studios VIP';

function upsertMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Per-route document title + meta description/og tags.
 * The SPA ships one index.html — without this every route shares the same
 * title and search engines see a single page.
 */
export function usePageMeta({ title, description }: PageMeta) {
  useEffect(() => {
    const full = title === SITE ? title : `${title} — ${SITE}`;
    document.title = full;
    if (description) {
      upsertMeta('description', description);
      upsertMeta('og:title', full, 'property');
      upsertMeta('og:description', description, 'property');
      upsertMeta('twitter:title', full);
      upsertMeta('twitter:description', description);
    }
  }, [title, description]);
}
