import { useState, type CSSProperties } from 'react';
import { Play, SpotifyLogo, YoutubeLogo } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head, Ext } from '../kit';
import { PODCAST_EPISODES, PODCAST_SHOW, podcastWatchUrl } from '../../data/podcastEpisodes';

const EPISODES = [...PODCAST_EPISODES].sort((a, b) => b.n - a.n);
const LATEST = EPISODES[0];
const BARS = Array.from({ length: 64 }, (_, i) => 25 + Math.round(Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.4)) * 75));

export function PodcastHub() {
  const [watching, setWatching] = useState(false);
  return (
    <EmpirePage>
      <PageHero
        eyebrow={PODCAST_SHOW.tagline}
        title={
          <>
            Follow and
            <br />
            Subscribe
          </>
        }
        lead={`${PODCAST_EPISODES.length} episodes with hosts Follow and Subscribe: the studio, the music, the books and the game, straight from the source.`}
        orb="rgba(155,107,255,.45)"
      >
        <div className="ep-ctas">
          <Ext href={PODCAST_SHOW.youtubeChannel} gold>
            <YoutubeLogo size={18} weight="fill" /> Watch on YouTube
          </Ext>
          <Ext href={PODCAST_SHOW.spotifyShow}>
            <SpotifyLogo size={18} weight="fill" /> Spotify
          </Ext>
          <Ext href={PODCAST_SHOW.substack}>Substack</Ext>
        </div>
      </PageHero>

      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap" style={{ display: 'grid', gap: 22 }}>
          <div className="ep-hosts">
            <div className="ep-glass ep-host">
              <div className="av" style={{ '--av': 'linear-gradient(135deg,#9b6bff,#3ee8ff)' } as CSSProperties} />
              <div>
                <b>Follow</b>
                <p>Co-host</p>
              </div>
            </div>
            <div className="ep-glass ep-host">
              <div className="av" style={{ '--av': 'linear-gradient(135deg,#f2c867,#ff5a2c)' } as CSSProperties} />
              <div>
                <b>Subscribe</b>
                <p>Co-host</p>
              </div>
            </div>
          </div>

          {LATEST && (
            <div className="ep-glass ep-gilt ep-card">
              <span className="em-kicker">Latest · Episode {LATEST.n}</span>
              <h3>{LATEST.title}</h3>
              <p>{LATEST.description}</p>
              {watching ? (
                <div className="ep-frame">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${LATEST.youtubeId}?autoplay=1&rel=0`}
                    title={`Episode ${LATEST.n}: ${LATEST.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <>
                  <div className="ep-wave" aria-hidden="true">
                    {BARS.map((h, i) => (
                      <i key={i} style={{ '--h': h, '--i': i } as CSSProperties} />
                    ))}
                  </div>
                  <div className="ep-ctas">
                    <button type="button" className="em-btn" onClick={() => setWatching(true)}>
                      <Play size={16} weight="fill" /> Play episode {LATEST.n}
                    </button>
                    {LATEST.spotifyUrl && <Ext href={LATEST.spotifyUrl}>Listen on Spotify</Ext>}
                  </div>
                </>
              )}
            </div>
          )}

          <div id="episodes">
            <Head eyebrow="Every episode" title={<>All <span className="ep-metal">{PODCAST_EPISODES.length}</span></>} />
            <div className="ep-glass">
              {EPISODES.map((ep) => (
                <div key={ep.n} className="ep-ep">
                  <span className="no">{ep.n}</span>
                  <span style={{ minWidth: 0 }}>
                    <span className="ti">{ep.title}</span>
                    <span className="ds">{ep.description}</span>
                  </span>
                  <span className="act">
                    <a href={podcastWatchUrl(ep)} target="_blank" rel="noopener noreferrer">
                      Watch
                    </a>
                    <a href={ep.spotifyUrl || PODCAST_SHOW.spotifyShow} target="_blank" rel="noopener noreferrer">
                      Listen
                    </a>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
