import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getSiteOverview,
  getStats,
  seedNetwork,
  type SiteOverview,
} from '../lib/api';

export function Dashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [overview, setOverview] = useState<SiteOverview[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [nextStats, siteOverview] = await Promise.all([getStats(), getSiteOverview()]);
    setStats(nextStats);
    setOverview(siteOverview.overview);
  }

  useEffect(() => {
    void (async () => {
      try {
        await load();
        setErr(null);
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'dashboard_failed');
      }
    })();
  }, []);

  async function handleSeed() {
    setBusy(true);
    setErr(null);
    try {
      await seedNetwork();
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'seed_failed');
    } finally {
      setBusy(false);
    }
  }

  const totalVisitors = overview.reduce((sum, e) => sum + (e.traffic.visitors24h ?? 0), 0);
  const totalRevenue = overview.reduce((sum, e) => sum + (e.monetization.revenueLast30dCents ?? 0), 0);
  const adsIssues = overview.filter(
    (e) => e.monetization.adsense.state === 'issue' || e.monetization.adsense.state === 'missing',
  ).length;
  const adsLive = overview.filter((e) => e.monetization.adsense.state === 'live').length;

  return (
    <div className="cStack">
      {err ? <div className="cError">{err}</div> : null}

      <div className="cKpis">
        <div className="cKpi">
          <div className="cKpiLabel">Sites Tracked</div>
          <div className="cKpiValue cNum">{stats?.sites ?? '—'}</div>
          <div className="cKpiHint">{stats?.bridgeEnabledSites ?? 0} with live bridge</div>
        </div>
        <div className={`cKpi ${(stats?.openIncidents ?? 0) > 0 ? 'bad' : 'ok'}`}>
          <div className="cKpiLabel">Open Incidents</div>
          <div className="cKpiValue cNum">{stats?.openIncidents ?? '—'}</div>
          <div className="cKpiHint">{(stats?.openIncidents ?? 0) > 0 ? 'needs attention' : 'all clear'}</div>
        </div>
        <div className="cKpi">
          <div className="cKpiLabel">Visitors · 24h</div>
          <div className="cKpiValue cNum">{formatMetric(totalVisitors || null)}</div>
          <div className="cKpiHint">across the fleet</div>
        </div>
        <div className="cKpi gold">
          <div className="cKpiLabel">Revenue · 30d</div>
          <div className="cKpiValue cNum">{formatCurrency(totalRevenue || null)}</div>
          <div className="cKpiHint">reported total</div>
        </div>
        <div className={`cKpi ${adsIssues > 0 ? 'warn' : 'ok'}`}>
          <div className="cKpiLabel">AdSense Health</div>
          <div className="cKpiValue cNum">{adsLive}/{overview.length || '—'}</div>
          <div className="cKpiHint">{adsIssues > 0 ? `${adsIssues} need review` : 'serving'}</div>
        </div>
      </div>

      <div className="cPanel">
        <div className="cPanelHead">
          <h2>Fleet Health</h2>
          <span className="cSub">Live traffic, monetization, and ad visibility per site</span>
          <span className="cSpacer" />
          <button className="cBtn sm" disabled={busy} onClick={handleSeed}>
            {busy ? 'Syncing…' : 'Sync Network'}
          </button>
        </div>
        <div className="cPanelBody flush">
          {overview.length === 0 ? (
            <div className="cEmpty">
              No sites synced yet. Click <strong>Sync Network</strong> to import your catalog,
              or add sites from the Fleet page.
            </div>
          ) : (
            <table className="cTable">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Status</th>
                  <th className="cRight">Visitors 24h</th>
                  <th className="cRight">Pageviews</th>
                  <th className="cRight">Revenue 30d</th>
                  <th>AdSense</th>
                  <th className="cRight">Action</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((e) => {
                  const status = e.monetization.pageStatus;
                  const up = status == null || (status >= 200 && status < 400);
                  return (
                    <tr key={e.site.id}>
                      <td>
                        <div className="cName">{e.site.name}</div>
                        <a className="cUrl" href={e.site.url} target="_blank" rel="noreferrer">{e.site.url}</a>
                      </td>
                      <td>
                        <span className={`cPill ${up ? 'ok' : 'down'}`}>
                          <span className="cDot" />{up ? 'online' : `HTTP ${status}`}
                        </span>
                      </td>
                      <td className="cRight cNum">{formatMetric(e.traffic.visitors24h)}</td>
                      <td className="cRight cNum">{formatMetric(e.traffic.pageviews24h)}</td>
                      <td className="cRight cNum">{formatCurrency(e.monetization.revenueLast30dCents)}</td>
                      <td><span className={`cPill ${e.monetization.adsense.state}`}><span className="cDot" />{e.monetization.adsense.state}</span></td>
                      <td className="cRight">
                        <Link to={`/vault/sites/${e.site.id}`} className="cBtn sm ghost">Open</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="cCols">
        <div className="cPanel">
          <div className="cPanelHead"><h2>Monetization</h2><span className="cSub">Where revenue is coming from</span></div>
          <div className="cPanelBody">
            {overview.length === 0 ? (
              <div className="cMuted">No data yet.</div>
            ) : (
              <div className="cRows cRowsFlush">
                {overview
                  .slice()
                  .sort((a, b) => (b.monetization.revenueLast30dCents ?? 0) - (a.monetization.revenueLast30dCents ?? 0))
                  .map((e) => (
                    <div className="cRow" key={e.site.id}>
                      <div className="cRowMain">
                        <span className="cName">{e.site.name}</span>
                        <span className="cMeta">{e.monetization.revenueSource ?? 'no source set'}</span>
                      </div>
                      <span className="cSpacer" />
                      <strong className="cNum">{formatCurrency(e.monetization.revenueLast30dCents)}</strong>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="cPanel">
          <div className="cPanelHead"><h2>Quick Actions</h2><span className="cSub">Jump into the work</span></div>
          <div className="cPanelBody">
            <div className="cTiles">
              <Link to="/vault/sites" className="cTile">
                <strong>Manage Fleet ▦</strong>
                <span>Add, remove, and inspect every connected site.</span>
              </Link>
              <Link to="/vault/ops" className="cTile">
                <strong>Open Ops Console ⌘</strong>
                <span>Run natural-language commands, inspect bridges, pull analytics.</span>
              </Link>
              <button className="cTile" disabled={busy} onClick={handleSeed} type="button">
                <strong>Sync Workspace Network</strong>
                <span>Re-import the site catalog and re-map Cloudflare zones.</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMetric(value: number | null) {
  if (value == null || value === 0) return '—';
  return new Intl.NumberFormat('en-US', { notation: value > 999 ? 'compact' : 'standard' }).format(value);
}

function formatCurrency(cents: number | null) {
  if (cents == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100);
}
