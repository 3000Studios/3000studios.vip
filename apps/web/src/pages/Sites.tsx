import { useEffect, useState } from 'react';
import { deleteSite, listSites, upsertSite } from '../lib/api';
import { Link } from 'react-router-dom';

export function Sites() {
  const [sites, setSites] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const l = await listSites();
    setSites(l.sites);
  };

  useEffect(() => {
    refresh().catch((e) => setErr(e instanceof Error ? e.message : 'failed'));
  }, []);

  const onAdd = async () => {
    setErr(null);
    setBusy(true);
    try {
      await upsertSite({ name, url, tags: [] });
      setName('');
      setUrl('');
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    setErr(null);
    setBusy(true);
    try {
      await deleteSite(id);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid">
      <div className="panel">
        <div className="panelHeader">
          <h2>Sites</h2>
          <span className="muted">Add, watch, and self-heal.</span>
        </div>
        {err ? <div className="errorBox">{err}</div> : null}

        <div className="formRow">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Site name"
          />
          <input
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
          <button className="btn primary" disabled={busy || !name || !url} onClick={onAdd}>
            Add
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Portfolio List</h2>
          <span className="muted">{sites.length} total</span>
        </div>
        <div className="cards">
          {sites.map((s) => (
            <div key={s.id} className="card">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">{s.name}</div>
                <div className="cardMeta">{s.url}</div>
                <div className="cardActions">
                  <Link to={`/vault/sites/${s.id}`} className="btn sm">
                    Open
                  </Link>
                  <button className="btn sm danger" disabled={busy} onClick={() => onDelete(s.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {sites.length === 0 ? (
            <div className="card empty">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">Empty</div>
                <div className="cardMeta">Add a site above to begin monitoring.</div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
