import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../v2/Reveal';
import { latestVaultReleases, VAULT_SONG_COUNT, type PublishedSong } from '../data/vaultSongs';

/**
 * Lower home sections: vault, latest episode, press, studio notes,
 * differentiators, FAQ, newsletter. All copy is the redesign mockup's,
 * verbatim; the only live values are the song count and the release list,
 * both read from `vaultSongs`.
 *
 * Preview buttons dispatch the existing `3000-play-track` event that
 * GlobalMusic already listens for — nothing plays until a visitor
 * presses play.
 */
function playPreview(song: PublishedSong): void {
  window.dispatchEvent(
    new CustomEvent('3000-play-track', { detail: { src: song.src, title: song.title } }),
  );
}

export function VaultSection() {
  return (
    <section className="empire-section" aria-labelledby="vault-title">
      <Reveal>
        <div className="empire-sec-head">
          <div>
            <p className="empire-kicker">New in the Vault</p>
            <h2 className="empire-h2" id="vault-title">
              Latest releases
            </h2>
          </div>
          <Link className="empire-text-link" to="/music">
            All {VAULT_SONG_COUNT} songs <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
      <div className="empire-vault-grid">
        {latestVaultReleases.map((song) => (
          <article className="empire-vault-card" key={song.slug}>
            <Link
              to={`/song/${song.slug}`}
              className="empire-vault-cover"
              aria-label={`${song.title} — open the release page`}
            >
              {song.cover ? (
                <img src={song.cover} alt="" loading="lazy" />
              ) : (
                <span className="empire-vault-cover-fallback" aria-hidden="true">
                  {song.title.slice(0, 1)}
                </span>
              )}
            </Link>
            <h3 className="empire-vault-title">
              <Link to={`/song/${song.slug}`}>{song.title}</Link>
            </h3>
            <p className="empire-vault-meta">Single</p>
            <button
              type="button"
              className="empire-preview-btn"
              onClick={() => playPreview(song)}
              aria-label={`Preview ${song.title} for one minute`}
            >
              <span aria-hidden="true">▶</span> Preview · 1:00
            </button>
          </article>
        ))}
      </div>
      <Reveal>
        <p className="empire-note">
          Nothing plays until a visitor presses play. Previews run one minute, full tracks are
          on Spotify, Apple Music and every other platform.
        </p>
      </Reveal>
    </section>
  );
}

export function EpisodeSection() {
  return (
    <section className="empire-section empire-episode" aria-labelledby="episode-title">
      <Reveal>
        <p className="empire-kicker">Latest episode · 26</p>
        <h2 className="empire-h2" id="episode-title">
          Stars After Dark
        </h2>
        <p className="empire-lede">
          Follow and Subscribe open with the day and weather in Acworth and close the same way
          every time: stars after dark.
        </p>
        <Link className="empire-text-link" to="/podcast">
          All 26 episodes <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </section>
  );
}

export function PressSection() {
  return (
    <section className="empire-section" aria-labelledby="press-title">
      <Reveal>
        <p className="empire-kicker">3000 Studios Press</p>
        <h2 className="empire-h2" id="press-title">
          Eight books, $9.99 each
        </h2>
        <p className="empire-lede">
          EPUB and PDF sold direct from the studio store. Print through IngramSpark.
        </p>
        <Link className="empire-text-link" to="/books">
          Browse the books <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </section>
  );
}

const STUDIO_NOTES = [
  {
    category: 'Games',
    title:
      "How Aeropocalypse's 24 Bosses Were Designed: Threat Classes, Telegraphs and Fair Bullet Patterns",
    to: '/blog/how-aeropocalypses-24-bosses-were-designed',
  },
  {
    category: 'Software',
    title: 'Inside Amped Ear 3000: How a 4096-Point FFT Helps You Fix a Mix',
    to: '/blog/inside-amped-ear-3000-spectral-audio',
  },
  {
    category: 'Engineering',
    title: 'How 3000studios.vip Runs on Cloudflare Pages, and the Deploy Lesson We Learned',
    to: '/blog/building-production-site-on-cloudflare-pages',
  },
] as const;

export function StudioNotesSection() {
  return (
    <section className="empire-section" aria-labelledby="notes-title">
      <Reveal>
        <div className="empire-sec-head">
          <div>
            <p className="empire-kicker">Studio Notes · From the War Room</p>
            <h2 className="empire-h2" id="notes-title">
              Studio Notes
            </h2>
          </div>
          <Link className="empire-text-link" to="/blog">
            Read the blog <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
      <div className="empire-notes-grid">
        {STUDIO_NOTES.map((post) => (
          <article className="empire-note-card" key={post.to}>
            <p className="empire-note-category">{post.category}</p>
            <h3 className="empire-note-title">
              <Link to={post.to}>{post.title}</Link>
            </h3>
          </article>
        ))}
      </div>
    </section>
  );
}

const DIFFERENTIATORS = [
  {
    index: '01',
    title: 'Everything under one roof',
    copy: 'Music, games, books, software and live broadcasts are made by the same studio, so a new release reaches every audience at once.',
  },
  {
    index: '02',
    title: 'Built to ship',
    copy: "The studio's software stack runs on Cloudflare's edge network, so new music, games and books go live in seconds, not days.",
  },
  {
    index: '03',
    title: 'Fans first',
    copy: 'Fans get a minute of every song free, the podcast records in front of a live audience, and Aeropocalypse is in closed testing with real players.',
  },
] as const;

export function DifferentSection() {
  return (
    <section className="empire-section" aria-labelledby="different-title">
      <Reveal>
        <p className="empire-kicker">What makes 3000 different</p>
        <h2 className="empire-h2" id="different-title">
          What makes 3000 different
        </h2>
        <p className="empire-lede">One studio. Every format. No waiting on a label.</p>
      </Reveal>
      <div className="empire-diff-grid">
        {DIFFERENTIATORS.map((item) => (
          <article className="empire-diff-card" key={item.index}>
            <p className="empire-diff-index">{item.index}</p>
            <h3 className="empire-diff-title">{item.title}</h3>
            <p className="empire-diff-copy">{item.copy}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: 'How do I listen to the music?',
    a: 'Every song previews free for one minute on this site. Full songs are on Spotify, Apple Music and every other platform.',
  },
  {
    q: 'Is Aeropocalypse free to play?',
    a: 'Aeropocalypse: Online is free on Google Play. It is in closed testing, and the launch list opens first to testers.',
  },
  {
    q: 'How do I get the books?',
    a: 'Ebooks are $9.99, in EPUB and PDF, sold direct from the studio store. Print is through IngramSpark.',
  },
  {
    q: 'Can I book the studio?',
    a: 'Yes — booking, sync and press go through the contact form, and the studio replies to every message.',
  },
  {
    q: 'Where is the studio based?',
    a: 'Acworth, Georgia.',
  },
] as const;

export function FaqSection() {
  return (
    <section className="empire-section" aria-labelledby="faq-title">
      <Reveal>
        <p className="empire-kicker">Questions, answered</p>
        <h2 className="empire-h2" id="faq-title">
          Questions, answered
        </h2>
      </Reveal>
      <div className="empire-faq">
        {FAQS.map((faq) => (
          <details className="empire-faq-item" key={faq.q}>
            <summary className="empire-faq-q">{faq.q}</summary>
            <p className="empire-faq-a">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Front-end only for now: no list provider is wired yet. The address is
    // captured in state and the success state is shown; wiring (provider,
    // endpoint, or the existing mailto fallback) is an open item in
    // home/NOTES.md. Nothing is sent anywhere from this form today.
    setJoined(true);
  };

  return (
    <section className="empire-section empire-newsletter" aria-labelledby="newsletter-title">
      <Reveal>
        <p className="empire-kicker">Never miss a drop</p>
        <h2 className="empire-h2" id="newsletter-title">
          Get on the list
        </h2>
        <p className="empire-lede">
          New songs, new books and the Aeropocalypse launch, straight to your inbox.
        </p>
        {joined ? (
          <p className="empire-newsletter-done" role="status">
            You&apos;re on the list — watch your inbox for the next drop.
          </p>
        ) : (
          <form className="empire-newsletter-form" onSubmit={submit}>
            <label className="empire-sr-only" htmlFor="empire-newsletter-email">
              Email address
            </label>
            <input
              id="empire-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="email"
            />
            <button type="submit" className="empire-btn empire-btn--gold">
              Join the list
            </button>
          </form>
        )}
        <p className="empire-note">No spam. Unsubscribe anytime.</p>
      </Reveal>
    </section>
  );
}
