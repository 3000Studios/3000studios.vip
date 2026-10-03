import { useParams, Link, Navigate } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from './Home';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import { usePageMeta } from '../lib/usePageMeta';
import '../styles/vip-luxury.css';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = BLOG_ARTICLES.find((a) => a.slug === slug);

  usePageMeta({
    title: article ? article.title : 'Blog',
    description: article ? article.summary : 'Stories and studio notes from 3000 Studios.',
  });
  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const related = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 2);

  return (
    <PublicLayout variant="spiral" compact={false}>
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            ARTICLE HERO
            ========================================================================= */}
        <section style={{ maxWidth: 900, margin: '40px auto 32px', padding: '0 20px' }}>
          <div style={{ marginBottom: 16 }}>
            <Link to="/blog" style={{ color: '#ffd700', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              ← Back to Editorial Blog
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
              {article.category}
            </span>
            <span style={{ color: 'var(--vip-text-muted)', fontSize: 13 }}>
              {article.readTime} · Published {article.publishedAt} · By {article.author}
            </span>
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 18px' }}>
            {article.title}
          </h1>

          <p style={{ color: '#ffd700', fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.6, margin: '0 0 28px' }}>
            {article.leadParagraph}
          </p>

          <div style={{ width: '100%', height: 1, background: 'rgba(255, 215, 0, 0.25)', marginBottom: 32 }} />
        </section>

        {/* =========================================================================
            ARTICLE BODY SECTIONS
            ========================================================================= */}
        <article style={{ maxWidth: 900, margin: '0 auto 48px', padding: '0 20px' }}>
          <div className="vip-glass-card" style={{ padding: 'clamp(20px, 4vw, 36px)', lineHeight: 1.8, fontSize: 16, color: 'var(--vip-cream)' }}>
            {article.sections.map((sec, idx) => (
              <section key={idx} style={{ marginBottom: 32 }}>
                <h2 style={{ color: '#fff', fontSize: 'clamp(20px, 3.5vw, 26px)', fontWeight: 800, margin: '0 0 14px' }}>
                  {sec.heading}
                </h2>
                {sec.body.map((paragraph, pIdx) => (
                  <p key={pIdx} style={{ color: 'var(--vip-text-muted)', margin: '0 0 16px', lineHeight: 1.75 }}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            {/* Tags */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              {article.tags.map((t) => (
                <span key={t} style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </article>

        {/* =========================================================================
            RELATED ARTICLES
            ========================================================================= */}
        {related.length > 0 && (
          <section style={{ maxWidth: 900, margin: '0 auto 48px', padding: '0 20px' }}>
            <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Related Articles</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {related.map((rel) => (
                <Link key={rel.slug} to={`/blog/${rel.slug}`} className="vip-glass-card" style={{ padding: '20px', textDecoration: 'none', display: 'block' }}>
                  <span style={{ color: '#00f0ff', fontSize: 11, fontWeight: 700 }}>{rel.category}</span>
                  <h4 style={{ color: '#fff', fontSize: 16, margin: '6px 0 4px' }}>{rel.title}</h4>
                  <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>{rel.readTime}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* =========================================================================
            ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 900, margin: '0 auto 48px', padding: '0 20px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

      </div>
    </PublicLayout>
  );
}
