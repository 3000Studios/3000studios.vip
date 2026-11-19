import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import '../styles/commerce.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';

/**
 * /sponsors — Partner with the studio, mockup section 13.
 * Three packages, mockup copy only. Every action is Talk to the studio
 * (mailto). No invented reach numbers, no feature lists, no Stripe buy
 * buttons — the old page's $99 Stripe sponsor link is dropped; see NOTES.md.
 */
const PACKAGES = [
  {
    num: 'Package 1',
    title: 'Featured Music Video Sponsor',
    price: '$99 / month',
    body: 'Your brand on official music video pages and the home page slot.',
  },
  {
    num: 'Package 2',
    title: 'Live Stream Presenting Partner',
    price: '$250 / drop',
    body: 'Presenting credit on a Live Command broadcast.',
  },
  {
    num: 'Package 3',
    title: 'Title Sponsor & Custom Sync',
    price: 'Custom',
    body: 'A custom track or title sponsorship built with the studio.',
  },
];

export function SponsorsPage() {
  return (
    <PublicLayoutV2 wallpaper="beams">
      <section className="v2-section commerce-hero">
        <div className="v2-wrap">
          <Reveal>
            <span className="commerce-kicker">Partner With The Studio</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="commerce-title">
              Sponsor <span className="commerce-gold">the show</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="commerce-lede">
              Put your brand in front of the music videos, the live stage and custom sync work.
            </p>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="commerce-grid commerce-grid--3" stagger={0.08}>
            {PACKAGES.map((pkg) => (
              <RevealItem key={pkg.title}>
                <article className="commerce-card" style={{ height: '100%' }}>
                  <span className="commerce-card-tag">{pkg.num}</span>
                  <h2 className="commerce-card-title">{pkg.title}</h2>
                  <div className="commerce-price">{pkg.price}</div>
                  <p className="commerce-card-body">{pkg.body}</p>
                  <a
                    className="nn-btn nn-btn-gold"
                    href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(`Sponsorship: ${pkg.title}`)}`}
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Talk to the studio →
                  </a>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <LiveLine />
    </PublicLayoutV2>
  );
}
