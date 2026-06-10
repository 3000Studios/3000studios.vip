import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteSite, listSites, seedNetwork, upsertSite, type Site } from '../lib/api';

export function Sites() {
  const [sites, setSites] = useState<Site[]>([]);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const l = await listSites();
    setSites(l.sites);
  };

  useEffect(() => {
    void (async () => {
      try {
        await refresh();
        setErr(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'failed');
      }
    })();
  }, []);

  const guard = async (fn: () => Promise<void>) => {
    setErr(null);
    setBusy(true);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'failed');
    } finally {
      setBusy(false);
    }
  };

  const onAdd = () =>
    guard(async () => {
      await upsertSite({ name, url, tags: [] });
      setName('');
      setUrl('');
    });

  const onDelete = (id: string) => guard(() => deleteSite(id).then(() => undefined));

  return (
    <div className="cStack">
      {err ? <div className="cError">{err}</div> : null}

      <div className="cPanel">
        <div className="cPanelHead">
          <h2>Add a Site</h2>
          <span className="cSub">Register any URL to begin monitoring</span>
          <span className="cSpacer" />
          <button className="cBtn sm" type="button" disabled={busy} onClick={() => guard(() => seedNetwork().then(() => undefined))}>
            Sync Network
          </button>
        </div>
        <div className="cPanelBody">
          <div className="cFormRow">
            <label className="cField">
              <span>Site name</span>
              <input className="cInput" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Project" />
            </label>
            <label className="cField">
              <span>URL</span>
              <input className="cInput" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
            </label>
            <button className="cBtn primary" type="button" disabled={busy || !name || !url} onClick={onAdd}>Add Site</button>
          </div>
        </div>
      </div>

      <div className="cPanel">
        <div className="cPanelHead">
          <h2>Portfolio</h2>
          <span className="cSub">{sites.length} site{sites.length === 1 ? '' : 's'} under watch</span>
        </div>
        <div className="cPanelBody flush">
          {sites.length === 0 ? (
            <div className="cEmpty">No sites yet. Add one above or sync your network.</div>
          ) : (
            <table className="cTable">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Platform</th>
                  <th>Cloudflare Zone</th>
                  <th>Bridge</th>
                  <th className="cRight">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sites.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="cName">{s.name}</div>
                      <a className="cUrl" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
                    </td>
                    <td><span className="cTag">{s.platform}</span></td>
                    <td className="cMuted">{s.cloudflare_zone_name || '—'}</td>
                    <td>
                      {s.bridge_enabled ? (
                        <span className="cPill ok"><span className="cDot" />enabled</span>
                      ) : (
                        <span className="cPill"><span className="cDot" />off</span>
                      )}
                    </td>
                    <td className="cRight">
                      <div className="cBtnRow end">
                        <Link to={`/vault/sites/${s.id}`} className="cBtn sm ghost">Open</Link>
                        <button className="cBtn sm danger" type="button" disabled={busy} onClick={() => onDelete(s.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
