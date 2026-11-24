import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { EmpirePage } from '../kit';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_BLOG_SLOT } from '../../lib/adsense';
import { DAILY_TOPICS, formatDailyDate, listDailyPosts, type DailyTopicId } from '../../data/dailyBlog';
import { heroForDate } from '../../data/dailyHero';
import { HeroVideo } from './DailyPostPage';
import { playSfx } from '../sfx';

type Card = { key: string; to: string; title: string; summary: string; topic: string; tint: string; date: string; read: string; poster?: string };

const TOPICS: Array<{ id: 'all' | DailyTopicId | 'stories'; label: string; blurb: string; tint: string }> = [
  { id: 'all', label: 'Everything', blurb: 'Every post, newest first.', tint: '#f2c867' },
  ...DAILY_TOPICS.map((t) => ({ id: t.id, label: t.label, blurb: t.blurb, tint: t.tint })),
  { id: 'stories', label: 'Studio Stories', blurb: 'Long reads and features from the studio.', tint: '#ff3d7f' },
];

const fmt = (d: string) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? d : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(t);
};

/** 3D coverflow of topics: swipe, drag, wheel, arrows or tap a card. */
function TopicFlow({ index, onPick }: { index: number; onPick: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; i: number } | null>(null);
  const wheelLock = useRef(0);

  const go = useCallback(
    (i: number) => {
      const n = Math.max(0, Math.min(TOPICS.length - 1, i));
      if (n !== index) {
        playSfx('nav');
        onPick(n);
      }
    },
    [index, onPick],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (Math.abs(d) < 8) return;
      e.preventDefault();
      const now = performance.now();
      if (now - wheelLock.current < 260) return;
      wheelLock.current = now;
      go(index + (d > 0 ? 1 : -1));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [go, index]);

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  };

  return (
    <div
      ref={ref}
      className="tf"
      role="listbox"
      aria-label="Pick a blog topic"
      aria-activedescendant={`tf-${TOPICS[index].id}`}
      tabIndex={0}
      onKeyDown={onKey}
      onPointerDown={(e) => { drag.current = { x: e.clientX, i: index }; }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d) return;
        const dx = e.clientX - d.x;
        if (Math.abs(dx) > 40) go(d.i - (Math.round(dx / 120) || Math.sign(dx)));
      }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <div className="tf-stage">
        {TOPICS.map((t, i) => {
          const off = i - index;
          const abs = Math.abs(off);
          return (
            <button
              key={t.id}
              id={`tf-${t.id}`}
              type="button"
              role="option"
              aria-selected={off === 0}
              tabIndex={-1}
              className={`tf-card${off === 0 ? ' is-on' : ''}`}
              style={{ '--off': off, '--abs': abs, '--c': t.tint, zIndex: 50 - abs } as CSSProperties}
              onClick={() => go(i)}
              data-em-silent
            >
              <span className="tf-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="tf-t">{t.label}</span>
              <span className="tf-s">{t.blurb}</span>
            </button>
          );
        })}
      </div>
      <div className="tf-dots" aria-hidden="true">
        {TOPICS.map((t, i) => (
          <i key={t.id} className={i === index ? 'is-on' : undefined} />
        ))}
      </div>
    </div>
  );
}

export function StudioNotes() {
  const [pick, setPick] = useState(0);
  const [q, setQ] = useState('');
  const daily = useMemo(() => listDailyPosts(), []);
  const today = daily[0];
  const hero = today ? heroForDate(today.date) : null;

  const cards = useMemo<Card[]>(() => {
    const d: Card[] = daily.map((p) => ({
      key: `d-${p.date}`,
      to: p.path,
      title: p.title,
      summary: p.description,
      topic: p.topic.id,
      tint: p.topic.tint,
      date: p.date,
      read: `${p.readMinutes} min read`,
      poster: heroForDate(p.date).poster,
    }));
    const a: Card[] = [...BLOG_ARTICLES]
      .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt))
      .map((x) => ({ key: `a-${x.slug}`, to: `/blog/${x.slug}`, title: x.title, summary: x.summary, topic: 'stories', tint: '#ff3d7f', date: x.publishedAt, read: x.readTime }));
    return [...d, ...a].sort((x, y) => y.date.localeCompare(x.date));
  }, [daily]);

  const topic = TOPICS[pick];
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (topic.id === 'all' || c.topic === topic.id) &&
        (!needle || c.title.toLowerCase().includes(needle) || c.summary.toLowerCase().includes(needle)),
    );
  }, [cards, topic, q]);

  return (
    <EmpirePage className="sn-page">
      {today && hero && (
        <section className="sn-today em-nostagger" aria-labelledby="sn-today-title">
          <div className="dp-frame">
            <HeroVideo hero={hero} eager />
            <div className="dp-shade" aria-hidden="true" />
          </div>
          <div className="em-wrap sn-today-in">
            <span className="ep-chip is-live">Today on the blog · {formatDailyDate(today.date)}</span>
            <h1 id="sn-today-title">{today.title}</h1>
            <p className="ep-lead">{today.description}</p>
            <div className="ep-ctas">
              <Link className="em-btn" to={today.path}>
                Read today&apos;s post
              </Link>
              <a className="em-btn em-btn--ghost" href="#sn-topics">
                Pick a topic
              </a>
            </div>
          </div>
        </section>
      )}

      <section className="ep-sec" id="sn-topics" aria-labelledby="sn-topics-title">
        <div className="em-wrap">
          <h2 id="sn-topics-title" className="sn-h2">
            Pick a topic
          </h2>
          <TopicFlow index={pick} onPick={setPick} />
          <div className="ep-head" style={{ marginTop: 18 }}>
            <p className="ep-dim" aria-live="polite" style={{ margin: 0 }}>
              {topic.label}: {shown.length} {shown.length === 1 ? 'post' : 'posts'}
            </p>
            <label className="ep-search">
              Search posts
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a word" />
            </label>
          </div>
          <div className="ep-grid ep-g3">
            {shown.map((c, i) => (
              <Link key={c.key} className={`ep-glass ep-post ep-lift${i === 0 && !q ? ' is-lead' : ''}`} to={c.to}>
                <div
                  className="ph"
                  style={
                    {
                      '--pc': c.poster
                        ? `center / cover no-repeat url(${c.poster})`
                        : `radial-gradient(120% 120% at 80% 0%, ${c.tint}66, transparent 60%), #0b0910`,
                    } as CSSProperties
                  }
                />
                <div className="bd">
                  <span className="ep-chip" style={{ color: c.tint }}>
                    {TOPICS.find((t) => t.id === c.topic)?.label ?? 'Blog'}
                  </span>
                  <h3>{c.title}</h3>
                  <p>{c.summary}</p>
                  <span className="ep-mono ep-dim" style={{ fontSize: 12 }}>
                    {fmt(c.date)} · {c.read}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {shown.length === 0 && <p className="ep-dim">No posts match that search.</p>}
          <div className="ep-ad">
            <AdSenseUnit slot={ADSENSE_BLOG_SLOT} />
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
