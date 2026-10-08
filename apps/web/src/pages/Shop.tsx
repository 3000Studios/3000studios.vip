import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, X, ArrowRight, Lock, Storefront, Tag, MagnifyingGlass, CaretLeft, CaretRight, Truck, ArrowCounterClockwise } from '@phosphor-icons/react';
import { PublicLayoutV2, AdSenseUnit } from '../v2/PublicLayoutV2';
import {
  SHOP_PRODUCTS,
  SHOP_STORE_URL,
  cartPermalink,
  productByVariant,
  type ShopProduct,
  type ShopCategory,
} from '../data/shopProducts';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';

const money = (n: number) => `$${n.toFixed(2)}`;
const PAGE_SIZE = 24;

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  apparel: 'Apparel',
  music: 'Music & Beats',
  services: 'Studio Services',
};

const CATEGORY_META: Record<
  ShopCategory,
  { label: string; headline: string; blurb: string; video: string }
> = {
  apparel: {
    label: 'Apparel',
    headline: 'WEAR THE STUDIO',
    blurb:
      'Official 3000 Studios gear — tees and hoodies from the studio store. ' +
      'Real garments, real stock, shipped to your door. Rep the squadron.',
    video: '/media/shop/hero-apparel.mp4',
  },
  music: {
    label: 'Music & Beats',
    headline: 'OWN THE SOUND',
    blurb:
      'Instrumentals, drum loops, 808s, and construction kits straight from the ' +
      '3000 Studios vault. Digital delivery — download links arrive after checkout.',
    video: '/media/shop/hero-music.mp4',
  },
  services: {
    label: 'Studio Services',
    headline: 'STUDIO SERVICES',
    blurb:
      'Custom beats built around your vision, exclusive rights that take a ' +
      'record off the market forever, and gift cards for the obsessed.',
    video: '/media/shop/hero-services.mp4',
  },
};

type CategoryFilter = 'all' | ShopCategory;
const CATEGORIES: CategoryFilter[] = ['all', 'apparel', 'music', 'services'];
type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name';

/* ------------------------------------------------------------------ */
/* Cart: keyed by Shopify variant id so variant picks survive.         */
/* Checkout builds a real cart permalink on boughtitonline.com.        */
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
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
}) {
  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([variantId, qty]) => {
          const product = productByVariant(variantId);
          const variant = product?.variants.find((v) => v.id === variantId);
          return product && variant && qty > 0 ? { product, variant, qty } : null;
        })
        .filter(Boolean) as { product: ShopProduct; variant: { id: string; title: string; price: number }; qty: number }[],
    [cart],
  );

  const subtotal = lines.reduce((s, l) => s + l.variant.price * l.qty, 0);

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
          {lines.map(({ product, variant, qty }) => (
            <div key={variant.id} className="nn-cart-item">
              {product.image ? (
                <img src={product.image} alt="" loading="lazy" />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    width: 56, height: 56, flexShrink: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 24,
                    fontWeight: 900, color: '#fff',
                    background: 'linear-gradient(135deg, #0a0f1e 0%, #1a2340 50%, #0d1b2a 100%)',
                    border: '1px solid rgba(255,215,0,0.25)', borderRadius: 8,
                  }}
                >
                  {product.title.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14 }}>{product.title}</strong>
                {product.variants.length > 1 && (
                  <div style={{ color: 'var(--nn-muted)', fontSize: 12 }}>{variant.title}</div>
                )}
                <div style={{ color: 'var(--nn-gold)', fontWeight: 800, fontSize: 14 }}>
                  {money(variant.price)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="nn-chip" onClick={() => setQty(variant.id, qty - 1)} aria-label="Decrease quantity">
                  <Minus size={12} />
                </button>
                <span style={{ minWidth: 20, textAlign: 'center', fontWeight: 800 }}>{qty}</span>
                <button type="button" className="nn-chip" onClick={() => setQty(variant.id, qty + 1)} aria-label="Increase quantity">
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
            <button
              type="button"
              className="nn-btn nn-btn-gold"
              onClick={() => window.open(cartPermalink(cart), '_blank', 'noreferrer')}
              style={{ width: '100%' }}
            >
              Checkout at 3000 Studios <ArrowRight size={16} />
            </button>
            <p style={{ color: 'var(--nn-muted)', fontSize: 12, margin: '10px 0 0', textAlign: 'center' }}>
              <Lock size={12} style={{ verticalAlign: '-1px' }} /> Secure checkout opens at our
              Shopify store with your cart pre-loaded.
            </p>
            <button type="button" className="nn-btn nn-btn-ghost" onClick={clear} style={{ width: '100%', marginTop: 10 }}>
              Clear cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

function ProductImage({ item, large }: { item: ShopProduct; large?: boolean }) {
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
        borderBottom: large ? undefined : '1px solid rgba(255,215,0,0.2)',
      }}
    >
      <span
        style={{
          fontSize: large ? 120 : 84,
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

/* ------------------------------------------------------------------ */
/* Quick view: bigger image, full description, variant picker, qty,    */
/* add-to-cart + buy-now. Breadcrumb: Shop / Category / Product.       */
/* ------------------------------------------------------------------ */
function QuickView({
  item,
  onClose,
  onAdd,
}: {
  item: ShopProduct;
  onClose: () => void;
  onAdd: (variantId: string, qty: number) => void;
}) {
  const [variantId, setVariantId] = useState(item.variantId);
  const [qty, setQtyLocal] = useState(1);
  const variant = item.variants.find((v) => v.id === variantId) ?? item.variants[0];

  useEffect(() => {
    setVariantId(item.variantId);
    setQtyLocal(1);
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 90, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 16,
        background: 'rgba(3,5,10,0.82)', backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="nn-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 880, width: '100%', maxHeight: '92vh', overflowY: 'auto', padding: 0 }}
      >
        <nav aria-label="Breadcrumb" style={{ padding: '18px 22px 0', fontSize: 13, color: 'var(--nn-muted)' }}>
          <Link to="/shop" onClick={onClose} style={{ color: 'var(--nn-muted)' }}>Shop</Link>
          <span aria-hidden="true"> / </span>
          <span>{CATEGORY_LABEL[item.category]}</span>
          <span aria-hidden="true"> / </span>
          <span style={{ color: '#fff' }}>{item.title}</span>
        </nav>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 0 }}>
          <ProductImage item={item} large />
          <div style={{ padding: 26 }}>
            <span className="nn-kicker" style={{ fontSize: 10 }}>{CATEGORY_LABEL[item.category]}</span>
            <h2 style={{ color: '#fff', margin: '10px 0 6px', fontSize: 24 }}>{item.title}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
              <strong style={{ color: 'var(--nn-gold)', fontSize: 26 }}>{money(variant.price)}</strong>
              {item.compareAt != null && item.compareAt > variant.price && (
                <s style={{ color: 'var(--nn-muted)', fontSize: 16 }}>{money(item.compareAt)}</s>
              )}
            </div>
            <p style={{ color: 'var(--nn-text)', fontSize: 14, lineHeight: 1.65, margin: '0 0 16px' }}>
              {item.descriptionFull}
            </p>
            {item.variants.length > 1 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--nn-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Options
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {item.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className="nn-chip"
                      aria-pressed={v.id === variantId}
                      onClick={() => setVariantId(v.id)}
                      style={{
                        padding: '10px 16px', fontWeight: 800,
                        ...(v.id === variantId
                          ? { background: 'var(--nn-gold)', color: '#05060a', borderColor: 'var(--nn-gold)' }
                          : {}),
                      }}
                    >
                      {v.title} · {money(v.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button type="button" className="nn-chip" onClick={() => setQtyLocal(Math.max(1, qty - 1))} aria-label="Decrease quantity">
                  <Minus size={12} />
                </button>
                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{qty}</span>
                <button type="button" className="nn-chip" onClick={() => setQtyLocal(qty + 1)} aria-label="Increase quantity">
                  <Plus size={12} />
                </button>
              </div>
              {item.sku && (
                <span style={{ fontSize: 12, color: 'var(--nn-muted)' }}>SKU {item.sku}</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="nn-btn nn-btn-cyan"
                onClick={() => { onAdd(variant.id, qty); onClose(); }}
                style={{ flex: 1, minWidth: 150 }}
              >
                <Plus size={14} weight="bold" /> Add to cart
              </button>
              <button
                type="button"
                className="nn-btn nn-btn-gold"
                onClick={() => window.open(cartPermalink({ [variant.id]: qty }), '_blank', 'noreferrer')}
                style={{ flex: 1, minWidth: 150 }}
              >
                Buy now <ArrowRight size={14} />
              </button>
            </div>
            <a
              href={item.productUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-block', marginTop: 14, fontSize: 13, color: 'var(--nn-muted)' }}
            >
              View on boughtitonline.com <ArrowRight size={12} />
            </a>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--nn-muted)' }}>
              <span><Truck size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} /> <Link to="/shipping" style={{ color: 'var(--nn-muted)' }}>Shipping info</Link></span>
              <span><ArrowCounterClockwise size={14} style={{ verticalAlign: '-2px', marginRight: 4 }} /> <Link to="/returns" style={{ color: 'var(--nn-muted)' }}>Returns</Link></span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="nn-btn nn-btn-ghost"
          style={{ position: 'absolute', top: 12, right: 12, padding: '8px 12px' }}
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function CategoryHero({ category }: { category: ShopCategory }) {
  const meta = CATEGORY_META[category];
  const featured = useMemo(
    () => SHOP_PRODUCTS.filter((p) => p.category === category).slice(0, 3),
    [category],
  );
  return (
    <section aria-label={`${meta.label} collection`} style={{ marginBottom: 40 }}>
      <div
        style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden',
          border: '1px solid rgba(255,215,0,0.18)', background: '#05070d',
        }}
      >
        <video
          src={meta.video}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          style={{ width: '100%', aspectRatio: '16/9', maxHeight: 420, objectFit: 'cover', display: 'block' }}
        />
        <div
          style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end', padding: 'clamp(20px, 4vw, 40px)',
            background: 'linear-gradient(to top, rgba(3,5,10,0.88) 0%, rgba(3,5,10,0.25) 55%, transparent 100%)',
          }}
        >
          <span className="nn-kicker nn-kicker--gold">{meta.label}</span>
          <h2 className="nn-chrome" style={{ fontSize: 'clamp(30px, 6vw, 64px)', margin: '8px 0' }}>
            {meta.headline}
          </h2>
          <p style={{ color: 'var(--nn-text)', maxWidth: 640, fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            {meta.blurb}
          </p>
          <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '10px 0 0' }}>
            Featured: {featured.map((f) => f.title).join(' · ')}
          </p>
        </div>
      </div>
    </section>
  );
}

export function ShopPage() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('featured');
  const [page, setPage] = useState(1);
  const [quickView, setQuickView] = useState<ShopProduct | null>(null);

  const setQty = (variantId: string, qty: number) =>
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[variantId];
      else next[variantId] = qty;
      return next;
    });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);

  useEffect(() => {
    setPage(1);
  }, [category, query, sort]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = SHOP_PRODUCTS.filter(
      (p) =>
        (category === 'all' || p.category === category) &&
        (q === '' || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)),
    );
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    return list;
  }, [category, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const addToCart = (variantId: string, qty = 1) => {
    setQty(variantId, (cart[variantId] || 0) + qty);
    setDrawerOpen(true);
  };

  return (
    <PublicLayoutV2>
      <div className="nn-scope">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--nn-muted)', margin: '18px 0 0' }}>
          <Link to="/" style={{ color: 'var(--nn-muted)' }}>Home</Link>
          <span aria-hidden="true"> / </span>
          <span style={{ color: '#fff' }}>Shop</span>
          {category !== 'all' && (
            <>
              <span aria-hidden="true"> / </span>
              <span style={{ color: '#fff' }}>{CATEGORY_LABEL[category]}</span>
            </>
          )}
        </nav>

        <section className="nn-hero" style={{ paddingBottom: 20 }}>
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

        {/* Sticky category + search + sort bar */}
        <div
          style={{
            position: 'sticky', top: 0, zIndex: 40,
            background: 'rgba(5,7,13,0.92)', backdropFilter: 'blur(10px)',
            padding: '12px 0', borderBottom: '1px solid rgba(255,215,0,0.12)',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className="nn-chip"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                style={{
                  padding: '10px 18px', fontWeight: 800,
                  ...(category === c
                    ? { background: 'var(--nn-gold)', color: '#05060a', borderColor: 'var(--nn-gold)' }
                    : {}),
                }}
              >
                <Tag size={14} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                {c === 'all' ? 'All' : CATEGORY_LABEL[c]}
              </button>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '8px 12px' }}>
              <MagnifyingGlass size={16} style={{ color: 'var(--nn-muted)' }} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the store…"
                aria-label="Search products"
                style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, width: 170 }}
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search" style={{ background: 'none', border: 'none', color: 'var(--nn-muted)', cursor: 'pointer' }}>
                  <X size={14} />
                </button>
              )}
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort products"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14, fontWeight: 700 }}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
        </div>

        {category !== 'all' && <CategoryHero category={category} />}

        <section className="nn-wrap" style={{ marginBottom: 40 }}>
          <div className="nn-sec-head">
            <div>
              <span className="nn-kicker">
                {category === 'all' ? 'The catalog' : CATEGORY_LABEL[category]}
              </span>
              <h2 className="nn-chrome-gold" style={{ fontSize: 'clamp(24px, 4vw, 38px)' }}>
                {category === 'all' ? 'Shop 3000 Studios' : CATEGORY_META[category].headline}
              </h2>
              <p>
                {filtered.length} product{filtered.length === 1 ? '' : 's'}
                {query && <> matching “{query}”</>} · real stock from boughtitonline.com
              </p>
            </div>
          </div>

          {pageItems.length === 0 ? (
            <p style={{ color: 'var(--nn-muted)', padding: '40px 0', textAlign: 'center' }}>
              Nothing matches that search. Try another term.
            </p>
          ) : (
            <div className="nn-grid">
              {pageItems.map((item) => (
                <article key={item.id} className="nn-card">
                  <button
                    type="button"
                    onClick={() => setQuickView(item)}
                    aria-label={`Quick view ${item.title}`}
                    style={{ display: 'block', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                  >
                    <ProductImage item={item} />
                  </button>
                  <div style={{ padding: 18 }}>
                    <span className="nn-kicker" style={{ fontSize: 10 }}>
                      {CATEGORY_LABEL[item.category]}
                    </span>
                    <h3 style={{ color: '#fff', margin: '8px 0 4px', fontSize: 17 }}>
                      <button
                        type="button"
                        onClick={() => setQuickView(item)}
                        style={{ background: 'none', border: 'none', padding: 0, color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                      >
                        {item.title}
                      </button>
                    </h3>
                    <p style={{ color: 'var(--nn-muted)', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, margin: '0 0 12px' }}>
                      <strong style={{ color: 'var(--nn-gold)', fontSize: 20 }}>
                        {money(item.price)}
                      </strong>
                      {item.compareAt != null && item.compareAt > item.price && (
                        <s style={{ color: 'var(--nn-muted)', fontSize: 14 }}>{money(item.compareAt)}</s>
                      )}
                      {item.variants.length > 1 && (
                        <span style={{ color: 'var(--nn-muted)', fontSize: 12 }}>
                          {item.variants.length} options
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        className="nn-btn nn-btn-cyan"
                        onClick={() => addToCart(item.variantId)}
                        style={{ padding: '10px 18px', fontSize: 13, flex: 1 }}
                      >
                        <Plus size={14} weight="bold" /> Add
                      </button>
                      <button
                        type="button"
                        className="nn-btn nn-btn-ghost"
                        onClick={() => setQuickView(item)}
                        style={{ padding: '10px 18px', fontSize: 13, flex: 1 }}
                      >
                        Quick view
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <nav aria-label="Product pages" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 32 }}>
              <button
                type="button"
                className="nn-chip"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
                aria-label="Previous page"
                style={{ padding: '10px 14px', opacity: safePage <= 1 ? 0.4 : 1 }}
              >
                <CaretLeft size={14} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className="nn-chip"
                  aria-pressed={n === safePage}
                  aria-label={`Page ${n}`}
                  onClick={() => setPage(n)}
                  style={{
                    padding: '10px 16px', fontWeight: 800,
                    ...(n === safePage
                      ? { background: 'var(--nn-gold)', color: '#05060a', borderColor: 'var(--nn-gold)' }
                      : {}),
                  }}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                className="nn-chip"
                disabled={safePage >= pageCount}
                onClick={() => setPage(safePage + 1)}
                aria-label="Next page"
                style={{ padding: '10px 14px', opacity: safePage >= pageCount ? 0.4 : 1 }}
              >
                <CaretRight size={14} />
              </button>
            </nav>
          )}
        </section>

        <section className="nn-wrap">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

        <footer className="nn-footer">
          <strong className="nn-chrome-gold">3000 STUDIOS</strong>
          <nav>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p>© 2026 3000 Studios · All rights reserved · Secure checkout via Shopify</p>
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
      {quickView && (
        <QuickView
          item={quickView}
          onClose={() => setQuickView(null)}
          onAdd={(variantId, qty) => addToCart(variantId, qty)}
        />
      )}
    </PublicLayoutV2>
  );
}
