import { useMemo } from 'react';
import { PublicLayout, AdSenseUnit } from './Home';
import { getDailyBlogPosts } from '../data/blog';
import { ADSENSE_BLOG_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

export function BlogPage() {
  const posts = useMemo(() => getDailyBlogPosts(new Date()), []);

  return (
    <PublicLayout variant="nebula" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 1140, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            Studio Journal
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Daily Editorial & Music Insights
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 600, margin: '0 auto', fontSize: 16 }}>
            Exclusive breakdowns on music production, AI workflows, DistroKid releases, and independent creator strategy.
          </p>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 36,
          }}
        >
          {posts.map((post) => (
            <article key={post.id} className="vip-glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
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
                      (e.target as HTMLImageElement).src = '/media/official-3000-studios-profile.png';
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(5, 6, 10, 0.85)',
                    color: '#ffd700',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {post.category}
                </span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{ color: 'var(--vip-text-muted)', fontSize: 12, marginBottom: 6 }}>
                  {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(post.date))}
                </span>
                <h2 style={{ color: '#fff', fontSize: 18, margin: '0 0 10px', lineHeight: 1.35 }}>
                  {post.title}
                </h2>
                <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.55, margin: '0 0 16px', flex: 1 }}>
                  {post.summary}
                </p>
                <div style={{ borderTop: '1px solid rgba(255, 215, 0, 0.15)', paddingTop: 12, marginTop: 'auto' }}>
                  <span style={{ color: '#ffd700', fontSize: 12, fontWeight: 700 }}>
                    Tags: {post.keywords}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section style={{ margin: '32px auto 0' }}>
          <AdSenseUnit slot={ADSENSE_BLOG_SLOT} />
        </section>
      </main>
    </PublicLayout>
  );
}
