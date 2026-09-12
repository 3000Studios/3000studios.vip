import { Link } from 'react-router-dom';
import { officialReleaseVideos, youtubeArtworkUrl, youtubeWatchUrl } from '../data/officialReleases';
import { rolloutSongs } from '../data/music';
import { PublicLayout } from '../pages/Home';
import { PLATFORMS } from '../lib/commerce';

const INTRO = '/media/spotify-signing.mp4';

export function CinematicHome() {
  const startSample = (slug: string, src: string, title: string) => {
    window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title, slug } }));
  };

  return (
    <PublicLayout variant="spiral">
      <main className="cinePage">
        <section className="cineHero" aria-label="Premiere">
          <video className="cineHeroVideo" src={INTRO} autoPlay muted loop playsInline preload="metadata" />
          <div className="cineHeroShade" />
          <div className="cineHeroCopy">
            <p className="cineKicker">Official artist · DistroKid · one HyperFollow</p>
            <h1 className="cineTitle">3000 Studios</h1>
            <p>Original music, official videos, and promo Shorts. Stream free here. Stores pay through DistroKid.</p>
            <div className="heroActions">
              <a className="studioButton ytCta" href="https://www.youtube.com/@3000Studio?sub_confirmation=1" target="_blank" rel="noreferrer">
                YouTube
              </a>
              <a className="studioButton secondary" href="https://distrokid.com/hyperfollow/3000studios" target="_blank" rel="noreferrer">
                Listen everywhere
              </a>
              <Link className="studioButton ghost" to="/music">
                Catalog
              </Link>
              <a className="studioButton ghost" href="/tiktok">
                TikTok promo
              </a>
            </div>
          </div>
        </section>

        <section className="cinePortals" aria-label="Enter">
          <Link className="cinePortal" to="/music">
            <small>Listen</small>
            <strong>Catalog</strong>
            <span>Full tracks on this site, free.</span>
          </Link>
          <Link className="cinePortal" to="/video">
            <small>Watch</small>
            <strong>Official videos</strong>
            <span>YouTube MVs and Shorts.</span>
          </Link>
          <a className="cinePortal" href="https://distrokid.com/hyperfollow/3000studios" target="_blank" rel="noreferrer">
            <small>Stores</small>
            <strong>HyperFollow</strong>
            <span>Spotify, Apple, and the rest.</span>
          </a>
          <Link className="cinePortal" to="/live">
            <small>Broadcast</small>
            <strong>Live</strong>
            <span>On air when the host is live.</span>
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
            {rolloutSongs.slice(0, 8).map((song) => (
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
