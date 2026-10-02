import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  House,
  MusicNote,
  PlayCircle,
  Broadcast,
  ShoppingBag,
  ChatsCircle,
  Lightbulb,
  EnvelopeSimple,
  Newspaper,
  Handshake,
  Info,
} from '@phosphor-icons/react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

export type NavItem = { to: string; label: string; icon: React.ReactNode; hash?: string };

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: <House size={20} weight="duotone" /> },
  { to: '/#music', label: 'Music', icon: <MusicNote size={20} weight="duotone" /> },
  { to: '/#videos', label: 'Videos', icon: <PlayCircle size={20} weight="duotone" /> },
  { to: '/#live', label: 'Live', icon: <Broadcast size={20} weight="duotone" /> },
  { to: '/shop', label: 'Shop', icon: <ShoppingBag size={20} weight="duotone" /> },
  { to: '/community', label: 'Community', icon: <ChatsCircle size={20} weight="duotone" /> },
  { to: '/concepts', label: 'Concepts', icon: <Lightbulb size={20} weight="duotone" /> },
  { to: '/requests', label: 'Requests', icon: <Lightbulb size={20} weight="duotone" /> },
  { to: '/blog', label: 'Blog', icon: <Newspaper size={20} weight="duotone" /> },
  { to: '/sponsors', label: 'Sponsors', icon: <Handshake size={20} weight="duotone" /> },
  { to: '/about', label: 'About', icon: <Info size={20} weight="duotone" /> },
  { to: '/contact', label: 'Contact', icon: <EnvelopeSimple size={20} weight="duotone" /> },
];

const DESKTOP_ITEMS = NAV_ITEMS.slice(0, 6);

function isActive(pathname: string, hash: string, to: string) {
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1);
  }
  return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
}

/** Hamburger button: idle pulse, morphs into an X on tap. */
function Burger({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const reduce = usePrefersReducedMotion();
  return (
    <motion.button
      type="button"
      className={`v2-burger${open ? ' is-open' : ''}${reduce ? '' : ' v2-burger--idle'}`}
      aria-expanded={open}
      aria-label={open ? 'Close menu' : 'Open menu'}
      onClick={onToggle}
      whileTap={reduce ? undefined : { scale: 0.88 }}
    >
      <span className="v2-burger-bars" aria-hidden="true">
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
      </span>
    </motion.button>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open ]);

  const hash = location.hash;

  return (
    <>
      <header className={`v2-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="v2-header-inner">
          <Link to="/" className="v2-brand" aria-label="3000 Studios home">
            <img src="/media/official-3000-studios-profile.png" alt="" className="v2-brand-logo" />
            <span className="v2-brand-word">
              <strong>
                3000<span className="v2-grad-text">Studios</span>
              </strong>
              <small>VIP · MUSIC · LIVE</small>
            </span>
          </Link>

          <nav className="v2-nav-desktop" aria-label="Primary">
            {DESKTOP_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive: rrActive }) =>
                  `v2-nav-link${isActive(location.pathname, hash, item.to) || rrActive ? ' is-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="v2-header-actions">
            <a
              className="v2-btn v2-btn--sm v2-header-cta"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
            >
              Subscribe
            </a>
            <Burger open={open} onToggle={() => setOpen((v) => !v)} />
          </div>
        </div>
        <span className="v2-header-line" aria-hidden="true" />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="v2-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.86, y: -18 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: -12 }}
            transition={
              reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 30 }
            }
          >
            <motion.button
              type="button"
              className="v2-menu-close"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ✕
            </motion.button>
            <nav aria-label="Mobile">
              <ul className="v2-menu-list">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, x: -26 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
                    transition={
                      reduce
                        ? { duration: 0.12 }
                        : { delay: 0.05 + i * 0.045, type: 'spring', stiffness: 320, damping: 26 }
                    }
                  >
                    <NavLink
                      to={item.to}
                      className={`v2-menu-link${
                        isActive(location.pathname, hash, item.to) ? ' is-active' : ''
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="v2-menu-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      <span className="v2-menu-arrow" aria-hidden="true">
                        →
                      </span>
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="v2-menu-foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              <a
                href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
                target="_blank"
                rel="noreferrer"
                className="v2-btn v2-btn--sm"
              >
                Subscribe on YouTube
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
