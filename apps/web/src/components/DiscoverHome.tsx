import { Link } from 'react-router-dom';
import { officialReleaseVideos, youtubeWatchUrl } from '../data/officialReleases';
import { rolloutSongs } from '../data/music';
import { PublicLayout } from '../pages/Home';
import { VideoWallpaperCard } from './VideoWallpaperCard';
import {
  PLATFORMS,
  SAMPLE_SECONDS,
  TRACK_PRICE_CENTS,
  MONTHLY_PRICE_CENTS,
  YEARLY_PRICE_CENTS,
  formatMoney,
  grantPlan,
  grantTrack,
  hasFullAccess,
} from '../lib/commerce';
import '../styles/discover.css';

const featured = officialReleaseVideos[0];
const stories = [
  { id: featured.videoId, label: 'Live drop', to: '/live' },
  { id: officialReleaseVideos[1]?.videoId || featured.videoId, label: 'New video', to: '/video' },
  { id: officialReleaseVideos[2]?.videoId || featured.videoId, label: 'Behind beat', to: '/music' },
  { id: officialReleaseVideos[3]?.videoId || featured.videoId, label: 'Merch', to: '/shop' },
  { id: officialReleaseVideos[4]?.videoId || featured.videoId, label: 'Games', href: 'https://getnexa.space' },
];

export function DiscoverHome() {
  const startSample = (slug: string, src: string, title: string) => {
    window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title, slug } }));
  };

  return (
    <PublicLayout variant="spiral">
      <main className="discoverPage">
        <section className="discoverStories" aria-label="Quick lanes">
          {stories.map((story) =>
            story.href ? (
              <a key={story.label} className="storyBubble" href={story.href} target="_blank" rel="noreferrer">
                <img src={`https://i.ytimg.com/vi/${story.id}/mqdefault.jpg`} alt="" />
                <span>{story.label}</span>
              </a>
            ) : (
              <Link key={story.label} className="storyBubble" to={story.to || '/'}>
                <img src={`https://i.ytimg.com/vi/${story.id}/mqdefault.jpg`} alt="" />
                <span>{story.label}</span>
              </Link>
            ),
          )}
        </section>
        <VideoWallpaperCard className="discoverHero" videoId={featured.videoId} kicker="Featured official video" title="Watch the videos. Own the drop." href={youtubeWatchUrl(featured.videoId)}>
          <p>{featured.title} · sample {SAMPLE_SECONDS}s free · full track {formatMoney(TRACK_PRICE_CENTS)}</p>
          <div className="discoverHeroActions">
            <Link className="pill" to="/video">Watch</Link>
            <Link className="pill gold" to="/shop">Shop</Link>
          </div>
        </VideoWallpaperCard>
        <section className="discoverUnlock">
          <h2>Samples only until you unlock</h2>
          <p>Every song plays a {SAMPLE_SECONDS}-second preview. Buy one track for {formatMoney(TRACK_PRICE_CENTS)}, or unlock the whole vault.</p>
          <div className="unlockRow">
            <Link className="studioButton" to="/shop" onClick={() => grantPlan('monthly')}>{formatMoney(MONTHLY_PRICE_CENTS)} / month</Link>
            <Link className="studioButton secondary" to="/shop" onClick={() => grantPlan('yearly')}>{formatMoney(YEARLY_PRICE_CENTS)} / year</Link>
          </div>
        </section>
        <section className="discoverGrid" aria-label="Official videos">
          <div className="discoverHead"><h2>Official videos</h2><Link to="/video">All videos</Link></div>
          <div className="vwGrid">
            {officialReleaseVideos.map((video) => (
              <VideoWallpaperCard key={video.videoId} videoId={video.videoId} kicker={video.release} title={video.title} href={youtubeWatchUrl(video.videoId)}>
                <small>{video.duration}</small>
              </VideoWallpaperCard>
            ))}
          </div>
        </section>
        <section className="discoverGrid" aria-label="Music samples">
          <div className="discoverHead"><h2>Music samples</h2><Link to="/music">Open deck</Link></div>
          <div className="sampleList">
            {rolloutSongs.slice(0, 18).map((song) => {
              const unlocked = hasFullAccess(song.slug);
              return (
                <article className="sampleRow" key={song.slug}>
                  <img src={song.cover} alt="" />
                  <div>
                    <strong>{song.title}</strong>
                    <small>{unlocked ? 'Full track unlocked' : `${SAMPLE_SECONDS}s sample`}</small>
                  </div>
                  <button type="button" onClick={() => startSample(song.slug, song.src, song.title)}>Play</button>
                  {!unlocked ? (
                    <Link className="buyBtn" to="/shop" onClick={() => grantTrack(song.slug)}>{formatMoney(TRACK_PRICE_CENTS)}</Link>
                  ) : (
                    <span className="owned">Owned</span>
                  )}
                </article>
              );
            })}
          </div>
        </section>
        <section className="discoverGrid" aria-label="Platforms">
          <div className="discoverHead"><h2>All platforms</h2></div>
          <div className="platformTiles">
            {PLATFORMS.map((p) =>
              p.id === 'games' ? (
                <a key={p.id} className="platformTile gamesTile" href={p.url} target="_blank" rel="noreferrer"><strong>Games</strong><span>getnexa.space</span></a>
              ) : (
                <a key={p.id} className="platformTile" href={p.url} target={p.url.startsWith('http') ? '_blank' : undefined} rel="noreferrer"><strong>{p.label}</strong><span>Open</span></a>
              ),
            )}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
