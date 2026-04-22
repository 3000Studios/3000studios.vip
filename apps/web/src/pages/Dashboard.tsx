import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCatalog,
  getStats,
  getZoneAnalytics,
  inspectBridge,
  listBridgeSnapshots,
  listZoneSnapshots,
  runNaturalCommand,
  seedNetwork,
  type Site,
} from '../lib/api';

type RecognitionCtor = new () => {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
};

export function Dashboard() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getStats>> | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [bridgeSnapshots, setBridgeSnapshots] = useState<any[]>([]);
  const [zoneSnapshots, setZoneSnapshots] = useState<any[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [commandText, setCommandText] = useState('Show analytics for 3000 Studios VIP');
  const [commandResult, setCommandResult] = useState<any>(null);
  const [livePanel, setLivePanel] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<RecognitionCtor> | null>(null);

  async function load() {
    const [nextStats, catalog, bridges, zones] = await Promise.all([
      getStats(),
      getCatalog(),
      listBridgeSnapshots(),
      listZoneSnapshots(),
    ]);
    setStats(nextStats);
    setSites(catalog.sites);
    setBridgeSnapshots(bridges.snapshots);
    setZoneSnapshots(zones.snapshots);
    setSelectedSiteId((current) => current || catalog.sites[0]?.id || '');
  }

  useEffect(() => {
    load().catch((error) => setErr(error instanceof Error ? error.message : 'dashboard_failed'));
  }, []);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;

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

  async function handleInspectBridge() {
    if (!selectedSite) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await inspectBridge(selectedSite.bridge_origin || selectedSite.url);
      setLivePanel(result);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'bridge_failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleAnalytics() {
    if (!selectedSite?.cloudflare_zone_id) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await getZoneAnalytics(selectedSite.cloudflare_zone_id);
      setLivePanel(result);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'analytics_failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleCommand() {
    if (!commandText.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await runNaturalCommand({
        siteId: selectedSite?.id ?? null,
        command: commandText,
      });
      setCommandResult(result);
      setLivePanel(result);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'command_failed');
    } finally {
      setBusy(false);
    }
  }

  function handleVoice() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErr('Speech input is not available in this browser.');
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recognition = new SpeechRecognition() as InstanceType<RecognitionCtor>;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript) {
        setCommandText(transcript);
      }
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <div className="grid">
      <div className="hero vaultHero">
        <div className="heroGlow" />
        <div className="heroInner">
          <div className="eyebrow">Super Admin Hub</div>
          <h1>One vault for site status, bridge telemetry, edits, traffic, and control.</h1>
          <p className="muted">
            This dashboard tracks Cloudflare-managed domains, bridge-enabled applications, edit
            surfaces, command runs, and endpoint health from the same control plane.
          </p>
          {err ? <div className="errorBox">{err}</div> : null}
          <div className="kpis">
            <div className="kpi">
              <div className="kpiLabel">Sites</div>
              <div className="kpiValue">{stats?.sites ?? '—'}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Bridge Sites</div>
              <div className="kpiValue">{stats?.bridgeEnabledSites ?? '—'}</div>
            </div>
            <div className="kpi">
              <div className="kpiLabel">Command Runs</div>
              <div className="kpiValue">{stats?.commandRuns ?? '—'}</div>
            </div>
          </div>
          <div className="heroActions">
            <button className="btn primary" disabled={busy} onClick={handleSeed}>
              Sync Workspace Network
            </button>
            <button className="btn" disabled={busy || !selectedSite} onClick={handleInspectBridge}>
              Inspect Site Bridge
            </button>
            <button className="btn" disabled={busy || !selectedSite?.cloudflare_zone_id} onClick={handleAnalytics}>
              Load Cloudflare Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Command Box</h2>
          <span className="muted">Voice or type natural language to drive site actions.</span>
        </div>
        <div className="commandBar">
          <select
            className="input"
            value={selectedSiteId}
            onChange={(event) => setSelectedSiteId(event.target.value)}
          >
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            value={commandText}
            onChange={(event) => setCommandText(event.target.value)}
            placeholder="Run checks on VoiceToWebsite"
          />
          <button className="btn" disabled={busy} onClick={handleVoice}>
            {listening ? 'Stop Mic' : 'Voice'}
          </button>
          <button className="btn primary" disabled={busy} onClick={handleCommand}>
            Run
          </button>
        </div>
        <pre className="pre">{commandResult ? JSON.stringify(commandResult, null, 2) : 'Awaiting command.'}</pre>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Connected Sites</h2>
          <span className="muted">Cloudflare domains, bridge apps, and edit-ready surfaces.</span>
        </div>
        <div className="cards">
          {sites.map((site) => (
            <div key={site.id} className="card">
              <div className="cardGlow" />
              <div className="cardInner">
                <div className="cardTitle">{site.name}</div>
                <div className="cardMeta">{site.url}</div>
                <div className="chipRow">
                  <span className="chip">{site.platform}</span>
                  {site.bridge_enabled ? <span className="chip chipAccent">bridge</span> : null}
                  {site.cloudflare_zone_name ? <span className="chip">{site.cloudflare_zone_name}</span> : null}
                </div>
                <div className="cardActions">
                  <Link to={`/vault/sites/${site.id}`} className="btn sm">
                    Open
                  </Link>
                  <button className="btn sm" onClick={() => setSelectedSiteId(site.id)}>
                    Target
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="split">
        <div className="panel">
          <div className="panelHeader">
            <h2>Bridge Health</h2>
            <span className="muted">
              `#studio-ops-bridge`, `window.__VTW_SITE_BRIDGE__`, protected ad slots, and public endpoints.
            </span>
          </div>
          <div className="snapshotList">
            {bridgeSnapshots.map((snapshot) => (
              <div key={`${snapshot.origin}-${snapshot.inspected_at}`} className="snapshotRow">
                <div>
                  <div className="cardTitle">{snapshot.origin}</div>
                  <div className="cardMeta">
                    {snapshot.page_status ?? '—'} • {snapshot.inspected_at}
                  </div>
                </div>
                <button className="btn sm" onClick={() => setLivePanel(snapshot)}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <h2>Zone Analytics Cache</h2>
            <span className="muted">Latest Cloudflare dashboard payloads captured per zone.</span>
          </div>
          <div className="snapshotList">
            {zoneSnapshots.map((snapshot) => (
              <div key={`${snapshot.zone_id}-${snapshot.captured_at}`} className="snapshotRow">
                <div>
                  <div className="cardTitle">{snapshot.zone_name}</div>
                  <div className="cardMeta">{snapshot.captured_at}</div>
                </div>
                <button className="btn sm" onClick={() => setLivePanel(snapshot)}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Live Payload</h2>
          <span className="muted">Current analytics, bridge, or command output.</span>
        </div>
        <pre className="pre">{livePanel ? JSON.stringify(livePanel, null, 2) : 'No live payload selected.'}</pre>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Edit Surfaces</h2>
          <span className="muted">Review-and-push safe route targets per connected site.</span>
        </div>
        <div className="cards">
          {sites.flatMap((site) => {
            const surfaces = JSON.parse(site.edit_surfaces || '[]') as string[];
            return surfaces.map((surface) => (
              <div key={`${site.id}-${surface}`} className="card">
                <div className="cardGlow" />
                <div className="cardInner">
                  <div className="cardTitle">{surface}</div>
                  <div className="cardMeta">{site.name}</div>
                  <div className="cardActions">
                    <a className="btn sm" href={`${site.url}${surface}`} target="_blank" rel="noreferrer">
                      Review
                    </a>
                    <button
                      className="btn sm"
                      onClick={() =>
                        setCommandText(`List editor surfaces for ${site.name} and prepare safe push review`)
                      }
                    >
                      Queue
                    </button>
                  </div>
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
}
