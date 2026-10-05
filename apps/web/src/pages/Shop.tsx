import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Tag,
  ArrowRight,
  Lock,
} from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import { MERCH_ITEMS, paypalBuyUrl, type MerchItem } from '../data/merch';
import { formatMoney, grantPlan, grantTrack } from '../lib/commerce';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';

/* ------------------------------------------------------------------ */
/* Shopify handoff. Cart checkout deep-links to the 3000 Studios       */
/* Shopify storefront. Until the Storefront API cart-permalink is      */
/* wired, checkout opens the Shopify store where the same catalog     */
/* is mirrored via the Printify integration.                          */
/* ------------------------------------------------------------------ */
const SHOPIFY_STOREFRONT_URL = 'https://ath0bu-tg.myshopify.com';
const SHOPIFY_STORE_NAME = '3000 Studios';

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
  const [promo, setPromo] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: MERCH_ITEMS.find((m) => m.id === id)!, qty }))
        .filter((l) => l.item && l.qty > 0),
    [cart],
  );

  const subtotal = lines.reduce((s, l) => s + l.item.priceCents * l.qty, 0);
  const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === 'WELCOME10') setPromoApplied(true);
  };

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
              Your cart is empty. Add some merch from the grid.
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
            <div className="nn-promo-row">
              <input
                className="nn-input"
                placeholder="Promo code (try WELCOME10)"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                disabled={promoApplied}
              />
              <button type="button" className="nn-btn nn-btn-ghost" onClick={applyPromo} disabled={promoApplied} style={{ padding: '11px 16px' }}>
                <Tag size={16} /> {promoApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--nn-muted)', marginBottom: 6 }}>
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {promoApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--nn-gold)', marginBottom: 6 }}>
                <span>WELCOME10 (−10%)</span>
                <span>−{formatMoney(discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, margin: '8px 0 14px' }}>
              <span>Total</span>
              <span style={{ color: 'var(--nn-gold)' }}>{formatMoney(total)}</span>
            </div>
            <button type="button" className="nn-btn nn-btn-gold" onClick={checkoutShopify} style={{ width: '100%' }}>
              Checkout at {SHOPIFY_STORE_NAME} <ArrowRight size={16} />
            </button>
            <p style={{ color: 'var(--nn-muted)', fontSize: 12, margin: '10px 0 0', textAlign: 'center' }}>
              <Lock size={12} style={{ verticalAlign: '-1px' }} /> Secure checkout opens at our
              Shopify store. Full Storefront API cart sync coming soon.
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
  const merch = MERCH_ITEMS.filter((m) => m.kind === 'merch');
  const digital = MERCH_ITEMS.filter((m) => m.kind !== 'merch');

  const addToCart = (item: MerchItem) => {
    setQty(item.id, (cart[item.id] || 0) + 1);
    setDrawerOpen(true);
  };

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker nn-kicker--gold">
            <Tag size={14} style={{ verticalAlign: '-2px' }} /> WELCOME10 — 10% off your first order
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            SUPPLY DEPOT
          </h1>
          <p>
            Official 3000 Studios merch, music ownership, and VIP passes. Merch
            checks out through our Shopify store; music and VIP stay on instant
            checkout below.
          </p>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <div className="nn-sec-head">
            <div>
              <span className="nn-kicker">Merch drops</span>
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 38px)' }}>
                Wear the Studio
              </h2>
              <p>Limited runs. When it sells out, it is gone.</p>
            </div>
          </div>
          <div className="nn-grid">
            {merch.map((item) => (
              <article key={item.id} className="nn-card">
                <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#000' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: 18 }}>
                  <h3 style={{ color: '#fff', margin: '0 0 4px', fontSize: 17 }}>{item.title}</h3>
                  <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '0 0 10px' }}>
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
          <div className="nn-sec-head">
            <div>
              <span className="nn-kicker">Music · VIP · Sponsors</span>
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 38px)' }}>
                Own the Music
              </h2>
              <p>High-res downloads, VIP passes, and sponsor inventory — instant checkout.</p>
            </div>
          </div>
          <div className="nn-grid">
            {digital.map((item) => (
              <article key={item.id} className="nn-card" style={{ padding: 20 }}>
                <span className="nn-kicker" style={{ fontSize: 10 }}>{item.kind}</span>
                <h3 style={{ color: '#fff', margin: '12px 0 6px', fontSize: 18 }}>{item.title}</h3>
                <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '0 0 12px' }}>
                  {item.blurb}
                </p>
                <p style={{ color: 'var(--nn-gold)', fontWeight: 900, fontSize: 22, margin: '0 0 14px' }}>
                  {formatMoney(item.priceCents)}
                </p>
                <a
                  className="nn-btn nn-btn-gold"
                  href={item.stripe}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    if (item.id === 'monthly') grantPlan('monthly');
                    if (item.id === 'yearly') grantPlan('yearly');
                    if (item.id === 'track') grantTrack('not-giving-up-tonight');
                  }}
                  style={{ width: '100%', marginBottom: 8 }}
                >
                  Buy now · {formatMoney(item.priceCents)}
                </a>
                <a
                  className="nn-btn nn-btn-ghost"
                  href={paypalBuyUrl(item)}
                  target="_blank"
                  rel="noreferrer"
                  style={{ width: '100%' }}
                >
                  PayPal instead
                </a>
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
