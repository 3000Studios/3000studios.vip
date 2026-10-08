import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  ArrowRight,
  Lock,
  Storefront,
  Tag,
} from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import {
  SHOP_PRODUCTS,
  SHOP_STORE_URL,
  cartPermalink,
  type ShopProduct,
  type ShopCategory,
} from '../data/shopProducts';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';

const money = (n: number) => `$${n.toFixed(2)}`;

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  apparel: 'Apparel',
  music: 'Music',
  services: 'Services',
};

const CATEGORIES: Array<'all' | ShopCategory> = ['all', 'apparel', 'music', 'services'];

/* ------------------------------------------------------------------ */
/* Real Shopify cart. Checkout builds a cart permalink on               */
/* boughtitonline.com and opens it in a new tab.                       */
/* ------------------------------------------------------------------ */
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
        .map(([id, qty]) => ({ item: SHOP_PRODUCTS.find((p) => p.id === id)!, qty }))
        .filter((l) => l.item && l.qty > 0),
    [cart],
  );

  const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);

  const checkoutShopify = () => {
    window.open(cartPermalink(cart), '_blank', 'noreferrer');
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
              Your cart is empty. Add something from the grid.
            </p>
          )}
          {lines.map(({ item, qty }) => (
            <div key={item.id} className="nn-cart-item">
              {item.image ? (
                <img src={item.image} alt="" loading="lazy" />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24,
                    fontWeight: 900,
                    color: '#fff',
                    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 50%, #0d1b2a 100%)',
                    border: '1px solid rgba(255,215,0,0.25)',
                    borderRadius: 8,
                  }}
                >
                  {item.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{item.title}</strong>
                <div style={{ color: 'var(--nn-gold)', fontWeight: 800, fontSize: 14 }}>
                  {money(item.price)}
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
              <span>Subtotal</span>
              <span style={{ color: 'var(--nn-gold)' }}>{money(subtotal)}</span>
            </div>
            <button type="button" className="nn-btn nn-btn-gold" onClick={checkoutShopify} style={{ width: '100%' }}>
              Checkout at 3000 Studios <ArrowRight size={16} />
            </button>
            <p style={{ color: 'var(--nn-muted)', fontSize: 12, margin: '10px 0 0', textAlign: 'center' }}>
              <Lock size={12} style={{ verticalAlign: '-1px' }} /> Secure checkout opens at our
              Shopify store with your cart pre-loaded.
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

function ProductImage({ item }: { item: ShopProduct }) {
  if (item.image) {
    return (
      <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: '#000' }}>
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        aspectRatio: '1/1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 55%, #0d1b2a 100%)',
        borderBottom: '1px solid rgba(255,215,0,0.2)',
      }}
    >
      <span
        style={{
          fontSize: 84,
          fontWeight: 900,
          color: 'rgba(255,215,0,0.85)',
          textShadow: '0 0 32px rgba(255,215,0,0.35)',
          lineHeight: 1,
        }}
      >
        {item.title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export function ShopPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | ShopCategory>('all');

  const setQty = (id: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  const visible = useMemo(
    () => (filter === 'all' ? SHOP_PRODUCTS : SHOP_PRODUCTS.filter((p) => p.category === filter)),
    [filter],
  );

  const addToCart = (item: ShopProduct) => {
    setQty(item.id, (cart[item.id] || 0) + 1);
    setDrawerOpen(true);
  };

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        <section className="nn-hero">
          <span className="nn-kicker nn-kicker--gold">
            <Storefront size={14} style={{ verticalAlign: '-2px' }} /> Official store · powered by Shopify
          </span>
          <h1 className="nn-chrome" style={{ fontSize: 'clamp(38px, 8vw, 84px)', marginTop: 18 }}>
            SUPPLY DEPOT
          </h1>
          <p>
            Official 3000 Studios merch, instrumentals, sound packs, and studio
            services — live from our Shopify store. Add to cart here and check
            out there, or visit the full store.
          </p>
          <a
            className="nn-btn nn-btn-ghost"
            href={SHOP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: 14, display: 'inline-flex' }}
          >
            Visit full store <ArrowRight size={16} />
          </a>
        </section>

        <section className="nn-wrap" style={{ marginBottom: 56 }}>
          <div className="nn-sec-head">
            <div>
              <span className="nn-kicker">The catalog</span>
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 38px)' }}>
                Shop 3000 Studios
              </h2>
              <p>{SHOP_PRODUCTS.length} products · real stock from boughtitonline.com</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="nn-chip"
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}
                style={{
                  padding: '10px 18px',
                  fontWeight: 800,
                  ...(filter === c
                    ? { background: 'var(--nn-gold)', color: '#05060a', borderColor: 'var(--nn-gold)' }
                    : {}),
                }}
              >
                <Tag size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="nn-grid">
            {visible.map((item) => (
              <article key={item.id} className="nn-card">
                <ProductImage item={item} />
                <div style={{ padding: 18 }}>
                  <span className="nn-kicker" style={{ fontSize: 10 }}>
                    {CATEGORY_LABEL[item.category]}
                  </span>
                  <h3 style={{ color: '#fff', margin: '8px 0 4px', fontSize: 17 }}>{item.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 0 12px' }}>
                    <strong style={{ color: 'var(--nn-gold)', fontSize: 20 }}>
                      {money(item.price)}
                    </strong>
                    {item.compareAt != null && item.compareAt > item.price && (
                      <s style={{ color: 'var(--nn-muted)', fontSize: 14 }}>{money(item.compareAt)}</s>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      className="nn-btn nn-btn-cyan"
                      onClick={() => addToCart(item)}
                      style={{ padding: '10px 18px', fontSize: 13, flex: 1 }}
                    >
                      <Plus size={14} weight="bold" /> Add
                    </button>
                    <a
                      className="nn-btn nn-btn-gold"
                      href={item.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ padding: '10px 18px', fontSize: 13, flex: 1, textAlign: 'center' }}
                    >
                      Buy <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
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
