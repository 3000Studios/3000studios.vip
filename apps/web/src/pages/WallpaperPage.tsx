import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { VideoLiveWallpaper } from '../components/VideoLiveWallpaper';
import { ChromeWallpaper } from '../components/ChromeWallpaper';
import { PlatformLogos } from '../components/PlatformLogos';
import { ReducedMotionGate } from './PublicLayout';
import '../styles/effects.css';
import '../styles/landing.css';

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export function WallpaperPage() {
  return (
    <div className="vipSite vipSite-spiral wallpaperPage">
      <VideoLiveWallpaper
        className="wallpaperPageBg"
        sources={[{ src: '/media/spotify-signing.mp4', poster: '/media/hero-lcp.webp', mimeType: 'video/mp4' }]}
      />
      <main className="vipMain wallpaperHero">
        <motion.div
          className="wallpaperContent"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.span className="wallpaperHint" variants={fadeUp}>
            3000 Studios · VIP Live Wallpaper
          </motion.span>
          <motion.h1 className="wallpaperTitle" variants={fadeUp}>
            Visual Frequencies
          </motion.h1>
          <motion.p className="wallpaperSubtitle" variants={fadeUp}>
            A responsive live wallpaper experience built from 3000 Studios' official video feeds.
            Canvas particles, depth vignette, and scan-line motion run on desktop. On mobile and in
            reduced-motion mode, a static gradient keeps the mood without draining battery.
          </motion.p>
          <motion.div className="heroActions wallpaperControls" variants={fadeUp}>
            <Link to="/music" className="studioButton primary">
              Explore Music
            </Link>
            <Link to="/video" className="studioButton secondary">
              Watch Videos
            </Link>
            <Link to="/live" className="studioButton ghost">
              Go Live
            </Link>
          </motion.div>
        </motion.div>
      </main>
      <footer className="vipFooter vipFooter--slim">
        <ReducedMotionGate>
          <ChromeWallpaper zone="footer" />
        </ReducedMotionGate>
        <div className="footerReactive" aria-hidden="true">
          {Array.from({ length: 36 }, (_, index) => (
            <i
              key={index}
              style={{ '--footer-energy': (index % 7) * 0.045 } as CSSProperties}
            />
          ))}
        </div>
        <PlatformLogos />
        <div className="footerBrand">
          <strong className="shimmerText">3000 Studios</strong>
          <p>Official music, videos, TikTok/IG promo, and DistroKid HyperFollow.</p>
        </div>
        <div className="footerLinks">
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/copyright">Copyright</Link>
          <Link to="/cookies">Cookies</Link>
          <Link to="/disclaimer">Disclaimer</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
