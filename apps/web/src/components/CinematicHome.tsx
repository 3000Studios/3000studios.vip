import { Link } from 'react-router-dom';
import { officialReleaseVideos, youtubeArtworkUrl, youtubeWatchUrl } from '../data/officialReleases';
import { rolloutSongs } from '../data/music';
import { PublicLayout } from '../pages/Home';
import { PLATFORMS } from '../lib/commerce';

const featured = officialReleaseVideos[0];
const INTRO = '/media/spotify-signing.mp4';

export function CinematicHome() {
  const startSample = (slug: string, src: string, title: string) => {
    window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title, slug } }));
  };

  const marquee = [...officialReleaseVideos, ...officialReleaseVideos].map((v) => v.title).join('  ·  ');

  return (
    <PublicLayout variant="spiral">
      <main className="cinePage">
        <section className="cineHero" aria-label="Premiere">
          <video className="cineHeroVideo" src={INTRO} autoPlay muted loop playsInline preload="metadata" />
          <div className="cineHeroShade" />
          <div className="cineHeroCopy">
            <p className="cineKicker">Official artist · DistroKid · Free to stream</p>
            <h1 className="cineTitle">3000 Studios</h1>
            <p>Cinematic music, official videos, and a live stage. Every track plays in full — no paywall, no sample cut.</p>
            <div className="heroActions">
              <a className="studioButton ytCta" href="https://www.youtube.com/@3000Studio?sub_confirmation=1" target="_blank" rel="noreferrer">
                Subscribe
              </a>
              <a className="studioButton secondary" href={youtubeWatchUrl(featured.videoId)} target="_blank" rel="noreferrer">
                Watch {featured.title}
              </a>
              <Link className="studioButton ghost" to="/live">
                Live stage
              </Link>
              <Link className="studioButton ghost" to="/music">
                Music deck
              </Link>
            </div>
          </div>
        </section>

        <div className="cineMarquee" aria-hidden="true">
          <div className="cineMarqueeTrack">
            <span>{marquee}</span>
            <span>{marquee}</span>
          </div>
        </div>

        <section className="cinePortals" aria-label="Enter">
          <Link className="cinePortal" to="/live">
            <small>Broadcast</small>
            <strong>Live stream</strong>
            <span>Standby until the host is on air.</span>
          </Link>
          <Link className="cinePortal" to="/music">
            <small>Vault</small>
            <strong>Coverflow deck</strong>
            <span>Official cards. You start the music.</span>
          </Link>
          <Link className="cinePortal" to="/shop">
            <small>Merch</small>
            <strong>Shop</strong>
            <span>Hoodies, tees, and studio marks.</span>
          </Link>
          <Link className="cinePortal" to="/video">
            <small>Picture</small>
            <strong>Official videos</strong>
            <span>DistroKid-clean YouTube shelf.</span>
          </Link>
        </section>

        <section aria-label="Official reel">
          <div className="discoverHead">
            <h2>Official reel</h2>
            <Link to="/video">All videos</Link>
          </div>
          <div className="cineReel">
            {officialReleaseVideos.map((video) => (
              <a key={video.videoId} href={youtubeWatchUrl(video.videoId)} target="_blank" rel="noreferrer">
                <img src={youtubeArtworkUrl(video.videoId)} alt="" />
                <figcaption>
                  <small>{video.release}</small>
                  <strong>{video.title}</strong>
                </figcaption>
              </a>
            ))}
          </div>
        </section>

        <section aria-label="Play the catalog">
          <div className="discoverHead">
            <h2>Play free</h2>
            <Link to="/music">Open deck</Link>
          </div>
          <div className="sampleList">
            {rolloutSongs.slice(0, 16).map((song) => (
              <article className="sampleRow" key={song.slug}>
                <img src={song.cover} alt="" />
                <div>
                  <strong>{song.title}</strong>
                  <small>Full stream · free</small>
                </div>
                <button type="button" onClick={() => startSample(song.slug, song.src, song.title)}>
                  Play
                </button>
              </article>
            ))}
          </div>
        </section>

        <section aria-label="Platforms">
          <div className="discoverHead">
            <h2>All platforms</h2>
          </div>
          <div className="platformTiles">
            {PLATFORMS.map((p) =>
              p.id === 'games' ? (
                <a key={p.id} className="platformTile gamesTile" href={p.url} target="_blank" rel="noreferrer">
                  <strong>Games</strong>
                  <span>getnexa.space</span>
                </a>
              ) : (
                <a key={p.id} className="platformTile" href={p.url} target={p.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <strong>{p.label}</strong>
                  <span>Open</span>
                </a>
              ),
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
