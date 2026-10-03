import { Link } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from './Home';
import { MERCH_ITEMS } from '../data/merch';
import { CASH_APP_URL } from '../lib/liveRoom';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

export function VipPage() {
  return (
    <PublicLayout variant="spiral" compact={false}>
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            VIP HERO: MOLTEN GOLD & OBSIDIAN VAULT
            ========================================================================= */}
        <section className="vip-hero-hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker">✦ THE INNER SANCTUM</span>
            <span className="md-kicker" style={{ color: '#ffd700' }}>3000 STUDIOS VIP ACCESS</span>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text">VIP VAULT & PASSES</span>
          </h1>

          <p style={{ maxWidth: 660, margin: '0 auto 24px' }}>
            All 47 official music releases stream 100% free forever. VIP memberships unlock uncompressed 24-bit WAV master archives, multi-track stem packs, live broadcast chat badges, and direct studio sponsorship.
          </p>

          <div className="vip-badge-row">
            <a className="vip-btn-gold" href="#vip-tiers">
              ★ View VIP Tiers
            </a>
            <a className="vip-btn-obsidian" href={CASH_APP_URL} target="_blank" rel="noreferrer">
              $ Tip $addcashGift
            </a>
            <Link className="vip-btn-obsidian" to="/#music">
              ♪ Free Catalog
            </Link>
          </div>
        </section>

        {/* =========================================================================
            VIP TIERS GRID
            ========================================================================= */}
        <section id="vip-tiers" style={{ maxWidth: 1280, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            
            {/* 99c Single */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                99¢ Single
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Own Any Track</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Lossless 24-bit studio master audio download + personal license. Yours to keep forever.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$0.99</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'track')?.stripe ?? '#'}>
                Buy Track
              </a>
            </article>

            {/* Monthly VIP */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#00f0ff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                VIP Monthly
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Vault Pass</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Full vault access, unreleased stems, exclusive drops, and priority live stream badge for 31 days.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00f0ff', marginBottom: 16 }}>$3.99 / mo</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'monthly')?.stripe ?? '#'}>
                Go VIP Monthly
              </a>
            </article>

            {/* Annual VIP */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', borderColor: 'rgba(255, 215, 0, 0.7)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ★ Best Value
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Vault All-Access</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Full year VIP access with 2 months free. Every stem, high-res catalog archive, and Discord role.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$19.99 / yr</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'yearly')?.stripe ?? '#'}>
                Go VIP Yearly
              </a>
            </article>

            {/* Sync Licensing */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#a855f7', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sync License
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Film & Commercial</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Worldwide sync clearance for YouTube creators, films, video games, ads, and TV broadcasts.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#a855f7', marginBottom: 16 }}>Custom</div>
              <a
                className="vip-btn-obsidian"
                href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('Sync License Request — 3000 Studios')}`}
              >
                Request Sync
              </a>
            </article>

            {/* Brand Sponsor */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sponsor Tier
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Brand Placement</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Prominent brand placement on 3000studios.vip and live stream tickers for 30 days.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$99 / mo</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'sponsor')?.stripe ?? '#'}>
                Sponsor Now
              </a>
            </article>

            {/* Cash App Direct Boost */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#00d632', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Direct Tip
              </span>
              <h2 style={{ color: '#fff', fontSize: 22, margin: '6px 0 2px', fontWeight: 800 }}>Cash App Tip</h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Direct 1-tap artist tip to $addcashGift. Instant drop power and sound session support.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00d632', marginBottom: 16 }}>Any $</div>
              <a
                className="vip-btn-gold"
                href={CASH_APP_URL}
                target="_blank"
                rel="noreferrer"
                style={{ background: 'linear-gradient(135deg, #00d632, #009922)', color: '#fff' }}
              >
                Tip $addcashGift
              </a>
            </article>
          </div>
        </section>

        {/* =========================================================================
            ADSENSE PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

      </div>
    </PublicLayout>
  );
}
