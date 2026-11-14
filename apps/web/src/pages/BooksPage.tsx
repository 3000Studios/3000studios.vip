import { Link } from 'react-router-dom';
import { ShoppingCart } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { BOOKS, BOOKS_PRICE, BOOKS_STORE_URL, LEANPUB_TITLES } from '../data/books';

export function BooksPage() {
  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">3000 Studios Press</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            BOOKS
          </h1>
          <p>
            Books by Jeremy Swain, published under the 3000 Studios Press
            imprint. The ebooks below are sold direct from the studio store —
            {` ${BOOKS_PRICE} `}each, EPUB + PDF delivered at checkout. Print
            editions are distributed through IngramSpark to bookstores and
            libraries worldwide.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 880, margin: '0 auto' }}>
            {BOOKS.map((book) => (
              <article key={book.id} className="nn-glass" style={{ padding: 'clamp(22px, 4vw, 34px)' }}>
                <span className="nn-kicker nn-kicker--gold">{book.categories}</span>
                <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(22px, 4vw, 32px)', margin: '10px 0 4px' }}>
                  {book.title}
                </h2>
                <p style={{ color: 'var(--nn-cyan)', margin: '0 0 14px', fontSize: 16 }}>{book.subtitle}</p>
                <p style={{ color: 'var(--nn-text)', lineHeight: 1.7, margin: '0 0 18px' }}>{book.description}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
                  <a
                    className="nn-btn nn-btn-gold"
                    href={BOOKS_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ShoppingCart size={17} /> Buy the ebook — {BOOKS_PRICE}
                  </a>
                  <span style={{ color: 'var(--nn-muted)', fontSize: 13 }}>
                    EPUB + PDF · by Jeremy Swain · 3000 Studios Press
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-glass" style={{ padding: 'clamp(22px, 4vw, 34px)', maxWidth: 880, margin: '0 auto' }}>
            <h2 className="nn-chrome" style={{ fontSize: 'clamp(22px, 4vw, 30px)', marginTop: 0 }}>
              MORE WAYS TO READ
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--nn-text)', lineHeight: 1.7 }}>
              <p style={{ margin: 0 }}>
                <strong>Payhip (direct from the studio):</strong> the full
                ebook shelf — every title above and dozens more — lives in the{' '}
                <a href={BOOKS_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  3000 Studios Payhip store
                </a>
                , {BOOKS_PRICE} each with EPUB + PDF delivered at checkout.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Barnes & Noble (NOOK ebooks):</strong> the Screen-Free
                Activities shelf is on NOOK —{' '}
                <a href="https://www.barnesandnoble.com/w/family-game-night-games-jeremy-swain/1151782724" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  Family Game Night Games
                </a>
                ,{' '}
                <a href="https://www.barnesandnoble.com/w/grandparent-grandchild-activities-jeremy-swain/1151782669" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  Grandparent Grandchild Activities
                </a>
                , and{' '}
                <a href="https://www.barnesandnoble.com/w/camping-trip-activity-missions-jeremy-swain/1151782849" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  Camping Trip Activity Missions
                </a>
                .
              </p>
              <p style={{ margin: 0 }}>
                <strong>Gumroad:</strong> book bundles and creator tools from
                the studio are on the{' '}
                <a href="https://3000studios.gumroad.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  3000 Studios Gumroad store
                </a>
                .
              </p>
              <p style={{ margin: 0 }}>
                <strong>Substack (free):</strong> new chapters, releases, and
                studio notes land first in the{' '}
                <a href="https://3000studios.substack.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--nn-cyan)' }}>
                  3000 Studios Substack
                </a>
                .
              </p>
              <p style={{ margin: 0 }}>
                <strong>Leanpub:</strong> {LEANPUB_TITLES.join(', ')} are also
                published on Leanpub.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Print:</strong> the wider 3000 Studios Press catalog —
                fiction, mystery, cookbooks, activity books, and creator
                guides — is distributed in print through IngramSpark,
                so bookstores and libraries can order copies through their
                usual channels. Selected ebooks also appear on Kobo and
                XinXii.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Questions about a title, bulk orders, or rights:</strong>{' '}
                <Link to="/contact" style={{ color: 'var(--nn-cyan)' }}>
                  contact the studio
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
