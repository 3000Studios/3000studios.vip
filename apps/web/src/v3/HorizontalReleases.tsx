import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';

/* Pinned horizontal scroll gallery of official videos */
export function HorizontalReleases() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-72%']);

  const videos = officialReleaseVideos.slice(0, 8);

  return (
    <section id="videos" className="v3-hwrap" ref={wrapRef} style={{ height: '320vh' }}>
      <div className="v3-hsticky">
        <motion.div className="v3-htrack" ref={trackRef} style={{ x }}>
          <div style={{ width: '34vw', minWidth: 280, flexShrink: 0 }}>
            <Reveal>
              <div className="v3-eyebrow">Cinema</div>
              <h2 className="v3-h2">
                Official <em>videos</em>
              </h2>
              <p className="v3-lead">
                Every release ships with a full visual world. Keep scrolling — the
                filmstrip runs sideways.
              </p>
            </Reveal>
          </div>

          {videos.map((v, i) => (
            <a
              key={v.videoId}
              className="v3-hcard"
              href={youtubeWatchUrl(v.videoId)}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'none', color: 'inherit' }}
              aria-label={`Watch ${v.title} on YouTube`}
            >
              <div
                className="v3-hph"
                style={{ backgroundImage: `url('${youtubeArtworkUrl(v.videoId)}')` }}
              />
              <h3>
                <i>{String(i + 1).padStart(2, '0')}</i>
                {v.title}
              </h3>
              <p>
                {v.release} · {v.duration}
              </p>
              <div className="v3-hmeta">
                <Play size={13} weight="fill" style={{ verticalAlign: -2 }} /> Watch on YouTube
              </div>
            </a>
          ))}

          <div className="v3-hint" style={{ paddingRight: '8vw' }}>
            <a
              href="https://www.youtube.com/@3000Studio/videos"
              target="_blank"
              rel="noreferrer"
              style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            >
              Browse them all <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
