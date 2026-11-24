import { useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { GooglePlayLogo, Globe } from '@phosphor-icons/react';
import { EmpirePage, Head, Stat, Go } from '../kit';
import { AERO_BOSSES, AERO_SHIPS, AERO_WEAPONS, type AeroBoss } from '../../data/aeropocalypse';
import { AERO_STILLS } from '../../data/aeropocalypseStills';
import { MERCH_ITEMS } from '../../data/merch';
import { AeroTrailer } from '../../components/AeroTrailer';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_HOME_SLOT } from '../../lib/adsense';
import { AERO_PLAY_URL, AERO_SITE_URL } from '../links';

const CLASSES = ['ALL', 'ALPHA', 'OMEGA', 'TITAN', 'NEXUS'] as const;
type Cls = (typeof CLASSES)[number];
const MERCH = MERCH_ITEMS.filter((m) => m.kind === 'merch');
const money = (c: number) => `$${(c / 100).toFixed(c % 100 ? 2 : 0)}`;

function BossCard({ boss, i, total }: { boss: AeroBoss; i: number; total: number }) {
  return (
    <article className={`ep-glass ep-boss ep-lift c-${boss.threatLevel}`}>
      <div className="lv">
        <span>LEVEL {String(boss.level).padStart(2, '0')}</span>
        <span>{boss.codename}</span>
      </div>
      <h4>{boss.name}</h4>
      <span className="cls">{boss.threatLevel}</span>
      <p>{boss.signatureAttack}. Weak point: {boss.weakness}.</p>
      <div className="threat" aria-hidden="true">
        <i style={{ '--w': `${20 + Math.round((i / Math.max(total - 1, 1)) * 80)}%` } as CSSProperties} />
      </div>
    </article>
  );
}

export function AeroPage() {
  const [cls, setCls] = useState<Cls>('ALL');
  const bosses = useMemo(
    () => (cls === 'ALL' ? AERO_BOSSES : AERO_BOSSES.filter((b) => b.threatLevel === cls)),
    [cls],
  );
  const hero = AERO_STILLS[0];

  return (
    <EmpirePage>
      <section className="ep-band em-nostagger">
        <div className="em-wrap">
          <div style={{ display: 'grid', gap: 20, minWidth: 0 }}>
            <span className="ep-chip is-live">Now on Google Play</span>
            <h1 className="em-dance">
              <span className="ep-metal">Aeropocalypse</span>
              <br />
              Online
            </h1>
            <p className="ep-lead">
              An arcade aerial combat shooter from 3000 Studios. Fly 25 stages, break {AERO_BOSSES.length} named bosses
              and take the fight online.
            </p>
            <div className="ep-ctas">
              <a className="em-btn em-btn--play" href={AERO_PLAY_URL} target="_blank" rel="noopener noreferrer">
                <GooglePlayLogo size={20} weight="fill" /> Download on Google Play
              </a>
              <a className="em-btn em-btn--ghost" href={AERO_SITE_URL} target="_blank" rel="noopener noreferrer">
                <Globe size={18} weight="duotone" /> aeropocalypse.online
              </a>
            </div>
          </div>
          <div className="ep-stage" data-em-tilt>
            <img
              src={hero ? hero.src : '/media/aeropocalypse/poster.jpg'}
              alt={hero ? hero.alt : 'Aeropocalypse: Online combat'}
              fetchPriority="high"
              decoding="async"
            />
            <div className="ep-hud" aria-hidden="true">
              <div>
                STAGE 01 / 25
                <div className="bar">
                  <i />
                </div>
              </div>
              <div>SCORE 128,400</div>
            </div>
          </div>
        </div>
      </section>

      <section className="ep-sec">
        <div className="em-wrap ep-stats">
          <Stat value="25" label="Stages" tone="ember" />
          <Stat value={AERO_BOSSES.length} label="Bosses" />
          <Stat value={AERO_SHIPS.length} label="Jets" tone="cyan" />
          <Stat value={AERO_WEAPONS.length} label="Weapon systems" />
          <Stat value="4" label="Threat classes" tone="violet" />
        </div>
      </section>

      <AeroTrailer title="Watch it fight" />

      {AERO_STILLS.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Gameplay" title={<>Frame by <span className="ep-metal">frame</span></>} />
            <div className="ep-rail" style={{ gridAutoColumns: 'minmax(280px, 1fr)' }}>
              {AERO_STILLS.map((s) => (
                <figure key={s.src} className="ep-glass" style={{ margin: 0 }}>
                  <img src={s.src} alt={s.alt} loading="lazy" decoding="async" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block' }} />
                  <figcaption style={{ padding: '12px 14px', fontSize: 13, color: 'var(--fg-2)' }}>{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ep-sec" id="bosses">
        <div className="em-wrap">
          <Head eyebrow="The boss roster" title={<>{AERO_BOSSES.length} names to <span className="ep-metal">fear</span></>} />
          <div className="ep-filters" role="group" aria-label="Filter by threat class">
            {CLASSES.map((c) => (
              <button key={c} type="button" aria-pressed={cls === c} onClick={() => setCls(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="ep-grid ep-g4">
            {bosses.map((b) => (
              <BossCard key={b.id} boss={b} i={AERO_BOSSES.indexOf(b)} total={AERO_BOSSES.length} />
            ))}
          </div>
        </div>
      </section>

      <section className="ep-sec">
        <div className="em-wrap">
          <Head eyebrow="The hangar" title={<>Pick your <span className="ep-metal">jet</span></>} />
          <div className="ep-grid ep-g3">
            {AERO_SHIPS.map((s) => (
              <article key={s.id} className="ep-glass ep-gilt ep-card ep-lift">
                <span className="ep-chip">{s.role}</span>
                <h3>{s.name}</h3>
                <p>{s.description}</p>
                <div className="ep-kv">
                  {(['speed', 'armor', 'firepower'] as const).map((k) => (
                    <FragmentRow key={k} label={k} value={s[k]} />
                  ))}
                </div>
                <div className="ep-foot">
                  <span className="ep-mono ep-dim" style={{ fontSize: 12 }}>{s.special}</span>
                  <span className="ep-chip">{s.unlockedAt}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ep-sec">
        <div className="em-wrap">
          <Head eyebrow="The armory" title={<>Weapon <span className="ep-metal">systems</span></>} />
          <div className="ep-grid ep-g3">
            {AERO_WEAPONS.map((w) => (
              <article key={w.id} className="ep-glass ep-card ep-lift ep-sheen">
                <span className="ep-chip">{w.type}</span>
                <h3>{w.name}</h3>
                <p>{w.description}</p>
                <div className="ep-foot">
                  <b className="t-ember ep-mono">{w.dps}</b>
                  <span className="ep-dim" style={{ fontSize: 13 }}>{w.ammo}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {MERCH.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Merch" title={<>Wear the <span className="ep-metal">sky</span></>}>
              <Go to="/shop">Shop all merch</Go>
            </Head>
            <div className="ep-grid ep-g4">
              {MERCH.map((m) => (
                <Link key={m.id} className="ep-glass ep-card ep-lift ep-sheen" to="/shop">
                  <div className="ep-shot">
                    <img src={m.image} alt={m.title} loading="lazy" decoding="async" />
                  </div>
                  <b>{m.title}</b>
                  <div className="ep-foot">
                    <span className="ep-price" style={{ fontSize: 26 }}>{money(m.priceCents)}</span>
                    <span className="em-more">Shop</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="ep-sec">
        <div className="em-wrap ep-glass ep-gilt ep-card" style={{ padding: 30, alignItems: 'flex-start' }}>
          <span className="em-kicker">Ready for launch</span>
          <h2>
            Take the <span className="ep-metal">fight</span> with you
          </h2>
          <p className="ep-lead">Free to download on Android phones and tablets.</p>
          <div className="ep-ctas">
            <a className="em-btn em-btn--play" href={AERO_PLAY_URL} target="_blank" rel="noopener noreferrer">
              <GooglePlayLogo size={20} weight="fill" /> Download on Google Play
            </a>
            <Go to="/aeropocalypse/privacy">Game privacy policy</Go>
          </div>
        </div>
        <div className="em-wrap ep-ad">
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </div>
      </section>
    </EmpirePage>
  );
}

function FragmentRow({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span>{label}</span>
      <div className="ep-bar" aria-label={`${label} ${value} of 100`}>
        <i style={{ '--w': `${value}%` } as CSSProperties} />
      </div>
    </>
  );
}
