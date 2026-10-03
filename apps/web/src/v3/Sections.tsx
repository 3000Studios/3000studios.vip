import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Lightning, FilmSlate, Waveform, RocketLaunch } from '@phosphor-icons/react';
import { Reveal } from '../v2/Reveal';
import { TiltCard, Marquee, MagneticLink } from './chrome';

export { Marquee };

/* ---------------- statement: word-by-word scroll reveal ---------------- */
const STATEMENT =
  '3000 Studios turns songs into cinema — videos, shorts and artwork cut to the rhythm, built for every screen you own.';

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'center 0.45'],
  });
  const words = STATEMENT.split(' ');

  return (
    <section id="statement" className="v3-section v3-statement" ref={ref}>
      <p>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} index={i} total={words.length}>
            {w}
          </Word>
        ))}
      </p>
    </section>
  );
}

function Word({
  children,
  progress,
  index,
  total,
}: {
  children: string;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  index: number;
  total: number;
}) {
  const start = index / total;
  const end = start + 1 / total;
  const opacity = useTransform(progress, [start, end], [0.13, 1]);
  return (
    <motion.span className="v3-sw" style={{ opacity }}>
      {children}{' '}
    </motion.span>
  );
}

/* ---------------- clip-path cinematic reveal ---------------- */
export function ClipReveal() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  });
  const clip = useTransform(
    scrollYProgress,
    [0, 1],
    ['inset(26% 20% 26% 20% round 22px)', 'inset(0% 0% 0% 0% round 0px)'],
  );

  return (
    <section className="v3-clip" ref={ref}>
      <motion.div
        className="v3-clip-img"
        style={{
          clipPath: clip,
          backgroundImage: "url('https://picsum.photos/seed/studioclip3k/1800/1100')",
        }}
        aria-hidden="true"
      />
      <div className="v3-clip-shade" aria-hidden="true" />
      <div className="v3-clip-cap">
        <Reveal>
          <span>Now screening</span>
          <h2>The visual vault</h2>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- studio grid: tilt cards ---------------- */
const PILLARS = [
  {
    n: '01',
    icon: Waveform,
    title: 'Produce',
    body: 'Original songs and scores, tracked and mixed to hit hard on any system — from phone speakers to club subs.',
    tag: 'Music',
  },
  {
    n: '02',
    icon: FilmSlate,
    title: 'Visualize',
    body: 'Cinematic music videos, visualizers and promo cuts — every frame graded, every cut on the beat.',
    tag: 'Film',
  },
  {
    n: '03',
    icon: RocketLaunch,
    title: 'Distribute',
    body: 'Releases pushed to every platform with full metadata, Content ID and promo scheduled to the drip.',
    tag: 'Reach',
  },
];

export function StudioGrid() {
  return (
    <section className="v3-section">
      <div className="v3-wrap">
        <Reveal>
          <div className="v3-eyebrow">The studio</div>
          <h2 className="v3-h2">
            Built like a <em>machine</em>, tuned like an instrument
          </h2>
          <p className="v3-lead">
            One idea becomes the song, the video, the shorts, the artwork and the merch —
            all in-house, all on brand.
          </p>
        </Reveal>
        <div className="v3-grid">
          {PILLARS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <TiltCard>
                <div className="v3-n">{p.n}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
                <span className="v3-tag">{p.tag}</span>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA band ---------------- */
export function CtaBand() {
  return (
    <section className="v3-section">
      <div className="v3-wrap">
        <Reveal>
          <div className="v3-cta-band v3-cta-band--art">
            <Lightning size={36} weight="duotone" color="#f1b74e" />
            <h2>
              Your turn. <em>Request it.</em>
            </h2>
            <p>
              Got a song idea, a vibe, or a story? Send it to the studio — community
              requests shape what gets made next.
            </p>
            <div className="v3-cta-row" style={{ marginTop: 0 }}>
              <MagneticLink to="/requests" className="v3-btn v3-btn--gold">
                Make a request
              </MagneticLink>
              <MagneticLink to="/community" className="v3-btn v3-btn--ghost">
                Join the community
              </MagneticLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
