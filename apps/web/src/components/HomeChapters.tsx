import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { studioOsReleases } from '../data/studioOsCatalog';
import { publishedSongs } from '../data/publishedSongs';
import { getDailyBlogPosts } from '../data/blog';
import { MERCH_ITEMS } from '../data/merch';
import { PLATFORMS } from '../lib/commerce';
import { LazyYouTube } from './LazyYouTube';
import type { AnalyzerFrame } from '../lib/audioAnalyzer';

type DiscItem = {
  slug: string;
  title: string;
  cover: string;
  src: string;
  date?: string;
  duration?: string;
  stream?: string;
};

function discography(): DiscItem[] {
  if (studioOsReleases.length) {
    return studioOsReleases.map((r) => ({
      slug: r.slug,
      title: r.title,
      cover: r.cover || `/media/covers/${r.slug}.jpg`,
      src: r.src || '',
      date: r.releaseDate,
      duration: r.duration,
      stream: r.streaming?.spotify || r.streaming?.apple,
    }));
  }
  return publishedSongs.map((s) => ({
    slug: s.slug,
    title: s.title,
    cover: s.cover,
    src: s.src || s.preview,
    stream: s.apple || s.buy,
  }));
}

function play(src: string, title: string, slug: string) {
  if (!src) return;
  window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title, slug } }));
}

function Discography() {
  const items = discography();
  if (!items.length) return null;
  return (
    <section className="md-discog" id="discography" aria-label="Discography">
      <div className="md-stage-head">
        <h2>Discography</h2>
        <Link to="/music">Full catalog</Link>
      </div>
      <div className="md-discog-rail">
        {items.map((item, i) => (
          <article key={item.slug} className={i === 0 ? 'md-discog-card is-now' : 'md-discog-card'}>
            <img src={item.cover} width={280} height={280} alt="" loading="lazy" />
            <div className="md-discog-copy">
              <span className="md-kicker">{item.date || item.duration || 'Official release'}</span>
              <h3>{item.title}</h3>
              <div className="md-cta-row">
                <button
                  type="button"
                  className="md-btn md-btn-gold"
                  onClick={() => play(item.src, item.title, item.slug)}
                >
                  Play
                </button>
                <Link className="md-btn md-btn-ghost" to={`/song/${item.slug}`}>
                  Release
                </Link>
                {item.stream ? (
                  <a className="md-btn md-btn-ghost" href={item.stream} target="_blank" rel="noreferrer">
                    Stores
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Visualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let frame: AnalyzerFrame | null = null;
    const onAudio = (e: Event) => {
      frame = (e as CustomEvent<AnalyzerFrame>).detail;
    };
    window.addEventListener('3000-analyzer-frame', onAudio as EventListener);
    let raf = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = 'rgba(5,6,10,0.35)';
      ctx.fillRect(0, 0, w, h);
      const spec = frame?.spectrum?.length ? frame.spectrum : [0.12, 0.2, 0.08, 0.18];
      const n = Math.min(48, spec.length);
      const gap = w / n;
      for (let i = 0; i < n; i += 1) {
        const v = reduced ? 0.18 : spec[i] || 0;
        const bh = Math.max(4, v * h * 0.9);
        ctx.fillStyle = i % 3 === 0 ? '#d4af37' : '#f4efe2';
        ctx.fillRect(i * gap + 1, h - bh, Math.max(2, gap - 3), bh);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('3000-analyzer-frame', onAudio as EventListener);
    };
  }, [reduced]);
  return (
    <section className="md-viz" id="visualizer" aria-label="Visualizer">
      <div className="md-stage-head">
        <h2>Visualizer</h2>
        <span className="md-kicker">Follows the global player</span>
      </div>
      <canvas ref={canvasRef} width={720} height={180} className="md-viz-canvas" />
    </section>
  );
}

type Promo = { videoId: string; title: string; youtubeUrl?: string };

function Promos() {
  const [items, setItems] = useState<Promo[]>([]);
  useEffect(() => {
    void fetch('/muse-campaigns.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        const releases = (data as { releases?: Promo[] } | null)?.releases || [];
        setItems(releases.filter((x) => x.videoId).slice(0, 8));
      })
      .catch(() => setItems([]));
  }, []);
  if (!items.length) return null;
  return (
    <section className="md-promos" id="promos" aria-label="Promos and reels">
      <div className="md-stage-head">
        <h2>Promos / reels</h2>
      </div>
      <div className="md-promos-rail">
        {items.map((p) => (
          <figure key={p.videoId} className="md-promo-card">
            <LazyYouTube videoId={p.videoId} title={p.title} className="md-promo-yt" />
            <figcaption>{p.title}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Arcade() {
  return (
    <section className="md-arcade" id="arcade" aria-label="Arcade">
      <div className="md-stage-head">
        <h2>Arcade</h2>
      </div>
      <div className="md-arcade-grid">
        <a className="md-arcade-card" href="/tiktok-games/">
          <strong>TikTok Games</strong>
          <span>Six 30-second games that already ship on this domain.</span>
        </a>
        <a className="md-arcade-card" href="https://getnexa.space" target="_blank" rel="noreferrer">
          <strong>Nexa</strong>
          <span>The live game world at getnexa.space.</span>
        </a>
      </div>
    </section>
  );
}

function BlogMerchAbout() {
  const posts = getDailyBlogPosts().slice(0, 3);
  const merch = MERCH_ITEMS.filter((m) => m.kind === 'merch').slice(0, 3);
  return (
    <>
      <section className="md-blog" id="blog" aria-label="Blog">
        <div className="md-stage-head">
          <h2>Blog</h2>
          <Link to="/blog">All posts</Link>
        </div>
        <div className="md-blog-rail">
          {posts.map((p) => (
            <article key={p.id}>
              <img src={p.image} width={160} height={160} alt="" loading="lazy" />
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="md-merch-home" id="merch" aria-label="Merch">
        <div className="md-stage-head">
          <h2>Merch</h2>
          <Link to="/shop">Shop</Link>
        </div>
        <div className="md-merch-rail">
          {merch.map((m) => (
            <a key={m.id} href={m.stripe} className="md-merch-card">
              {m.title}
            </a>
          ))}
        </div>
      </section>
      <section className="md-about-home" id="about" aria-label="Follow 3000 Studios">
        <h2>Follow</h2>
        <div className="md-cta-row">
          {PLATFORMS.slice(0, 6).map((p) => (
            <a key={p.id} className="md-btn md-btn-ghost" href={p.url} target="_blank" rel="noreferrer">
              {p.label}
            </a>
          ))}
          <Link className="md-btn md-btn-gold" to="/about">
            About
          </Link>
        </div>
      </section>
    </>
  );
}

export default function HomeChapters() {
  return (
    <>
      <Discography />
      <Visualizer />
      <Promos />
      <Arcade />
      <BlogMerchAbout />
    </>
  );
}
