import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PublicLayout } from './Home';

const OWNER_EMAIL = 'Mr.jwswain@gmail.com';
const ADMIN_PATH = '/admin';

/** Cloudflare Stream live input (public playback IDs) */
const DEFAULT_CUSTOMER_CODE = 'wx8j23tjjjpkb37k';
const DEFAULT_LIVE_INPUT_ID = '6502a441fdad0df6eebf3270a569c1ab';

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.58, ease } },
};
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.06 } },
};

export function LiveStreamPage() {
  const customerCode =
    import.meta.env.VITE_STREAM_CUSTOMER_CODE?.toString().trim() || DEFAULT_CUSTOMER_CODE;
  const liveInputId =
    import.meta.env.VITE_STREAM_LIVE_INPUT_ID?.toString().trim() || DEFAULT_LIVE_INPUT_ID;
  const configured = Boolean(customerCode && liveInputId);
  const embedUrl = configured
    ? `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/iframe`
    : null;

  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <motion.section className="vipPageHero" initial="hidden" animate="show" variants={stagger}>
          <motion.span className="vipKicker" variants={fadeUp}>
            Live stream
          </motion.span>
          <motion.h1 variants={fadeUp}>Watch 3000 Studios live when the broadcast is active.</motion.h1>
          <motion.p variants={fadeUp}>
            Public playback is powered by Cloudflare Stream. Go live from the owner admin console (passcode 3000) and
            OBS — this page plays the broadcast automatically when ingest is active.
          </motion.p>
          <motion.div className="heroActions" variants={fadeUp}>
            <Link className="studioButton primary" to={ADMIN_PATH}>
              Owner Admin Console
            </Link>
            <a
              className="studioButton secondary"
              href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20live%20stream`}
            >
              Stream Inquiry
            </a>
          </motion.div>
        </motion.section>
        <section className="streamPublicPanel">
          {embedUrl ? (
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 9',
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,211,106,0.22)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.45)',
              }}
            >
              <iframe
                title="3000 Studios live stream"
                src={embedUrl}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="vipCard">
              <h2>Stream setup required</h2>
              <p>
                Open the passcode-protected admin at <Link to="/admin">/admin</Link> to run the go-live checklist.
              </p>
            </div>
          )}
        </section>
      </main>
    </PublicLayout>
  );
}
