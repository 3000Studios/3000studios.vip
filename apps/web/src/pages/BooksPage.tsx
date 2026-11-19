import type { PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { BOOKS, formatPriceUsd } from '../data/books';
import type { Book } from '../data/books';
import { BookCover } from '../components/BookCover';

/**
 * BooksPage — /books, "THE BOOKSHELF".
 *
 * Eight 3D covers in a lit shelf grid. Hover (fine pointers only) turns
 * and tilts the cover to follow the pointer; click navigates to the
 * detail page. Animation is transform/opacity only, so it holds 60fps
 * on mobile. The tilt is applied by writing CSS custom properties
 * straight onto the element — no React re-render per pointer move.
 */

const MAX_TILT_DEG = 14;

function handleTiltMove(event: ReactPointerEvent<HTMLElement>): void {
  if (event.pointerType !== 'mouse') return;
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - 0.5;
  const py = (event.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty('--books-ry', `${(px * MAX_TILT_DEG).toFixed(2)}deg`);
  el.style.setProperty('--books-rx', `${(-py * MAX_TILT_DEG).toFixed(2)}deg`);
  el.style.setProperty('--books-lift', '-10px');
}

function handleTiltLeave(event: ReactPointerEvent<HTMLElement>): void {
  const el = event.currentTarget;
  el.style.setProperty('--books-ry', '0deg');
  el.style.setProperty('--books-rx', '0deg');
  el.style.setProperty('--books-lift', '0px');
}

function BookCard({ book }: { book: Book }) {
  return (
    <article className="books-card">
      <Link
        to={`/books/${book.slug}`}
        className="books-card__link"
        aria-label={`${book.title} — ${book.subtitle}. Buy the ebook, ${formatPriceUsd(book.priceUsd)}.`}
        onPointerMove={handleTiltMove}
        onPointerLeave={handleTiltLeave}
      >
        <span className="books-card__stage">
          <BookCover book={book} />
          <span className="books-card__spine" aria-hidden="true" />
          <span className="books-card__shine" aria-hidden="true" />
        </span>
        <span className="books-card__meta">
          <span className="books-card__category">{book.category}</span>
          <span className="books-card__title">{book.title}</span>
          <span className="books-card__subtitle">{book.subtitle}</span>
          <span className="books-card__buy">
            <span className="books-card__price">
              {formatPriceUsd(book.priceUsd)}
            </span>
            <span className="books-card__formats">
              {book.formats.join(' + ')} ebook
            </span>
          </span>
        </span>
      </Link>
    </article>
  );
}

export function BooksPage() {
  return (
    <main className="books-page">
      <header className="books-hero">
        <p className="books-kicker">3000 Studios Press</p>
        <h1 className="books-title">The Bookshelf</h1>
        <p className="books-lede">
          Fiction, mystery, cookbooks and creator guides. Ebooks are $9.99,
          EPUB and PDF, sold direct. Print through IngramSpark.
        </p>
        <p className="books-count" aria-label="Eight books in store">
          <span className="books-count__num">8</span> books in store
          <span className="books-count__dot" aria-hidden="true">
            ·
          </span>
          <span className="books-count__price">$9.99 each</span>
        </p>
      </header>

      <section className="books-shelf" aria-label="Eight books on the shelf">
        {BOOKS.map((book) => (
          <BookCard key={book.slug} book={book} />
        ))}
      </section>

      <section className="books-more" aria-label="More ways to read">
        <h2 className="books-more__title">More ways to read</h2>
        <p className="books-more__body">
          Grow the Channel, Compounding Content and The Twelve Cookies of
          Christmas are also on Leanpub. Select titles are available in print
          through IngramSpark.
        </p>
        <p className="books-more__back">
          <Link to="/" className="books-more__link">
            ← Back to the empire
          </Link>
        </p>
      </section>
    </main>
  );
}
