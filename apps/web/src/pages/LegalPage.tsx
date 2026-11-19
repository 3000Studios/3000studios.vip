import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import '../styles/commerce.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

type LegalSection = { id: string; title: string; body: string[] };
type LegalDoc = {
  kicker: string;
  title: string;
  effective: string;
  intro: string[];
  sections: LegalSection[];
};

/**
 * /privacy + /terms — two-column legal layout with a section index,
 * mockup sections 19–20. Section copy is the mockup's own wording; the
 * intro paragraphs merge the existing LegalPage text so nothing the site
 * already promised is lost. No new legal terms invented. The copyright /
 * cookies / disclaimer routes keep the old single-section form.
 */
const DOCS: Record<'privacy' | 'terms', LegalDoc> = {
  privacy: {
    kicker: 'Legal',
    title: 'Privacy Policy',
    effective: 'Effective November 7, 2026. Operated by 3000 Studios (Jeremy Swain).',
    intro: [
      '3000 Studios VIP limits personal data collection to contact requests, site operations, security, analytics, advertising measurement, legal compliance, and optional community submissions. Google AdSense may use cookies or similar technologies to serve and measure ads when ad serving is active. Do not submit sensitive personal information in public forms.',
    ],
    sections: [
      {
        id: 'what-we-collect',
        title: 'What we collect',
        body: ['Messages sent through the contact form, and local storage for playback settings and cookie consent.'],
      },
      {
        id: 'hosting',
        title: 'Hosting',
        body: ['The site is hosted on Cloudflare.'],
      },
      {
        id: 'third-parties',
        title: 'Third parties',
        body: ['TikTok Login Kit, YouTube embeds, DistroKid HyperFollow and Spotify links.'],
      },
      {
        id: 'advertising-and-cookies',
        title: 'Advertising and cookies',
        body: [
          'With consent, Google AdSense and similar partners may use cookies, including the DoubleClick DART cookie.',
          'The site may use necessary storage for preferences, local community entries, playback settings, security, analytics, AdSense advertising, fraud prevention, and advertising review. Browser controls can clear local data at any time.',
        ],
      },
      {
        id: 'payments',
        title: 'Payments',
        body: ['Merch is paid through Stripe or PayPal payment links.'],
      },
      {
        id: 'children',
        title: 'Children',
        body: ['The site is not directed at children under 13.'],
      },
    ],
  },
  terms: {
    kicker: 'Legal',
    title: 'Terms of Service',
    effective: 'Effective 12 September 2026.',
    intro: [
      'By using this site you agree to lawful use, respectful community behavior, no scraping or abuse, and no unauthorized copying of music, videos, visuals, source code, private streams, or protected admin content.',
    ],
    sections: [
      {
        id: 'the-service',
        title: 'The service',
        body: ['Streaming on the site is free. Store royalties are handled through DistroKid.'],
      },
      {
        id: 'acceptable-use',
        title: 'Acceptable use',
        body: ['Use the site lawfully and respect the studio’s work.'],
      },
      {
        id: 'tiktok-promo',
        title: 'TikTok promo',
        body: ['How TikTok promotion on the site works.'],
      },
      {
        id: 'youtube-and-instagram',
        title: 'YouTube and Instagram',
        body: ['Official videos live on @3000Studio. Shorts and Reels are 15-second promo cuts with a HyperFollow link.'],
      },
      {
        id: 'user-content',
        title: 'User content',
        body: ['What happens to anything you submit.'],
      },
      {
        id: 'ads',
        title: 'Ads',
        body: ['Google AdSense or similar ads may appear.'],
      },
      {
        id: 'disclaimer',
        title: 'Disclaimer',
        body: [
          'The site is provided as-is.',
          'The site provides music, media, entertainment, community, and business information. It is not legal, financial, medical, or professional advice. Sponsorships and offers require separate written approval.',
        ],
      },
    ],
  },
};

const LEGACY: Record<string, { title: string; text: string }> = {
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

export function LegalPage({ type }: { type: 'privacy' | 'terms' | 'copyright' | 'cookies' | 'disclaimer' }) {
  const doc = type === 'privacy' || type === 'terms' ? DOCS[type] : undefined;

  if (!doc) {
    const page = LEGACY[type];
    return (
      <PublicLayoutV2 wallpaper="nebula">
        <section className="v2-section">
          <div className="v2-wrap" style={{ maxWidth: 840 }}>
            <Reveal>
              <span className="v2-kicker">Official Policy</span>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="v2-display">{page.title}</h1>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="v2-card" style={{ padding: 'clamp(24px, 5vw, 40px)', marginTop: 28 }}>
                <p style={{ color: 'var(--v2-text)', fontSize: 16, lineHeight: 1.7, margin: '0 0 24px' }}>
                  {page.text}
                </p>
                <div style={{ borderTop: '1px solid var(--v2-neon-line)', paddingTop: 20 }}>
                  <p style={{ color: 'var(--v2-muted)', fontSize: 14, margin: 0 }}>
                    Direct questions to:{' '}
                    <a href={`mailto:${OWNER_EMAIL}`} style={{ color: 'var(--v2-neon)', fontWeight: 700, textDecoration: 'none' }}>
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

  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap">
          <Reveal>
            <span className="v2-kicker">{doc.kicker}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">{doc.title}</h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 12, fontSize: 14 }}>
              {doc.effective}
            </p>
          </Reveal>

          <div className="commerce-legal">
            <nav className="commerce-legal-index" aria-label="Sections">
              <h2>Sections</h2>
              <ul>
                {doc.sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>{s.title}</a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="commerce-legal-body">
              {doc.intro.map((p, i) => (
                <p key={i} style={{ color: 'var(--v2-text)' }}>{p}</p>
              ))}
              {doc.sections.map((s) => (
                <section key={s.id} id={s.id}>
                  <h2>{s.title}</h2>
                  {s.body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </section>
              ))}
              <div style={{ borderTop: '1px solid var(--v2-neon-line)', paddingTop: 20, marginTop: 8 }}>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, margin: 0 }}>
                  Direct questions to:{' '}
                  <a href={`mailto:${OWNER_EMAIL}`} style={{ color: 'var(--v2-neon)', fontWeight: 700, textDecoration: 'none' }}>
                    {OWNER_EMAIL}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
