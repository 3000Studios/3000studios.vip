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
  shipping: {
    title: 'Shipping Policy',
    text: 'Physical merch (apparel and goods) ships via standard carriers, typically within 2–5 business days of order confirmation. U.S. delivery usually takes 5–10 business days after dispatch. Shipping costs are calculated at checkout in our Shopify store.\n\nDigital products — instrumentals, sound packs, construction kits, and custom beats — are delivered electronically. Download links are sent to the email used at checkout, usually within 24 hours; custom beats are delivered on the timeline agreed during the order.\n\nGift cards and exclusive-rights purchases are fulfilled electronically to the buyer\'s email. If a tracking number or download link has not arrived within the stated window, contact us and we will make it right.',
  },
  returns: {
    title: 'Returns & Refunds',
    text: 'Physical merch: 30-day returns. Unworn, unwashed apparel in original condition may be returned within 30 days of delivery for a refund to the original payment method. Buyer covers return shipping unless the item arrived damaged or incorrect — in that case we cover it and replace or refund.\n\nDigital products: final sale once delivered. Because instrumentals, packs, and kits are downloadable files, we cannot accept returns after the download link has been sent. If a file is corrupted or the wrong product was delivered, we will replace it or refund — your call.\n\nCustom beats and exclusive rights: final sale once work has begun or the rights transfer is issued. If we have not started, a full refund is available.\n\nTo start a return, contact us with your order number within 30 days of delivery. Refunds are issued to the original payment method within 5–10 business days of approval.',
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
              {page.text.split('\n\n').map((para, i) => (
                <p key={i} style={{ color: 'var(--v2-text)', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
                  {para}
                </p>
              ))}
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
