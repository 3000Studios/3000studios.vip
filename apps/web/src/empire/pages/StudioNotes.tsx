import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { EmpirePage, PageHero } from '../kit';
import { getDailyBlogPosts } from '../../data/blog';
import { BLOG_ARTICLES } from '../../data/blogArticles';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_BLOG_SLOT } from '../../lib/adsense';

type Card = { key: string; title: string; summary: string; category: string; date: string; slug?: string; readTime?: string; image?: string };

const TINTS = ['#ff5a2c', '#3ee8ff', '#9b6bff', '#f2c867', '#3df2a8', '#ff3d7f'];
const fmt = (d: string) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? d : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(t);
};

export function StudioNotes() {
  const [cat, setCat] = useState('ALL');
  const [q, setQ] = useState('');
  const cards = useMemo<Card[]>(() => {
    const articles: Card[] = [...BLOG_ARTICLES]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map((a) => ({ key: `a-${a.slug}`, title: a.title, summary: a.summary, category: a.category, date: a.publishedAt, slug: a.slug, readTime: a.readTime }));
    const daily: Card[] = getDailyBlogPosts().map((p) => ({
      key: `p-${p.id}`,
      title: p.title,
      summary: p.summary,
      category: p.category,
      date: p.date,
      image: p.image,
    }));
    return [...articles, ...daily];
  }, []);
  const cats = useMemo(() => ['ALL', ...Array.from(new Set(cards.map((c) => c.category)))], [cards]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cards.filter(
      (c) => (cat === 'ALL' || c.category === cat) && (!needle || c.title.toLowerCase().includes(needle) || c.summary.toLowerCase().includes(needle)),
    );
  }, [cards, cat, q]);

  return (
    <EmpirePage>
      <PageHero
        eyebrow="Blog"
        title={
          <>
            Studio
            <br />
            notes
          </>
        }
        lead="News, stories and build notes from 3000 Studios."
        orb="rgba(62,232,255,.32)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap">
          <div className="ep-head">
            <div className="ep-filters" role="group" aria-label="Filter posts" style={{ marginBottom: 0 }}>
              {cats.map((c) => (
                <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
                  {c}
                </button>
              ))}
            </div>
            <label className="ep-search">
              Search posts
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a word" />
            </label>
          </div>
          <div className="ep-grid ep-g3">
            {shown.map((c, i) => {
              const body = (
                <>
                  <div
                    className="ph"
                    style={
                      {
                        '--pc': c.image
                          ? `center / cover no-repeat url(${c.image})`
                          : `radial-gradient(120% 120% at 80% 0%, ${TINTS[i % TINTS.length]}66, transparent 60%), #0b0910`,
                      } as CSSProperties
                    }
                  />
                  <div className="bd">
                    <span className="ep-chip">{c.category}</span>
                    <h3>{c.title}</h3>
                    <p>{c.summary}</p>
                    <span className="ep-mono ep-dim" style={{ fontSize: 12 }}>
                      {fmt(c.date)}
                      {c.readTime ? ` · ${c.readTime}` : ''}
                    </span>
                  </div>
                </>
              );
              const cls = `ep-glass ep-post ep-lift${i === 0 && cat === 'ALL' && !q ? ' is-lead' : ''}`;
              return c.slug ? (
                <Link key={c.key} className={cls} to={`/blog/${c.slug}`}>
                  {body}
                </Link>
              ) : (
                <article key={c.key} className={cls}>
                  {body}
                </article>
              );
            })}
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
