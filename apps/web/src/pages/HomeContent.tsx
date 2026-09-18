import { motion } from 'framer-motion';
import { MagneticButton } from '../components/MagneticButton';
import { ParticleField } from '../components/ParticleField';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import {
  AdSenseUnit,
  BeatDancingTitle,
  PublicLayout,
  ReducedMotionGate,
  StudioButton,
} from './PublicLayout';
import { fadeUp, stagger } from './PageMotion';

const INTRO_VIDEO = '/media/spotify-signing.mp4';
const networkSites = [
  { name: '3000 Studios VIP', url: 'https://3000studios.vip', tag: 'Main Launch' },
  { name: 'Music Catalog', url: '/music', tag: 'Tracks' },
  { name: 'Live Stream', url: '/live', tag: 'Broadcast' },
  { name: 'Creator Ops', url: '/admin', tag: 'Private' },
];

export function HomeContent() {
  return (
    <PublicLayout variant="spiral">
      <main className="vipMain">
        <section className="redCarpetHero">
          <video
            src={INTRO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/official-3000-studios-profile.png"
          />
          <div className="carpetDepth" aria-hidden="true" />
          <ReducedMotionGate>
            <ParticleField />
          </ReducedMotionGate>
          <motion.div
            className="heroCopy heroCopy--yt"
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.span className="vipKicker" variants={fadeUp}>
              YouTube · DistroKid · Official artist
            </motion.span>
            <BeatDancingTitle text="3000 Studios" />
            <motion.p variants={fadeUp}>
              Official music videos and DistroKid releases. Everything streams free. Subscribe so
              YouTube puts the next drop in your feed.
            </motion.p>
            <motion.div className="heroFeature" variants={fadeUp}>
              <a
                className="heroFeatureCard"
                href="https://www.youtube.com/watch?v=tIY1WU9N_RU"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="/media/covers/not-giving-up-tonight.jpg"
                  alt="Not Giving Up Tonight official video"
                />
                <span>
                  <small>Live on DistroKid + YouTube</small>
                  <strong>Not Giving Up Tonight</strong>
                </span>
              </a>
            </motion.div>
            <motion.div className="heroActions" variants={fadeUp}>
              <MagneticButton
                className="studioButton ytCta"
                href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              >
                Subscribe on YouTube
              </MagneticButton>
              <StudioButton href="https://www.youtube.com/watch?v=tIY1WU9N_RU" variant="secondary">
                Watch the video
              </StudioButton>
              <StudioButton to="/music" variant="ghost">
                Full catalog
              </StudioButton>
            </motion.div>
          </motion.div>
        </section>
        <section className="ytSubscribeBar" aria-label="YouTube subscribe">
          <div className="ytSubscribeInner">
            <p className="ytSubscribeKicker">Official artist channel</p>
            <h2>Watch the videos. Subscribe @3000Studio.</h2>
            <p>
              New official videos, DistroKid releases, and 3000 Studios drops. Tap subscribe so
              YouTube actually shows you the next one.
            </p>
            <div className="heroActions">
              <StudioButton href="https://www.youtube.com/@3000Studio?sub_confirmation=1">
                Subscribe
              </StudioButton>
              <StudioButton href="https://www.youtube.com/watch?v=tIY1WU9N_RU" variant="secondary">
                Not Giving Up Tonight
              </StudioButton>
            </div>
          </div>
        </section>
        <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        <motion.section
          className="vipSection featureRail"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          {[
            ['Music Showcase', 'Original tracks, full streams, and official videos — all free.'],
            [
              'Live Stream',
              'Cloudflare Stream-ready playback plus a protected owner stream console.',
            ],
            [
              'Community Chat',
              'Visitor chat and song ideas that can upgrade to Firebase or D1 persistence.',
            ],
            [
              'Sponsor Inventory',
              'Clear placements for launch partners, video sponsors, and creator tools.',
            ],
          ].map(([title, copy]) => (
            <motion.article className="vipCard" key={title} variants={fadeUp}>
              <h2>{title}</h2>
              <p>{copy}</p>
            </motion.article>
          ))}
        </motion.section>
        <motion.section
          className="vipSection networkSection"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={stagger}
        >
          <motion.span className="vipKicker" variants={fadeUp}>
            3000 Studios Network
          </motion.span>
          <motion.h2 variants={fadeUp}>All doors open for VIP members</motion.h2>
          <div className="networkGrid">
            {networkSites.map((site) => (
              <motion.article className="vipCard networkCard" key={site.name} variants={fadeUp}>
                <span className="networkTag">{site.tag}</span>
                <h3>{site.name}</h3>
                <StudioButton
                  to={site.url.startsWith('http') ? undefined : site.url}
                  href={site.url.startsWith('http') ? site.url : undefined}
                  variant="secondary"
                >
                  Enter
                </StudioButton>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </main>
    </PublicLayout>
  );
}
