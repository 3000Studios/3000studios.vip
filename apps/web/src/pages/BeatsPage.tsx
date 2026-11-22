import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import { ArrowRight, Download, MusicNote, SealCheck, ShoppingBag } from '@phosphor-icons/react';
import {
  BEAT_BUNDLE,
  BEAT_BUNDLE_SAVINGS_CENTS,
  BEAT_ITEMS,
  beatBuyUrl,
} from '../data/beats';
import { formatMoney } from '../lib/commerce';
import '../styles/commerce.css';

/**
 * /beats — license-ready instrumentals, mockup section 8.
 * The mockup lists 14 singles; the repo catalog (data/beats.ts) holds 16.
 * The two not in the mockup are filtered out here and the conflict is
 * logged in NOTES.md. Bundle price follows the mockup: $49 vs $112.
 */
const MOCKUP_BEAT_IDS = [
  'room-goes-cold',
  'not-giving-up-tonight',
  'motel-television',
  'more-mass',
  'midnight-haunt-dnb',
  'midnight-haunt',
  'keep-ridin',
  'entertain-us',
  'die-in-a-fire',
  'crabs-n-aidas',
  'burn-up-the-bass',
  'amazon',
  'am-i',
  'after-hours-heaven',
] as const;

const MOCKUP_BEATS = MOCKUP_BEAT_IDS.map(
  (id) => BEAT_ITEMS.find((item) => item.id === id)!,
).filter(Boolean);

function displayTitle(title: string): string {
  return title.replace(/ \(Instrumental\)$/, '');
}

export function BeatsPage() {
  return (
    <PublicLayoutV2 wallpaper="eq">
      {/* HERO */}
      <section className="v2-section commerce-hero">
        <div className="v2-wrap">
          <Reveal>
            <span className="commerce-kicker">
              <MusicNote size={15} weight="bold" style={{ marginRight: 8, verticalAlign: -2 }} />
              Beat Packs
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="commerce-title">
              License-ready <span className="commerce-gold">instrumentals</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="commerce-lede">
              Instant MP3 delivery after checkout. For sync, exclusives or custom
              production, talk to the studio first.
            </p>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      {/* BUNDLE HERO */}
      <section className="v2-section" id="bundle">
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div className="commerce-bundle">
              <span className="commerce-bundle-tag">
                <SealCheck size={16} weight="fill" /> Best value
              </span>
              <h2
                className="v2-display"
                style={{ fontSize: 'clamp(1.8rem, 4.5vw, 2.8rem)', marginTop: 18 }}
              >
                Complete Instrumental Bundle
              </h2>
              <p className="v2-lede" style={{ marginTop: 10, maxWidth: 560 }}>
                Every instrumental in one download.
              </p>
              <div>
                <span className="commerce-save">
                  Save {formatMoney(BEAT_BUNDLE_SAVINGS_CENTS)} — $49 vs $112 bought one by one
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
                    fontFamily: 'var(--md-font-display, Georgia, serif)',
                    fontWeight: 700,
                    fontSize: 34,
                    color: 'var(--md-gold-hi, #f6dd8a)',
                  }}
                >
                  {formatMoney(BEAT_BUNDLE.priceCents)}
                  <span className="commerce-price-strike">$112</span>
                </span>
                <a
                  className="nn-btn nn-btn-gold"
                  href={beatBuyUrl(BEAT_BUNDLE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '16px 30px', fontSize: 17 }}
                >
                  Buy the bundle <ArrowRight size={17} weight="bold" style={{ marginLeft: 8, verticalAlign: -2 }} />
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      {/* SINGLES */}
      <section className="v2-section" id="tracks">
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <span className="commerce-eyebrow">Single Tracks</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="commerce-section-title" style={{ marginTop: 12 }}>
              The instrumentals
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 10 }}>
              {formatMoney(700)} each. Pick your weapons, or grab the bundle above.
            </p>
          </Reveal>
          <RevealGroup className="commerce-beat-list" stagger={0.04}>
            {MOCKUP_BEATS.map((item, i) => (
              <RevealItem key={item.id}>
                <div className="commerce-beat-row">
                  <span className="commerce-beat-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="commerce-beat-name">{displayTitle(item.title)}</span>
                  <span className="commerce-beat-price">{formatMoney(item.priceCents)}</span>
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
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* DELIVERY NOTE */}
      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                gap: 16,
                alignItems: 'flex-start',
                padding: '22px clamp(20px, 4vw, 32px)',
                border: '1px solid rgba(212, 175, 55, 0.22)',
                borderRadius: 16,
                background: 'rgba(212, 175, 55, 0.04)',
              }}
            >
              <Download size={30} weight="bold" style={{ color: 'var(--md-gold-hi, #f6dd8a)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ color: '#fff', fontSize: 17, fontFamily: 'var(--md-font-display, Georgia, serif)' }}>
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

      {/* LICENSING */}
      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 18,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(24px, 4vw, 36px)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 18,
                background: 'rgba(212, 175, 55, 0.05)',
              }}
            >
              <div>
                <strong
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'var(--md-font-display, Georgia, serif)',
                  }}
                >
                  Licensing
                </strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '8px 0 0', maxWidth: 520 }}>
                  For sync licensing, exclusives and custom production, contact the studio
                  before purchasing.
                </p>
              </div>
              <Link className="nn-btn nn-btn-gold" to="/contact" style={{ padding: '16px 30px', fontSize: 17 }}>
                Contact the studio <ArrowRight size={17} weight="bold" style={{ marginLeft: 8, verticalAlign: -2 }} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MERCH CROSS-LINK */}
      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 900 }}>
          <Reveal>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 18,
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'clamp(24px, 4vw, 36px)',
                border: '1px solid rgba(212, 175, 55, 0.25)',
                borderRadius: 18,
                background: 'rgba(212, 175, 55, 0.05)',
              }}
            >
              <div>
                <strong
                  style={{
                    color: '#fff',
                    fontSize: 20,
                    fontFamily: 'var(--md-font-display, Georgia, serif)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <ShoppingBag size={22} weight="bold" style={{ color: 'var(--md-gold-hi, #f6dd8a)' }} />
                  Looking for merch?
                </strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 15, margin: '8px 0 0' }}>
                  Hoodies, tees, caps, and sticker packs live in the boutique.
                </p>
              </div>
              <Link className="nn-btn nn-btn-ghost" to="/shop" style={{ padding: '16px 30px', fontSize: 17 }}>
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
