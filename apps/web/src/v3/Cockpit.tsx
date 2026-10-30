import { Link } from 'react-router-dom';
import { publishedSongs } from '../data/publishedSongs';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS } from '../data/videoCatalog';
import { THUNDER_BOSSES } from '../data/thunderDome';

/**
 * COCKPIT HYBRID shell pieces (fast-track 2026-10-29, audit §3.5):
 * boss-dossier hero readout, HUD gauges (counts DERIVED from data at
 * runtime — never hardcoded), a mission-timeline, and the mobile bottom
 * command rail with exactly ONE primary CTA. No WebGL.
 */

function uniqueSongCount(): number {
  return new Set(publishedSongs.map((s) => s.slug)).size;
}

export function CockpitDossier({ live }: { live: boolean }) {
  const songs = uniqueSongCount();
  const gauges = [
    { value: songs, label: 'Official songs', pct: '100%' },
    { value: MUSIC_VIDEOS.length, label: 'Music videos', pct: '92%' },
    { value: THUNDER_BOSSES.length, label: 'Dome bosses', pct: '64%' },
    { value: CINEMATIC_VIDEOS.length, label: 'Cinematics', pct: '78%' },
  ];
  return (
    <section className="ck-dossier" aria-label="Mission dossier">
      <div className="ck-dossier-frame">
        <div className="ck-dossier-kicker">
          <span>◆ Mission dossier — 3000 Studios</span>
          <span className="ck-status">
            {live ? '● Stage live now' : '○ Stage offline — vault open'}
          </span>
          <span>Thunder Dome: closed testing</span>
        </div>
        <h2>
          One cockpit. <em>Every mission.</em>
        </h2>
        <p>
          Music plays as 1-minute previews on this site — full tracks live on
          Apple Music, Spotify, and every major platform. Videos play free via
          YouTube. Thunder Dome: AeroStrike is in closed testing, coming soon.
        </p>
        <div className="ck-gauges" role="list" aria-label="Catalog status">
          {gauges.map((g) => (
            <div
              key={g.label}
              className="ck-gauge"
              role="listitem"
              style={{ '--hud-p': g.pct } as React.CSSProperties}
            >
              <b>{g.value}</b>
              <span>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MISSION_STEPS = [
  {
    n: '01',
    hue: 190,
    title: 'Listen — the Sonic Print catalog',
    body: 'Every song is a poster: cover art, waveform, liner notes. Press play for the 1-minute preview, then take the full track on your platform.',
    state: 'Live now',
    to: '/music',
    cta: 'Open the catalog',
  },
  {
    n: '02',
    hue: 45,
    title: 'Watch — the Video Vault',
    body: 'Official videos and Thunder Dome cinematics, free via YouTube. Tap a poster to play — nothing is locked and nothing is paywalled.',
    state: 'Live now',
    to: '/video',
    cta: 'Open the vault',
  },
  {
    n: '03',
    hue: 265,
    title: 'Thunder Dome — closed testing',
    body: '24 bosses, 24 arenas. AeroStrike is in closed testing on Google Play — public launch is coming soon. Study the boss dossier now.',
    state: 'Coming soon',
    to: '/thunder-dome',
    cta: 'Read the dossier',
  },
  {
    n: '04',
    hue: 320,
    title: 'Own it — merch, beats & passes',
    body: 'Merch, beat licenses, and Vault passes check out in the Shop. The music itself streams free on the platforms — previews play right here.',
    state: 'Live now',
    to: '/shop',
    cta: 'Open the shop',
  },
] as const;

export function MissionTimeline() {
  return (
    <section className="ck-mission" aria-label="Mission timeline">
      <div className="v3-eyebrow">Mission timeline</div>
      <h2 className="v3-h2">
        Run the <em>missions</em> in order
      </h2>
      <ol className="ck-mission-list">
        {MISSION_STEPS.map((s) => (
          <li
            key={s.n}
            className="ck-mission-step"
            style={{ '--threat-hue': s.hue } as React.CSSProperties}
          >
            <span className="ck-step-n">{s.n}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              <span className="ck-step-state">{s.state}</span>{' '}
              <Link
                to={s.to}
                style={{ color: 'var(--ck-gold)', fontWeight: 700, fontSize: 13 }}
              >
                {s.cta} →
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Mobile bottom command rail — exactly ONE primary CTA (audit §3.2). */
export function CommandRail() {
  return (
    <div className="ck-rail" role="region" aria-label="Quick command">
      <div className="ck-rail-note">
        <strong>Start here</strong>
        1-min previews on site · full tracks on all platforms
      </div>
      <Link to="/music">▶ Listen</Link>
    </div>
  );
}
