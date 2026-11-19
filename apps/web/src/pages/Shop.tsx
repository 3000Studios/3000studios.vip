import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Lock } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';
import { MERCH_ITEMS, type MerchItem } from '../data/merch';
import { formatMoney } from '../lib/commerce';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/commerce.css';

/**
 * /shop — The Boutique, mockup section 12.
 * Apparel (fulfilled through Bought It Online), Vault passes, Sponsor slot.
 * Add buttons are front-end only: items land in a local cart and checkout
 * opens the Shopify storefront with a cart note (existing pattern).
 * No promo codes, no invented discounts.
 */
const SHOPIFY_STOREFRONT_URL = 'https://boughtitonline.com';

function CartDrawer({
  open,
  onClose,
  cart,
  setQty,
  clear,
}: {
  open: boolean;
  onClose: () => void;
  cart: Record<string, number>;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}) {
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: MERCH_ITEMS.find((m) => m.id === id)!, qty }))
        .filter((l) => l.item && l.qty > 0),
    [cart],
  );

  const subtotal = lines.reduce((s, l) => s + l.item.priceCents * l.qty, 0);

  const checkoutShopify = () => {
    const names = lines.map((l) => `${l.qty}x ${l.item.title}`).join(', ');
    const url = new URL(SHOPIFY_STOREFRONT_URL);
    url.searchParams.set('note', `3000studios.vip cart: ${names}`);
    window.open(url.toString(), '_blank', 'noreferrer');
  };

  return (
    <>
      <div
        className={`nn-cart-overlay${open ? ' is-open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`nn-cart-drawer${open ? ' is-open' : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!open}
      >
        <div className="nn-cart-head">
          <strong style={{ fontSize: 18 }}>
            <ShoppingCart size={20} weight="fill" style={{ verticalAlign: '-3px' }} /> Your cart
          </strong>
          <button type="button" className="nn-btn nn-btn-ghost" onClick={onClose} aria-label="Close cart" style={{ padding: '8px 12px' }}>
            <X size={18} />
          </button>
        </div>
        <div className="nn-cart-items">
          {lines.length === 0 && (
            <p style={{ color: 'var(--nn-muted)' }}>
              Your cart is empty. Add something from the boutique.
            </p>
          )}
          {lines.map(({ item, qty }) => (
            <div key={item.id} className="nn-cart-item">
              <img src={item.image} alt="" loading="lazy" />
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{item.title}</strong>
                <div style={{ color: 'var(--nn-gold)', fontWeight: 800, fontSize: 14 }}>
                  {formatMoney(item.priceCents)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="nn-chip"
                  onClick={() => setQty(item.id, qty - 1)}
                  aria-label="Decrease quantity"
                >
                  <Minus size={12} />
                </button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                <button
                  type="button"
                  className="nn-chip"
                  onClick={() => setQty(item.id, qty + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div className="nn-cart-foot">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, margin: '8px 0 14px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--nn-gold)' }}>{formatMoney(subtotal)}</span>
            </div>
            <button type="button" className="nn-btn nn-btn-gold" onClick={checkoutShopify} style={{ width: '100%' }}>
              Checkout at Bought It Online <ArrowRight size={16} />
            </button>
            <p style={{ color: 'var(--nn-muted)', fontSize: 12, margin: '10px 0 0', textAlign: 'center' }}>
              <Lock size={12} style={{ verticalAlign: '-1px' }} /> Secure checkout opens at our
              Shopify store.
            </p>
            <button
              type="button"
              className="nn-btn nn-btn-ghost"
              onClick={clear}
              style={{ width: '100%', marginTop: 10 }}
            >
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export function ShopPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const apparel = MERCH_ITEMS.filter((m) => m.kind === 'merch');
  const passes = MERCH_ITEMS.filter((m) => m.kind === 'plan');
  const sponsors = MERCH_ITEMS.filter((m) => m.kind === 'sponsor');

  const addToCart = (item: MerchItem) => {
    setQty(item.id, (cart[item.id] || 0) + 1);
    setDrawerOpen(true);
  };

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker">3000 Studios Shop</span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            THE BOUTIQUE
          </h1>
          <p>
            Merch, VIP passes and sponsor slots, with apparel fulfilled through Bought It Online.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <Reveal>
            <span className="commerce-eyebrow">Apparel</span>
            <h2 className="commerce-section-title" style={{ marginTop: 12 }}>
              Wear the studio
            </h2>
          </Reveal>
          <div className="commerce-grid commerce-grid--4">
            {apparel.map((item) => (
              <article key={item.id} className="commerce-card commerce-shop-card">
                <div className="commerce-shop-img">
                  <img src={item.image} alt={item.title} loading="lazy" />
                </div>
                <div className="commerce-shop-card-body">
                  <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 17 }}>{item.title}</h3>
                  <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '0 0 10px', flex: 1 }}>
                    {item.blurb}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ color: 'var(--nn-gold)', fontSize: 20 }}>
                      {formatMoney(item.priceCents)}
                    </strong>
                    <button
                      type="button"
                      className="nn-btn nn-btn-cyan"
                      onClick={() => addToCart(item)}
                      style={{ padding: '10px 18px', fontSize: 13 }}
                    >
                      <Plus size={14} weight="bold" /> Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <Reveal>
            <span className="commerce-eyebrow">Vault passes</span>
            <h2 className="commerce-section-title" style={{ marginTop: 12 }}>
              Join the vault
            </h2>
          </Reveal>
          <div className="commerce-grid">
            {passes.map((item) => (
              <article key={item.id} className="commerce-card">
                <span className="commerce-card-tag">{item.kind === 'plan' ? 'VIP' : item.kind}</span>
                <h3 className="commerce-card-title">{item.title}</h3>
                <p className="commerce-card-body">{item.blurb}</p>
                <div className="commerce-price">{formatMoney(item.priceCents)}</div>
                <button
                  type="button"
                  className="nn-btn nn-btn-gold"
                  onClick={() => addToCart(item)}
                  style={{ width: '100%' }}
                >
                  <Plus size={14} weight="bold" /> Add
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <Reveal>
            <span className="commerce-eyebrow">Sponsor slots</span>
            <h2 className="commerce-section-title" style={{ marginTop: 12 }}>
              Put your brand on the site
            </h2>
          </Reveal>
          <div className="commerce-grid">
            {sponsors.map((item) => (
              <article key={item.id} className="commerce-card">
                <span className="commerce-card-tag">Sponsor</span>
                <h3 className="commerce-card-title">{item.title}</h3>
                <p className="commerce-card-body">{item.blurb}</p>
                <div className="commerce-price">{formatMoney(item.priceCents)}</div>
                <button
                  type="button"
                  className="nn-btn nn-btn-gold"
                  onClick={() => addToCart(item)}
                  style={{ width: '100%' }}
                >
                  <Plus size={14} weight="bold" /> Add
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="nn-wrap">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved</p>
        </footer>
      </div>

      <button
        type="button"
        className="nn-cart-fab"
        onClick={() => setDrawerOpen(true)}
        aria-label={`Open cart, ${cartCount} items`}
      >
        <ShoppingCart size={26} weight="fill" />
        {cartCount > 0 && <span className="nn-cart-count">{cartCount}</span>}
      </button>
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        setQty={setQty}
        clear={() => setCart({})}
      />
    </PublicLayoutV2>
  );
}
