import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Go } from '../kit';
import { MERCH_ITEMS } from '../../data/merch';
import { formatMoney, settleReturnPurchase, writePending, SHOP_PENDING_KEY } from '../../lib/commerce';

const price = (id: string) => {
  const item = MERCH_ITEMS.find((m) => m.id === id);
  return item ? formatMoney(item.priceCents) : '';
};

type Tier = {
  tag: string;
  name: string;
  amount: string;
  per?: string;
  body: string;
  cta: string;
  sku?: string;
  to?: string;
  best?: boolean;
};

const TIERS: Tier[] = [
  {
    tag: 'Free previews',
    name: 'Previews + full songs',
    amount: 'Free',
    body: 'Every track previews free for a full minute. Full songs are one tap away on Spotify, Apple Music and Amazon.',
    cta: 'Open the vault',
    to: '/music',
  },
  {
    tag: 'Monthly',
    name: 'Vault Pass',
    amount: price('monthly'),
    per: '/ mo',
    body: 'Full vault access, stem downloads, exclusive drops and a priority live-stream badge for 31 days.',
    cta: 'Get Vault Pass',
    sku: 'monthly',
  },
  {
    tag: 'Best value',
    name: 'Vault All-Access',
    amount: price('yearly'),
    per: '/ yr',
    body: 'A full year of the vault for less than six months of the monthly pass. Every stem and every drop.',
    cta: 'Go All-Access',
    sku: 'yearly',
    best: true,
  },
  {
    tag: 'Sync',
    name: 'Film & commercial',
    amount: 'Custom',
    body: 'Licensing for film, ads and commercial use. Talk to the studio for terms.',
    cta: 'Talk to the studio',
    to: '/contact',
  },
];

function PayLink({ sku, best, children }: { sku: string; best?: boolean; children: React.ReactNode }) {
  return (
    <a
      className={best ? 'em-btn' : 'em-btn em-btn--ghost'}
      href={`/api/pay?sku=${sku}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => writePending(SHOP_PENDING_KEY, { id: sku, via: 'stripe', ts: Date.now() })}
    >
      {children} <ArrowRight size={15} weight="bold" />
    </a>
  );
}

export function VipRope() {
  useEffect(() => {
    void settleReturnPurchase();
  }, []);
  return (
    <EmpirePage>
      <PageHero
        eyebrow="3000 Studios VIP"
        title={
          <>
            Behind the
            <br />
            velvet rope
          </>
        }
        lead="Early drops, vault tracks and member perks. Start free, go deeper when you want."
        orb="rgba(242,200,103,.42)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid ep-g4">
          {TIERS.map((t) => (
            <article key={t.name} className={`ep-glass ep-card ep-lift${t.best ? ' ep-gilt ep-best' : ''}`}>
              <span className={t.best ? 'ep-chip is-live' : 'ep-chip'}>{t.tag}</span>
              <h3>{t.name}</h3>
              <div className={t.best ? 'ep-price ep-metal' : 'ep-price'}>
                {t.amount}
                {t.per ? <small> {t.per}</small> : null}
              </div>
              <p>{t.body}</p>
              <div className="ep-foot">
                {t.sku ? (
                  <PayLink sku={t.sku} best={t.best}>
                    {t.cta}
                  </PayLink>
                ) : (
                  <Link className="em-btn em-btn--ghost" to={t.to ?? '/'}>
                    {t.cta} <ArrowRight size={15} weight="bold" />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="ep-sec">
        <div className="em-wrap ep-grid ep-g2">
          <div className="ep-glass ep-card art-vip">
            <span className="em-kicker">For brands</span>
            <h3>Brand placement</h3>
            <p>Put your brand on 3000studios.vip, the music video pages and the live stage.</p>
            <div className="ep-foot">
              <Go to="/sponsors">Sponsor packages</Go>
            </div>
          </div>
          <div className="ep-glass ep-card art-music">
            <span className="em-kicker">Members</span>
            <h3>Already a member?</h3>
            <p>Your pass unlocks on this device right after checkout. Questions about a purchase go to the studio.</p>
            <div className="ep-foot">
              <Go to="/contact">Contact support</Go>
              <Go to="/shop">Shop</Go>
            </div>
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
