import { Link, Navigate, useParams } from 'react-router-dom';
import { BOOKS, BOOK_LEANPUB_NOTE, formatPriceUsd, getBookBySlug } from '../data/books';
import { BookCover } from '../components/BookCover';
import { BookWallpaper } from '../components/BookWallpaper';

/**
 * BookDetailPage — /books/:slug.
 *
 * Big cover over the book's own live wallpaper, title, subtitle and the
 * facts the mockup gives: $9.99 ebook (EPUB + PDF), print through
 * IngramSpark, Leanpub note where it applies.
 *
 * The mockup transcribes no per-book description and no checkout URL, so
 * this page invents neither: the copy is the subtitle plus the
 * format/price facts, and the Buy button is wired in NOTES.md as the
 * coordinator's one-line checkout hookup.
 */
export function BookDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const book = getBookBySlug(slug);

  if (!book) {
    return <Navigate to="/books" replace />;
  }

  const siblings = BOOKS.filter((candidate) => candidate.slug !== book.slug);

  return (
    <main className="books-detail">
      <section className="books-detail__hero" aria-label={`${book.title} cover and wallpaper`}>
        <BookWallpaper theme={book.wallpaper} title={book.title} />
        <div className="books-detail__hero-inner">
          <BookCover book={book} eager />
        </div>
      </section>

      <section className="books-detail__body">
        <p className="books-kicker">3000 Studios Press · {book.category}</p>
        <h1 className="books-detail__title">{book.title}</h1>
        <p className="books-detail__subtitle">{book.subtitle}</p>

        <div className="books-detail__buy" aria-label="Buy the ebook">
          <p className="books-detail__price">
            {formatPriceUsd(book.priceUsd)}
            <span className="books-detail__price-note"> ebook</span>
          </p>
          <p className="books-detail__formats">
            {book.formats.join(' + ')} — sold direct from the studio store
          </p>
          <button type="button" className="books-detail__buy-btn">
            Buy the ebook, {formatPriceUsd(book.priceUsd)}
          </button>
          <p className="books-detail__print">{book.printNote}</p>
          {book.onLeanpub ? (
            <p className="books-detail__leanpub">{BOOK_LEANPUB_NOTE}</p>
          ) : null}
        </div>

        <p className="books-detail__back">
          <Link to="/books" className="books-detail__back-link">
            ← Back to the shelf
          </Link>
        </p>
      </section>

      <section className="books-detail__more" aria-label="More from the shelf">
        <h2 className="books-detail__more-title">More from the shelf</h2>
        <ul className="books-detail__more-list">
          {siblings.slice(0, 4).map((sibling) => (
            <li key={sibling.slug} className="books-detail__more-item">
              <Link to={`/books/${sibling.slug}`} className="books-detail__more-link">
                <BookCover book={sibling} />
                <span className="books-detail__more-name">{sibling.title}</span>
                <span className="books-detail__more-price">
                  {formatPriceUsd(sibling.priceUsd)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
