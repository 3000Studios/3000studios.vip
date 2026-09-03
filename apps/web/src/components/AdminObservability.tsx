import { useEffect, useState } from 'react';
import { officialReleaseVideos } from '../data/officialReleases';
import { rolloutSongs } from '../data/music';
import { PLATFORMS, readEntitlement, readOpsEvents, grantPlan } from '../lib/commerce';

type AdSenseReport = {
  ok: boolean;
  publisher: string;
  homeSlotConfigured: boolean;
  notes: string[];
  checklist: { adsTxt: boolean; privacyPolicy: boolean; scriptTag: boolean; displaySlot: boolean };
};

export function AdminObservability() {
  const [ads, setAds] = useState<AdSenseReport | null>(null);
  const [live, setLive] = useState<{ live?: boolean; ts?: number } | null>(null);
  const [adsTxt, setAdsTxt] = useState('');
  const ent = readEntitlement();
  const events = readOpsEvents();

  useEffect(() => {
    void fetch('/api/adsense-status').then((r) => r.json()).then(setAds).catch(() => setAds(null));
    void fetch('/api/live-flag').then((r) => r.json()).then(setLive).catch(() => setLive(null));
    void fetch('/ads.txt').then((r) => r.text()).then(setAdsTxt).catch(() => setAdsTxt('missing'));
  }, []);

  const slotOk = Boolean(ads?.checklist.displaySlot);
  const txtOk = adsTxt.includes('pub-5800977493749262');

  return (
    <section className="cPanel">
      <div className="cPanelHead">
        <h2>Observability</h2>
        <span className="cSub">Catalog, platforms, money, AdSense</span>
      </div>
      <div className="cPanelBody adminObs">
        <div className="adminObsGrid">
          <div className={`adminObsCard ${live?.live ? 'ok' : 'warn'}`}>
            <strong>Live flag</strong>
            <p>{live?.live ? 'ON AIR' : 'offline'} · /api/live-flag</p>
          </div>
          <div className="adminObsCard ok">
            <strong>Catalog</strong>
            <p>{officialReleaseVideos.length} official videos · {rolloutSongs.length} audio tracks</p>
          </div>
          <div className={`adminObsCard ${txtOk ? 'ok' : 'bad'}`}>
            <strong>ads.txt</strong>
            <p>{txtOk ? 'Live and matching pub-5800977493749262' : 'Missing or wrong'}</p>
          </div>
          <div className={`adminObsCard ${slotOk ? 'ok' : 'warn'}`}>
            <strong>AdSense units</strong>
            <p>{slotOk ? 'Home slot configured' : 'No display slot env — ads will not fill'}</p>
          </div>
        </div>
        <p className="cMuted">Publisher {ads?.publisher || 'ca-pub-5800977493749262'}. Script is in index.html. Empty VITE_ADSENSE_HOME_SLOT is why units do not appear.</p>
        <ul className="cMuted">
          {(ads?.notes || []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="cMuted">Platforms: {PLATFORMS.map((p) => p.label).join(' · ')}</p>
        <p className="cMuted">Local entitlement: {ent.plan} · tracks {ent.tracks.length}</p>
        <button type="button" className="cBtn sm ghost" onClick={() => grantPlan('admin')}>Grant this browser full catalog (owner)</button>
        <div>
          <strong>Recent local events</strong>
          <ul className="cMuted">
            {events.slice(0, 8).map((event) => (
              <li key={`${event.type}-${event.ts}`}>{event.type} · {new Date(event.ts).toLocaleString()}</li>
            ))}
            {events.length === 0 ? <li>No checkout events yet</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
