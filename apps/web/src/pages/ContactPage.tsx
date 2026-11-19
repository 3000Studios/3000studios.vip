import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import '../styles/commerce.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const TOPICS = ['Booking', 'Sync licensing', 'Press', 'VIP list'] as const;

const QUICK_DOORS = [
  { label: 'Requests', to: '/requests' },
  { label: 'Sponsors', to: '/sponsors' },
  { label: 'Beat Packs', to: '/beats' },
  { label: 'Books', to: '/books' },
  { label: 'Shop', to: '/shop' },
  { label: 'VIP', to: '/vip' },
];

/**
 * /contact — Book the Studio, mockup section 18.
 * Form topics follow the mockup exactly. Submit opens the visitor's mail
 * client addressed to the studio (existing repo pattern) — front-end only;
 * no backend endpoint is wired yet. Coordinator to connect a form backend
 * if the studio wants in-page delivery (see NOTES.md).
 */
export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<string>('Booking');
  const [message, setMessage] = useState('');

  function submit(event: FormEvent) {
    event.preventDefault();
    const subject = `3000 Studios contact — ${topic} — ${name || 'website visitor'}`;
    const body = `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\n\n${message}`;
    window.location.assign(
      `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  }

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">Contact 3000 Studios</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(34px, 7vw, 72px)', marginTop: 18 }}>
            BOOK THE STUDIO
          </h1>
          <p>
            Booking, sync and press go through the form. Looking for something specific? The
            quick doors are below.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-glass" style={{ padding: 'clamp(22px, 4vw, 36px)', maxWidth: 640, margin: '0 auto' }}>
            <Reveal>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--nn-text)', fontSize: 14, fontWeight: 700 }}>
                    Name
                    <input
                      className="nn-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={80}
                      required
                    />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--nn-text)', fontSize: 14, fontWeight: 700 }}>
                    Email
                    <input
                      className="nn-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      maxLength={120}
                      required
                    />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--nn-text)', fontSize: 14, fontWeight: 700 }}>
                  Topic
                  <select
                    className="nn-select"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    style={{ borderRadius: 12 }}
                  >
                    {TOPICS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--nn-text)', fontSize: 14, fontWeight: 700 }}>
                  Message
                  <textarea
                    className="nn-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Project details, timeline, budget…"
                    maxLength={2000}
                    required
                  />
                </label>
                <button type="submit" className="nn-btn nn-btn-gold" style={{ width: '100%' }}>
                  <EnvelopeSimple size={18} /> Send message
                </button>
                <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: 0, textAlign: 'center' }}>
                  Prefer direct?{' '}
                  <a href={`mailto:${OWNER_EMAIL}`} style={{ color: 'var(--nn-cyan)' }}>
                    {OWNER_EMAIL}
                  </a>
                </p>
              </form>
            </Reveal>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48, textAlign: 'center' }}>
          <Reveal>
            <span className="nn-kicker nn-kicker--gold">Quick doors</span>
            <div className="commerce-doors">
              {QUICK_DOORS.map((door) => (
                <Link key={door.to} className="nn-btn nn-btn-ghost" to={door.to}>
                  {door.label}
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/about">About</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>
    </PublicLayoutV2>
  );
}
