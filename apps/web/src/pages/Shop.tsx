import { Link, useSearchParams } from 'react-router-dom';
import { PublicLayout } from './Home';
import { MERCH_ITEMS, paypalBuyUrl, type MerchItem } from '../data/merch';
import { formatMoney, grantPlan, grantTrack } from '../lib/commerce';
import {
  HYPERFOLLOW_ALT_URL,
  HYPERFOLLOW_URL,
  SPOTIFY_ARTIST_URL,
} from '../data/priorityShorts';
import '../styles/discover.css';
import '../styles/million-dollar.css';

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
    <PublicLayout variant="goldwave">
      <main className="discoverPage shopPage md-scope">
        <section className="discoverUnlock md-reveal in">
          <span className="md-kicker">Merch · Music · VIP · Sponsors</span>
          <h1 className="md-title" style={{ fontSize: 'clamp(38px,9vw,72px)' }}>
            Shop the empire
          </h1>
          <p>
            Music streams free. Ownership lives here — downloads, VIP, merch, sponsors. Checkout is
            Stripe.
          </p>
          {paid ? <p className="owned">Thanks — your order is in. Check your email.</p> : null}
          <div
            className="shopRevenueCtas"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}
          >
            <a className="studioButton" href="#shop-stripe">
              Buy with Stripe
            </a>
            <a
              className="studioButton secondary"
              href={SPOTIFY_ARTIST_URL}
              target="_blank"
              rel="noreferrer"
            >
              Listen on Spotify
            </a>
            <a
              className="studioButton secondary"
              href={HYPERFOLLOW_URL}
              target="_blank"
              rel="noreferrer"
            >
              HyperFollow (all platforms)
            </a>
            <a
              className="studioButton secondary"
              href={HYPERFOLLOW_ALT_URL}
              target="_blank"
              rel="noreferrer"
            >
              hyperfollow.com/3000Studios
            </a>
          </div>
          <p className="cMuted" style={{ marginTop: 12 }}>
            Prefer streams first? Spotify + HyperFollow unlock every DSP. Ready to own it? Stripe
            checkout below.
          </p>
        </section>
        <div id="shop-stripe">
          {GROUPS.map((group) => {
            const items = MERCH_ITEMS.filter((item) => item.kind === group.kind);
            if (!items.length) return null;
            return (
              <section key={group.kind} aria-label={group.title}>
                <h2 style={{ fontFamily: 'var(--md-font-display)', margin: '26px 0 4px' }}>
                  {group.title}
                </h2>
                <p className="cMuted" style={{ margin: '0 0 14px' }}>
                  {group.copy}
                </p>
                <div className="shopGrid">
                  {items.map((item) => (
                    <article className="shopCard" key={item.id}>
                      <div className="shopArt" style={{ backgroundImage: `url(${item.image})` }} />
                      <span className="shopKind">{item.kind}</span>
                      <h2>{item.title}</h2>
                      <p>{item.blurb}</p>
                      <p className="md-price">{formatMoney(item.priceCents)}</p>
                      <button type="button" className="studioButton" onClick={() => buy(item)}>
                        Buy with Stripe · {formatMoney(item.priceCents)}
                      </button>
                      <a
                        className="studioButton secondary"
                        href={paypalBuyUrl(item)}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginTop: 8 }}
                      >
                        PayPal instead
                      </a>
                      <div
                        className="shopCardListen"
                        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}
                      >
                        <a href={SPOTIFY_ARTIST_URL} target="_blank" rel="noreferrer">
                          Spotify
                        </a>
                        <a href={HYPERFOLLOW_URL} target="_blank" rel="noreferrer">
                          HyperFollow
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <section className="shopListenFooter md-reveal" style={{ marginTop: 36 }}>
          <h2 style={{ fontFamily: 'var(--md-font-display)' }}>Stream before you buy</h2>
          <p className="cMuted">
            Free listening drives royalties. Follow on Spotify, then grab ownership here when you are
            ready.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a className="studioButton" href={SPOTIFY_ARTIST_URL} target="_blank" rel="noreferrer">
              Open Spotify artist
            </a>
            <a className="studioButton secondary" href={HYPERFOLLOW_URL} target="_blank" rel="noreferrer">
              DistroKid HyperFollow
            </a>
            <a
              className="studioButton secondary"
              href={HYPERFOLLOW_ALT_URL}
              target="_blank"
              rel="noreferrer"
            >
              hyperfollow.com hub
            </a>
          </div>
        </section>
        <p className="cMuted">
          Custom order, sync license, or sponsor deal?{' '}
          <a href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('3000 Studios order / license')}`}>
            {OWNER_EMAIL}
          </a>{' '}
          · <Link to="/contact">Contact</Link>
        </p>
      </main>
    </PublicLayout>
  );
}
