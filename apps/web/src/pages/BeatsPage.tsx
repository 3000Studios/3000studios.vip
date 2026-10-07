import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import {
  ArrowRight,
  Download,
  MusicNote,
  SealCheck,
  ShoppingBag,
  Sparkle,
} from '@phosphor-icons/react';
import {
  BEAT_BUNDLE,
  BEAT_BUNDLE_SAVINGS_CENTS,
  BEAT_ITEMS,
  beatBuyUrl,
} from '../data/beats';
import { formatMoney } from '../lib/commerce';

/**
 * /beats — the 3000 Studios digital instrumental store.
 * Digital catalog only: 16 instrumentals at $7 + the 16-track bundle at $49.
 * Merch lives on /shop. Checkout deep-links to the Shopify storefront.
 */
export function BeatsPage() {
  return (
    <PublicLayoutV2 wallpaper="eq">
      <style>{`
        .beats-headline { font-family: var(--nn-font); font-weight: 800; letter-spacing: .01em;
          font-size: clamp(2.6rem, 7.5vw, 5.5rem); line-height: 1.02; margin: 18px 0 0; color: #fff;
          text-align: center; }
        .beats-shimmer { background: linear-gradient(100deg, var(--nn-gold) 10%, #fff6c9 30%, var(--nn-cyan) 55%, var(--nn-gold) 80%);
          background-size: 220% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
          animation: beats-shimmer 6s linear infinite; }
        @keyframes beats-shimmer { to { background-position: 220% center; } }
        .beats-cta-row { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 26px; justify-content: center; }
        .nn-btn-big { padding: 16px 30px; font-size: 17px; border-radius: 14px; }
        .beats-bundle { position: relative; overflow: hidden; border: 1px solid rgba(255,215,0,.45);
          border-radius: 20px; background: linear-gradient(135deg, rgba(255,215,0,.09) 0%, rgba(10,14,20,.85) 45%, rgba(0,240,255,.07) 100%);
          box-shadow: 0 18px 80px rgba(255,215,0,.14); padding: clamp(26px, 5vw, 48px); }
        .beats-bundle-tag { display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 999px; background: rgba(255,215,0,.14); border: 1px solid rgba(255,215,0,.4);
          color: var(--nn-gold); font-weight: 800; font-size: 13px; letter-spacing: .06em; text-transform: uppercase; }
        .beats-save { display: inline-block; margin-top: 14px; padding: 8px 18px; border-radius: 12px;
          background: rgba(0,240,255,.1); border: 1px solid rgba(0,240,255,.35);
          color: var(--nn-cyan); font-weight: 800; font-size: 15px; }
        .beats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
        .beats-card { border: 1px solid rgba(0,240,255,.14); border-radius: 16px; background: rgba(10,14,20,.72);
          padding: 22px; display: flex; flex-direction: column; transition: border-color .25s, transform .25s; }
        .beats-card:hover { border-color: rgba(0,240,255,.45); transform: translateY(-3px); }
        .beats-num { font-family: var(--nn-font); font-weight: 800; font-size: 13px; letter-spacing: .12em;
          color: var(--nn-cyan); opacity: .75; }
        .beats-delivery { display: flex; gap: 16px; align-items: flex-start; padding: 22px clamp(20px, 4vw, 32px);
          border: 1px solid rgba(0,240,255,.2); border-radius: 16px; background: rgba(0,240,255,.04); }
        .beats-merch-link { display: flex; flex-wrap: wrap; gap: 18px; align-items: center; justify-content: space-between;
          padding: clamp(24px, 4vw, 36px); border: 1px solid rgba(255,215,0,.25); border-radius: 18px;
          background: rgba(255,215,0,.05); }
        @media (prefers-reduced-motion: reduce) { .beats-shimmer { animation: none; } }
      `}</style>

      {/* HERO */}
      <section className="v2-section" style={{ paddingTop: 'clamp(56px, 9vw, 110px)' }}>
        <div className="v2-wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <span className="v2-kicker">
              <MusicNote size={15} weight="bold" style={{ marginRight: 8, verticalAlign: -2 }} />
              Instrumentals · Instant Download
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="beats-headline">
              Own the <span className="beats-shimmer">sound.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="v2-lede" style={{ maxWidth: 640, margin: '20px auto 0' }}>
              Studio-grade 3000 Studios instrumentals, yours to keep. Every track is an
              instant MP3 download — pay once, download right after checkout, use it forever.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="beats-cta-row">
              <a className="nn-btn nn-btn-gold nn-btn-big" href="#bundle">
                <Sparkle size={18} weight="fill" style={{ marginRight: 10, verticalAlign: -3 }} />
                Get the Bundle — {formatMoney(BEAT_BUNDLE.priceCents)}
              </a>
              <a className="nn-btn nn-btn-ghost nn-btn-big" href="#tracks">
                Browse Tracks
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      {/* FEATURED BUNDLE */}
      <section className="v2-section" id="bundle">
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div className="beats-bundle">
              <span className="beats-bundle-tag">
                <SealCheck size={16} weight="fill" /> Best value
              </span>
              <h2
                className="v2-display"
                style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', marginTop: 18 }}
              >
                {BEAT_BUNDLE.title}
              </h2>
              <p className="v2-lede" style={{ marginTop: 10, maxWidth: 560 }}>
                {BEAT_BUNDLE.blurb} All 16 tracks, one checkout, one download.
              </p>
              <div>
                <span className="beats-save">
                  All 16 tracks — save {formatMoney(BEAT_BUNDLE_SAVINGS_CENTS)}
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 16,
                  alignItems: 'center',
                  marginTop: 22,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--nn-font)',
                    fontWeight: 800,
                    fontSize: 34,
                    color: 'var(--nn-gold)',
                  }}
                >
                  {formatMoney(BEAT_BUNDLE.priceCents)}
                </span>
                <a
                  className="nn-btn nn-btn-gold nn-btn-big"
                  href={beatBuyUrl(BEAT_BUNDLE)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Buy the Bundle <ArrowRight size={17} weight="bold" style={{ marginLeft: 8, verticalAlign: -2 }} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      {/* TRACK GRID */}
      <section className="v2-section" id="tracks">
        <div className="v2-wrap">
          <Reveal>
            <span className="v2-kicker">Single Tracks</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="v2-display" style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)' }}>
              The <span className="v2-grad-text">instrumentals</span>
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 10 }}>
              {formatMoney(700)} each. Pick your weapons, or grab the bundle above.
            </p>
          </Reveal>
          <div style={{ marginTop: 26 }}>
          <RevealGroup className="beats-grid" stagger={0.06}>
            {BEAT_ITEMS.map((item, i) => (
              <RevealItem key={item.id}>
                <article className="beats-card">
                  <span className="beats-num">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    style={{
                      fontFamily: 'var(--nn-font)',
                      fontSize: 18,
                      margin: '10px 0 6px',
                      color: '#fff',
                      lineHeight: 1.35,
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--v2-muted)', fontSize: 13, margin: '0 0 14px' }}>
                    {item.blurb}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <strong style={{ color: 'var(--nn-gold)', fontSize: 20 }}>
                      {formatMoney(item.priceCents)}
                    </strong>
                    <a
                      className="nn-btn nn-btn-cyan"
                      href={beatBuyUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ padding: '10px 20px', fontSize: 14 }}
                    >
                      Buy
                    </a>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
          </div>
        </div>
      </section>

      {/* DIGITAL DELIVERY NOTE */}
      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div className="beats-delivery">
              <Download size={30} weight="bold" style={{ color: 'var(--nn-cyan)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#fff', fontSize: 17, fontFamily: 'var(--nn-font)' }}>
                  Instant digital delivery
                </strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '8px 0 0', lineHeight: 1.6 }}>
                  Every purchase is a digital product — your MP3 download link is delivered
                  automatically right after checkout. No shipping, no waiting.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MERCH CROSS-LINK */}
      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div className="beats-merch-link">
              <div>
                <strong
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'var(--nn-font)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <ShoppingBag size={22} weight="bold" style={{ color: 'var(--nn-gold)' }} />
                  Looking for merch?
                </strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '8px 0 0' }}>
                  Hoodies, tees, caps, and sticker packs live in the Supply Depot.
                </p>
              </div>
              <Link className="nn-btn nn-btn-ghost nn-btn-big" to="/shop">
                Visit /shop <ArrowRight size={17} weight="bold" style={{ marginLeft: 8, verticalAlign: -2 }} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
