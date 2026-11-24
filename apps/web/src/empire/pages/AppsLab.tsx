import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Go } from '../kit';
import { STUDIO_APPS, type StudioApp } from '../../data/appsData';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_HOME_SLOT } from '../../lib/adsense';

const CATS = ['ALL', ...Array.from(new Set(STUDIO_APPS.map((a) => a.category)))] as const;
const TONE: Record<StudioApp['category'], string> = {
  'Audio Tool': 't-gold',
  Game: 't-ember',
  'AI Engine': 't-violet',
  'Web Platform': 't-cyan',
  Creative: 't-jade',
};

function Action({ app }: { app: StudioApp }) {
  const inner = (
    <>
      {app.actionLabel} <ArrowRight size={15} weight="bold" />
    </>
  );
  if (app.actionUrl.startsWith('/')) {
    return (
      <Link className="em-btn em-btn--ghost" to={app.actionUrl}>
        {inner}
      </Link>
    );
  }
  return (
    <a className="em-btn em-btn--ghost" href={app.actionUrl} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  );
}

export function AppsLab() {
  const [cat, setCat] = useState<string>('ALL');
  const apps = useMemo(() => (cat === 'ALL' ? STUDIO_APPS : STUDIO_APPS.filter((a) => a.category === cat)), [cat]);
  return (
    <EmpirePage>
      <PageHero
        eyebrow="3000 Studios software lab"
        title={
          <>
            Software
            <br />& apps
          </>
        }
        lead="From audio analyzers and 60fps canvas game engines to sub-second WebRTC broadcast infrastructure. Tools the studio wanted to exist."
        orb="rgba(62,232,255,.35)"
      >
        <div className="ep-ctas">
          <Go to="/projects" gold>
            Case studies
          </Go>
        </div>
      </PageHero>
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap">
          <div className="ep-filters" role="group" aria-label="Filter apps">
            {CATS.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="ep-grid ep-g2">
            {apps.map((a) => (
              <article key={a.id} id={a.id} className="ep-glass ep-gilt ep-card ep-lift ep-sheen">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <span className="ep-chip">{a.category}</span>
                  <span className={a.status === 'Production Live' ? 'ep-chip is-live' : 'ep-chip'}>{a.status}</span>
                </div>
                <h3 className={TONE[a.category]} style={{ fontSize: 34 }}>
                  {a.name}
                </h3>
                <b>{a.tagline}</b>
                <p>{a.description}</p>
                {a.highlights.length > 0 && (
                  <ul>
                    {a.highlights.slice(0, 4).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                )}
                <div className="ep-foot">
                  <span className="ep-mono ep-dim" style={{ fontSize: 12 }}>
                    {a.platform} · v{a.version.replace(/^v/i, '')}
                  </span>
                  <Action app={a} />
                </div>
              </article>
            ))}
          </div>
          <div className="ep-ad">
            <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
