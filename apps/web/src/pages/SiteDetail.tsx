import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getSite,
  getSiteOverview,
  restartAdsense,
  runDeployHook,
  runNaturalCommand,
  runSiteChecks,
  upsertSite,
  type SiteOverview,
} from '../lib/api';

export function SiteDetail() {
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [overview, setOverview] = useState<SiteOverview | null>(null);
  const [run, setRun] = useState<any | null>(null);
  const [commandText, setCommandText] = useState('Refresh homepage copy and verify ads are rendering');
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    adsenseClientId: '',
    revenueLast30d: '',
    revenueSource: '',
    workspacePath: '',
    editSurfaces: '',
  });

  const refresh = async () => {
    if (!id) return;
    const [siteData, siteOverview] = await Promise.all([getSite(id), getSiteOverview()]);
    setData(siteData);
    const match = siteOverview.overview.find((entry) => entry.site.id === id) ?? null;
    setOverview(match);
    if (siteData?.site) {
      setForm({
        adsenseClientId: siteData.site.adsense_client_id || '',
        revenueLast30d:
          siteData.site.revenue_last_30d_cents != null
            ? String(siteData.site.revenue_last_30d_cents / 100)
            : '',
        revenueSource: siteData.site.revenue_source || '',
        workspacePath: siteData.site.workspace_path || '',
        editSurfaces: (JSON.parse(siteData.site.edit_surfaces || '[]') as string[]).join(', '),
      });
    }
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

  const onRestartAdsense = async () => {
    if (!id) return;
    setErr(null);
    setBusy(true);
    try {
      const result = await restartAdsense(id);
      setRun(result);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const onCommand = async () => {
    if (!id || !commandText.trim()) return;
    setErr(null);
    setBusy(true);
    try {
      const result = await runNaturalCommand({ siteId: id, command: commandText });
      setRun(result);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!data?.site) return;
    setErr(null);
    setSaving(true);
    try {
      await upsertSite({
        id: data.site.id,
        name: data.site.name,
        url: data.site.url,
        tags: JSON.parse(data.site.tags || '[]'),
        deploy_hook_url: data.site.deploy_hook_url,
        workspace_key: data.site.workspace_key,
        workspace_path: form.workspacePath || null,
        cloudflare_zone_id: data.site.cloudflare_zone_id,
        cloudflare_zone_name: data.site.cloudflare_zone_name,
        bridge_origin: data.site.bridge_origin,
        bridge_enabled: data.site.bridge_enabled === 1,
        critical_routes: JSON.parse(data.site.critical_routes || '[]'),
        edit_surfaces: form.editSurfaces
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
        adsense_client_id: form.adsenseClientId || null,
        adsense_enabled: Boolean(form.adsenseClientId),
        ga_property_id: data.site.ga_property_id,
        revenue_last_30d_cents: form.revenueLast30d
          ? Math.round(Number(form.revenueLast30d) * 100)
          : null,
        revenue_source: form.revenueSource || null,
        enabled: data.site.enabled === 1,
      });
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="panel">Loading…</div>;

  const surfaces = JSON.parse(data.site.edit_surfaces || '[]') as string[];
  const criticalRoutes = JSON.parse(data.site.critical_routes || '[]') as string[];
  const adsState = overview?.monetization.adsense.state ?? 'missing';

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
          <button className="btn" disabled={busy} onClick={onRestartAdsense}>
            Restart AdSense
          </button>
        </div>
      </div>

      <div className="split splitWide">
        <div className="panel">
          <div className="panelHeader">
            <h2>Live Metrics</h2>
            <span className="muted">Traffic, revenue, and ad visibility.</span>
          </div>
          <div className="detailStats">
            <div className="detailStat">
              <span>Visitors</span>
              <strong>{formatMetric(overview?.traffic.visitors24h ?? null)}</strong>
            </div>
            <div className="detailStat">
              <span>Pageviews</span>
              <strong>{formatMetric(overview?.traffic.pageviews24h ?? null)}</strong>
            </div>
            <div className="detailStat">
              <span>Revenue</span>
              <strong>{formatCurrency(overview?.monetization.revenueLast30dCents ?? null)}</strong>
            </div>
            <div className="detailStat">
              <span>AdSense</span>
              <strong>{adsState}</strong>
            </div>
          </div>
          <div className="statusLine paddedInline">
            <span className={`statusDot ${adsState}`} />
            <strong>Ad render light</strong>
            <span>
              {overview?.monetization.adsense.adSlotsDetected ? 'slots detected on page' : 'ads not detected on page'}
            </span>
          </div>
        </div>

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
      </div>

      <div className="split splitWide">
        <div className="panel">
          <div className="panelHeader">
            <h2>Prompt to Edit</h2>
            <span className="muted">Describe the change you want on this selected site.</span>
          </div>
          <div className="commandStack">
            <textarea
              className="input inputTextarea"
              rows={5}
              value={commandText}
              onChange={(event) => setCommandText(event.target.value)}
            />
            <div className="row">
              <button className="btn primary" disabled={busy} onClick={onCommand}>
                Run Prompt
              </button>
              <button
                className="btn"
                disabled={busy}
                onClick={() => setCommandText(`Check adsense visibility and summarize edit surfaces for ${data.site.name}`)}
              >
                Insert Ad Check Prompt
              </button>
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
              <a className="chip" href={`${data.site.url}${route}`} key={route} rel="noreferrer" target="_blank">
                route {route}
              </a>
            ))}
            {surfaces.map((surface) => (
              <a className="chip chipAccent" href={`${data.site.url}${surface}`} key={surface} rel="noreferrer" target="_blank">
                edit {surface}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Monetization and Workspace Settings</h2>
          <span className="muted">Keep site revenue and AdSense configuration visible in the vault.</span>
        </div>
        <div className="settingsGrid">
          <label className="field">
            <span>AdSense Client ID</span>
            <input
              className="input"
              value={form.adsenseClientId}
              onChange={(event) => setForm((current) => ({ ...current, adsenseClientId: event.target.value }))}
              placeholder="ca-pub-xxxxxxxxxxxxxxxx"
            />
          </label>
          <label className="field">
            <span>Revenue Last 30 Days (USD)</span>
            <input
              className="input"
              inputMode="decimal"
              value={form.revenueLast30d}
              onChange={(event) => setForm((current) => ({ ...current, revenueLast30d: event.target.value }))}
              placeholder="0.00"
            />
          </label>
          <label className="field">
            <span>Revenue Source</span>
            <input
              className="input"
              value={form.revenueSource}
              onChange={(event) => setForm((current) => ({ ...current, revenueSource: event.target.value }))}
              placeholder="adsense, stripe, paypal, affiliate"
            />
          </label>
          <label className="field">
            <span>Workspace Path</span>
            <input
              className="input"
              value={form.workspacePath}
              onChange={(event) => setForm((current) => ({ ...current, workspacePath: event.target.value }))}
              placeholder="C:\Workspaces\site-name"
            />
          </label>
          <label className="field fieldSpan">
            <span>Edit Surfaces</span>
            <input
              className="input"
              value={form.editSurfaces}
              onChange={(event) => setForm((current) => ({ ...current, editSurfaces: event.target.value }))}
              placeholder="/, /pricing, /blog, /contact"
            />
          </label>
        </div>
        <div className="row">
          <button className="btn primary" disabled={saving} onClick={onSave}>
            Save Site Settings
          </button>
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
        <pre className="pre">{run ? JSON.stringify(run, null, 2) : 'Run checks or commands to see results.'}</pre>
      </div>
    </div>
  );
}

function formatMetric(value: number | null) {
  if (value == null) return '—';
  return new Intl.NumberFormat('en-US', { notation: value > 999 ? 'compact' : 'standard' }).format(
    value,
  );
}

function formatCurrency(cents: number | null) {
  if (cents == null) return 'Not connected';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
