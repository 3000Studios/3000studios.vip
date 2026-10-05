import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const sections: { heading: string; body: string }[] = [
  {
    heading: 'Who We Are',
    body: '3000studios.vip is the official site of 3000 Studios, an independent music and media label operated by Jeremy Swain. Contact: mr.jwswain@gmail.com.',
  },
  {
    heading: 'Information We Collect',
    body: 'Contact messages. Our contact form opens your own email app addressed to us — the site itself does not store or transmit your message through a server. What you send by email (name, email address, message) is used only to reply.\n\nOn-device preferences. Playback settings, your cookie-consent choice, and unlock entitlements are stored in your browser\u2019s local storage on your own device. They are not sent to our servers.\n\nTechnical and security data. Our hosting provider (Cloudflare) processes standard technical data such as IP address, browser type, and pages visited to deliver the site, keep it secure, and prevent abuse.\n\nPromotional tools. Official 3000 Studios promo tools on this site may use TikTok Login Kit and Content Posting, YouTube embeds, and links to Instagram, Spotify, Apple Music, and DistroKid HyperFollow. Where you explicitly connect a TikTok account, TikTok may share a user identifier and the basic public profile fields its platform allows, used only to post official 3000 Studios clips you own. We do not sell access tokens.',
  },
  {
    heading: 'How We Use Information',
    body: 'We use the information we collect to: operate and secure the site; stream music and video; answer contact and booking messages; process merch orders; measure traffic; and promote official releases. We do not sell your personal information.',
  },
  {
    heading: 'Cookies and Advertising',
    body: 'Necessary storage keeps the site working (preferences, consent choice, playback). With your consent, Google AdSense may use cookies or similar technologies (including the DoubleClick cookie) to serve and measure ads. You can change your consent choice at any time in your browser, and manage ad personalization in your Google ad settings.',
  },
  {
    heading: 'Payments',
    body: 'Merch purchases check out through Stripe payment links. Payment card details are entered on and processed by Stripe — we never see or store your card number.',
  },
  {
    heading: 'Embedded Media and Outbound Links',
    body: 'YouTube videos are embedded in privacy-enhanced mode, which limits tracking until you play a video. When you follow links to YouTube, Spotify, Apple Music, TikTok, Instagram, Facebook, or DistroKid, those companies handle your data under their own privacy policies.',
  },
  {
    heading: 'Data Sharing',
    body: 'We share data only with the service providers needed to run the site: Cloudflare (hosting and security), Google (advertising), and Stripe (payments). We do not sell personal information.',
  },
  {
    heading: 'Data Retention',
    body: 'Contact email is kept as long as needed to reply and for legal records. On-device preferences remain in your browser until you clear them. Server and security logs rotate on our hosting provider\u2019s standard schedule.',
  },
  {
    heading: 'Your Rights',
    body: 'Depending on where you live, you may have the right to access, correct, or delete personal information we hold about you. Email mr.jwswain@gmail.com to exercise these rights. You can disconnect TikTok access any time in your TikTok app settings.',
  },
  {
    heading: 'Children',
    body: 'This site is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
  },
  {
    heading: 'Changes to This Policy',
    body: 'If we change this policy, we will update the effective date below. Continued use of the site after changes means you accept the updated policy.',
  },
];

export function PrivacyPolicyPage() {
  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 840 }}>
          <Reveal>
            <span className="v2-kicker">Official Policy</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Privacy <span className="v2-grad-text">Policy</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 12, fontSize: 14 }}>
              Effective date: October 5, 2026 · Operator: 3000 Studios
              (Jeremy Swain)
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div
              className="v2-card"
              style={{ padding: 'clamp(24px, 5vw, 40px)', marginTop: 28 }}
            >
              <p
                style={{
                  color: 'var(--v2-text)',
                  fontSize: 16,
                  lineHeight: 1.7,
                  margin: '0 0 24px',
                }}
              >
                This Privacy Policy explains how 3000studios.vip
                (&ldquo;the Site,&rdquo; &ldquo;we&rdquo;) collects, uses, and
                protects your information.
              </p>
              {sections.map((s) => (
                <div key={s.heading} style={{ marginBottom: 24 }}>
                  <h2
                    style={{
                      color: 'var(--v2-neon)',
                      fontSize: 18,
                      margin: '0 0 10px',
                    }}
                  >
                    {s.heading}
                  </h2>
                  {s.body.split('\n\n').map((p, i) => (
                    <p
                      key={i}
                      style={{
                        color: 'var(--v2-text)',
                        fontSize: 15,
                        lineHeight: 1.7,
                        margin: '0 0 12px',
                      }}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              ))}
              <div
                style={{
                  borderTop: '1px solid var(--v2-neon-line)',
                  paddingTop: 20,
                }}
              >
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, margin: 0 }}>
                  Questions about this policy? Contact 3000 Studios:{' '}
                  <a
                    href={`mailto:${OWNER_EMAIL}`}
                    style={{
                      color: 'var(--v2-neon)',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
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
