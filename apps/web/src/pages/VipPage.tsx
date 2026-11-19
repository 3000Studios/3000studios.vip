import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { MERCH_ITEMS } from '../data/merch';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/commerce.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

type VipTier = {
  id: string;
  tag: string;
  name: string;
  price: string;
  body: string;
  cta: string;
  featured?: boolean;
};

/**
 * /vip — Behind the velvet rope, mockup section 11. Four tiers exactly.
 * Monthly / yearly buy through the existing Stripe payment links in
 * data/merch.ts; the sync tier is a talk-to-the-studio mailto. Front-end
 * wiring only — coordinator to confirm the Stripe links are the live ones.
 */
const TIERS: VipTier[] = [
  {
    id: 'free',
    tag: 'Previews + Full Songs',
    name: 'Free Previews',
    price: 'Free',
    body: 'Every track previews free for a full minute. Full songs one tap away on Apple Music, Spotify and Amazon Music.',
    cta: 'Open the vault',
  },
  {
    id: 'monthly',
    tag: 'Monthly',
    name: 'Vault Pass',
    price: '$3.99 / mo',
    body: 'Full vault access, unreleased stems, exclusive drops and a priority live-stream badge for 31 days.',
    cta: 'Get Vault Pass',
  },
  {
    id: 'yearly',
    tag: 'Best Value',
    name: 'Vault All-Access',
    price: '$19.99 / yr',
    body: 'A full year with 2 months free. Every stem, the high-res catalog archive and the Discord role.',
    cta: 'Go All-Access',
    featured: true,
  },
  {
    id: 'sync',
    tag: 'Sync',
    name: 'Film & Commercial',
    price: '$99 / mo',
    body: 'Licensing for film, ads and commercial use. Talk to the studio for terms.',
    cta: 'Talk to the studio',
  },
];

export function VipPage() {
  const monthly = MERCH_ITEMS.find((m) => m.id === 'monthly');
  const yearly = MERCH_ITEMS.find((m) => m.id === 'yearly');

  return (
    <PublicLayoutV2 wallpaper="aurora">
      <section className="v2-section commerce-hero">
        <div className="v2-wrap">
          <Reveal>
            <span className="commerce-kicker">3000 Studios VIP</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="commerce-title">
              Behind the <span className="commerce-gold">velvet rope</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="commerce-lede">
              Early drops, vault tracks and member perks. Start free, go deeper when you want.
            </p>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="commerce-grid commerce-grid--4" stagger={0.08}>
            {TIERS.map((tier) => (
              <RevealItem key={tier.id}>
                <article
                  className={`commerce-card${tier.featured ? ' commerce-card--featured' : ''}`}
                  style={{ height: '100%' }}
                >
                  <span className="commerce-card-tag">{tier.tag}</span>
                  <h2 className="commerce-card-title">{tier.name}</h2>
                  <p className="commerce-card-body">{tier.body}</p>
                  <div className="commerce-price">{tier.price}</div>
                  {tier.id === 'free' ? (
                    <Link className="nn-btn nn-btn-ghost" to="/music" style={{ width: '100%', textAlign: 'center' }}>
                      {tier.cta} →
                    </Link>
                  ) : tier.id === 'sync' ? (
                    <a
                      className="nn-btn nn-btn-ghost"
                      href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('Sync License Request — 3000 Studios')}`}
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      {tier.cta} →
                    </a>
                  ) : (
                    <a
                      className="nn-btn nn-btn-gold"
                      href={(tier.id === 'monthly' ? monthly?.stripe : yearly?.stripe) ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      {tier.cta} →
                    </a>
                  )}
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
