import { PublicLayout } from './Home';
import '../styles/vip-luxury.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

export function ContactPage() {
  return (
    <PublicLayout variant="pulse" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 840, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            Direct Studio Line
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Contact 3000 Studios
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 540, margin: '0 auto', fontSize: 16 }}>
            Reach Jeremy Swain directly for sync licenses, music features, live stream bookings, brand sponsorships, and press inquiries.
          </p>
        </section>

        <section className="vip-glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', marginBottom: 16, fontSize: 24 }}>
            ✉
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, margin: '0 0 8px' }}>Official Studio Email</h2>
          <a
            href={`mailto:${OWNER_EMAIL}`}
            style={{
              color: '#ffd700',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 800,
              textDecoration: 'none',
              display: 'inline-block',
              margin: '8px 0 20px',
            }}
          >
            {OWNER_EMAIL}
          </a>
          <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
            All messages route directly to the producer. We respond to licensing and business inquiries within 24 hours.
          </p>
          <a
            className="vip-btn-gold"
            href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios Inquiry')}`}
            style={{ minWidth: 200 }}
          >
            Send Email Message
          </a>
        </section>
      </main>
    </PublicLayout>
  );
}
