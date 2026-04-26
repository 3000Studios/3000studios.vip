import { useEffect, useState } from 'react';
import { runDeployHook, runSiteChecks } from '../lib/api';
import { useParams } from 'react-router-dom';
import { getSite } from '../lib/api';

export function SiteDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [run, setRun] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const refresh = async () => {
    if (!id) return;
    const d = await getSite(id);
    setData(d);
  };

  useEffect(() => {
    refresh().catch((e) => setErr(e instanceof Error ? e.message : 'failed'));
  }, [id]);

  const onRun = async () => {
    if (!id) return;
    setErr(null);
    setBusy(true);
    try {
      const r = await runSiteChecks(id);
      setRun(r);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const onDeployHook = async () => {
    if (!id) return;
    setErr(null);
    setBusy(true);
    try {
      const r = await runDeployHook(id);
      setRun(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <div className="panel">Loading…</div>;

  const surfaces = JSON.parse(data.site.edit_surfaces || '[]') as string[];
  const criticalRoutes = JSON.parse(data.site.critical_routes || '[]') as string[];

  return (
    <div className="grid">
      <div className="panel">
        <div className="panelHeader">
          <h2>{data.site.name}</h2>
          <span className="muted">{data.site.url}</span>
        </div>
        {err ? <div className="errorBox">{err}</div> : null}
        <div className="row">
          <button className="btn primary" disabled={busy} onClick={onRun}>
            Run Checks
          </button>
          <button className="btn" disabled={busy || !data.site.deploy_hook_url} onClick={onDeployHook}>
            Trigger Deploy Hook
          </button>
        </div>
      </div>

      <div className="split splitWide">
        <div className="panel">
          <div className="panelHeader">
            <h2>Site Identity</h2>
            <span className="muted">Workspace, bridge, and zone map</span>
          </div>
          <div className="detailStats">
            <div className="detailStat">
              <span>Platform</span>
              <strong>{data.site.platform}</strong>
            </div>
            <div className="detailStat">
              <span>Workspace</span>
              <strong>{data.site.workspace_key || 'not mapped'}</strong>
            </div>
            <div className="detailStat">
              <span>Bridge Origin</span>
              <strong>{data.site.bridge_origin || 'not enabled'}</strong>
            </div>
            <div className="detailStat">
              <span>Cloudflare Zone</span>
              <strong>{data.site.cloudflare_zone_name || 'external'}</strong>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <h2>Routes and Surfaces</h2>
            <span className="muted">Clickable review and edit targets</span>
          </div>
          <div className="microList paddedList">
            {criticalRoutes.map((route) => (
              <a
                className="chip"
                href={`${data.site.url}${route}`}
                key={route}
                rel="noreferrer"
                target="_blank"
              >
                route {route}
              </a>
            ))}
            {surfaces.map((surface) => (
              <a
                className="chip chipAccent"
                href={`${data.site.url}${surface}`}
                key={surface}
                rel="noreferrer"
                target="_blank"
              >
                edit {surface}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Checks</h2>
          <span className="muted">{data.checks.length}</span>
        </div>
        <div className="cards">
          {data.checks.map((c: any) => (
            <div key={c.id} className="card">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">{c.type}</div>
                <div className="cardMeta">Timeout: {c.timeout_ms}ms</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Last Run</h2>
          <span className="muted">Evidence + status</span>
        </div>
        <pre className="pre">{run ? JSON.stringify(run, null, 2) : 'Run checks to see results.'}</pre>
      </div>
    </div>
  );
}
