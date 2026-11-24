import { ShoppingCart } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Ext, Go } from '../kit';
import { BEAT_BUNDLE, BEAT_BUNDLE_SAVINGS_CENTS, BEAT_ITEMS, beatBuyUrl } from '../../data/beats';
import { formatMoney } from '../../lib/commerce';

const clean = (t: string) => t.replace(/ \(Instrumental\)$/, '');
const fullPrice = BEAT_BUNDLE.priceCents + BEAT_BUNDLE_SAVINGS_CENTS;

export function BeatPacks() {
  return (
    <EmpirePage>
      <PageHero
        eyebrow="Beat packs"
        title={
          <>
            License-ready
            <br />
            instrumentals
          </>
        }
        lead="Instant MP3 delivery after checkout. For sync, exclusives or custom production, talk to the studio first."
        orb="rgba(62,232,255,.35)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', alignItems: 'start' }}>
          <div className="ep-glass ep-gilt ep-card ep-best" style={{ padding: 30 }}>
            <span className="ep-chip is-live">Best value</span>
            <h3 style={{ fontSize: 40 }}>Complete instrumental bundle</h3>
            <p>
              All {BEAT_ITEMS.length} instrumentals in one download. {BEAT_BUNDLE.blurb}
            </p>
            <div className="ep-price ep-metal">
              {formatMoney(BEAT_BUNDLE.priceCents).replace('.00', '')}
              <small> vs {formatMoney(fullPrice).replace('.00', '')} bought one by one</small>
            </div>
            <Ext href={beatBuyUrl(BEAT_BUNDLE)} gold>
              Buy the bundle
            </Ext>
          </div>
          <div className="ep-glass ep-tracks">
            {BEAT_ITEMS.map((b, i) => (
              <div key={b.id} className="ep-trk">
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t" title={b.blurb}>
                  {clean(b.title)}
                </span>
                <span className="pv">{formatMoney(b.priceCents)}</span>
                <a className="ep-mini" href={beatBuyUrl(b)} target="_blank" rel="noopener noreferrer" aria-label={`Buy ${clean(b.title)}, ${formatMoney(b.priceCents)}`}>
                  <ShoppingCart size={16} weight="bold" />
                </a>
              </div>
            ))}
          </div>
        </div>
        <div className="em-wrap">
          <div className="ep-glass ep-card" style={{ marginTop: 22 }}>
            <span className="em-kicker">Licensing</span>
            <p>For sync licensing, exclusives and custom production, contact the studio before purchasing.</p>
            <div className="ep-foot">
              <Go to="/contact">Contact the studio</Go>
              <Go to="/requests">Commission a track</Go>
            </div>
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
