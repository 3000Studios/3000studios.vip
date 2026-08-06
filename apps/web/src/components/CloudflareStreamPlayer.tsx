import { buildStreamPlayerUrl, STREAM_PLAYER_EMBED_SRC, streamPlayerIframeSrc } from '../lib/streamConfig';

type Props = {
  /** Stream video / live asset UID. Defaults to site featured player. */
  uid?: string;
  title?: string;
  className?: string;
  autoplay?: boolean;
  muted?: boolean;
};

/**
 * Cloudflare hosted Stream Player (iframe embed).
 * @see https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/
 */
export function CloudflareStreamPlayer({
  uid,
  title = '3000 Studios Stream',
  className = '',
  autoplay = true,
  muted = true,
}: Props) {
  const src = uid
    ? streamPlayerIframeSrc({ uid, autoplay, muted, primaryColor: 'ffd700' })
    : STREAM_PLAYER_EMBED_SRC;
  const openUrl = buildStreamPlayerUrl(uid);

  return (
    <div className={`cfStreamEmbed ${className}`.trim()} style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        title={title}
        src={src}
        className="cfStreamIframe streamIframe"
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a className="cfStreamOpenLink" href={openUrl} target="_blank" rel="noreferrer">
        Open Stream Player
      </a>
    </div>
  );
}
