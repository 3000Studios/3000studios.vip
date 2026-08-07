import { useEffect, useRef, useState } from 'react';
import { WhepPlayer } from '../lib/webrtcStream';
import { STREAM_WHEP_URL, buildStreamWhepUrl, STREAM_PLAYER_UID } from '../lib/streamConfig';

type Props = {
  uid?: string;
  whepUrl?: string;
  className?: string;
  muted?: boolean;
  autoplay?: boolean;
  title?: string;
  onStatus?: (status: 'connecting' | 'live' | 'error' | 'idle') => void;
};

/**
 * Sub-second WebRTC playback via Cloudflare Stream WHEP endpoint.
 * @see https://developers.cloudflare.com/stream/webrtc-beta/
 */
export function WhepStreamPlayer({
  uid = STREAM_PLAYER_UID,
  whepUrl,
  className = '',
  muted = true,
  autoplay = true,
  title = '3000 Studios WHEP',
  onStatus,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<WhepPlayer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'error' | 'idle'>('connecting');

  const endpoint = whepUrl || buildStreamWhepUrl(uid);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    const run = async () => {
      setStatus('connecting');
      onStatus?.('connecting');
      setError(null);
      try {
        await playerRef.current?.stop();
        const player = new WhepPlayer(endpoint);
        playerRef.current = player;
        // Autoplay policies: start muted then unmute after play if requested
        video.muted = true;
        await player.start(video);
        if (cancelled) {
          await player.stop();
          return;
        }
        if (autoplay) {
          await video.play().catch(() => undefined);
        }
        if (!muted) {
          video.muted = false;
          await video.play().catch(() => {
            // If unmute blocks play, keep muted so picture still shows
            video.muted = true;
          });
        } else {
          video.muted = true;
        }
        setStatus('live');
        onStatus?.('live');
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : 'WHEP connect failed';
        setError(msg);
        setStatus('error');
        onStatus?.('error');
      }
    };

    void run();

    return () => {
      cancelled = true;
      void playerRef.current?.stop();
      playerRef.current = null;
    };
  }, [endpoint, muted, autoplay, onStatus]);

  return (
    <div className={`cfManifestPlayer cfWhepPlayer ${className}`.trim()}>
      <video
        ref={videoRef}
        className="cfManifestVideo"
        controls
        playsInline
        autoPlay={autoplay}
        muted={muted}
        title={title}
      />
      <div className="cfManifestMeta" aria-hidden="true">
        <span>WHEP</span>
        <span>{status}</span>
      </div>
      {error ? <p className="cfManifestError">{error}</p> : null}
      <div className="cfManifestLinks">
        <a href={endpoint || STREAM_WHEP_URL} target="_blank" rel="noreferrer">
          WHEP endpoint
        </a>
      </div>
    </div>
  );
}
