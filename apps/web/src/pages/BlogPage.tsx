import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { BLOG_ARTICLES } from '../data/blogArticles';
import { ADSENSE_BLOG_SLOT } from '../lib/adsense';
import '../styles/commerce.css';

/**
 * /blog — Studio Notes, mockup section 15.
 * Exactly the six mockup posts, in mockup order, with the mockup's
 * categories. The old page's rotating daily posts (data/blog.ts) and
 * search/filter are dropped — the mockup is a plain editorial index.
 * Two posts have no body copy in the repo yet; their cards show title +
 * category and link to a long-read shell (see BlogPostPage / NOTES.md).
 */
export function BlogPage() {
  return (
    <PublicLayoutV2 wallpaper="particles">
      <section className="v2-section commerce-hero">
        <div className="v2-wrap">
          <Reveal>
            <span className="commerce-kicker">Blog</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="commerce-title">
              Studio <span className="commerce-gold">notes</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="commerce-lede">
              News, stories and studio notes from 3000 Studios.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="commerce-grid commerce-grid--3" stagger={0.06}>
            {BLOG_ARTICLES.map((article) => (
              <RevealItem key={article.slug}>
                <article
                  className="commerce-card"
                  style={{ height: '100%' }}
                >
                  <span className="commerce-card-tag">{article.category}</span>
                  <h2 className="commerce-card-title" style={{ flex: 'none' }}>
                    {article.title}
                  </h2>
                  {article.summary ? (
                    <p className="commerce-card-body">{article.summary}</p>
                  ) : null}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      borderTop: '1px solid var(--v2-neon-line)',
                      paddingTop: 12,
                      marginTop: 'auto',
                    }}
                  >
                    <span style={{ color: 'var(--v2-faint)', fontSize: 12 }}>
                      {article.readTime || `By ${article.author}`}
                    </span>
                    <Link
                      to={`/blog/${article.slug}`}
                      className="v2-btn v2-btn--neon"
                      style={{ padding: '6px 14px', fontSize: 12, flexShrink: 0 }}
                    >
                      Read →
                    </Link>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
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
