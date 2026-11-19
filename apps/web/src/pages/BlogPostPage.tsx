import { useParams, Link, Navigate } from 'react-router-dom';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { BLOG_ARTICLES, findBlogArticle } from '../data/blogArticles';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import { usePageMeta } from '../lib/usePageMeta';
import '../styles/commerce.css';

/**
 * /blog/:slug — long-read article, mockup section 16.
 * Narrow measure, pull quotes (only where the mockup supplies one), and
 * three related posts. Articles without body copy in the repo render as a
 * shell — real title, category and summary only, no invented body text.
 * The bosses article lives at the mockup slug /blog/aeropocalypse-bosses;
 * its old slug still resolves via BLOG_SLUG_ALIASES.
 */
export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? findBlogArticle(slug) : undefined;

  usePageMeta({
    title: article ? article.title : 'Blog',
    description: article
      ? article.summary || 'Stories and studio notes from 3000 Studios.'
      : 'Stories and studio notes from 3000 Studios.',
  });

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  const related = BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);
  const meta = [article.readTime, article.publishedAt ? `Published ${article.publishedAt}` : '', `By ${article.author}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <PublicLayoutV2 wallpaper="particles">
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        <section className="commerce-article" style={{ marginTop: 40, marginBottom: 32, padding: '0 20px' }}>
          <div style={{ marginBottom: 16 }}>
            <Link to="/blog" style={{ color: '#ffd700', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
              ← Back to Studio Notes
            </Link>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
            <span className="md-kicker" style={{ color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.4)' }}>
              {article.category}
            </span>
            {meta ? (
              <span style={{ color: 'var(--vip-text-muted)', fontSize: 13 }}>{meta}</span>
            ) : null}
          </div>

          <h1 style={{ color: '#fff', fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 18px' }}>
            {article.title}
          </h1>

          {article.leadParagraph ? (
            <p style={{ color: '#ffd700', fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.6, margin: '0 0 28px' }}>
              {article.leadParagraph}
            </p>
          ) : null}

          <div style={{ width: '100%', height: 1, background: 'rgba(255, 215, 0, 0.25)', marginBottom: 32 }} />
        </section>

        <article className="commerce-article" style={{ marginBottom: 48, padding: '0 20px' }}>
          <div className="commerce-article-body">
            {article.pullQuote ? (
              <blockquote className="commerce-pullquote">{article.pullQuote}</blockquote>
            ) : null}
            {article.sections.map((sec, idx) => (
              <section key={idx} style={{ marginBottom: 32 }}>
                <h2>{sec.heading}</h2>
                {sec.body.map((paragraph, pIdx) => (
                  <p key={pIdx}>{paragraph}</p>
                ))}
              </section>
            ))}
            {article.sections.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                {article.tags.map((t) => (
                  <span key={t} style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', fontSize: 12, padding: '4px 10px', borderRadius: 999 }}>
                    #{t}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </article>

        {related.length > 0 && (
          <section className="commerce-article" style={{ marginBottom: 48, padding: '0 20px' }}>
            <h3 style={{ color: '#fff', fontSize: 20, marginBottom: 16 }}>Related — Keep Reading</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {related.map((rel) => (
                <Link key={rel.slug} to={`/blog/${rel.slug}`} className="vip-glass-card" style={{ padding: '20px', textDecoration: 'none', display: 'block' }}>
                  <span style={{ color: '#00f0ff', fontSize: 11, fontWeight: 700 }}>{rel.category}</span>
                  <h4 style={{ color: '#fff', fontSize: 16, margin: '6px 0 4px' }}>{rel.title}</h4>
                  {rel.readTime ? (
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>{rel.readTime}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section style={{ maxWidth: 900, margin: '0 auto 48px', padding: '0 20px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>
      </div>
    </PublicLayoutV2>
  );
}
