import { PublicLayout } from './Home';
import '../styles/vip-luxury.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const content = {
  privacy: {
    title: 'Privacy Policy',
    text: '3000 Studios VIP limits personal data collection to contact requests, site operations, security, analytics, advertising measurement, legal compliance, and optional community submissions. Google AdSense may use cookies or similar technologies to serve and measure ads when ad serving is active. Do not submit sensitive personal information in public forms.',
  },
  terms: {
    title: 'Terms Of Use',
    text: 'By using this site you agree to lawful use, respectful community behavior, no scraping or abuse, and no unauthorized copying of music, videos, visuals, source code, private streams, or protected admin content.',
  },
  copyright: {
    title: 'Copyright & DMCA',
    text: 'All original music, video, graphics, branding, and site content are owned by 3000 Studios or their respective rights holders. For takedown or licensing requests, send a detailed notice to the official contact email.',
  },
  cookies: {
    title: 'Cookie Notice',
    text: 'The site may use necessary storage for preferences, local community entries, playback settings, security, analytics, AdSense advertising, fraud prevention, and advertising review. Browser controls can clear local data at any time.',
  },
  disclaimer: {
    title: 'Legal Disclaimer',
    text: 'The site provides music, media, entertainment, community, and business information. It is not legal, financial, medical, or professional advice. Sponsorships and offers require separate written approval.',
  },
};

export function LegalPage({ type }: { type: keyof typeof content }) {
  const page = content[type];
  return (
    <PublicLayout variant="blackhole" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 840, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            Official Policy
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            {page.title}
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', fontSize: 14 }}>
            Last updated for 3000 Studios VIP
          </p>
        </section>

        <section className="vip-glass-card" style={{ padding: '32px 28px' }}>
          <p style={{ color: '#f8f6f0', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
            {page.text}
          </p>
          <div style={{ borderTop: '1px solid rgba(255, 215, 0, 0.2)', paddingTop: 20 }}>
            <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: 0 }}>
              Direct questions to:{' '}
              <a href={`mailto:${OWNER_EMAIL}`} style={{ color: '#ffd700', fontWeight: 700, textDecoration: 'none' }}>
                {OWNER_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
