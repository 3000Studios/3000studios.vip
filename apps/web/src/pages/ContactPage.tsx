import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { PublicLayoutV2 } from '../v2/PublicLayoutV2';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Booking');
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
          <span className="nn-kicker">Direct studio line</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(34px, 7vw, 72px)', marginTop: 18 }}>
            BOOK THE STUDIO
          </h1>
          <p>
            Sync licenses, music features, live stream bookings, brand
            sponsorships, and press — reach Jeremy Swain directly.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div className="nn-glass" style={{ padding: 'clamp(22px, 4vw, 36px)', maxWidth: 640, margin: '0 auto' }}>
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <input
                  className="nn-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={80}
                  required
                />
                <input
                  className="nn-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  maxLength={120}
                  required
                />
              </div>
              <select
                className="nn-select"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                style={{ borderRadius: 12 }}
              >
                <option>Booking</option>
                <option>Sync license</option>
                <option>Sponsorship</option>
                <option>Video project</option>
                <option>Press</option>
                <option>Other</option>
              </select>
              <textarea
                className="nn-textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Project details, timeline, budget…"
                maxLength={2000}
                required
              />
              <button type="submit" className="nn-btn nn-btn-gold" style={{ width: '100%' }}>
                <EnvelopeSimple size={18} /> Send via email
              </button>
              <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: 0, textAlign: 'center' }}>
                Prefer direct?{' '}
                <a href={`mailto:${OWNER_EMAIL}`} style={{ color: 'var(--nn-cyan)' }}>
                  {OWNER_EMAIL}
                </a>
              </p>
            </form>
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 48 }}>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h2 className="nn-chrome" style={{ fontSize: 'clamp(22px, 4vw, 32px)', margin: 0 }}>
              MORE WAYS TO REACH THE STUDIO
            </h2>
            <p style={{ color: 'var(--nn-muted)', margin: 0, lineHeight: 1.6 }}>
              3000 Studios is an independent music and media label run by Jeremy Swain out of
              Acworth, Georgia. Every message from this page lands in the studio inbox — pick the
              route that fits and include your timeline so the reply can be specific.
            </p>
            <div className="nn-glass" style={{ padding: '18px 22px' }}>
              <strong>Booking, sync &amp; press</strong>
              <p style={{ color: 'var(--nn-muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
                Use the form above, or email{' '}
                <a href={`mailto:${OWNER_EMAIL}`} style={{ color: 'var(--nn-cyan)' }}>
                  {OWNER_EMAIL}
                </a>{' '}
                directly. For team and VIP list matters, write to{' '}
                <a href="mailto:Team@3000studios.vip" style={{ color: 'var(--nn-cyan)' }}>
                  Team@3000studios.vip
                </a>
                .
              </p>
            </div>
            <div className="nn-glass" style={{ padding: '18px 22px' }}>
              <strong>Looking for something specific?</strong>
              <p style={{ color: 'var(--nn-muted)', margin: '6px 0 0', lineHeight: 1.6 }}>
                Song and video requests go through <Link to="/requests" style={{ color: 'var(--nn-cyan)' }}>Requests</Link>;
                homepage sponsorship slots are on <Link to="/sponsors" style={{ color: 'var(--nn-cyan)' }}>Sponsors</Link>;
                beat packs and licensing live on <Link to="/beats" style={{ color: 'var(--nn-cyan)' }}>Beat Packs</Link>;
                and merch is in the <Link to="/shop" style={{ color: 'var(--nn-cyan)' }}>Shop</Link>.
              </p>
            </div>
          </div>
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
