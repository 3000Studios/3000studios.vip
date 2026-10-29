import { useState } from 'react';
import { Play, YoutubeLogo } from '@phosphor-icons/react';
import { youtubeWatch, type VideoCatalogItem } from '../data/videoCatalog';

/**
 * Click-to-play facade (fast-track 2026-10-29, audit Phase 1/2).
 * Renders only a thumbnail + play button; the YouTube iframe (or the
 * cinematic <video>) is mounted ONLY after the visitor clicks. Videos are
 * free on YouTube — there is no unlock, lock veil, or paywall here.
 */
export function VideoFacadeCard({ item }: { item: VideoCatalogItem }) {
  const [playing, setPlaying] = useState(false);

  const ytId =
    item.preview.type === 'youtube' ? item.preview.videoId : null;
  const mp4Url = item.preview.type === 'mp4' ? item.preview.url : null;
  const thumb = ytId
    ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
    : undefined;
  const embedSrc = ytId
    ? `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`
    : null;

  return (
    <article className="vf-card" aria-label={item.title}>
      <div className="vf-stage">
        {playing && embedSrc ? (
          <iframe
            src={embedSrc}
            title={`${item.title} — official video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : playing && mp4Url ? (
          <video src={mp4Url} controls autoPlay playsInline preload="metadata" />
        ) : (
          <button
            type="button"
            className="vf-facade"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${item.title}`}
            style={thumb ? { backgroundImage: `url(${thumb})` } : undefined}
          >
            <span className="vf-play" aria-hidden="true">
              <Play size={26} weight="fill" />
            </span>
          </button>
        )}
      </div>
      <div className="vf-meta">
        <h3>{item.title}</h3>
        <p>
          {item.subtitle} · {item.duration} · Free on YouTube
        </p>
        {ytId && (
          <a
            className="vf-watch"
            href={youtubeWatch(ytId)}
            target="_blank"
            rel="noreferrer"
          >
            <YoutubeLogo size={16} weight="fill" /> Watch on YouTube
          </a>
        )}
      </div>
    </article>
  );
}
