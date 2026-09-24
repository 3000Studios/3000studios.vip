import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { playSwoosh } from './stageSfx';
import { LazyYouTube } from './LazyYouTube';
import { publishedSongs } from '../data/publishedSongs';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { MERCH_ITEMS } from '../data/merch';
import { PLATFORMS } from '../lib/commerce';
import { PublicLayout } from '../pages/Home';
import '../styles/million-dollar.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

type Slide = {
  title: string;
  videoId: string;
  release: string;
  duration: string;
  poster: string;
  buy?: string;
  stream?: string;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

function buildSlides(): Slide[] {
  return officialReleaseVideos.map((v) => {
    const n = norm(v.title);
    const match = publishedSongs.find((s) => {
      const m = norm(s.title);
      return m === n || m.includes(n) || n.includes(m);
    });
    return {
      title: v.title,
      videoId: v.videoId,
      release: v.release,
      duration: v.duration,
      poster: youtubeArtworkUrl(v.videoId),
      buy: match?.buy || match?.apple,
      stream: match?.buy || 'https://distrokid.com/hyperfollow/3000studios',
    };
  });
}

function stripeFor(id: string) {
  return MERCH_ITEMS.find((item) => item.id === id)?.stripe ?? '#';
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.md-reveal'));
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  });
}

export function SwipeHome() {
  const slides = useMemo(() => buildSlides(), []);
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [drag, setDrag] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const startX = useRef(0);
  const dragging = useRef(false);
  const dragRef = useRef(0);
  const indexRef = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const song = slides[index];

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useReveal();

  const go = useCallback(
    (next: number, dir?: 'fwd' | 'rev') => {
      if (!n) return;
      const i = ((next % n) + n) % n;
      indexRef.current = i;
      setIndex(i);
      dragRef.current = 0;
      setDrag(0);
      if (dir) playSwoosh(dir);
      const s = slides[i];
      if (s && localStorage.getItem('3000-music-on') !== '0') {
        const audio = publishedSongs.find((p) => {
          const a = norm(p.title);
          const b = norm(s.title);
          return a === b || a.includes(b) || b.includes(a);
        });
        const src = audio?.preview || audio?.src;
        if (src) {
          window.dispatchEvent(
            new CustomEvent('3000-play-track', {
              detail: { src, title: s.title, slug: audio?.slug ?? s.videoId },
            }),
          );
        }
      }
    },
    [n, slides],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(indexRef.current + 1, 'fwd');
      if (e.key === 'ArrowLeft') go(indexRef.current - 1, 'rev');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if ((e.target as HTMLElement).closest('a,button')) return;
    dragging.current = true;
    setIsDragging(true);
    startX.current = e.clientX;
    dragRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    dragRef.current = dx;
    setDrag(dx);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setIsDragging(false);
    const w = viewportRef.current?.clientWidth || window.innerWidth || 1;
    const dx = dragRef.current;
    const cur = indexRef.current;
    if (dx < -Math.max(36, w * 0.1)) go(cur + 1, 'fwd');
    else if (dx > Math.max(36, w * 0.1)) go(cur - 1, 'rev');
    else {
      dragRef.current = 0;
      setDrag(0);
    }
  };

  const hero = slides[0];

  return (
    <PublicLayout variant="spiral" compact>
      <div className="md-scope">
        <section className="md-hero" aria-label="3000 Studios VIP">
          <div className="md-hero-media" aria-hidden="true">
            {hero ? <img src={hero.poster} alt="" fetchPriority="high" decoding="async" /> : null}
          </div>
          <div className="md-hero-veil" aria-hidden="true" />
          <div className="md-hero-copy">
            <span className="md-kicker">YouTube · DistroKid · Official Artist</span>
            <h1 className="md-title">3000 Studios</h1>
            <p className="md-sub">
              {n} official music videos. Swipe through every drop — everything streams free.
              Subscribe so YouTube puts the next release in your feed.
            </p>
            <div className="md-cta-row">
              <a
                className="md-btn md-btn-gold"
                href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
                target="_blank"
                rel="noreferrer"
              >
                Subscribe on YouTube
              </a>
              <a className="md-btn md-btn-ghost" href="#watch">
                Swipe the videos
              </a>
              <Link className="md-btn md-btn-ghost" to="/shop">
                Shop the drop
              </Link>
            </div>
          </div>
        </section>

        <section className="md-stage" id="watch" aria-label="All music videos, swipe to play">
          <div className="md-stage-head">
            <h2>Every video. One swipe.</h2>
            <span className="md-count">
              {String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
            </span>
          </div>
          <div
            className="md-track-viewport"
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="md-track"
              style={{
                transform: `translateX(calc(${-index * 100}vw + ${drag}px))`,
                transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {slides.map((s, i) => {
                const active = i === index;
                const near = Math.abs(i - index) <= 1;
                return (
                  <article
                    key={s.videoId}
                    className="md-slide"
                    aria-label={s.title}
                    aria-current={active ? 'true' : undefined}
                  >
                    <img
                      className="md-slide-poster"
                      src={s.poster}
                      alt=""
                      draggable={false}
                      loading={near ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                    {active ? (
                      <LazyYouTube
                        className="md-slide-video"
                        videoId={s.videoId}
                        title={`${s.title} — official music video`}
                        playlist
                      />
                    ) : null}
                    <div className="md-slide-shade" aria-hidden="true" />
                    <div className="md-slide-meta">
                      <span className="md-slide-index">
                        {String(i + 1).padStart(2, '0')} — {s.release} · {s.duration}
                      </span>
                      <h3 className="md-slide-title">{s.title}</h3>
                      <span className="md-slide-sub">3000 Studios · Official video</span>
                      {active ? (
                        <div className="md-slide-actions">
                          <button
                            type="button"
                            className="md-chip"
                            onClick={() => setSoundOn((v) => !v)}
                            onPointerDown={(ev) => ev.stopPropagation()}
                          >
                            {soundOn ? 'Mute' : 'Tap for sound'}
                          </button>
                          <a
                            className="md-chip md-chip-gold"
                            href={s.buy || s.stream}
                            target="_blank"
                            rel="noreferrer"
                            onPointerDown={(ev) => ev.stopPropagation()}
                          >
                            Buy / stream $0.99
                          </a>
                          <a
                            className="md-chip"
                            href={youtubeWatchUrl(s.videoId)}
                            target="_blank"
                            rel="noreferrer"
                            onPointerDown={(ev) => ev.stopPropagation()}
                          >
                            YouTube
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
            <button
              type="button"
              className="md-arrow prev"
              aria-label="Previous video"
              onClick={() => go(indexRef.current - 1, 'rev')}
            >
              ‹
            </button>
            <button
              type="button"
              className="md-arrow next"
              aria-label="Next video"
              onClick={() => go(indexRef.current + 1, 'fwd')}
            >
              ›
            </button>
          </div>
          <ul className="md-dots" aria-label="Videos">
            {slides.map((s, i) => (
              <li key={s.videoId} className={i === index ? 'on' : undefined}>
                <button type="button" aria-label={s.title} onClick={() => go(i)} />
              </li>
            ))}
          </ul>
          {song ? (
            <p
              style={{
                textAlign: 'center',
                color: '#a7adbd',
                fontSize: 14,
                padding: '6px 16px 18px',
                margin: 0,
              }}
            >
              <strong style={{ color: '#f4efe2' }}>{song.title}</strong> — swipe for the next video
              · <Link to="/music">full catalog</Link> ·{' '}
              <a href="https://distrokid.com/hyperfollow/3000studios">HyperFollow</a>
            </p>
          ) : null}
        </section>

        <div className="md-marquee" aria-hidden="true">
          <div className="md-marquee-track">
            {Array.from({ length: 2 }).flatMap((_, k) =>
              slides.slice(0, 12).map((s) => <span key={`${k}-${s.videoId}`}>{s.title} ✦</span>),
            )}
          </div>
        </div>

        <section className="md-money md-reveal" aria-label="Support 3000 Studios">
          <span className="md-kicker">Fuel the next drop</span>
          <h2>Six ways to get paid — pick one.</h2>
          <p>
            Music streams free forever. Money comes from ownership: downloads, VIP passes, sync
            licenses, sponsors, and merch.
          </p>
          <div className="md-money-grid">
            <article className="md-pay-card">
              <span className="md-tag">99¢</span>
              <h3>Own any track</h3>
              <p>High-res download + release license. Keep it forever.</p>
              <span className="md-price">$0.99</span>
              <a className="md-btn md-btn-gold" href={stripeFor('track')}>
                Buy a track
              </a>
            </article>
            <article className="md-pay-card">
              <span className="md-tag">VIP</span>
              <h3>Vault monthly</h3>
              <p>VIP pass + stem downloads for 31 days.</p>
              <span className="md-price">$3.99/mo</span>
              <a className="md-btn md-btn-gold" href={stripeFor('monthly')}>
                Go VIP
              </a>
            </article>
            <article className="md-pay-card">
              <span className="md-tag">Best value</span>
              <h3>Vault yearly</h3>
              <p>VIP pass + stems for 365 days. Two months free.</p>
              <span className="md-price">$19.99/yr</span>
              <a className="md-btn md-btn-gold" href={stripeFor('yearly')}>
                Go yearly
              </a>
            </article>
            <article className="md-pay-card">
              <span className="md-tag">Sync</span>
              <h3>License a song</h3>
              <p>Film, ads, games, YouTube. Real sync money, direct deal.</p>
              <span className="md-price">Custom</span>
              <a
                className="md-btn md-btn-ghost"
                href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('Sync license request — 3000 Studios')}`}
              >
                Request license
              </a>
            </article>
            <article className="md-pay-card">
              <span className="md-tag">$99</span>
              <h3>Sponsor this page</h3>
              <p>Your brand on 3000studios.vip for 30 days.</p>
              <span className="md-price">$99</span>
              <a className="md-btn md-btn-ghost" href={stripeFor('sponsor')}>
                Sponsor
              </a>
            </article>
            <article className="md-pay-card">
              <span className="md-tag">Merch</span>
              <h3>Wear the brand</h3>
              <p>Hoodies, tees, caps, sticker packs. Limited runs.</p>
              <span className="md-price">from $8</span>
              <Link className="md-btn md-btn-ghost" to="/shop">
                Shop merch
              </Link>
            </article>
          </div>
        </section>

        <section className="md-strip md-reveal" aria-label="Stream everywhere">
          {PLATFORMS.map((p) => (
            <a key={p.id} className="md-chip" href={p.url} target="_blank" rel="noreferrer">
              {p.label}
            </a>
          ))}
        </section>
      </div>
    </PublicLayout>
  );
}
