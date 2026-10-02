import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { getDailyBlogPosts } from '../data/blog';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ADSENSE_BLOG_SLOT } from '../lib/adsense';

type Card = {
  key: string;
  title: string;
  summary: string;
  category: string;
  dateLabel: string;
  tags: string[];
  image?: string;
  video?: string;
  slug?: string;
  readTime?: string;
  author?: string;
};

const FALLBACK_IMG = '/media/official-3000-studios-profile.png';

export function BlogPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const cards = useMemo<Card[]>(() => {
    const posts: Card[] = getDailyBlogPosts().map((p) => ({
      key: `post-${p.id}`,
      title: p.title,
      summary: p.summary,
      category: p.category,
      dateLabel: new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date(p.date)),
      tags: p.keywords.split(',').map((k) => k.trim()).filter(Boolean),
      image: p.image,
      video: p.video,
    }));
    const articles: Card[] = BLOG_ARTICLES.map((a) => ({
      key: `article-${a.slug}`,
      title: a.title,
      summary: a.summary,
      category: a.category,
      dateLabel: a.publishedAt,
      tags: a.tags,
      slug: a.slug,
      readTime: a.readTime,
      author: a.author,
    }));
    return [...posts, ...articles];
  }, []);

  const categories = useMemo(
    () => ['ALL', ...Array.from(new Set(cards.map((c) => c.category)))],
    [cards],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      const matchCat = filter === 'ALL' || c.category === filter;
      const matchSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [cards, filter, search]);

  return (
    <PublicLayoutV2 wallpaper="particles">
      <section className="v2-section">
        <div className="v2-wrap">
          <Reveal>
            <span className="v2-kicker">Studio Journal</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Daily Editorial & <span className="v2-grad-text">Music Insights</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 640 }}>
              Exclusive breakdowns on music production, AI workflows, DistroKid releases,
              independent creator strategy — plus deep engineering dispatches on game
              physics, audio DSP, and edge architecture.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div style={{ marginTop: 20, maxWidth: 420 }}>
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(8, 10, 16, 0.85)',
                  border: '1px solid var(--v2-neon-line)',
                  color: '#fff',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilter(cat)}
                  className="v2-chip"
                  style={{
                    cursor: 'pointer',
                    borderColor: filter === cat ? 'var(--v2-neon)' : undefined,
                    color: filter === cat ? 'var(--v2-neon)' : undefined,
                    background: filter === cat ? 'rgba(0, 240, 255, 0.12)' : undefined,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          {filtered.length === 0 ? (
            <p style={{ color: 'var(--v2-muted)', textAlign: 'center', padding: '40px 0' }}>
              No articles match your search. Try a different keyword.
            </p>
          ) : (
            <RevealGroup className="v2-grid-3">
              {filtered.map((card) => (
                <RevealItem key={card.key}>
                  <article
                    className="v2-card v2-card--lift"
                    style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
                  >
                    {card.image && (
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '16/9',
                          overflow: 'hidden',
                        }}
                      >
                        {card.video ? (
                          <video
                            src={card.video}
                            muted
                            playsInline
                            loop
                            autoPlay
                            preload="metadata"
                            poster={card.image}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={card.image}
                            alt={card.title}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMG;
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        )}
                        <span className="v2-chip" style={{ position: 'absolute', top: 12, left: 12 }}>
                          {card.category}
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        padding: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ color: 'var(--v2-faint)', fontSize: 12 }}>
                          {card.dateLabel}
                          {card.author ? ` · By ${card.author}` : ''}
                        </span>
                        {card.readTime && (
                          <span style={{ color: 'var(--v2-neon)', fontSize: 12, fontWeight: 700 }}>
                            {card.readTime}
                          </span>
                        )}
                      </div>
                      {!card.image && (
                        <span className="v2-chip" style={{ alignSelf: 'flex-start', marginBottom: 10 }}>
                          {card.category}
                        </span>
                      )}
                      <h2
                        className="v2-display"
                        style={{ fontSize: 18, margin: '0 0 10px', lineHeight: 1.35 }}
                      >
                        {card.title}
                      </h2>
                      <p
                        style={{
                          color: 'var(--v2-muted)',
                          fontSize: 14,
                          lineHeight: 1.55,
                          margin: '0 0 16px',
                          flex: 1,
                        }}
                      >
                        {card.summary}
                      </p>
                      <div
                        style={{
                          borderTop: '1px solid var(--v2-neon-line)',
                          paddingTop: 12,
                          marginTop: 'auto',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--v2-faint)',
                            fontSize: 12,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {card.tags.slice(0, 3).map((t) => `#${t}`).join(' ')}
                        </span>
                        {card.slug && (
                          <Link
                            to={`/blog/${card.slug}`}
                            className="v2-btn v2-btn--neon"
                            style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                          >
                            Read ↗
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <AdSenseUnit slot={ADSENSE_BLOG_SLOT} />
        </div>
      </section>
    </PublicLayoutV2>
  );
}
