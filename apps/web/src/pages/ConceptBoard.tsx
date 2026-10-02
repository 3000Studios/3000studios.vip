import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import '../v2/concept-board.css';

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
  {
    name: '3000 Promo',
    tagline: 'Suno to DistroKid to official TikTok draft or Direct Post. Caption from lyrics JSON. No fake views.',
    palette: 'Deep black, gold #D4AF37, purple neon',
    motion: 'Queue pulse, caption preview, post-now confirm lock',
    focus: '9:16 shorts from the music pipeline, inbox draft until audited, post only after confirm',
    platforms: ['TikTok', 'Suno', 'DistroKid', 'YouTube', 'Pipeline'],
  },
];

export function ConceptBoard() {
  return (
    <PublicLayoutV2 wallpaper="grid">
      <section className="v2-section">
        <div className="v2-wrap">
          <div className="v2-concept-hero">
            <div>
              <Reveal>
                <span className="v2-kicker">Flagship redesign concepts</span>
              </Reveal>
              <Reveal delay={0.08}>
                <h1 className="v2-display">
                  Choose the visual system <span className="v2-grad-text">before replacing the site.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="v2-lede" style={{ marginTop: 16 }}>
                  Ten directions for a mobile-first 3000 Studios flagship: stronger
                  animation, unified styling, featured music, live streaming, multistream
                  controls, sponsor paths, AdSense-ready content, and the Suno /
                  DistroKid / TikTok promo publisher.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <div className="v2-card v2-concept-panel" aria-label="Live dashboard concept preview">
                <span>Owner dashboard target</span>
                <strong>One tap Go Live</strong>
                <div className="v2-concept-checks" aria-label="Platform destination examples">
                  {['3000studios.vip', 'Twitch', 'YouTube', 'TikTok', 'Spotify'].map((item, index) => (
                    <label key={item}>
                      <input type="checkbox" defaultChecked={index < 3} />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
                <small>
                  Final build can store OAuth/API connection states, but each platform still
                  needs its real app credentials and streaming permissions. TikTok uses the
                  official Content Posting API only.
                </small>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <RevealGroup className="v2-grid-2">
            {concepts.map((concept, index) => (
              <RevealItem key={concept.name}>
                <article className="v2-card v2-card--lift" aria-label={`Concept: ${concept.name}`}>
                  <div className="v2-concept-art" aria-hidden="true">
                    <span className="v2-concept-orb one" />
                    <span className="v2-concept-orb two" />
                    <span className="v2-concept-orb three" />
                    <div className="v2-concept-phone">
                      <div className="v2-concept-mini-stage" />
                      <div className="v2-concept-mini-row" />
                      <div className="v2-concept-mini-row" />
                      <div className="v2-concept-mini-row" />
                    </div>
                  </div>
                  <div className="v2-concept-copy">
                    <span className="v2-concept-number">{String(index + 1).padStart(2, '0')}</span>
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
                    <div className="v2-concept-platforms">
                      {concept.platforms.map((platform) => (
                        <span key={platform} className="v2-chip">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap">
          <div className="v2-sec-head">
            <h2 className="v2-sec-title">What I would build after you pick a direction</h2>
          </div>
          <RevealGroup className="v2-grid-2">
            <RevealItem>
              <div className="v2-card" style={{ padding: 24, height: '100%' }}>
                <strong style={{ color: 'var(--v2-neon)', fontSize: 16 }}>Public flagship</strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
                  Replace the homepage with the chosen concept, featuring music, video, live
                  player, articles, sponsors, and clean legal/navigation paths.
                </p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="v2-card" style={{ padding: 24, height: '100%' }}>
                <strong style={{ color: 'var(--v2-neon)', fontSize: 16 }}>Owner live deck</strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
                  Add a dashboard destination checklist for 3000studios.vip, Twitch, YouTube,
                  Facebook, TikTok, and podcast workflows, backed by real connection status.
                </p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="v2-card" style={{ padding: 24, height: '100%' }}>
                <strong style={{ color: 'var(--v2-neon)', fontSize: 16 }}>AdSense readiness</strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
                  Keep privacy, terms, cookies, contact, useful editorial content, and
                  responsive ad slots ready without fake approval claims.
                </p>
              </div>
            </RevealItem>
            <RevealItem>
              <div className="v2-card" style={{ padding: 24, height: '100%' }}>
                <strong style={{ color: 'var(--v2-neon)', fontSize: 16 }}>3000 Promo</strong>
                <p style={{ color: 'var(--v2-muted)', fontSize: 14, lineHeight: 1.6, margin: '8px 0 0' }}>
                  Official TikTok Content Posting API publisher hooked to the Suno / DistroKid
                  pipeline. Watches 08-Social-Shorts and lyrics JSON, queues a caption,
                  inbox-draft by default, publishes only after an explicit post now. No fake
                  likes or follow bots. App code: tools/3000-promo. Developer portal:
                  developers.tiktok.com.
                </p>
              </div>
            </RevealItem>
          </RevealGroup>
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link className="v2-btn v2-btn--ghost" to="/">
              <ArrowLeft size={18} weight="bold" />
              Back to current site
            </Link>
          </div>
        </div>
      </section>
    </PublicLayoutV2>
  );
}
