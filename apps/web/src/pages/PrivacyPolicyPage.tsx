import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

/**
 * CANONICAL PRIVACY TEXT — this page and public/privacy.html carry the
 * same policy word for word. /privacy is the one canonical privacy URL;
 * if you edit the policy, edit both surfaces in the same change.
 */
const sections: { heading: string; body: string }[] = [
  {
    heading: 'Who We Are',
    body: '3000studios.vip is the official site of 3000 Studios, an independent music and media label operated by Jeremy Swain. Contact: mr.jwswain@gmail.com.',
  },
  {
    heading: 'Information We Collect',
    body: 'Contact messages. The contact form sends your message (name, email address, topic, and message text) to our studio inbox so we can reply. If the inbox cannot be reached, the form opens your own email app with the message addressed to us instead.\n\nOn-device preferences. Playback settings, your cookie-consent choice, and unlock entitlements are stored in your browser\u2019s local storage on your own device.\n\nTechnical and security data. Our hosting provider (Cloudflare) processes standard technical data such as IP address, browser type, pages visited, and approximate region to deliver the site, keep it secure, and prevent abuse.\n\nPromotional tools. Official 3000 Studios promo tools on this site may use TikTok Login Kit and Content Posting, YouTube embeds, and links to Instagram, Spotify, Apple Music, and DistroKid HyperFollow. Where you explicitly connect a TikTok account, TikTok may share a user identifier and the basic public profile fields its platform allows, and permission to upload a promo video as a draft or (after TikTok app review) a public post. We do not sell access tokens. It is used only to post 3000 Studios music clips you already own.\n\nYouTube. Videos are embedded in privacy-enhanced mode, which limits tracking until you play a video. Studio uploads use Google OAuth on our own machines, not visitor Google accounts, unless you explicitly sign in to a 3000 Studios tool.',
  },
  {
    heading: 'How We Use Information',
    body: 'We use the information we collect to operate and secure the site; stream music and video; measure traffic; show ads (with your consent, as described below); answer contact, booking, and press messages; process merch orders; and promote official releases on TikTok, YouTube, Instagram, and our own pages. We do not sell personal data.',
  },
  {
    heading: 'Cookies and Advertising',
    body: 'Necessary cookies and local storage keep the site working (preferences, consent choice, playback). With your consent, Google AdSense and similar partners may use cookies (including the DoubleClick DART cookie) to serve and measure ads. You can change your consent choice at any time in your browser. Opt out of personalized advertising in Google Ads Settings (google.com/settings/ads) or at aboutads.info/choices.',
  },
  {
    heading: 'Payments',
    body: 'Merch and other purchases check out through Stripe or PayPal payment links. Payment card details are entered on and processed by the payment provider — we never see or store your card number.',
  },
  {
    heading: 'Embedded Media and Outbound Links',
    body: 'When you use TikTok, YouTube, Instagram, Spotify, Apple Music, or DistroKid from our links, those companies process data under their own policies. TikTok Login Kit and Content Posting follow TikTok\u2019s developer terms. We only request user.info.basic and video.upload until Direct Post is approved; then we may also use video.publish for official 3000 Studios clips.',
  },
  {
    heading: 'Data Sharing',
    body: 'We share data only with the service providers needed to run the site: Cloudflare (hosting and security), Google (advertising), and Stripe / PayPal (payments). We do not sell personal information.',
  },
  {
    heading: 'Data Retention',
    body: 'Contact email is kept as long as needed to reply and for legal records. On-device preferences remain in your browser until you clear them. OAuth tokens for promo live on our studio systems, not in public pages. Server and security logs rotate on our hosting provider\u2019s standard schedule.',
  },
  {
    heading: 'Your Rights',
    body: 'Depending on where you live, you may have the right to access, correct, or delete personal information we hold about you. Email mr.jwswain@gmail.com to exercise these rights. You can disconnect TikTok access any time in your TikTok app settings. California / GDPR-style requests go to the same email.',
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
              Effective date: November 7, 2026 · Operator: 3000 Studios
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
