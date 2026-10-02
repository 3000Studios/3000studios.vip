import { useMemo } from 'react';
import { PublicLayoutV2, LiveLine, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { getDailyBlogPosts } from '../data/blog';
import { ADSENSE_BLOG_SLOT } from '../lib/adsense';

export function BlogPage() {
  const posts = useMemo(() => getDailyBlogPosts(new Date()), []);

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
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 600 }}>
              Exclusive breakdowns on music production, AI workflows, DistroKid releases,
              and independent creator strategy.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="v2-grid-3">
            {posts.map((post) => (
              <RevealItem key={post.id}>
                <article
                  className="v2-card v2-card--lift"
                  style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
                >
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '16/9',
                      overflow: 'hidden',
                    }}
                  >
                    {post.video ? (
                      <video
                        src={post.video}
                        muted
                        playsInline
                        loop
                        autoPlay
                        preload="metadata"
                        poster={post.image}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/media/official-3000-studios-profile.png';
                        }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <span className="v2-chip" style={{ position: 'absolute', top: 12, left: 12 }}>
                      {post.category}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                    }}
                  >
                    <span style={{ color: 'var(--v2-faint)', fontSize: 12, marginBottom: 6 }}>
                      {new Intl.DateTimeFormat('en', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }).format(new Date(post.date))}
                    </span>
                    <h2
                      className="v2-display"
                      style={{ fontSize: 18, margin: '0 0 10px', lineHeight: 1.35 }}
                    >
                      {post.title}
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
                      {post.summary}
                    </p>
                    <div
                      style={{
                        borderTop: '1px solid var(--v2-neon-line)',
                        paddingTop: 12,
                        marginTop: 'auto',
                      }}
                    >
                      <span style={{ color: 'var(--v2-neon)', fontSize: 12, fontWeight: 700 }}>
                        Tags: {post.keywords}
                      </span>
                    </div>
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
