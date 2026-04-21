import { useEffect, useMemo, useState } from 'react';
import { getStats, listSites } from '../lib/api';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const [stats, setStats] = useState<{ sites: number; openIncidents: number } | null>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, l] = await Promise.all([getStats(), listSites()]);
        setStats(s);
        setSites(l.sites.slice(0, 6));
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'failed');
      }
    })();
  }, []);

  const healthLabel = useMemo(() => {
    if (!stats) return '…';
    if (stats.openIncidents > 0) return 'Elevated';
    return 'Stable';
  }, [stats]);

  return (
    <div className="grid">
      <div className="hero vaultHero">
        <div className="heroGlow" />
        <div className="heroInner">
          <div className="eyebrow">Owner Vault</div>
          <h1>Studio command over launches, sites, and incidents.</h1>
          <p className="muted">
            The vault stays focused on portfolio visibility while the public home page handles the
            cinematic brand presentation and login entry point.
          </p>
          {err ? <div className="errorBox">{err}</div> : null}
          <div className="kpis">
            <div className="kpi">
              <div className="kpiLabel">Portfolio</div>
              <div className="kpiValue">{stats ? stats.sites : '—'}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Open Incidents</div>
              <div className="kpiValue">{stats ? stats.openIncidents : '—'}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Status</div>
              <div className="kpiValue">{healthLabel}</div>
            </div>
          </div>
          <div className="heroActions">
            <Link className="btn primary" to="/vault/sites">
              Open Sites
            </Link>
            <Link className="btn" to="/vault/settings">
              Audio Console
            </Link>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Quick Watch</h2>
          <span className="muted">Latest configured sites</span>
        </div>
        <div className="cards">
          {sites.map((s) => (
            <Link to={`/sites/${s.id}`} key={s.id} className="card">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">{s.name}</div>
                <div className="cardMeta">{s.url}</div>
              </div>
            </Link>
          ))}
          {sites.length === 0 ? (
            <div className="card empty">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">No sites yet</div>
                <div className="cardMeta">Add your first site in Sites → Add.</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
