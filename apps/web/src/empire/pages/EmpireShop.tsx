import { useEffect, useState } from 'react';
import { Plus, ShoppingCart } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head, Go } from '../kit';
import { MERCH_ITEMS, paypalBuyUrl, type MerchItem } from '../../data/merch';
import { formatMoney, settleReturnPurchase, writePending, SHOP_PENDING_KEY } from '../../lib/commerce';
import { CartDrawer } from '../../pages/Shop';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_HOME_SLOT } from '../../lib/adsense';

const MERCH = MERCH_ITEMS.filter((m) => m.kind === 'merch');
const PASSES = MERCH_ITEMS.filter((m) => m.kind === 'plan');
const SPONSOR = MERCH_ITEMS.filter((m) => m.kind === 'sponsor');

/* Fail-closed digital checkout: a click only records a pending intent;
   commerce.settleReturnPurchase() grants on the signed ?paid=1 return. */
const remember = (id: string, via: 'stripe' | 'paypal') => writePending(SHOP_PENDING_KEY, { id, via, ts: Date.now() });

function DigitalCard({ item }: { item: MerchItem }) {
  return (
    <article className="ep-glass ep-card ep-lift ep-sheen">
      <span className="ep-chip">{item.kind === 'plan' ? 'VIP pass' : 'Sponsor slot'}</span>
      <h3>{item.title}</h3>
      <p>{item.blurb}</p>
      <div className="ep-price ep-metal">{formatMoney(item.priceCents)}</div>
      <div className="ep-foot">
        <a className="em-btn" href={`/api/pay?sku=${item.id}`} target="_blank" rel="noopener noreferrer" onClick={() => remember(item.id, 'stripe')}>
          Buy now
        </a>
        <a className="em-more" href={paypalBuyUrl(item)} target="_blank" rel="noopener noreferrer" onClick={() => remember(item.id, 'paypal')}>
          PayPal instead
        </a>
      </div>
    </article>
  );
}

export function EmpireShop() {
  useEffect(() => {
    void settleReturnPurchase();
  }, []);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
  const count = Object.values(cart).reduce((s, q) => s + q, 0);
  const add = (item: MerchItem) => {
    setQty(item.id, (cart[item.id] || 0) + 1);
    setOpen(true);
  };

  return (
    <EmpirePage>
      <PageHero
        eyebrow="3000 Studios shop"
        title={
          <>
            The
            <br />
            boutique
          </>
        }
        lead="Merch, VIP passes and sponsor slots. Apparel checks out through the 3000 Studios store; passes and slots use instant checkout. Code WELCOME10 takes 10% off your first merch order."
        orb="rgba(242,200,103,.38)"
      >
        <div className="ep-ctas">
          <button type="button" className="em-btn" onClick={() => setOpen(true)}>
            <ShoppingCart size={18} weight="fill" /> Cart{count > 0 ? ` (${count})` : ''}
          </button>
          <Go to="/vip">Compare VIP tiers</Go>
        </div>
      </PageHero>

      {MERCH.length > 0 && (
        <section className="ep-sec" style={{ paddingTop: 0 }}>
          <div className="em-wrap">
            <Head eyebrow="Merch drops" title="Apparel" />
            <div className="ep-grid ep-g4">
              {MERCH.map((m) => (
                <article key={m.id} className="ep-glass ep-card ep-lift ep-sheen">
                  <div className="ep-shot">
                    <img src={m.image} alt={m.title} loading="lazy" decoding="async" />
                  </div>
                  <b>{m.title}</b>
                  <p style={{ fontSize: 13 }}>{m.blurb}</p>
                  <div className="ep-foot">
                    <span className="ep-price" style={{ fontSize: 26 }}>
                      {formatMoney(m.priceCents)}
                    </span>
                    <button type="button" className="em-btn em-btn--ghost" onClick={() => add(m)} aria-label={`Add ${m.title} to cart`}>
                      <Plus size={14} weight="bold" /> Add
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {PASSES.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Instant checkout" title="Vault passes" />
            <div className="ep-grid ep-g3">
              {PASSES.map((m) => (
                <DigitalCard key={m.id} item={m} />
              ))}
            </div>
          </div>
        </section>
      )}

      {SPONSOR.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="For brands" title="Sponsor slots">
              <Go to="/sponsors">All sponsor packages</Go>
            </Head>
            <div className="ep-grid ep-g3">
              {SPONSOR.map((m) => (
                <DigitalCard key={m.id} item={m} />
              ))}
            </div>
            <div className="ep-ad">
              <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
            </div>
          </div>
        </section>
      )}

      <div className="nn-scope" style={{ minHeight: 0, paddingBottom: 0 }}>
        <CartDrawer open={open} onClose={() => setOpen(false)} cart={cart} setQty={setQty} clear={() => setCart({})} />
      </div>
    </EmpirePage>
  );
}
