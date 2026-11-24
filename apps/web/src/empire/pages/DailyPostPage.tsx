import type { CSSProperties } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { EmpirePage } from '../kit';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_BLOG_SLOT } from '../../lib/adsense';
import { usePageMeta } from '../../lib/usePageMeta';
import { buildDailyPost, dailyPostExists, formatDailyDate, DAILY_BASE, utcDateKey } from '../../data/dailyBlog';
import { heroForDate, heroEmbedUrl, type DailyHero } from '../../data/dailyHero';

const DAY = 86_400_000;
const shift = (d: string, n: number) => utcDateKey(new Date(Date.parse(`${d}T00:00:00Z`) + n * DAY));

export function HeroVideo({ hero, eager = false }: { hero: DailyHero; eager?: boolean }) {
  if (hero.kind === 'mp4') {
    return (
      <video
        className="dp-video"
        src={hero.src}
        poster={hero.poster}
        autoPlay
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        aria-label={hero.title}
      />
    );
  }
  return (
    <iframe
      className="dp-video"
      src={heroEmbedUrl(hero.videoId)}
      title={hero.title}
      loading={eager ? 'eager' : 'lazy'}
      allow="autoplay; encrypted-media; picture-in-picture"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

export function DailyPostPage() {
  const { date = '' } = useParams<{ date: string }>();
  const ok = dailyPostExists(date);
  const post = ok ? buildDailyPost(date) : null;
  usePageMeta({
    title: post ? post.title : 'Blog',
    description: post ? post.description : 'Daily stories from 3000 Studios.',
  });
  if (!post) return <Navigate to="/blog" replace />;

  const hero = heroForDate(post.date);
  const prev = dailyPostExists(shift(post.date, -1)) ? shift(post.date, -1) : null;
  const next = dailyPostExists(shift(post.date, 1)) ? shift(post.date, 1) : null;

  return (
    <EmpirePage className="dp-page">
      <article className="dp" style={{ '--dp-tint': post.topic.tint } as CSSProperties}>
        <header className="dp-hero em-nostagger">
          <div className="dp-frame">
            <HeroVideo hero={hero} eager />
            <div className="dp-shade" aria-hidden="true" />
          </div>
          <div className="em-wrap dp-head">
            <Link className="dp-back" to="/blog">
              All posts
            </Link>
            <span className="ep-chip is-live">{post.topic.label}</span>
            <h1>{post.title}</h1>
            <p className="dp-meta">
              <time dateTime={post.date}>{formatDailyDate(post.date)}</time> · {post.readMinutes} min read · Video: {hero.title}
            </p>
          </div>
        </header>
        <div className="em-wrap dp-body">
          <p className="dp-lead">{post.lead}</p>
          {post.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p.slice(0, 40)}>{p}</p>
              ))}
            </section>
          ))}
          <div className="ep-ad">
            <AdSenseUnit slot={ADSENSE_BLOG_SLOT} />
          </div>
          <section className="dp-faq">
            <h2>Frequently asked questions</h2>
            {post.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
          <p className="dp-cta">
            <Link className="em-btn" to={post.topic.cta.to}>
              {post.topic.cta.label}
            </Link>
          </p>
          <ul className="dp-tags" aria-label="Topics">
            {post.keywords.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <nav className="dp-pager" aria-label="More daily posts">
            {prev ? <Link to={`${DAILY_BASE}/${prev}`}>Previous day</Link> : <span />}
            {next ? <Link to={`${DAILY_BASE}/${next}`}>Next day</Link> : <span />}
          </nav>
        </div>
      </article>
    </EmpirePage>
  );
}
