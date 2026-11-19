/**
 * books.ts — the 3000 Studios Press catalog.
 *
 * Source of truth: the redesign mockup transcription
 * (~/workspace/system/handoffs-duet-2026-11-18/artifact-4shhfkV732GgNmYco3B4y9.md,
 * section 7 BOOKS + Home press strip).
 *
 * Facts in this file come ONLY from that transcription:
 *  - titles, subtitles, $9.99 price, EPUB + PDF formats
 *  - print through IngramSpark
 *  - Leanpub availability for Grow the Channel, Compounding Content and
 *    The Twelve Cookies of Christmas
 *  - real cover JPGs at /media/books/<slug>.jpg for all eight titles
 *    (the last two — ember + foxglove — recovered 2026-11-18 23:01 EST
 *    from the live XinXii product pages and verified: correct title,
 *    subtitle, 3000 STUDIOS PRESS imprint, JEREMY SWAIN author)
 *
 * Nothing else is invented here. There are no per-book descriptions in the
 * transcription, so there are none in this file — detail pages show the
 * subtitle plus the format/price facts only.
 */

/** Live-wallpaper theme key, one per book (see BookWallpaper.tsx). */
export type BookWallpaperTheme =
  | 'cookies'
  | 'ember'
  | 'foxglove'
  | 'larkspur'
  | 'marginalia'
  | 'hidden'
  | 'grow'
  | 'compounding';

export interface Book {
  /** URL slug: /books/<slug>. Also the cover filename stem. */
  slug: string;
  title: string;
  /** Subtitle exactly as transcribed in the mockup. */
  subtitle: string;
  /** Shelf category, taken from the mockup's shelf line:
   *  "Fiction, mystery, cookbooks and creator guides." */
  category: 'Fiction' | 'Mystery' | 'Cookbook' | 'Creator guide' | 'Nonfiction';
  priceUsd: number;
  formats: readonly string[];
  printNote: string;
  /** True when the mockup lists the title as also on Leanpub. */
  onLeanpub: boolean;
  /**
   * Real cover JPG at /media/books/<slug>.jpg. All eight titles have a
   * verified real cover in the repo.
   */
  coverSrc: string;
  wallpaper: BookWallpaperTheme;
}

export const BOOK_PRICE_USD = 9.99;
export const BOOK_FORMATS: readonly string[] = ['EPUB', 'PDF'];
export const BOOK_PRINT_NOTE = 'Print edition through IngramSpark.';
export const BOOK_LEANPUB_NOTE =
  'Also available on Leanpub.';

export const BOOKS: readonly Book[] = [
  {
    slug: 'the-twelve-cookies-of-christmas',
    title: 'The Twelve Cookies of Christmas',
    subtitle: 'Bake, Swap & Gift: A Festive Cookie Collection',
    category: 'Cookbook',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: true,
    coverSrc: '/media/books/the-twelve-cookies-of-christmas.jpg',
    wallpaper: 'cookies',
  },
  {
    slug: 'the-ember-cartographer',
    title: 'The Ember Cartographer',
    subtitle: 'Maps Drawn in Ash, Roads That Burn Away',
    category: 'Fiction',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: false,
    coverSrc: '/media/books/the-ember-cartographer.jpg',
    wallpaper: 'ember',
  },
  {
    slug: 'the-foxglove-armistice',
    title: 'The Foxglove Armistice',
    subtitle: 'A Novel of the Poison Garden Courts',
    category: 'Fiction',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: false,
    coverSrc: '/media/books/the-foxglove-armistice.jpg',
    wallpaper: 'foxglove',
  },
  {
    slug: 'the-last-train-to-larkspur-hollow',
    title: 'The Last Train to Larkspur Hollow',
    subtitle: 'A Small-Town Mystery',
    category: 'Mystery',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: false,
    coverSrc: '/media/books/the-last-train-to-larkspur-hollow.jpg',
    wallpaper: 'larkspur',
  },
  {
    slug: 'the-collectors-marginalia',
    title: "The Collector's Marginalia",
    subtitle: 'An Antiquarian Book Mystery',
    category: 'Mystery',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: false,
    coverSrc: '/media/books/the-collectors-marginalia.jpg',
    wallpaper: 'marginalia',
  },
  {
    slug: 'hidden-in-plain-sight',
    title: 'Hidden in Plain Sight',
    subtitle:
      'Secret Rooms, Forgotten Places & the Things Hiding in Everyday Life',
    category: 'Nonfiction',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: false,
    coverSrc: '/media/books/hidden-in-plain-sight.jpg',
    wallpaper: 'hidden',
  },
  {
    slug: 'grow-the-channel',
    title: 'Grow the Channel',
    subtitle:
      'The YouTube Growth Playbook: From Zero Subscribers to a Real Audience',
    category: 'Creator guide',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: true,
    coverSrc: '/media/books/grow-the-channel.jpg',
    wallpaper: 'grow',
  },
  {
    slug: 'compounding-content',
    title: 'Compounding Content',
    subtitle: 'How to Gain, and Keep, Momentum on Social Media',
    category: 'Creator guide',
    priceUsd: BOOK_PRICE_USD,
    formats: BOOK_FORMATS,
    printNote: BOOK_PRINT_NOTE,
    onLeanpub: true,
    coverSrc: '/media/books/compounding-content.jpg',
    wallpaper: 'compounding',
  },
];

export function getBookBySlug(slug: string | undefined): Book | undefined {
  if (!slug) return undefined;
  return BOOKS.find((book) => book.slug === slug);
}

export function formatPriceUsd(priceUsd: number): string {
  return `$${priceUsd.toFixed(2)}`;
}
