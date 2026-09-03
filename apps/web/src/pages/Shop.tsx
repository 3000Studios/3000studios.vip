import { Link, useSearchParams } from 'react-router-dom';
import { PublicLayout } from './Home';
import { MERCH_ITEMS, paypalBuyUrl } from '../data/merch';
import { formatMoney, grantPlan, grantTrack } from '../lib/commerce';
import { officialReleaseVideos, youtubeArtworkUrl } from '../data/officialReleases';
import '../styles/discover.css';

function payHref(item: (typeof MERCH_ITEMS)[number]) {
  const stripe =
    item.id === 'track'
      ? (import.meta.env.VITE_STRIPE_TRACK_LINK as string | undefined)
      : item.id === 'monthly'
        ? (import.meta.env.VITE_STRIPE_MONTHLY_LINK as string | undefined)
        : item.id === 'yearly'
          ? (import.meta.env.VITE_STRIPE_YEARLY_LINK as string | undefined)
          : item.id === 'sponsor'
            ? (import.meta.env.VITE_STRIPE_SPONSOR_LINK as string | undefined)
            : (import.meta.env.VITE_STRIPE_MERCH_LINK as string | undefined);
  if (stripe) return stripe;
  return paypalBuyUrl(item);
}

export function ShopPage() {
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const buy = (item: (typeof MERCH_ITEMS)[number]) => {
    if (item.id === 'monthly') grantPlan('monthly');
    if (item.id === 'yearly') grantPlan('yearly');
    if (item.id === 'track') grantTrack('not-giving-up-tonight');
    window.location.href = payHref(item);
  };
  return (
    <PublicLayout variant="goldwave">
      <main className="discoverPage shopPage">
        <section className="discoverUnlock">
          <h1>Shop</h1>
          <p>PayPal checkout is live. Stripe links take over when env vars are set on Cloudflare.</p>
          {paid ? <p className="owned">Welcome back. If a plan was paid, it is unlocked on this device.</p> : null}
        </section>
        <div className="shopGrid">
          {MERCH_ITEMS.map((item) => (
            <article className="shopCard" key={item.id}>
              <div className="shopArt" style={{ backgroundImage: `url(${youtubeArtworkUrl(officialReleaseVideos[0].videoId)})` }} />
              <span className="shopKind">{item.kind}</span>
              <h2>{item.title}</h2>
              <p>{item.blurb}</p>
              <button type="button" className="studioButton" onClick={() => buy(item)}>
                Buy {formatMoney(item.priceCents)}
              </button>
            </article>
          ))}
        </div>
        <p className="cMuted">Need a custom order? <Link to="/contact">Contact</Link></p>
      </main>
    </PublicLayout>
  );
}
