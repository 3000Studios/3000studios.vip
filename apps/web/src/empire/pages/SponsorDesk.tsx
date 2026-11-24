import { EmpirePage, PageHero, Go } from '../kit';
import { MERCH_ITEMS } from '../../data/merch';
import { formatMoney, writePending, SHOP_PENDING_KEY } from '../../lib/commerce';

const SLOT = MERCH_ITEMS.find((m) => m.id === 'sponsor');

const PACKAGES = [
  {
    title: 'Featured music video sponsor',
    price: SLOT ? formatMoney(SLOT.priceCents).replace('.00', '') : '$99',
    per: '/ month',
    body: 'Your brand on official music video pages and the home page slot for 30 days.',
    buy: Boolean(SLOT),
  },
  {
    title: 'Live stream presenting partner',
    price: '$250',
    per: '/ drop',
    body: 'Presenting credit on a Live Command broadcast, on screen and in the archive.',
  },
  {
    title: 'Title sponsor & custom sync',
    price: 'Custom',
    body: 'A custom track or title sponsorship built with the studio.',
  },
];

export function SponsorDesk() {
  return (
    <EmpirePage>
      <PageHero
        eyebrow="Partner with the studio"
        title={
          <>
            Sponsor
            <br />
            the show
          </>
        }
        lead="Put your brand in front of the music videos, the live stage and custom sync work."
        orb="rgba(62,232,255,.32)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid ep-g3">
          {PACKAGES.map((p, i) => (
            <article key={p.title} className={`ep-glass ep-card ep-lift${i === 1 ? ' ep-gilt ep-best' : ''}`}>
              <span className="em-kicker">Package {i + 1}</span>
              <h3>{p.title}</h3>
              <div className={i === 1 ? 'ep-price ep-metal' : 'ep-price'}>
                {p.price}
                {p.per ? <small> {p.per}</small> : null}
              </div>
              <p>{p.body}</p>
              <div className="ep-foot">
                {p.buy ? (
                  <a
                    className="em-btn"
                    href="/api/pay?sku=sponsor"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => writePending(SHOP_PENDING_KEY, { id: 'sponsor', via: 'stripe', ts: Date.now() })}
                  >
                    Book the slot
                  </a>
                ) : null}
                <Go to="/contact" gold={!p.buy && i === 1}>
                  Talk to the studio
                </Go>
              </div>
            </article>
          ))}
        </div>
      </section>
    </EmpirePage>
  );
}
