import { useState } from 'react';
import { Play, YoutubeLogo } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head, Ext, Go } from '../kit';
import { YOUTUBE_CHANNEL } from '../swatch';
import { MUSIC_VIDEOS, CINEMATIC_VIDEOS, youtubeWatch, type VideoCatalogItem } from '../../data/videoCatalog';

const STEP = 12;

/** Click-to-play facade: the YouTube iframe loads only after a tap. */
function VideoTile({ item }: { item: VideoCatalogItem }) {
  const [on, setOn] = useState(false);
  const yt = item.preview.type === 'youtube' ? item.preview.videoId : null;
  const mp4 = item.preview.type === 'mp4' ? item.preview.url : null;
  return (
    <article className="ep-glass ep-lift" style={{ display: 'grid' }}>
      {on && yt ? (
        <div className="ep-frame" style={{ borderRadius: 0 }}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`}
            title={`${item.title}, official video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : on && mp4 ? (
        <video src={mp4} controls autoPlay playsInline preload="metadata" style={{ width: '100%', aspectRatio: '16/9', background: '#000' }} />
      ) : (
        <button type="button" className="ep-vid" onClick={() => setOn(true)} aria-label={`Play ${item.title}`} style={{ border: 0, padding: 0, cursor: 'pointer' }}>
          {yt ? <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" /> : null}
          <span className="pb">
            <Play size={24} weight="fill" />
          </span>
          <span className="cap">
            <b>{item.title}</b>
            <span>
              {item.subtitle} · {item.duration}
            </span>
          </span>
        </button>
      )}
      {yt && (
        <a className="em-more" href={youtubeWatch(yt)} target="_blank" rel="noopener noreferrer" style={{ padding: '12px 14px' }}>
          Watch on YouTube
        </a>
      )}
    </article>
  );
}

function Lane({ eyebrow, title, items, children }: { eyebrow: string; title: string; items: VideoCatalogItem[]; children?: React.ReactNode }) {
  const [shown, setShown] = useState(STEP);
  if (items.length === 0) return null;
  return (
    <section className="ep-sec">
      <div className="em-wrap">
        <Head eyebrow={eyebrow} title={title}>
          {children}
        </Head>
        <div className="ep-grid ep-g4">
          {items.slice(0, shown).map((v) => (
            <VideoTile key={v.id} item={v} />
          ))}
        </div>
        {shown < items.length && (
          <div className="ep-ctas" style={{ marginTop: 22 }}>
            <button type="button" className="em-btn em-btn--ghost" onClick={() => setShown((n) => n + STEP)}>
              Show more ({items.length - shown} left)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export function VideoVault() {
  return (
    <EmpirePage>
      <PageHero
        eyebrow="Video vault"
        title="The screening room"
        lead="Free on YouTube. Official music videos, the Aeropocalypse cinematics and every live broadcast, all playable right here."
        orb="rgba(255,61,127,.38)"
      >
        <div className="ep-ctas">
          <Ext href={`${YOUTUBE_CHANNEL}?sub_confirmation=1`} gold>
            <YoutubeLogo size={18} weight="fill" /> Subscribe on YouTube
          </Ext>
          <Go to="/music">Music catalog</Go>
        </div>
      </PageHero>
      <Lane eyebrow="Every single, official video" title="Music videos" items={MUSIC_VIDEOS}>
        <Go to="/music">Go to music</Go>
      </Lane>
      <Lane eyebrow="Opening, mid-game and finale" title="Aeropocalypse cinematics" items={CINEMATIC_VIDEOS}>
        <Go to="/aeropocalypse">Go to the game</Go>
      </Lane>
      <section className="ep-sec">
        <div className="em-wrap ep-grid ep-g2">
          <div className="ep-glass ep-gilt ep-card">
            <span className="em-kicker">Live broadcasts</span>
            <h3>Archived from Live Command</h3>
            <p>Every broadcast is saved to the 3000 Studios YouTube channel the moment it ends.</p>
            <div className="ep-foot">
              <Go to="/live">Live Command</Go>
              <Ext href={`${YOUTUBE_CHANNEL}/streams`}>Broadcast archive</Ext>
            </div>
          </div>
          <div className="ep-glass ep-card art-pod">
            <span className="em-kicker">The podcast</span>
            <h3>Follow and Subscribe</h3>
            <p>Every episode is a full video on YouTube, recorded on the live stage.</p>
            <div className="ep-foot">
              <Go to="/podcast">Episodes</Go>
            </div>
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
