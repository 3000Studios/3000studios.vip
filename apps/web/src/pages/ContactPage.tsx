import { EnvelopeSimple } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

export function ContactPage() {
  return (
    <PublicLayoutV2 wallpaper="waves">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 840 }}>
          <Reveal>
            <span className="v2-kicker">Direct Studio Line</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Contact <span className="v2-grad-text">3000 Studios</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 560 }}>
              Reach Jeremy Swain directly for sync licenses, music features, live stream
              bookings, brand sponsorships, and press inquiries.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div
              className="v2-card v2-card--lift"
              style={{ padding: 'clamp(28px, 5vw, 48px)', textAlign: 'center', marginTop: 32 }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: 'rgba(0, 245, 147, 0.1)',
                  border: '1px solid var(--v2-neon-line)',
                  color: 'var(--v2-neon)',
                  marginBottom: 18,
                }}
                aria-hidden="true"
              >
                <EnvelopeSimple size={30} weight="duotone" />
              </div>
              <h2
                className="v2-display"
                style={{ fontSize: 24, margin: '0 0 8px' }}
              >
                Official Studio Email
              </h2>
              <a
                href={`mailto:${OWNER_EMAIL}`}
                style={{
                  color: 'var(--v2-neon)',
                  fontSize: 'clamp(18px, 4vw, 24px)',
                  fontWeight: 800,
                  textDecoration: 'none',
                  display: 'inline-block',
                  margin: '8px 0 20px',
                  wordBreak: 'break-all',
                }}
              >
                {OWNER_EMAIL}
              </a>
              <p style={{ color: 'var(--v2-muted)', fontSize: 14, maxWidth: 440, margin: '0 auto 24px' }}>
                All messages route directly to the producer. We respond to licensing and
                business inquiries within 24 hours.
              </p>
              <a
                className="v2-btn"
                href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios Inquiry')}`}
                style={{ minWidth: 200 }}
              >
                <EnvelopeSimple size={18} weight="fill" />
                Send Email Message
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
