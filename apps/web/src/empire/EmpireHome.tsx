import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GameController,
  BookOpen,
  MusicNote,
  FilmStrip,
  Microphone,
  ShoppingBag,
  Article,
  EnvelopeSimple,
  GooglePlayLogo,
  Globe,
  Play,
  ArrowUpRight,
  SpotifyLogo,
  YoutubeLogo,
  Newspaper,
} from '@phosphor-icons/react';
import { Header } from '../v2/Header';
import { Footer } from '../v2/Footer';
import { usePageMeta } from '../lib/usePageMeta';
import { settlePendingPurchase } from '../v3/MusicSection';
import { STORE_BOOKS, STORE_PRICE, coverUrl, type StoreBook } from '../data/storeBooks';
import { officialReleaseVideos, youtubeArtworkUrl, type OfficialReleaseVideo } from '../data/officialReleases';
import { PODCAST_EPISODES, PODCAST_SHOW, podcastWatchUrl } from '../data/podcastEpisodes';
import { MERCH_ITEMS } from '../data/merch';
import { AERO_STILLS } from '../data/aeropocalypseStills';
import { AERO_BOSSES } from '../data/aeropocalypse';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { AERO_PLAY_URL, AERO_SITE_URL, BOOK_STORE_URL, SUBSTACK_URL } from './links';

/* Featured video: 'Always Feel Like' (oEmbed-verified official video). The
   first catalog entry pairs a title with a Shorts id, so it is skipped. */
const FEATURED_ID = 'GRokxtfSu9s';
const VIDEOS: OfficialReleaseVideo[] = (() => {
  const clean = officialReleaseVideos.slice(1).filter((v) => !v.explicit && !/podcast/i.test(v.title));
  const featured = clean.find((v) => v.videoId === FEATURED_ID);
  const rest = clean.filter((v) => v.videoId !== FEATURED_ID);
  return (featured ? [featured, ...rest] : rest).slice(0, 16);
})();

const EPISODES = [...PODCAST_EPISODES].sort((a, b) => b.n - a.n);
const LATEST_POSTS = [...BLOG_ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3);
const MERCH = MERCH_ITEMS.filter((m) => m.kind === 'merch');
const price = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

/* Two rows of covers for the top-of-page marquee: every title appears once. */
const ROW_A = STORE_BOOKS.filter((_, i) => i % 2 === 0);
const ROW_B = STORE_BOOKS.filter((_, i) => i % 2 === 1);

const FIND = [
  { to: '/aeropocalypse', label: 'Game', sub: 'Aeropocalypse: Online', icon: GameController, c: '#ff5a2c' },
  { to: '/books', label: 'Books', sub: `${STORE_BOOKS.length} titles`, icon: BookOpen, c: '#f2c867' },
  { to: '/music', label: 'Music', sub: 'Songs and albums', icon: MusicNote, c: '#9b6bff' },
  { to: '/video', label: 'Videos', sub: 'Music videos', icon: FilmStrip, c: '#ff3d7f' },
  { to: '/podcast', label: 'Podcast', sub: `${PODCAST_EPISODES.length} episodes`, icon: Microphone, c: '#3df2a8' },
  { to: '/shop', label: 'Shop', sub: 'Merch and VIP', icon: ShoppingBag, c: '#f2c867' },
  { to: '/blog', label: 'Blog', sub: 'News and guides', icon: Article, c: '#3ee8ff' },
  { to: '/contact', label: 'Contact', sub: 'Support and booking', icon: EnvelopeSimple, c: '#9b6bff' },
];

function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span key={i} className="w" style={{ '--i': i } as React.CSSProperties}>
          {w}
          {' '}
        </span>
      ))}
    </>
  );
}

function BookCard({ book, eager = false }: { book: StoreBook; eager?: boolean }) {
  return (
    <a className="em-book" href={book.url} target="_blank" rel="noopener noreferrer" aria-label={`${book.title}, ${STORE_PRICE} on Payhip`}>
      <span className="em-book-cover">
        <img
          src={coverUrl(book, 320)}
          alt={`${book.title} book cover`}
          width={320}
          height={480}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
      </span>
      <span className="em-book-meta">
        <b>{book.title}</b>
        <span>{STORE_PRICE} · Buy</span>
      </span>
    </a>
  );
}

function Marquee({ books, reverse, dur }: { books: StoreBook[]; reverse?: boolean; dur: number }) {
  // The track holds the row twice so the loop is seamless; the copy is
  // hidden from assistive tech and from the tab order.
  return (
    <div className={`em-marquee${reverse ? ' rev' : ''}`} style={{ '--dur': `${dur}s` } as React.CSSProperties}>
      <div className="em-marquee-track">
        {books.map((b, i) => (
          <BookCard key={b.url} book={b} eager={i < 6} />
        ))}
        <div aria-hidden="true" style={{ display: 'contents' }} inert>
          {books.map((b) => (
            <BookCard key={`${b.url}-dup`} book={b} />
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoStage() {
  const [current, setCurrent] = useState<OfficialReleaseVideo>(VIDEOS[0]);
  const [playing, setPlaying] = useState(false);
  const pick = (v: OfficialReleaseVideo) => {
    setCurrent(v);
    setPlaying(true);
    document.getElementById('em-player')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  return (
    <>
      <div className="em-player" id="em-player">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${current.videoId}?rel=0&modestbranding=1&autoplay=1&playsinline=1`}
            title={`${current.title} official music video`}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="em-thumb" onClick={() => setPlaying(true)} aria-label={`Play ${current.title}`}>
            <span className="em-thumb-img" style={{ borderRadius: 0, aspectRatio: '16 / 9', display: 'block' }}>
              <img src={youtubeArtworkUrl(current.videoId)} alt="" loading="lazy" decoding="async" />
              <span className="play">
                <Play size={26} weight="fill" />
              </span>
              <span className="tag">Tap to watch · {current.title}</span>
            </span>
          </button>
        )}
      </div>
      <div className="em-rail" style={{ '--col': 'min(72vw, 280px)' } as React.CSSProperties}>
        {VIDEOS.map((v) => (
          <button key={v.videoId} type="button" className="em-thumb" onClick={() => pick(v)} aria-label={`Play ${v.title}`}>
            <span className="em-thumb-img">
              <img src={youtubeArtworkUrl(v.videoId)} alt="" loading="lazy" decoding="async" />
              <span className="play">
                <Play size={20} weight="fill" />
              </span>
              <span className="tag">{v.duration}</span>
            </span>
            <b>{v.title}</b>
            <small>{v.release}</small>
          </button>
        ))}
      </div>
    </>
  );
}

export function EmpireHome() {
  usePageMeta({
    title: 'Aeropocalypse, Books, Music & Podcast',
    description:
      '3000 Studios: play Aeropocalypse: Online on Google Play, shop 93 original books, watch official music videos and catch every episode of the podcast.',
  });

  useEffect(() => {
    settlePendingPurchase();
  }, []);

  const heroStills = useMemo(() => AERO_STILLS.slice(0, 3), []);

  return (
    <div className="em-home">
      <Header />
      <main id="main">
        {/* 1. The feature: the game. */}
        <section className="em-hero em-nostagger" aria-labelledby="em-hero-title">
          <div className="em-hero-media" data-em-tilt>
            <img src="/media/aeropocalypse/poster.jpg" alt="" fetchPriority="high" decoding="async" />
          </div>
          <span className="em-hud" aria-hidden="true" />
          <div className="em-wrap em-hero-in">
            <span className="em-kicker">3000 Studios presents · Now on Google Play</span>
            <h1 id="em-hero-title" className="em-dance em-slide-words">
              <Words text="Aeropocalypse:" />
              <span className="sub">
                <Words text="Online" />
              </span>
            </h1>
            <p className="em-hero-lede">
              An aerial combat shooter built at 3000 Studios. Twenty-five stages, {AERO_BOSSES.length} bosses and a sky
              that fights back. Find it on Google Play, then take the fight to aeropocalypse.online.
            </p>
            <div className="em-hero-cta">
              <a className="em-btn em-btn--play" href={AERO_PLAY_URL} target="_blank" rel="noopener noreferrer">
                <GooglePlayLogo size={20} weight="fill" /> Get it on Google Play
              </a>
              <a className="em-btn em-btn--ghost" href={AERO_SITE_URL} target="_blank" rel="noopener noreferrer">
                <Globe size={18} weight="duotone" /> aeropocalypse.online
              </a>
              <Link className="em-btn em-btn--ghost" to="/aeropocalypse">
                Game page <ArrowUpRight size={16} weight="bold" />
              </Link>
            </div>
            <div className="em-hero-stats" aria-label="Game at a glance">
              <span>
                <b>25</b>Stages
              </span>
              <span>
                <b>{AERO_BOSSES.length}</b>Bosses
              </span>
              <span>
                <b>{STORE_BOOKS.length}</b>Books
              </span>
              <span>
                <b>{PODCAST_EPISODES.length}</b>Episodes
              </span>
            </div>
          </div>
        </section>

        {/* 2. Book covers at the top. */}
        <section className="em-sec em-nostagger" aria-labelledby="em-books-title" style={{ paddingTop: 34 }}>
          <div className="em-wrap em-sec-head">
            <div>
              <span className="em-kicker">3000 Studios Press</span>
              <h2 id="em-books-title">{STORE_BOOKS.length} books. One shelf.</h2>
            </div>
            <Link className="em-more" to="/books">
              See every book →
            </Link>
          </div>
          <Marquee books={ROW_A} dur={150} />
          <Marquee books={ROW_B} dur={170} reverse />
        </section>

        {/* 3. Quick find. */}
        <section className="em-sec" aria-labelledby="em-find-title">
          <div className="em-wrap">
            <div className="em-sec-head">
              <div>
                <span className="em-kicker">Find anything</span>
                <h2 id="em-find-title">The whole empire</h2>
              </div>
            </div>
            <div className="em-find">
              {FIND.map(({ to, label, sub, icon: Icon, c }) => (
                <Link key={to} to={to} className="em-card" style={{ '--c': c } as React.CSSProperties}>
                  <Icon size={30} weight="duotone" className="ic" />
                  <span>
                    <b>{label}</b>
                    <span style={{ display: 'block' }}>{sub}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Game band with real stills. */}
        <section className="em-sec" aria-labelledby="em-game-title">
          <div className="em-wrap">
            <div className="em-card em-game">
              <div>
                <span className="em-kicker">Play now</span>
                <h2 id="em-game-title" className="em-sec-title-sm">
                  Take the sky back
                </h2>
                <p style={{ color: 'var(--em-dim)', lineHeight: 1.65, maxWidth: '48ch' }}>
                  Pick a jet, stack power-ups and break through boss after boss. Free to play on Android through Google Play, with party co-op and 1v1 duels.
                </p>
                <div className="em-hero-cta" style={{ marginTop: 18 }}>
                  <a className="em-btn em-btn--play" href={AERO_PLAY_URL} target="_blank" rel="noopener noreferrer">
                    <GooglePlayLogo size={20} weight="fill" /> Google Play
                  </a>
                  <a className="em-btn em-btn--ghost" href={AERO_SITE_URL} target="_blank" rel="noopener noreferrer">
                    aeropocalypse.online
                  </a>
                </div>
              </div>
              <div className="em-game-stills">
                {heroStills.map((s) => (
                  <img key={s.src} src={s.src} alt={s.alt} loading="lazy" decoding="async" />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Music videos, opt-in: nothing plays or loads until tapped. */}
        <section className="em-sec" aria-labelledby="em-video-title">
          <div className="em-wrap">
            <div className="em-sec-head">
              <div>
                <span className="em-kicker">Official videos</span>
                <h2 id="em-video-title">Watch the music</h2>
              </div>
              <Link className="em-more" to="/video">
                All videos →
              </Link>
            </div>
            <VideoStage />
          </div>
        </section>

        {/* 6. Podcast with real episode thumbnails. */}
        <section className="em-sec" aria-labelledby="em-pod-title">
          <div className="em-wrap">
            <div className="em-sec-head">
              <div>
                <span className="em-kicker">{PODCAST_SHOW.tagline}</span>
                <h2 id="em-pod-title">{PODCAST_SHOW.name}</h2>
                <p>Every episode, newest first. Watch on YouTube, listen on Spotify, read on Substack.</p>
              </div>
              <div className="em-hero-cta">
                <a className="em-btn em-btn--ghost" href={PODCAST_SHOW.youtubeChannel} target="_blank" rel="noopener noreferrer">
                  <YoutubeLogo size={18} weight="duotone" /> YouTube
                </a>
                <a className="em-btn em-btn--ghost" href={PODCAST_SHOW.spotifyShow} target="_blank" rel="noopener noreferrer">
                  <SpotifyLogo size={18} weight="duotone" /> Spotify
                </a>
                <a className="em-btn em-btn--ghost" href={SUBSTACK_URL} target="_blank" rel="noopener noreferrer">
                  <Newspaper size={18} weight="duotone" /> Substack
                </a>
              </div>
            </div>
            <div className="em-rail" style={{ '--col': 'min(66vw, 250px)' } as React.CSSProperties}>
              {EPISODES.map((ep) => (
                <a key={ep.youtubeId} className="em-thumb" href={podcastWatchUrl(ep)} target="_blank" rel="noopener noreferrer">
                  <span className="em-thumb-img">
                    <img src={youtubeArtworkUrl(ep.youtubeId)} alt="" loading="lazy" decoding="async" />
                    <span className="play">
                      <Play size={20} weight="fill" />
                    </span>
                    <span className="tag">EP {String(ep.n).padStart(2, '0')}</span>
                  </span>
                  <b>{ep.title}</b>
                  {ep.spotifyUrl && <small>Also on Spotify</small>}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Shop: real product photos, real Stripe checkout links. */}
        <section className="em-sec" aria-labelledby="em-shop-title">
          <div className="em-wrap">
            <div className="em-sec-head">
              <div>
                <span className="em-kicker">Official merch</span>
                <h2 id="em-shop-title">Wear the empire</h2>
              </div>
              <Link className="em-more" to="/shop">
                Merch and VIP pass →
              </Link>
            </div>
            <div className="em-shop">
              {MERCH.map((m) => (
                <a key={m.id} className="em-card" href={m.stripe} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${m.title}, ${price(m.priceCents)}`}>
                  <span className="img" style={{ display: 'block' }}>
                    <img src={m.image} alt={m.title} loading="lazy" decoding="async" />
                  </span>
                  <span className="meta">
                    <b>{m.title}</b>
                    <span>{price(m.priceCents)}</span>
                  </span>
                </a>
              ))}
            </div>
            <p style={{ marginTop: 14, color: 'var(--em-dim)', fontSize: 13 }}>
              Books check out on <a href={BOOK_STORE_URL} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--em-gold)' }}>Payhip</a>. Merch checks out securely on Stripe.
            </p>
          </div>
        </section>

        {/* 8. Latest posts. */}
        <section className="em-sec" aria-labelledby="em-blog-title">
          <div className="em-wrap">
            <div className="em-sec-head">
              <div>
                <span className="em-kicker">From the studio</span>
                <h2 id="em-blog-title">Latest on the blog</h2>
              </div>
              <Link className="em-more" to="/blog">
                All posts →
              </Link>
            </div>
            <div className="em-posts">
              {LATEST_POSTS.map((a) => (
                <Link key={a.slug} to={`/blog/${a.slug}`} className="em-card em-post">
                  <span className="em-kicker">{a.category}</span>
                  <b>{a.title}</b>
                  <span>{a.summary}</span>
                  <small>{a.readTime}</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
