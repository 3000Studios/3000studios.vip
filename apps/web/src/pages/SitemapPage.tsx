import { Link } from 'react-router-dom';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import { AERO_PLAY_URL } from '../empire/links';

/**
 * /sitemap — All pages. The footer links here as "All pages" (mockup).
 * Static index of every public route on the site. Add a row here when a
 * public route is added so the list never goes stale silently.
 */
const PAGE_GROUPS: { heading: string; pages: { to: string; label: string; external?: boolean }[] }[] = [
  {
    heading: 'Listen',
    pages: [
      { to: '/music', label: 'Music Vault — 52 DistroKid releases, 1:00 previews' },
      { to: '/podcast', label: 'Podcast — 26 episodes' },
      { to: '/live', label: 'Live Command — broadcast deck' },
      { to: '/beats', label: 'Beat Packs — 14 singles + bundle' },
    ],
  },
  {
    heading: 'Watch & Play',
    pages: [
      { to: '/video', label: 'Video Vault — music videos + Aeropocalypse cinematics' },
      { to: '/aeropocalypse', label: 'Aeropocalypse: Online (formerly Thunderdome) — free on Google Play' },
      { to: AERO_PLAY_URL, label: 'Get Aeropocalypse: Online on Google Play', external: true },
    ],
  },
  {
    heading: 'Read & Buy',
    pages: [
      { to: '/books', label: 'The Bookshelf — 8 books, $9.99 EPUB + PDF' },
      { to: '/shop', label: 'Shop — apparel, vault passes, sponsor slots' },
      { to: '/vip', label: 'VIP — Free, $3.99/mo, $19.99/yr, $99/mo sync' },
      { to: '/sponsors', label: 'Sponsors — partner with the studio' },
    ],
  },
  {
    heading: 'Studio',
    pages: [
      { to: '/about', label: 'About — Built Different' },
      { to: '/projects', label: 'Projects — case studies' },
      { to: '/apps', label: 'Apps Lab' },
      { to: '/blog', label: 'Blog — studio notes' },
      { to: '/requests', label: 'Requests — ask the studio' },
      { to: '/contact', label: 'Contact' },
      { to: '/community', label: 'Community' },
      { to: '/concepts', label: 'Concepts' },
    ],
  },
  {
    heading: 'Legal',
    pages: [
      { to: '/privacy', label: 'Privacy Policy' },
      { to: '/terms', label: 'Terms of Use' },
      { to: '/copyright', label: 'Copyright' },
      { to: '/cookies', label: 'Cookie Policy' },
      { to: '/disclaimer', label: 'Disclaimer' },
    ],
  },
];

export function SitemapPage() {
  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">Sitemap</span>
          <h1>All pages</h1>
          <p className="nn-lede">Every public page on 3000studios.vip, in one place.</p>
        </section>
        {PAGE_GROUPS.map((group) => (
          <Reveal key={group.heading}>
            <section className="nn-section">
              <h2>{group.heading}</h2>
              <ul className="nn-list">
                {group.pages.map((page) => (
                  <li key={page.to}>
                    {page.external ? (
                      <a href={page.to} target="_blank" rel="noopener noreferrer">
                        {page.label}
                      </a>
                    ) : (
                      <Link to={page.to}>{page.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </PublicLayoutV2>
  );
}
