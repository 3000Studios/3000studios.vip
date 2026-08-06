import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';

const concepts = [
  {
    name: 'Broadcast Command',
    tagline: 'A phone-first live control room with clear platform toggles.',
    palette: 'Signal red, graphite, electric blue',
    motion: 'Pulsing live rails, animated routing lines, responsive camera preview',
    focus: 'Go live, choose destinations, confirm public playback',
    platforms: ['Site', 'Twitch', 'YouTube', 'Facebook', 'Spotify'],
  },
  {
    name: 'Neon Music Vault',
    tagline: 'A premium catalog homepage where albums, streams, and drops feel collectible.',
    palette: 'Black glass, chrome green, gold accents',
    motion: '3D cover flow, audio-reactive spectrum, swipeable release stack',
    focus: 'Featured track, music discovery, licensing and purchase paths',
    platforms: ['Music', 'Videos', 'Sponsors', 'Requests', 'Blog'],
  },
  {
    name: 'Stage Portal',
    tagline: 'A cinematic live venue that opens directly into the current show.',
    palette: 'Deep black, warm spotlights, cobalt haze',
    motion: 'Moving lights, fog depth, floating show cards',
    focus: 'Live player first, next event, sponsor placement',
    platforms: ['Live', 'Replay', 'Chat', 'Tip', 'Subscribe'],
  },
  {
    name: 'Creator Console',
    tagline: 'A dashboard-led site that makes 3000 Studios feel like a media network.',
    palette: 'Charcoal, lime status, platinum UI',
    motion: 'Status meters, route animations, sliding drawer controls',
    focus: 'Owner operations, multistream setup, analytics, AdSense health',
    platforms: ['Cloudflare', 'OBS', 'Twitch', 'YouTube', 'Meta'],
  },
  {
    name: 'Street Premiere',
    tagline: 'A bold release-party layout for videos, hooks, merch, and sponsor moments.',
    palette: 'Concrete gray, flash white, caution gold',
    motion: 'Poster flips, beat cuts, kinetic type',
    focus: 'New release launch, music video premiere, shareable clips',
    platforms: ['Premiere', 'Clips', 'Merch', 'Sponsors', 'Press'],
  },
  {
    name: 'VIP Magazine',
    tagline: 'An AdSense-ready editorial system wrapped around music and streaming.',
    palette: 'Ink black, ivory, refined gold',
    motion: 'Smooth article reveals, magnetic media modules, subtle parallax',
    focus: 'Helpful content, artist story, articles, legal pages, ad slots',
    platforms: ['Articles', 'Guides', 'Reviews', 'About', 'Contact'],
  },
  {
    name: 'Cosmic Mixer',
    tagline: 'An interactive sound-reactive universe for mobile listeners.',
    palette: 'Cosmic teal, hot magenta, solar yellow',
    motion: 'Orbiting tracks, touch-responsive particles, audio waves',
    focus: 'Swipe songs, request ideas, fan interaction',
    platforms: ['Player', 'Requests', 'Chat', 'Drops', 'Playlist'],
  },
  {
    name: 'Sponsor Studio',
    tagline: 'A polished business-facing front door for brand deals and media packages.',
    palette: 'Midnight, emerald, clean white',
    motion: 'Package comparisons, proof ribbons, animated sponsor inventory',
    focus: 'Sponsorships, bookings, placements, conversion forms',
    platforms: ['Packages', 'Inventory', 'Rates', 'Contact', 'Proof'],
  },
  {
    name: 'Mobile Live Deck',
    tagline: 'A one-handed phone dashboard for going live and monitoring every destination.',
    palette: 'OLED black, live red, sky blue, success green',
    motion: 'Thumb-friendly toggles, swipe sheets, live health pulses',
    focus: 'Phone streaming, platform checkboxes, stream health, quick recovery',
    platforms: ['On Site', 'Twitch', 'YouTube', 'Facebook', 'Podcast'],
  },
];

export function ConceptBoard() {
  return (
    <PublicLayout variant="electric">
      <main className="conceptPage">
        <section className="conceptHero">
          <div>
            <span className="vipKicker">Flagship redesign concepts</span>
            <h1>Choose the visual system before replacing the site.</h1>
            <p>
              Nine directions for a mobile-first 3000 Studios flagship: stronger animation, unified
              styling, featured music, live streaming, multistream controls, sponsor paths, and
              AdSense-ready content structure.
            </p>
          </div>
          <div className="conceptHeroPanel" aria-label="Live dashboard concept preview">
            <span>Owner dashboard target</span>
            <strong>One tap Go Live</strong>
            <div className="destinationChecks" aria-label="Platform destination examples">
              {['3000studios.vip', 'Twitch', 'YouTube', 'Facebook', 'Spotify'].map((item, index) => (
                <label key={item}>
                  <input type="checkbox" defaultChecked={index < 2} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <small>
              Final build can store OAuth/API connection states, but each platform still needs its
              real app credentials and streaming permissions.
            </small>
          </div>
        </section>

        <section className="conceptGrid" aria-label="Nine 3000 Studios redesign concepts">
          {concepts.map((concept, index) => (
            <article className={`conceptCard conceptCard-${index + 1}`} key={concept.name}>
              <div className="conceptArt" aria-hidden="true">
                <span className="orb one" />
                <span className="orb two" />
                <span className="orb three" />
                <div className="phoneMock">
                  <div className="miniTop" />
                  <div className="miniStage" />
                  <div className="miniRows">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
                <div className="waveStack">
                  <b />
                  <b />
                  <b />
                  <b />
                </div>
              </div>
              <div className="conceptCopy">
                <span className="conceptNumber">{String(index + 1).padStart(2, '0')}</span>
                <h2>{concept.name}</h2>
                <p>{concept.tagline}</p>
                <dl>
                  <div>
                    <dt>Palette</dt>
                    <dd>{concept.palette}</dd>
                  </div>
                  <div>
                    <dt>Motion</dt>
                    <dd>{concept.motion}</dd>
                  </div>
                  <div>
                    <dt>Homepage job</dt>
                    <dd>{concept.focus}</dd>
                  </div>
                </dl>
                <div className="platformChips">
                  {concept.platforms.map((platform) => (
                    <span key={platform}>{platform}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="conceptBuildNotes">
          <h2>What I would build after you pick a direction</h2>
          <div className="buildNoteGrid">
            <div>
              <strong>Public flagship</strong>
              <p>Replace the homepage with the chosen concept, featuring music, video, live player, articles, sponsors, and clean legal/navigation paths.</p>
            </div>
            <div>
              <strong>Owner live deck</strong>
              <p>Add a dashboard destination checklist for 3000studios.vip, Twitch, YouTube, Facebook, and podcast workflows, backed by real connection status.</p>
            </div>
            <div>
              <strong>AdSense readiness</strong>
              <p>Keep privacy, terms, cookies, contact, useful editorial content, and responsive ad slots ready without fake approval claims.</p>
            </div>
          </div>
          <Link className="studioButton primary" to="/">
            Back to current site
          </Link>
        </section>
      </main>
    </PublicLayout>
  );
}
