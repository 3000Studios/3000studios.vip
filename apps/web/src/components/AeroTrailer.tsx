import { useRef, useState } from 'react';
import './aeroTrailer.css';

/* Official 45-second Aeropocalypse: Online trailer, v3 (portrait 9:16,
   1080x1920 at 60 fps, rendered natively from the 1.4.0 engine: all 25
   stages, the asteroid field, the warp tunnel and five bosses). Built by
   thunderdome/distribution/play_preview/v3 and kept under the Cloudflare
   Pages 25 MiB per-file limit. A new file name, because /media/* is cached
   for a week. Opt-in like every other video on the site: preload="none",
   nothing downloads until tapped. */
export const AERO_TRAILER_SRC = '/media/aeropocalypse/trailer-v3.mp4';
export const AERO_TRAILER_POSTER = '/media/aeropocalypse/trailer-v3-poster.jpg';

type Props = {
  kicker?: string;
  title?: string;
  lede?: string;
  children?: React.ReactNode;
};

export function AeroTrailer({
  kicker = 'Official trailer',
  title = 'Watch it fight',
  lede = 'All 25 stages and the bosses in forty-five seconds of real Aeropocalypse: Online combat, cut to the game’s own theme. Sound on.',
  children,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.controls = true;
    void v.play().catch(() => {
      /* Autoplay policy refused the call; native controls stay visible. */
    });
  };

  return (
    <section className="aero-trailer" aria-labelledby="aero-trailer-title">
      <div className="aero-trailer-in">
        <div className="aero-trailer-copy">
          <span className="aero-trailer-kicker">{kicker}</span>
          <h2 id="aero-trailer-title">{title}</h2>
          <p>{lede}</p>
          {children}
        </div>
        <div className="aero-trailer-frame">
          <video
            ref={videoRef}
            className="aero-trailer-video"
            src={AERO_TRAILER_SRC}
            poster={AERO_TRAILER_POSTER}
            preload="none"
            playsInline
            width={1080}
            height={1920}
            aria-label="Aeropocalypse: Online official trailer"
            onEnded={() => setStarted(false)}
          />
          {!started && (
            <button type="button" className="aero-trailer-play" onClick={start} aria-label="Play the Aeropocalypse: Online trailer">
              <span className="aero-trailer-tri" aria-hidden="true" />
              <span className="aero-trailer-play-label">Play trailer · 0:45</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
