import { PublicLayout } from './Home';
import { MERCH_ITEMS } from '../data/merch';
import '../styles/vip-luxury.css';

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
    <PublicLayout variant="chrome" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 1140, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '36px 24px', textAlign: 'center', marginBottom: 36 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            Brand Partnerships
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 52px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Sponsor 3000 Studios
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 640, margin: '0 auto 20px', fontSize: 16 }}>
            Put your brand in front of engaged music fans, independent creators, and live stream audiences worldwide.
          </p>
          <a
            className="vip-btn-gold"
            href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios Sponsorship Inquiry')}`}
          >
            Inquire via Email ✉
          </a>
        </section>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
          }}
        >
          {sponsorPackages.map((pkg) => (
            <article key={pkg.title} className="vip-glass-card" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {pkg.tag}
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '8px 0 4px' }}>{pkg.title}</h2>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', margin: '12px 0 20px' }}>
                {pkg.price}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {pkg.features.map((feat) => (
                  <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--vip-text-muted)', fontSize: 14 }}>
                    <span style={{ color: '#ffd700' }}>✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              {pkg.stripeId && sponsorItem ? (
                <a className="vip-btn-gold" href={sponsorItem.stripe} style={{ width: '100%' }}>
                  Sponsor with Stripe ($99)
                </a>
              ) : (
                <a
                  className="vip-btn-obsidian"
                  href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Sponsorship: ${pkg.title}`)}`}
                  style={{ width: '100%' }}
                >
                  Contact Producer
                </a>
              )}
            </article>
          ))}
        </section>
      </main>
    </PublicLayout>
  );
}
