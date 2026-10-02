import { Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Play, SpotifyLogo, EnvelopeSimple } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { MERCH_ITEMS, paypalBuyUrl, type MerchItem } from '../data/merch';
import { formatMoney, grantPlan, grantTrack } from '../lib/commerce';
import {
  HYPERFOLLOW_ALT_URL,
  HYPERFOLLOW_URL,
  SPOTIFY_ARTIST_URL,
} from '../data/priorityShorts';
import '../v2/shop-page.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

const GROUPS: Array<{ kind: MerchItem['kind']; title: string; copy: string }> = [
  { kind: 'music', title: 'Own the music', copy: 'High-res downloads + licenses. Yours forever.' },
  { kind: 'plan', title: 'VIP passes', copy: 'Stems, early drops, and the full vault.' },
  { kind: 'merch', title: 'Merch drops', copy: 'Limited runs. When it sells out, it is gone.' },
  { kind: 'sponsor', title: 'Sponsor inventory', copy: 'Put your brand on the VIP stage.' },
];

export function ShopPage() {
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const buy = (item: MerchItem) => {
    if (item.id === 'monthly') grantPlan('monthly');
    if (item.id === 'yearly') grantPlan('yearly');
    if (item.id === 'track') grantTrack('not-giving-up-tonight');
    window.location.assign(item.stripe);
  };
  return (
    <PublicLayoutV2 wallpaper="grid">
      <section className="v2-section v2-shop-hero">
        <div className="v2-wrap">
          <Reveal>
            <span className="v2-kicker">Merch · Music · VIP · Sponsors</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display" style={{ fontSize: 'clamp(38px, 9vw, 72px)' }}>
              Shop the <span className="v2-grad-text">empire</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ margin: '16px auto 0', maxWidth: 600 }}>
              Music streams free. Ownership lives here — downloads, VIP, merch, sponsors.
              Checkout is Stripe.
            </p>
          </Reveal>
          {paid ? (
            <Reveal delay={0.2}>
              <span className="v2-shop-thanks">Thanks — your order is in. Check your email.</span>
            </Reveal>
          ) : null}
          <Reveal delay={0.24}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 22, justifyContent: 'center' }}>
              <a className="v2-btn" href="#shop-stripe">
                <ShoppingCart size={18} weight="fill" />
                Buy with Stripe
              </a>
              <a
                className="v2-btn v2-btn--ghost"
                href={SPOTIFY_ARTIST_URL}
                target="_blank"
                rel="noreferrer"
              >
                <SpotifyLogo size={18} weight="fill" />
                Listen on Spotify
              </a>
              <a
                className="v2-btn v2-btn--ghost"
                href={HYPERFOLLOW_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Play size={18} weight="fill" />
                HyperFollow (all platforms)
              </a>
              <a
                className="v2-btn v2-btn--ghost"
                href={HYPERFOLLOW_ALT_URL}
                target="_blank"
                rel="noreferrer"
              >
                hyperfollow.com/3000Studios
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.28}>
            <p style={{ color: 'var(--v2-faint)', marginTop: 14, fontSize: 14 }}>
              Prefer streams first? Spotify + HyperFollow unlock every DSP. Ready to own it?
              Stripe checkout below.
            </p>
          </Reveal>
        </div>
      </section>

      <div id="shop-stripe">
        {GROUPS.map((group) => {
          const items = MERCH_ITEMS.filter((item) => item.kind === group.kind);
          if (!items.length) return null;
          return (
            <section key={group.kind} aria-label={group.title} className="v2-section" style={{ paddingTop: 0 }}>
              <div className="v2-wrap">
                <Reveal>
                  <h2 className="v2-shop-group-title">{group.title}</h2>
                  <p className="v2-shop-group-copy">{group.copy}</p>
                </Reveal>
                <RevealGroup className="v2-grid-4">
                  {items.map((item) => (
                    <RevealItem key={item.id}>
                      <article className="v2-card v2-card--lift v2-shop-card">
                        <div
                          className="v2-shop-art"
                          style={{ backgroundImage: `url(${item.image})` }}
                          role="img"
                          aria-label={item.title}
                        />
                        <span className="v2-chip" style={{ alignSelf: 'flex-start' }}>
                          {item.kind}
                        </span>
                        <h2>{item.title}</h2>
                        <p>{item.blurb}</p>
                        <p className="v2-shop-price">{formatMoney(item.priceCents)}</p>
                        <button type="button" className="v2-btn" style={{ width: '100%' }} onClick={() => buy(item)}>
                          Buy with Stripe · {formatMoney(item.priceCents)}
                        </button>
                        <a
                          className="v2-btn v2-btn--ghost"
                          href={paypalBuyUrl(item)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ marginTop: 8, width: '100%' }}
                        >
                          PayPal instead
                        </a>
                        <div className="v2-shop-listens">
                          <a href={SPOTIFY_ARTIST_URL} target="_blank" rel="noreferrer">
                            Spotify
                          </a>
                          <a href={HYPERFOLLOW_URL} target="_blank" rel="noreferrer">
                            HyperFollow
                          </a>
                        </div>
                      </article>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </div>
            </section>
          );
        })}
      </div>

      <LiveLine />

      <section className="v2-section">
        <div className="v2-wrap" style={{ textAlign: 'center' }}>
          <Reveal>
            <h2 className="v2-sec-title">Stream before you buy</h2>
            <p className="v2-lede" style={{ margin: '12px auto 22px', maxWidth: 560 }}>
              Free listening drives royalties. Follow on Spotify, then grab ownership here when
              you are ready.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              <a className="v2-btn" href={SPOTIFY_ARTIST_URL} target="_blank" rel="noreferrer">
                Open Spotify artist
              </a>
              <a className="v2-btn v2-btn--ghost" href={HYPERFOLLOW_URL} target="_blank" rel="noreferrer">
                DistroKid HyperFollow
              </a>
              <a
                className="v2-btn v2-btn--ghost"
                href={HYPERFOLLOW_ALT_URL}
                target="_blank"
                rel="noreferrer"
              >
                hyperfollow.com hub
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <p style={{ color: 'var(--v2-muted)', fontSize: 14, marginTop: 28 }}>
              Custom order, sync license, or sponsor deal?{' '}
              <a
                href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios order / license')}`}
                style={{ color: 'var(--v2-neon)', fontWeight: 700, textDecoration: 'none' }}
              >
                {OWNER_EMAIL}
              </a>{' '}
              ·{' '}
              <Link to="/contact" style={{ color: 'var(--v2-neon)', fontWeight: 700, textDecoration: 'none' }}>
                Contact
              </Link>{' '}
              <EnvelopeSimple size={14} weight="fill" style={{ verticalAlign: '-2px' }} />
            </p>
          </Reveal>
        </div>
      </section>
    </PublicLayoutV2>
  );
}
