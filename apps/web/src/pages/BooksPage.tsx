import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { LEANPUB_TITLES } from '../data/books';
import { SHELVES, STORE_BOOKS, STORE_PRICE, coverUrl, type ShelfId, type StoreBook } from '../data/storeBooks';
import { BOOK_STORE_URL, SUBSTACK_URL } from '../empire/links';

type Filter = ShelfId | 'all';

function Cover({ book, i }: { book: StoreBook; i: number }) {
  return (
    <a
      className="em-book"
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${book.title}, ${STORE_PRICE} on Payhip`}
    >
      <span className="em-book-cover">
        <img
          src={coverUrl(book, 320)}
          alt={`${book.title} book cover`}
          width={320}
          height={480}
          loading={i < 6 ? 'eager' : 'lazy'}
          decoding="async"
        />
      </span>
      <span className="em-book-meta">
        <b>{book.title}</b>
        <span>{STORE_PRICE} · Buy on Payhip</span>
      </span>
    </a>
  );
}

export function BooksPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return STORE_BOOKS.filter(
      (b) => (filter === 'all' || b.cat === filter) && (!needle || b.title.toLowerCase().includes(needle)),
    );
  }, [filter, q]);

  const counts = useMemo(() => {
    const c = new Map<ShelfId, number>();
    for (const b of STORE_BOOKS) c.set(b.cat, (c.get(b.cat) ?? 0) + 1);
    return c;
  }, []);

  const shelves = filter === 'all' ? SHELVES.filter((s) => counts.get(s.id)) : SHELVES.filter((s) => s.id === filter);

  return (
    <PublicLayoutV2>
      <div className="em-wrap" style={{ paddingTop: 'clamp(28px, 6vw, 64px)' }}>
        <header className="em-sec-head" style={{ marginBottom: 8 }}>
          <div>
            <span className="em-kicker">3000 Studios Press</span>
            <h1 style={{ fontSize: 'clamp(54px, 13vw, 140px)', margin: '10px 0 0' }}>Books</h1>
            <p>
              {STORE_BOOKS.length} original titles by Jeremy Swain. {STORE_PRICE} each, sold direct from the studio store on Payhip,
              delivered as an instant download at checkout. Tap any cover to buy.
            </p>
          </div>
          <a className="em-btn" href={BOOK_STORE_URL} target="_blank" rel="noopener noreferrer">
            Open the store
          </a>
        </header>

        <div className="em-shelfnav" role="toolbar" aria-label="Filter books by shelf">
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            All · {STORE_BOOKS.length}
          </button>
          {SHELVES.filter((s) => counts.get(s.id)).map((s) => (
            <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)}>
              {s.label} · {counts.get(s.id)}
            </button>
          ))}
        </div>

        <label className="em-search">
          <MagnifyingGlass size={18} weight="bold" aria-hidden="true" />
          <span className="em-sr">Search books</span>
          <input type="search" placeholder="Search titles" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>

        {shown.length === 0 && <p className="em-empty">No titles match “{q}”. Try another word.</p>}

        {shelves.map((s) => {
          const list = shown.filter((b) => b.cat === s.id);
          if (!list.length) return null;
          return (
            <section key={s.id} className="em-sec" style={{ paddingTop: 34 }} aria-labelledby={`shelf-${s.id}`}>
              <div className="em-sec-head">
                <div>
                  <h2 id={`shelf-${s.id}`} style={{ fontSize: 'clamp(30px, 6vw, 54px)', margin: 0 }}>
                    {s.label}
                  </h2>
                  <p>{s.blurb}</p>
                </div>
              </div>
              <div className="em-shelf em-nostagger">
                {list.map((b, i) => (
                  <Cover key={b.url} book={b} i={i} />
                ))}
              </div>
            </section>
          );
        })}

        <section className="em-sec" aria-labelledby="more-ways">
          <div className="em-card" style={{ padding: 'clamp(20px, 4vw, 34px)' }}>
            <h2 id="more-ways" style={{ fontSize: 'clamp(26px, 5vw, 40px)', marginTop: 0 }}>
              More ways to read
            </h2>
            <ul className="em-ways">
              <li>
                <b>Barnes and Noble (NOOK):</b>{' '}
                <a href="https://www.barnesandnoble.com/w/family-game-night-games-jeremy-swain/1151782724" target="_blank" rel="noopener noreferrer">
                  Family Game Night Games
                </a>
                ,{' '}
                <a href="https://www.barnesandnoble.com/w/grandparent-grandchild-activities-jeremy-swain/1151782669" target="_blank" rel="noopener noreferrer">
                  Grandparent Grandchild Activities
                </a>{' '}
                and{' '}
                <a href="https://www.barnesandnoble.com/w/camping-trip-activity-missions-jeremy-swain/1151782849" target="_blank" rel="noopener noreferrer">
                  Camping Trip Activity Missions
                </a>
                .
              </li>
              <li>
                <b>Gumroad:</b> book bundles and creator tools on the{' '}
                <a href="https://3000studios.gumroad.com" target="_blank" rel="noopener noreferrer">
                  3000 Studios Gumroad store
                </a>
                .
              </li>
              <li>
                <b>Substack (free):</b> new chapters and releases land first in the{' '}
                <a href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
                  3000 Studios Substack
                </a>
                .
              </li>
              <li>
                <b>Leanpub:</b> {LEANPUB_TITLES.join(', ')}.
              </li>
              <li>
                <b>Print:</b> the wider catalog is distributed in print through IngramSpark, so bookstores and libraries can
                order copies. Selected ebooks also appear on Kobo and XinXii.
              </li>
              <li>
                <b>Bulk orders or rights:</b> <Link to="/contact">contact the studio</Link>.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </PublicLayoutV2>
  );
}
