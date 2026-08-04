import { useEffect, type ReactNode } from 'react';
import { getListenerSignature, recordLivePresence, type MorphScene } from '../lib/velvetEngine';

type VelvetStageProps = {
  children: ReactNode;
  isLive?: boolean;
  scene?: MorphScene;
  className?: string;
  /** Show STREAMING SOON ticker under content when offline */
  showSoonTicker?: boolean;
};

/**
 * The one Stage — shared visual shell for feature art, catalog, and live feed.
 * Signature bezel threads are unique per listener (local only).
 */
export function VelvetStage({
  children,
  isLive = false,
  scene = 'jazz',
  className = '',
  showSoonTicker = false,
}: VelvetStageProps) {
  useEffect(() => {
    getListenerSignature();
    document.documentElement.dataset.velvetScene = scene;
  }, [scene]);

  useEffect(() => {
    if (!isLive) return;
    const t = window.setInterval(() => recordLivePresence(15), 15000);
    recordLivePresence(10);
    return () => window.clearInterval(t);
  }, [isLive]);

  return (
    <div
      className={`velvetStage ${isLive ? 'is-live' : 'is-standby'} scene-${scene} ${className}`.trim()}
      data-live={isLive ? '1' : '0'}
    >
      <div className="velvetBezel" aria-hidden="true">
        <span className="velvetThread t0" />
        <span className="velvetThread t1" />
        <span className="velvetThread t2" />
        <span className="velvetThread t3" />
        <span className="velvetThread t4" />
        <span className="velvetThread t5" />
        <span className="velvetThread t6" />
      </div>

      <div className="velvetSpotlight" aria-hidden="true" />
      <div className="velvetGrain" aria-hidden="true" />

      <div className={`velvetStageInner ${isLive ? 'wipe-in' : ''}`}>{children}</div>

      {isLive ? (
        <div className="streamLiveBadge velvetLiveBadge" aria-hidden="true">
          ● LIVE
        </div>
      ) : null}

      {showSoonTicker && !isLive ? (
        <div className="streamMarquee velvetSoon" aria-hidden="true">
          <div className="streamMarqueeTrack">
            <span>
              STREAMING SOON · 3000 STUDIOS LIVE · THE VELVET MACHINE · GO LIVE FROM /ADMIN ·{' '}
            </span>
            <span>
              STREAMING SOON · 3000 STUDIOS LIVE · THE VELVET MACHINE · GO LIVE FROM /ADMIN ·{' '}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MetallicTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`metallicText ${className}`.trim()}>{children}</span>;
}
