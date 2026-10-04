import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const sections: { heading: string; body: string }[] = [
  {
    heading: 'Information We Collect',
    body: 'Account information. If you sign in, we collect your account identifier through Firebase Authentication (for example, your email address or Google account ID) to identify your player profile and sync your progress.\n\nCloud saves. Your game progress, settings, aircraft unlocks, and player profile are stored in Cloud Firestore so your progress follows you across devices.\n\nMultiplayer data. When you play online matches, our matchmaking server processes your IP address, player callsign, and real-time gameplay telemetry (position, match events) to operate the match. Match telemetry is transient and not retained as a personal profile.\n\nAdvertising. The Game displays ads via Google Mobile Ads. Google may collect your advertising ID and ad-interaction data to serve and measure ads. You can reset or opt out of personalized ads in your Android device settings.\n\nPurchases. In-app purchases are processed by Google Play Billing. We receive purchase confirmations (what was bought, when) but never see or store your payment card details — those stay with Google.\n\nDevice integrity. We use Firebase App Check to verify that requests come from the genuine Game and protect against abuse. This involves device attestation signals.',
  },
  {
    heading: 'How We Use Information',
    body: 'We use the information we collect to: operate player accounts, cloud saves, and online multiplayer; process purchases and deliver what you bought; serve and measure advertising; prevent cheating, fraud, and abuse; and improve game stability and performance.',
  },
  {
    heading: 'Data Sharing',
    body: 'We do not sell your personal information. Data is shared only with the service providers needed to run the Game: Google (Firebase, Play Billing, Ads) and Cloudflare (multiplayer matchmaking infrastructure).',
  },
  {
    heading: 'Data Retention',
    body: 'Cloud saves are kept while your account is active. You may request deletion of your account data at any time by contacting us below, after which your cloud saves and profile are removed.',
  },
  {
    heading: 'Children',
    body: 'The Game is not directed at children under 13, and we do not knowingly collect personal information from children under 13.',
  },
  {
    heading: 'Security',
    body: 'We use industry-standard safeguards, including encrypted connections, authenticated-only database access, and per-player data isolation. No method of transmission or storage is completely secure, but we work to protect your information.',
  },
  {
    heading: 'Your Rights',
    body: 'Depending on where you live, you may have the right to access, correct, delete, or restrict use of your personal information. Contact us to exercise these rights.',
  },
  {
    heading: 'Changes',
    body: 'If we change this policy, we will update the effective date above and, where appropriate, notify you in the Game or on our site.',
  },
];

export function ThunderDomePrivacyPage() {
  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 840 }}>
          <Reveal>
            <span className="v2-kicker">Official Policy</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Thunderdome: AeroStrike{' '}
              <span className="v2-grad-text">Privacy Policy</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 12, fontSize: 14 }}>
              Effective date: October 4, 2026 · Developer: 3000 Studios
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
                This Privacy Policy explains how Thunderdome: AeroStrike
                (&ldquo;the Game,&rdquo; &ldquo;we&rdquo;) collects, uses, and
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
                  Contact 3000 Studios:{' '}
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
