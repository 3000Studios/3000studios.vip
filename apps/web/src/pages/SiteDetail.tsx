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

