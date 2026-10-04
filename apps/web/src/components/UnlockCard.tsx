import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Lock, LockOpen, Play, Download, YoutubeLogo, Spinner } from '@phosphor-icons/react';
import {
  type VideoCatalogItem,
  youtubeEmbed,
  youtubeWatch,
} from '../data/videoCatalog';
import {
  activeProvider,
  formatMoney,
  grantUnlock,
  isUnlocked,
  onUnlocksChanged,
  readUnlockSettings,
} from '../lib/unlockPayments';

interface BurstParticle {
  id: number;
  px: string;
  py: string;
  left: string;
  top: string;
  delay: string;
  size: number;
}

function makeBurstParticles(): BurstParticle[] {
  return Array.from({ length: 26 }, (_, i) => {
    const angle = (i / 26) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 90 + Math.random() * 130;
    return {
      id: i,
      px: `${Math.cos(angle) * dist}px`,
      py: `${Math.sin(angle) * dist}px`,
      left: `${38 + Math.random() * 24}%`,
      top: `${30 + Math.random() * 22}%`,
      delay: `${Math.random() * 0.15}s`,
      size: 5 + Math.random() * 6,
    };
  });
}

function Burst({ particles, burstKey }: { particles: BurstParticle[]; burstKey: number }) {
  if (!burstKey || particles.length === 0) return null;
  return (
    <>
      {particles.map((p) => (
        <span
          key={`${burstKey}-${p.id}`}
          className="nn-particle"
          style={
            {
              '--px': p.px,
              '--py': p.py,
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

export function UnlockCard({ item }: { item: VideoCatalogItem }) {
  const [unlocked, setUnlocked] = useState(() => isUnlocked(item.id));
  const [unlocking, setUnlocking] = useState(false);
  const [particles, setParticles] = useState<BurstParticle[]>([]);
  const [burstKey, setBurstKey] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [playingFull, setPlayingFull] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);

  useEffect(() => onUnlocksChanged(() => setUnlocked(isUnlocked(item.id))), [item.id]);

  const demoMode = readUnlockSettings().demoMode;

  const previewSrc =
    item.preview.type === 'youtube'
      ? youtubeEmbed(item.preview.videoId)
      : item.preview.url;

  const fullSrc =
    item.full.type === 'youtube' ? youtubeEmbed(item.full.videoId) : item.full.url;

  const startCheckout = async () => {
    setProcessing(true);
    setCheckoutError(null);
    try {
      const result = await activeProvider().startCheckout({
        id: item.id,
        title: item.title,
        priceCents: item.priceCents,
      });
      if (result.ok) {
        // Gold burst + lock morph + glow sweep, then reveal full content.
        setUnlocking(true);
        setParticles(makeBurstParticles());
        setBurstKey((k) => k + 1);
        window.setTimeout(() => {
          grantUnlock(item.id);
          setUnlocked(true);
          setUnlocking(false);
          setShowCheckout(false);
          setPlayingFull(true);
          cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1500);
      } else {
        setCheckoutError(
          result.reason === 'not-configured'
            ? 'Live payments are not connected yet. Switch on demo mode in the Command Deck.'
            : 'Checkout did not complete. No charge was made.',
        );
      }
    } finally {
      setProcessing(false);
    }
  };

  const downloadHref =
    item.full.type === 'mp4'
      ? item.full.url
      : item.songLinks?.hyperfollow || (item.full.type === 'youtube' ? youtubeWatch(item.full.videoId) : '#');

  const cardClass = `nn-card nn-unlock-card${unlocking ? ' is-unlocking' : ''}${
    unlocked ? ' is-unlocked' : ''
  }`;

  return (
    <article ref={cardRef} className={cardClass} aria-label={item.title}>
      <Burst particles={particles} burstKey={burstKey} />
      <div className="nn-unlock-stage">
        {playingFull && unlocked ? (
          item.full.type === 'youtube' ? (
            <iframe
              src={`${fullSrc}&autoplay=1&rel=0`}
              title={`${item.title} — full`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <video src={fullSrc} controls autoPlay playsInline preload="metadata" />
          )
        ) : item.preview.type === 'youtube' ? (
          <iframe
            src={previewSrc}
            title={`${item.title} — free preview`}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <video src={previewSrc} controls playsInline preload="metadata" />
        )}

        {!unlocked && !unlocking && (
          <div className="nn-lock-veil">
            <div className="nn-lock-icon">
              <Lock size={30} weight="duotone" />
            </div>
            <span className="nn-price-tag">FULL VIDEO + SONG · {formatMoney(item.priceCents)}</span>
          </div>
        )}
      </div>

      <div className="nn-unlock-meta">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
          <div>
            <h3>{item.title}</h3>
            <span className="nn-sub">
              {item.subtitle} · {item.duration} · Free preview above
            </span>
          </div>
          {unlocked && (
            <span className="nn-unlocked-badge">
              <LockOpen size={14} weight="fill" /> Unlocked
            </span>
          )}
        </div>

        <div className="nn-unlock-actions">
          {!unlocked ? (
            <button
              type="button"
              className="nn-btn nn-btn-gold"
              onClick={() => setShowCheckout((v) => !v)}
              style={{ flex: 1 }}
            >
              <Lock size={16} weight="fill" />
              Unlock Full — {formatMoney(item.priceCents)}
            </button>
          ) : (
            <>
              {!playingFull && (
                <button
                  type="button"
                  className="nn-btn nn-btn-cyan"
                  onClick={() => setPlayingFull(true)}
                  style={{ flex: 1 }}
                >
                  <Play size={16} weight="fill" /> Play Full
                </button>
              )}
              <a
                className="nn-btn nn-btn-ghost"
                href={downloadHref}
                target="_blank"
                rel="noreferrer"
                download={item.full.type === 'mp4' ? `${item.id}-full.mp4` : undefined}
                style={{ flex: 1 }}
              >
                {item.full.type === 'mp4' ? (
                  <>
                    <Download size={16} weight="fill" /> Download
                  </>
                ) : (
                  <>
                    <YoutubeLogo size={16} weight="fill" /> Full song + video
                  </>
                )}
              </a>
            </>
          )}
        </div>

        {showCheckout && !unlocked && (
          <div className="nn-checkout">
            <h4>
              Unlock “{item.title}”{demoMode && <span className="nn-demo-flag">DEMO</span>}
            </h4>
            <p>
              One-time {formatMoney(item.priceCents)} · full video + full song, yours forever.
              {demoMode
                ? ' Demo checkout — no card is charged.'
                : ' Secure checkout via Stripe.'}
            </p>
            {checkoutError && (
              <p style={{ color: '#ff4d5e' }}>{checkoutError}</p>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="nn-btn nn-btn-gold"
                disabled={processing}
                onClick={startCheckout}
                style={{ flex: 1, opacity: processing ? 0.6 : 1 }}
              >
                {processing ? (
                  <>
                    <Spinner size={16} className="nn-spin" /> Processing…
                  </>
                ) : (
                  <>Pay {formatMoney(item.priceCents)}{demoMode ? ' (demo)' : ''}</>
                )}
              </button>
              <button
                type="button"
                className="nn-btn nn-btn-ghost"
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
