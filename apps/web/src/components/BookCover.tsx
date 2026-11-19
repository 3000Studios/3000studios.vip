import type { Book } from '../data/books';

/**
 * BookCover — one 2:3 book cover.
 *
 * All eight titles have a verified real cover JPG at
 * /media/books/<slug>.jpg (ember + foxglove recovered from the live
 * XinXii product pages 2026-11-18). Reuses the CoverWall approach:
 * plain <img>, lazy, async decode.
 */
export function BookCover({
  book,
  eager = false,
  className = '',
}: {
  book: Book;
  eager?: boolean;
  className?: string;
}) {
  const classes = `books-cover${className ? ` ${className}` : ''}`;

  return (
    <img
      className={classes}
      src={book.coverSrc}
      alt={`Cover of ${book.title} — ${book.subtitle}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
    />
  );
}
