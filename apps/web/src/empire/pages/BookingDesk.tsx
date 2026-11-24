import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeSimple } from '@phosphor-icons/react';
import { EmpirePage, PageHero } from '../kit';
import { swatch } from '../swatch';
import { SUPPORT_EMAIL } from '../links';

const TOPICS = ['Booking', 'Sync license', 'Sponsorship', 'Video project', 'Press', 'Support', 'Other'];
const DOORS = [
  { to: '/requests', label: 'Requests', sub: 'Commission a track' },
  { to: '/sponsors', label: 'Sponsors', sub: 'Brand packages' },
  { to: '/beats', label: 'Beat packs', sub: 'License instrumentals' },
  { to: '/books', label: 'Books', sub: 'The bookshelf' },
  { to: '/shop', label: 'Shop', sub: 'Merch and passes' },
  { to: '/vip', label: 'VIP', sub: 'Member tiers' },
];

export function BookingDesk() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Booking');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ kind: 'contact', name, email, mood: topic, body: message.slice(0, 1000) }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) throw new Error('inbox rejected');
      setStatus('sent');
      setMessage('');
    } catch {
      setStatus('failed');
    }
  }

  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`3000 Studios: ${topic}`)}&body=${encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\n${message}`,
  )}`;

  return (
    <EmpirePage>
      <PageHero
        eyebrow="Book the studio"
        title={
          <>
            Contact
            <br />
            3000 Studios
          </>
        }
        lead="Booking, sync, press and support go through the form. Looking for something specific? The quick doors are below."
        orb="rgba(62,232,255,.32)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid ep-g2" style={{ alignItems: 'start' }}>
          <form className="ep-glass ep-gilt ep-card ep-form" onSubmit={submit}>
            <div className="row">
              <label>
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
              </label>
              <label>
                Email
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </label>
            </div>
            <label>
              Topic
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Message
              <textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} required />
            </label>
            <button className="em-btn" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? 'Sending' : 'Send message'}
            </button>
            {status === 'sent' && <p className="ep-note">Sent. The studio will reply by email.</p>}
            {status === 'failed' && (
              <p className="ep-note is-err">
                That did not go through. <a href={mailto}>Email {SUPPORT_EMAIL}</a> instead.
              </p>
            )}
            <p className="ep-dim" style={{ fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
              <EnvelopeSimple size={16} /> {SUPPORT_EMAIL}
            </p>
          </form>
          <div className="ep-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
            {DOORS.map((d, i) => (
              <Link key={d.to} to={d.to} className="ep-glass ep-door ep-lift ep-sheen" style={{ background: swatch(i) }}>
                <b>{d.label}</b>
                <small>{d.sub}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
