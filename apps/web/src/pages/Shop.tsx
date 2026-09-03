import { Link, useSearchParams } from 'react-router-dom';
import { PublicLayout } from './Home';
import { MERCH_ITEMS } from '../data/merch';
import { formatMoney, grantPlan, grantTrack } from '../lib/commerce';
import '../styles/discover.css';

export function ShopPage() {
  const [params] = useSearchParams();
  const paid = params.get('paid') === '1';
  const buy = (item: (typeof MERCH_ITEMS)[number]) => {
    if (item.id === 'monthly') grantPlan('monthly');
    if (item.id === 'yearly') grantPlan('yearly');
    if (item.id === 'track') grantTrack('not-giving-up-tonight');
    window.location.href = item.stripe;
  };
  return (
    <PublicLayout variant="goldwave">
      <main className="discoverPage shopPage">
        <section className="discoverUnlock">
          <h1>Shop</h1>
          <p>Card checkout on Stripe. After pay you return here unlocked on this device.</p>
          {paid ? <p className="owned">Payment returned. Unlock is stored on this device.</p> : null}
        </section>
        <div className="shopGrid">
          {MERCH_ITEMS.map((item) => (
            <article className="shopCard" key={item.id}>
              <div className="shopArt" style={{ backgroundImage: `url(${item.image})` }} />
              <span className="shopKind">{item.kind}</span>
              <h2>{item.title}</h2>
              <p>{item.blurb}</p>
              <button type="button" className="studioButton" onClick={() => buy(item)}>
                Buy {formatMoney(item.priceCents)}
              </button>
            </article>
          ))}
        </div>
        <p className="cMuted">Photos via Pixabay. Need a custom order? <Link to="/contact">Contact</Link></p>
      </main>
    </PublicLayout>
  );
}
