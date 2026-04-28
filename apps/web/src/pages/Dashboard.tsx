import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCatalog,
  getSiteOverview,
  getStats,
  getZoneAnalytics,
  inspectBridge,
  listBridgeSnapshots,
  listZoneSnapshots,
  restartAdsense,
  runNaturalCommand,
  seedNetwork,
  type Site,
  type SiteOverview,
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
  const [overview, setOverview] = useState<SiteOverview[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [commandText, setCommandText] = useState('Show analytics and ad status for 3000 Studios VIP');
  const [commandResult, setCommandResult] = useState<any>(null);
  const [livePanel, setLivePanel] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<RecognitionCtor> | null>(null);

  async function load() {
    const [nextStats, catalog, bridges, zones, siteOverview] = await Promise.all([
      getStats(),
      getCatalog(),
      listBridgeSnapshots(),
      listZoneSnapshots(),
      getSiteOverview(),
    ]);
    setStats(nextStats);
    setSites(catalog.sites);
    setBridgeSnapshots(bridges.snapshots);
    setZoneSnapshots(zones.snapshots);
    setOverview(siteOverview.overview);
    setSelectedSiteId((current) => current || catalog.sites[0]?.id || '');
  }

  useEffect(() => {
    load().catch((error) => setErr(error instanceof Error ? error.message : 'dashboard_failed'));
  }, []);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;
  const selectedOverview = overview.find((entry) => entry.site.id === selectedSiteId) ?? null;
  const selectedSurfaces = selectedSite ? (JSON.parse(selectedSite.edit_surfaces || '[]') as string[]) : [];
  const selectedRoutes = selectedSite ? (JSON.parse(selectedSite.critical_routes || '[]') as string[]) : [];

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

  async function handleAdsenseRestart() {
    if (!selectedSite) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await restartAdsense(selectedSite.id);
      setLivePanel(result);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'adsense_restart_failed');
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
          <h1>One vault for site edits, traffic, monetization, and live production control.</h1>
          <p className="muted">
            This dashboard tracks connected websites, prompt-driven edit commands, Cloudflare
            traffic, AdSense health, deploy actions, and bridge telemetry from one 3000studios.vip
            control plane.
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
            <button className="btn" disabled={busy || !selectedSite} onClick={handleAdsenseRestart}>
              Restart AdSense
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Portfolio Overview</h2>
          <span className="muted">Visitors, monetization, ad visibility, and edit readiness.</span>
        </div>
        <div className="cards siteOverviewGrid">
          {overview.map((entry) => {
            const adsState = entry.monetization.adsense.state;
            return (
              <div key={entry.site.id} className="card overviewCard">
                <div className="cardGlow" />
                <div className="cardInner">
                  <div className="cardTitle">{entry.site.name}</div>
                  <div className="cardMeta">{entry.site.url}</div>
                  <div className="statusLine">
                    <span className={`statusDot ${adsState}`} />
                    <strong>AdSense {adsState}</strong>
                    <span>{entry.traffic.visitors24h ?? '—'} visitors</span>
                  </div>
                  <div className="detailStats compact">
                    <div className="detailStat">
                      <span>Revenue</span>
                      <strong>{formatCurrency(entry.monetization.revenueLast30dCents)}</strong>
                    </div>
                    <div className="detailStat">
                      <span>Pageviews</span>
                      <strong>{formatMetric(entry.traffic.pageviews24h)}</strong>
                    </div>
                    <div className="detailStat">
                      <span>Requests</span>
                      <strong>{formatMetric(entry.traffic.requests24h)}</strong>
                    </div>
                    <div className="detailStat">
                      <span>Edit Paths</span>
                      <strong>{entry.workspace.editSurfaces.length}</strong>
                    </div>
                  </div>
                  <div className="cardActions">
                    <Link to={`/vault/sites/${entry.site.id}`} className="btn sm">
                      Open
                    </Link>
                    <button className="btn sm" onClick={() => setSelectedSiteId(entry.site.id)}>
                      Target
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h2>Command Box</h2>
          <span className="muted">Choose a site, describe the change, and queue the site action.</span>
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
            placeholder="Update homepage hero copy and verify AdSense on VoiceToWebsite"
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

      {selectedSite ? (
        <div className="split splitWide">
          <div className="panel">
            <div className="panelHeader">
              <h2>Site Control</h2>
              <span className="muted">{selectedSite.name}</span>
            </div>
            <div className="controlGrid">
              <button className="controlTile" onClick={handleInspectBridge} type="button">
                <strong>Bridge Inspect</strong>
                <span>Read `#studio-ops-bridge`, endpoint health, and ads-protected selectors.</span>
              </button>
              <button
                className="controlTile"
                disabled={!selectedSite.cloudflare_zone_id}
                onClick={handleAnalytics}
                type="button"
              >
                <strong>Cloudflare Analytics</strong>
                <span>Load cached or live zone metrics for traffic, views, and performance.</span>
              </button>
              <button
                className="controlTile"
                onClick={() => setCommandText(`Run checks on ${selectedSite.name}`)}
                type="button"
              >
                <strong>Health Checks</strong>
                <span>Queue uptime, route, seo, tls, dns, and performance checks.</span>
              </button>
              <button
                className="controlTile"
                onClick={() => setCommandText(`List editor surfaces for ${selectedSite.name}`)}
                type="button"
              >
                <strong>Edit Surfaces</strong>
                <span>Prepare safe review targets for `/dashboard`, `/pricing`, `/blog`, and more.</span>
              </button>
              <button className="controlTile" onClick={handleAdsenseRestart} type="button">
                <strong>AdSense Restart</strong>
                <span>Reinspect the page, check ad slots, and trigger deploy recovery when configured.</span>
              </button>
            </div>
          </div>

          <div className="panel">
            <div className="panelHeader">
              <h2>Selected Site Matrix</h2>
              <span className="muted">Active routes, monetization, and workspace controls.</span>
            </div>
            <div className="detailStats">
              <div className="detailStat">
                <span>Workspace</span>
                <strong>{selectedSite.workspace_key || 'not mapped'}</strong>
              </div>
              <div className="detailStat">
                <span>Zone</span>
                <strong>{selectedSite.cloudflare_zone_name || 'external'}</strong>
              </div>
              <div className="detailStat">
                <span>Bridge</span>
                <strong>{selectedSite.bridge_enabled ? 'enabled' : 'off'}</strong>
              </div>
              <div className="detailStat">
                <span>Visitors</span>
                <strong>{formatMetric(selectedOverview?.traffic.visitors24h ?? null)}</strong>
              </div>
              <div className="detailStat">
                <span>Revenue</span>
                <strong>{formatCurrency(selectedOverview?.monetization.revenueLast30dCents ?? null)}</strong>
              </div>
              <div className="detailStat">
                <span>AdSense</span>
                <strong>{selectedOverview?.monetization.adsense.state ?? 'missing'}</strong>
              </div>
            </div>
            <div className="microList">
              {selectedRoutes.map((route) => (
                <span className="chip" key={route}>
                  route {route}
                </span>
              ))}
              {selectedSurfaces.map((surface) => (
                <span className="chip chipAccent" key={surface}>
                  edit {surface}
                </span>
              ))}
            </div>
            {selectedOverview ? (
              <div className="adsensePanel">
                <div className="statusLine">
                  <span className={`statusDot ${selectedOverview.monetization.adsense.state}`} />
                  <strong>
                    AdSense {selectedOverview.monetization.adsense.state === 'live' ? 'is visible' : 'needs attention'}
                  </strong>
                </div>
                <div className="featureList">
                  <div className="featureLine">
                    <strong>Configured client</strong>
                    <span>{selectedOverview.monetization.adsense.configuredClientId || 'not set'}</span>
                  </div>
                  <div className="featureLine">
                    <strong>Bridge-detected client</strong>
                    <span>{selectedOverview.monetization.adsense.bridgeClientId || 'not detected'}</span>
                  </div>
                  <div className="featureLine">
                    <strong>Slots on page</strong>
                    <span>{selectedOverview.monetization.adsense.adSlotsDetected ? 'detected' : 'not detected'}</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

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

      <div className="split splitWide">
        <div className="panel">
          <div className="panelHeader">
            <h2>Secure Storage</h2>
            <span className="muted">Owner-only encrypted file vault planning surface.</span>
          </div>
          <div className="featureList">
            <div className="featureLine">
              <strong>Status</strong>
              <span>UI ready; production storage binding still requires encrypted object storage configuration.</span>
            </div>
            <div className="featureLine">
              <strong>Scope</strong>
              <span>Intended for owner files, deployment packs, exports, archives, and dashboard evidence.</span>
            </div>
            <div className="featureLine">
              <strong>Next step</strong>
              <span>Bind R2 or equivalent secure store before exposing upload and retrieval controls.</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panelHeader">
            <h2>Private Stream Vault</h2>
            <span className="muted">Protected stream control and archive readiness.</span>
          </div>
          <div className="featureList">
            <div className="featureLine">
              <strong>Status</strong>
              <span>Dashboard placeholder removed from public exposure; stream backend not yet configured.</span>
            </div>
            <div className="featureLine">
              <strong>Required</strong>
              <span>Dedicated ingest, recording storage, and password-gated playback service.</span>
            </div>
            <div className="featureLine">
              <strong>Safe mode</strong>
              <span>No broken stream controls appear until a real recording pipeline exists.</span>
            </div>
          </div>
        </div>
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
