import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from './Home';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ADSENSE_BLOG_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

export function BlogPage() {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const categories = ['ALL', 'Game Design & Engineering', 'Audio Engineering', 'Web Architecture', 'AI Workflows'];

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((art) => {
      const matchCat = filter === 'ALL' || art.category === filter;
      const matchSearch =
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        art.summary.toLowerCase().includes(search.toLowerCase()) ||
        art.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [filter, search]);

  return (
    <PublicLayout variant="nebula" compact={false}>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 1240, margin: '0 auto' }}>
        
        {/* =========================================================================
            BLOG HERO
            ========================================================================= */}
        <section className="vip-glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 32 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            Studio Journal & Engineering Dispatch
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            3000 Studios Insights & Architecture
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 660, margin: '0 auto 20px', fontSize: 16 }}>
            In-depth technical breakdowns and creative logs on Thunder Dome game physics, 4096-bin audio DSP, AI agent pipelines, and Cloudflare edge architecture.
          </p>

          {/* Search bar */}
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <input
              type="text"
              placeholder="Search engineering articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(10, 13, 22, 0.9)',
                border: '1px solid rgba(255, 215, 0, 0.35)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </section>

        {/* =========================================================================
            CATEGORY TABS
            ========================================================================= */}
        <section style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className="vip-btn-obsidian"
                style={{
                  fontSize: 13,
                  padding: '8px 18px',
                  borderColor: filter === cat ? '#00f0ff' : undefined,
                  background: filter === cat ? 'rgba(0, 240, 255, 0.15)' : undefined,
                  color: filter === cat ? '#00f0ff' : undefined,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* =========================================================================
            ARTICLES GRID
            ========================================================================= */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}
        >
          {filteredArticles.map((article) => (
            <article key={article.slug} className="vip-glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ color: '#00f0ff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {article.category}
                </span>
                <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>
                  {article.readTime}
                </span>
              </div>

              <h2 style={{ color: '#fff', fontSize: 20, margin: '0 0 10px', lineHeight: 1.35, fontWeight: 800 }}>
                {article.title}
              </h2>

              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.6, margin: '0 0 18px', flex: 1 }}>
                {article.summary}
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
                {article.tags.map((tag) => (
                  <span key={tag} style={{ background: 'rgba(255, 255, 255, 0.06)', color: 'var(--vip-cream)', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 215, 0, 0.15)', paddingTop: 14, marginTop: 'auto' }}>
                <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>
                  Published {article.publishedAt} · By {article.author}
                </span>
                <Link to={`/blog/${article.slug}`} className="vip-btn-gold" style={{ padding: '6px 14px', fontSize: 12 }}>
                  Read Article ↗
                </Link>
              </div>
            </article>
          ))}
        </section>

        {/* =========================================================================
            ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ margin: '32px auto 0' }}>
          <AdSenseUnit slot={ADSENSE_BLOG_SLOT} />
        </section>
      </main>
    </PublicLayout>
  );
}
