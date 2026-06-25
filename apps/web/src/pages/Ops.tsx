import { useEffect, useRef, useState } from 'react';
import {
  getCatalog,
  getZoneAnalytics,
  inspectBridge,
  listBridgeSnapshots,
  listZoneSnapshots,
  restartAdsense,
  runNaturalCommand,
  type BridgeSnapshot,
  type CommandResult,
  type Site,
  type ZoneSnapshot,
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

export function Ops() {
  const [sites, setSites] = useState<Site[]>([]);
  const [bridgeSnapshots, setBridgeSnapshots] = useState<BridgeSnapshot[]>([]);
  const [zoneSnapshots, setZoneSnapshots] = useState<ZoneSnapshot[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [commandText, setCommandText] = useState('Show analytics and ad status for 3000 Studios VIP');
  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  const [livePanel, setLivePanel] = useState<Record<string, unknown> | BridgeSnapshot | ZoneSnapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const recognitionRef = useRef<InstanceType<RecognitionCtor> | null>(null);

  async function load() {
    const [catalog, bridges, zones] = await Promise.all([
      getCatalog(),
      listBridgeSnapshots(),
      listZoneSnapshots(),
    ]);
    setSites(catalog.sites);
    setBridgeSnapshots(bridges.snapshots);
    setZoneSnapshots(zones.snapshots);
    setSelectedSiteId((current) => current || catalog.sites[0]?.id || '');
  }

  useEffect(() => {
    void (async () => {
      try {
        await load();
        setErr(null);
      } catch (error) {
        setErr(error instanceof Error ? error.message : 'ops_failed');
      }
    })();
  }, []);

  const selectedSite = sites.find((site) => site.id === selectedSiteId) ?? null;

  const guard = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setErr(null);
    try {
      const result = await fn();
      if (result) setLivePanel(result as Record<string, unknown>);
      await load();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'action_failed');
    } finally {
      setBusy(false);
    }
  };

  const handleInspectBridge = () =>
    selectedSite && guard(() => inspectBridge(selectedSite.bridge_origin || selectedSite.url));
  const handleAnalytics = () =>
    selectedSite?.cloudflare_zone_id && guard(() => getZoneAnalytics(selectedSite.cloudflare_zone_id!));
  const handleAdsenseRestart = () => selectedSite && guard(() => restartAdsense(selectedSite.id));

  const handleCommand = () => {
    if (!commandText.trim()) return;
    void guard(async () => {
      const result = await runNaturalCommand({ siteId: selectedSite?.id ?? null, command: commandText });
      setCommandResult(result);
      return result;
    });
  };

  function handleVoice() {
    const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
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
      if (transcript) setCommandText(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }

  return (
    <div className="cStack">
      {err ? <div className="cError">{err}</div> : null}

      <div className="cPanel">
        <div className="cPanelHead">
          <h2>Command Box</h2>
          <span className="cSub">Target a site, describe the action, run it</span>
        </div>
        <div className="cPanelBody">
          <div className="cFormRow">
            <label className="cField">
              <span>Target site</span>
              <select className="cSelect" value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </label>
            <label className="cField">
              <span>Command</span>
              <input
                className="cInput"
                value={commandText}
                onChange={(e) => setCommandText(e.target.value)}
              />
            </label>
            <div className="cBtnRow">
              <button className="cBtn" type="button" disabled={busy} onClick={handleVoice}>
                {listening ? 'Stop' : 'Voice'}
              </button>
              <button className="cBtn primary" type="button" disabled={busy} onClick={handleCommand}>Run</button>
            </div>
          </div>
          <pre className="cPre cPreSpaced">
            {commandResult ? JSON.stringify(commandResult, null, 2) : 'Awaiting command.'}
          </pre>
        </div>
      </div>

      <div className="cPanel">
        <div className="cPanelHead">
          <h2>Site Actions</h2>
          <span className="cSub">{selectedSite ? selectedSite.name : 'no site targeted'}</span>
        </div>
        <div className="cPanelBody">
          <div className="cTiles">
            <button className="cTile" type="button" disabled={busy || !selectedSite} onClick={() => handleInspectBridge()}>
              <strong>Bridge Inspect</strong>
              <span>Read the ops bridge, endpoint health, and ad-protected selectors.</span>
            </button>
            <button className="cTile" type="button" disabled={busy || !selectedSite?.cloudflare_zone_id} onClick={() => handleAnalytics()}>
              <strong>Cloudflare Analytics</strong>
              <span>Pull live or cached zone metrics for traffic and performance.</span>
            </button>
            <button className="cTile" type="button" disabled={busy || !selectedSite} onClick={() => handleAdsenseRestart()}>
              <strong>AdSense Restart</strong>
              <span>Re-inspect ad slots and trigger deploy recovery when configured.</span>
            </button>
          </div>
        </div>
      </div>

      <div className="cCols">
        <div className="cPanel">
          <div className="cPanelHead"><h2>Bridge Health</h2><span className="cSub">Latest inspections</span></div>
          <div className="cPanelBody flush">
            {bridgeSnapshots.length === 0 ? (
              <div className="cEmpty">No bridge snapshots yet.</div>
            ) : (
              <div className="cRows">
                {bridgeSnapshots.map((s) => {
                  const up = s.page_status != null && s.page_status >= 200 && s.page_status < 400;
                  return (
                    <div className="cRow" key={`${s.origin}-${s.inspected_at}`}>
                      <span className={`cPill ${up ? 'ok' : 'bad'}`}><span className="cDot" />{s.page_status ?? '—'}</span>
                      <div className="cRowMain">
                        <span className="cName">{s.origin}</span>
                        <span className="cMeta">{s.inspected_at}</span>
                      </div>
                      <span className="cSpacer" />
                      <button className="cBtn sm ghost" type="button" onClick={() => setLivePanel(s)}>View</button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="cPanel">
          <div className="cPanelHead"><h2>Zone Analytics Cache</h2><span className="cSub">Captured Cloudflare payloads</span></div>
          <div className="cPanelBody flush">
            {zoneSnapshots.length === 0 ? (
              <div className="cEmpty">No zone snapshots yet.</div>
            ) : (
              <div className="cRows">
                {zoneSnapshots.map((s) => (
                  <div className="cRow" key={`${s.zone_id}-${s.captured_at}`}>
                    <div className="cRowMain">
                      <span className="cName">{s.zone_name}</span>
                      <span className="cMeta">{s.captured_at}</span>
                    </div>
                    <span className="cSpacer" />
                    <button className="cBtn sm ghost" type="button" onClick={() => setLivePanel(s)}>View</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cPanel">
        <div className="cPanelHead"><h2>Live Payload</h2><span className="cSub">Latest analytics, bridge, or command output</span></div>
        <div className="cPanelBody">
          <pre className="cPre">{livePanel ? JSON.stringify(livePanel, null, 2) : 'No live payload selected.'}</pre>
        </div>
      </div>
    </div>
  );
}
