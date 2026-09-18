import { useEffect, useState } from 'react';
import { officialReleaseVideos } from '../data/officialReleases';
import { rolloutSongs } from '../data/music';
import { PLATFORMS, readEntitlement, readOpsEvents, grantPlan } from '../lib/commerce';
import { readHostLiveFlag } from '../lib/streamScene';
import { adsenseClientId } from '../lib/adsense';

type AdSenseReport = {
  ok: boolean;
  publisher: string;
  homeSlotConfigured: boolean;
  notes: string[];
  checklist: { adsTxt: boolean; privacyPolicy: boolean; scriptTag: boolean; displaySlot: boolean };
};

export function AdminObservability() {
  const [ads, setAds] = useState<AdSenseReport | null>(null);
  const [live, setLive] = useState(() => readHostLiveFlag());
  const [adsTxt, setAdsTxt] = useState('');
  const ent = readEntitlement();
  const events = readOpsEvents();

  useEffect(() => {
    void fetch('/ads.txt')
      .then((r) => r.text())
      .then(setAdsTxt)
      .catch(() => setAdsTxt('missing'));
    void fetch('/api/adsense-status')
      .then((r) =>
        r.ok
          ? (r.json() as Promise<AdSenseReport>)
          : Promise.reject(new Error(`Status ${r.status}`)),
      )
      .then((report) => setAds(report))
      .catch(() => setAds(null));
    const timer = window.setInterval(() => setLive(readHostLiveFlag()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const publisherId = adsenseClientId();
  const slotOk = Boolean(ads?.checklist.displaySlot);
  const txtOk = publisherId ? adsTxt.includes(publisherId.replace('ca-pub-', 'pub-')) : false;

  return (
    <section className="cPanel">
      <div className="cPanelHead">
        <h2>Observability</h2>
        <span className="cSub">Catalog, platforms, money, AdSense</span>
      </div>
      <div className="cPanelBody adminObs">
        <div className="adminObsGrid">
          <div className={`adminObsCard ${live ? 'ok' : 'warn'}`}>
            <strong>Browser broadcast</strong>
            <p>{live ? 'ON AIR' : 'offline'} · Cloudflare lifecycle checks viewers</p>
          </div>
          <div className="adminObsCard ok">
            <strong>Catalog</strong>
            <p>
              {officialReleaseVideos.length} matched official videos · {rolloutSongs.length}{' '}
              verified DistroKid tracks
            </p>
          </div>
          <div className={`adminObsCard ${txtOk ? 'ok' : 'bad'}`}>
            <strong>ads.txt</strong>
            <p>{txtOk ? `Live and matching ${publisherId || 'publisher'}` : 'Missing or wrong'}</p>
          </div>
          <div className={`adminObsCard ${slotOk ? 'ok' : 'warn'}`}>
            <strong>AdSense units</strong>
            <p>{slotOk ? 'Home slot configured' : 'No display slot env — ads will not fill'}</p>
          </div>
        </div>
        <p className="cMuted">
          Publisher {ads?.publisher || publisherId || 'not configured'}. Script is loaded after
          consent. Empty VITE_ADSENSE_HOME_SLOT is why units do not appear.
        </p>
        <ul className="cMuted">
          {(ads?.notes || []).map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p className="cMuted">Platforms: {PLATFORMS.map((p) => p.label).join(' · ')}</p>
        <p className="cMuted">
          Local entitlement: {ent.plan} · tracks {ent.tracks.length}
        </p>
        <button type="button" className="cBtn sm ghost" onClick={() => grantPlan('admin')}>
          Grant this browser full catalog (owner)
        </button>
        <div>
          <strong>Recent local events</strong>
          <ul className="cMuted">
            {events.slice(0, 8).map((event) => (
              <li key={`${event.type}-${event.ts}`}>
                {event.type} · {new Date(event.ts).toLocaleString()}
              </li>
            ))}
            {events.length === 0 ? <li>No checkout events yet</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
