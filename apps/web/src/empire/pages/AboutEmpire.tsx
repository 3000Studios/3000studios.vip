import { YoutubeLogo, InstagramLogo, TiktokLogo, SpotifyLogo, AppleLogo } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Stat, Go } from '../kit';
import { SPOTIFY_ARTIST, APPLE_ARTIST, YOUTUBE_CHANNEL } from '../swatch';
import { publishedSongs } from '../../data/publishedSongs';
import { PODCAST_EPISODES } from '../../data/podcastEpisodes';
import { STORE_BOOKS } from '../../data/storeBooks';
import { AERO_BOSSES } from '../../data/aeropocalypse';
import { STUDIO_APPS } from '../../data/appsData';

const SONG_COUNT = new Set(publishedSongs.map((s) => s.slug)).size;

const SOCIALS = [
  { name: 'YouTube', url: YOUTUBE_CHANNEL, Icon: YoutubeLogo },
  { name: 'Instagram', url: 'https://www.instagram.com/3000studios.vip', Icon: InstagramLogo },
  { name: 'TikTok', url: 'https://www.tiktok.com/@3000studios.vip', Icon: TiktokLogo },
  { name: 'Spotify', url: SPOTIFY_ARTIST, Icon: SpotifyLogo },
  { name: 'Apple Music', url: APPLE_ARTIST, Icon: AppleLogo },
];

const DIVISIONS: [string, string, string][] = [
  ['Music', `${SONG_COUNT} songs on every platform`, '/music'],
  ['Podcast', `Follow and Subscribe, ${PODCAST_EPISODES.length} episodes`, '/podcast'],
  ['Press', `${STORE_BOOKS.length} books in the studio store`, '/books'],
  ['Games', `Aeropocalypse: Online, ${AERO_BOSSES.length} bosses, on Google Play`, '/aeropocalypse'],
  ['Software', `${STUDIO_APPS.length} apps in the lab`, '/apps'],
  ['Live', 'Live Command broadcast deck', '/live'],
];

export function AboutEmpire() {
  return (
    <EmpirePage>
      <PageHero
        eyebrow="About 3000 Studios"
        title={
          <>
            Built
            <br />
            different
          </>
        }
        lead="Independent music production, cinematic video, games and creator media, from Acworth, Georgia to every screen on earth."
        orb="rgba(242,200,103,.42)"
      >
        <div className="ep-stats">
          <Stat value={SONG_COUNT} label="Released tracks" />
          <Stat value={PODCAST_EPISODES.length} label="Podcast episodes" tone="violet" />
          <Stat value={STORE_BOOKS.length} label="Books in store" tone="cyan" />
          <Stat value={AERO_BOSSES.length} label="Game bosses" tone="ember" />
        </div>
      </PageHero>
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid ep-g2" style={{ alignItems: 'start' }}>
          <div className="ep-glass ep-gilt ep-card" style={{ padding: 30 }}>
            <span className="em-kicker">The founder</span>
            <h3 style={{ fontSize: 40 }}>Jeremy Swain</h3>
            <p>
              Founded 3000 Studios as an independent label and creator media brand. Every release begins in the studio:
              original songwriting, AI production assistance, then human arrangement, vocals, mixing and mastering.
            </p>
            <p>
              The catalog is distributed through DistroKid. Songs play as one-minute previews here, full tracks live on the
              streaming platforms, and the official videos play free on YouTube.
            </p>
            <div className="ep-ctas">
              {SOCIALS.map(({ name, url, Icon }) => (
                <a key={name} className="ep-mini" href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name}>
                  <Icon size={18} weight="fill" />
                </a>
              ))}
            </div>
          </div>
          <div className="ep-glass ep-tracks">
            {DIVISIONS.map(([name, sub, to], i) => (
              <div key={name} className="ep-trk" style={{ gridTemplateColumns: '40px minmax(0,1fr) auto' }}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span style={{ minWidth: 0 }}>
                  <b>{name}</b> <span className="ep-dim">· {sub}</span>
                </span>
                <Go to={to}>Open</Go>
              </div>
            ))}
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
