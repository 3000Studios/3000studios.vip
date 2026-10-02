import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

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
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 840 }}>
          <Reveal>
            <span className="v2-kicker">Official Policy</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              {page.title.split(' ').slice(0, -1).join(' ')}{' '}
              <span className="v2-grad-text">
                {page.title.split(' ').slice(-1)}
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 12, fontSize: 14 }}>
              Last updated for 3000 Studios VIP
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div
              className="v2-card"
              style={{ padding: 'clamp(24px, 5vw, 40px)', marginTop: 28 }}
            >
              <p style={{ color: 'var(--v2-text)', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
                {page.text}
              </p>
              <div style={{ borderTop: '1px solid var(--v2-neon-line)', paddingTop: 20 }}>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, margin: 0 }}>
                  Direct questions to:{' '}
                  <a
                    href={`mailto:${OWNER_EMAIL}`}
                    style={{ color: 'var(--v2-neon)', fontWeight: 700, textDecoration: 'none' }}
                  >
                    {OWNER_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
