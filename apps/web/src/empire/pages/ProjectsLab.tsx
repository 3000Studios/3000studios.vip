import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Go } from '../kit';
import { STUDIO_PROJECTS } from '../../data/projectsData';
import { AdSenseUnit } from '../../v2/PublicLayoutV2';
import { ADSENSE_HOME_SLOT } from '../../lib/adsense';

const ART = ['art-game', 'art-apps', 'art-vip', 'art-music', 'art-pod', 'art-live'];

export function ProjectsLab() {
  return (
    <EmpirePage>
      <PageHero
        eyebrow="Engineering and creative case studies"
        title={
          <>
            Featured
            <br />
            projects
          </>
        }
        lead="How the studio builds: the architecture behind the game, the analyzer and this site."
        orb="rgba(62,232,255,.3)"
      >
        <div className="ep-ctas">
          <Go to="/apps" gold>
            The apps lab
          </Go>
        </div>
      </PageHero>
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap">
          <div className="ep-grid ep-g3">
            {STUDIO_PROJECTS.map((p, i) => {
              const [name, ...rest] = p.title.split(': ');
              const sub = rest.join(': ');
              return (
                <article key={p.id} className="ep-glass ep-card ep-lift ep-sheen">
                  <div className={`ep-art ${ART[i % ART.length]}`} aria-hidden="true" />
                  <span className="ep-chip is-live">{p.status}</span>
                  <h3>{sub ? name : p.title}</h3>
                  {sub && <b style={{ fontSize: 15 }}>{sub}</b>}
                  <p>{p.summary}</p>
                  {p.metrics.length > 0 && (
                    <div className="ep-stats" style={{ gap: 8 }}>
                      {p.metrics.slice(0, 3).map((m) => (
                        <div key={m.label} className="ep-stat ep-glass" style={{ padding: '10px 12px', minWidth: 0 }}>
                          <b className="t-gold" style={{ fontSize: 24 }}>
                            {m.value}
                          </b>
                          <span>{m.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="ep-mono ep-dim" style={{ fontSize: 12 }}>
                    {p.techStack.slice(0, 5).join(' · ')}
                  </span>
                  <div className="ep-foot">
                    <span className="ep-dim" style={{ fontSize: 13 }}>{p.category}</span>
                    <Link className="em-btn em-btn--ghost" to={p.actionUrl}>
                      {p.actionLabel} <ArrowRight size={15} weight="bold" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="ep-ad">
            <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
