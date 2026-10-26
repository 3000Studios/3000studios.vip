import {
  buildStreamPlayerUrl,
  STREAM_CUSTOMER_CODE,
  STREAM_PLAYER_UID,
  streamPlayerIframeSrc,
} from '../lib/streamConfig';

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
 *
 * Empty-config guard (VIP-1000X fix #3): when the customer code or the
 * video UID is empty/missing, render the clean Offline state and fire
 * ZERO stream requests — previously this built
 * `https://customer-.cloudflarestream.com//…` and failed on every load.
 */
export function CloudflareStreamPlayer({
  uid,
  title = '3000 Studios Stream',
  className = '',
  autoplay = true,
  muted = true,
}: Props) {
  const effectiveUid = (uid ?? STREAM_PLAYER_UID).trim();
  const configured = Boolean(STREAM_CUSTOMER_CODE.trim() && effectiveUid);

  if (!configured) {
    return (
      <div
        className={`cfStreamEmbed cfStreamOffline ${className}`.trim()}
        style={{ position: 'relative', paddingTop: '56.25%' }}
        role="status"
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: '#000',
            textAlign: 'center',
            padding: 24,
          }}
        >
          <span className="v3-live-dot" aria-hidden="true" />
          <strong>Offline</strong>
          <span style={{ opacity: 0.75, fontSize: 14 }}>
            The live stage is not broadcasting right now.
          </span>
        </div>
      </div>
    );
  }

  const src = streamPlayerIframeSrc({
    uid: effectiveUid,
    autoplay,
    muted,
    primaryColor: 'ffd700',
  });
  const openUrl = buildStreamPlayerUrl(effectiveUid);

  return (
    <div className={`cfStreamEmbed ${className}`.trim()} style={{ position: 'relative', paddingTop: '56.25%' }}>
      <iframe
        title={title}
        src={src}
        className="cfStreamIframe streamIframe"
        style={{ border: 'none', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        loading="eager"
        referrerPolicy="strict-origin-when-cross-origin"
      />
      <a className="cfStreamOpenLink" href={openUrl} target="_blank" rel="noreferrer">
        Open Stream Player
      </a>
    </div>
  );
}
