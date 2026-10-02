import { Check, EnvelopeSimple } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { MERCH_ITEMS } from '../data/merch';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const sponsorPackages = [
  {
    title: 'Featured Music Video Sponsor',
    tag: 'Digital Placement',
    price: '$99 / month',
    stripeId: 'sponsor',
    features: [
      'Logo & brand placement on 3000studios.vip for 30 days',
      'Pinned sponsor shoutout in video descriptions & live streams',
      'Direct link to your site or product',
      'Instant Stripe activation',
    ],
  },
  {
    title: 'Live Stream Presenting Partner',
    tag: 'Broadcast Tier',
    price: '$250 / drop',
    features: [
      'Top banner & overlay on all live stream broadcasts',
      'Custom visual ticker & verbal host acknowledgments',
      'Dedicated sponsor segment during live drop events',
      'Social media cross-promotion on TikTok/IG',
    ],
  },
  {
    title: 'Title Sponsor & Custom Sync',
    tag: 'Enterprise VIP',
    price: 'Custom Deal',
    features: [
      'Exclusive brand co-release across 47+ platform releases',
      'Custom song composition & soundtrack licensing',
      'Worldwide sync rights for ads, film, and gaming',
      'Direct producer access & multi-channel distribution',
    ],
  },
];

export function SponsorsPage() {
  const sponsorItem = MERCH_ITEMS.find((item) => item.id === 'sponsor');

  return (
    <PublicLayoutV2 wallpaper="beams">
      <section className="v2-section">
        <div className="v2-wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <span className="v2-kicker">Brand Partnerships</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Sponsor <span className="v2-grad-text">3000 Studios</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ margin: '16px auto 24px', maxWidth: 640 }}>
              Put your brand in front of engaged music fans, independent creators, and live
              stream audiences worldwide.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <a
              className="v2-btn"
              href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios Sponsorship Inquiry')}`}
            >
              <EnvelopeSimple size={18} weight="fill" />
              Inquire via Email
            </a>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="v2-grid-3">
            {sponsorPackages.map((pkg) => (
              <RevealItem key={pkg.title}>
                <article
                  className="v2-card v2-card--lift"
                  style={{ padding: 'clamp(24px, 4vw, 32px)', display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <span className="v2-chip">{pkg.tag}</span>
                  <h2 className="v2-display" style={{ fontSize: 24, margin: '14px 0 4px' }}>
                    {pkg.title}
                  </h2>
                  <div
                    className="v2-display"
                    style={{ fontSize: 30, color: 'var(--v2-neon)', margin: '12px 0 20px' }}
                  >
                    {pkg.price}
                  </div>
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '0 0 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    {pkg.features.map((feat) => (
                      <li
                        key={feat}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          color: 'var(--v2-muted)',
                          fontSize: 14,
                        }}
                      >
                        <Check size={16} weight="bold" style={{ color: 'var(--v2-neon)', flexShrink: 0, marginTop: 2 }} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                  {pkg.stripeId && sponsorItem ? (
                    <a className="v2-btn" href={sponsorItem.stripe} style={{ width: '100%' }}>
                      Sponsor with Stripe ($99)
                    </a>
                  ) : (
                    <a
                      className="v2-btn v2-btn--ghost"
                      href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Sponsorship: ${pkg.title}`)}`}
                      style={{ width: '100%' }}
                    >
                      Contact Producer
                    </a>
                  )}
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
