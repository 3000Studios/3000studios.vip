import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MusicNote,
  Microphone,
  ShoppingBag,
  GameController,
  Broadcast,
  EnvelopeSimple,
  CaretDown,
} from '@phosphor-icons/react';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

export type NavChild = { to: string; label: string; external?: boolean };
export type NavItem = {
  to?: string;
  label: string;
  icon: React.ReactNode;
  external?: boolean;
  children?: NavChild[];
};

export const SHOP_URL = 'https://boughtitonline.com';

// eslint-disable-next-line react-refresh/only-export-components
export const NAV_ITEMS: NavItem[] = [
  {
    to: '/music',
    label: 'Music',
    icon: <MusicNote size={20} weight="duotone" />,
    children: [
      { to: '/video', label: 'Videos' },
      { to: '/#promos', label: 'Music Promo' },
      { to: '/beats', label: 'Music For Sale' },
    ],
  },
  {
    to: '/podcast',
    label: 'Podcast',
    icon: <Microphone size={20} weight="duotone" />,
    children: [
      { to: '/podcast#episodes', label: 'All Episodes' },
      { to: '/podcast#episode-1', label: 'Episode One' },
      { to: '/podcast#episode-2', label: 'Episode Two' },
    ],
  },
  {
    to: SHOP_URL,
    label: 'Shop',
    icon: <ShoppingBag size={20} weight="duotone" />,
    external: true,
  },
  {
    to: '/thunder-dome',
    label: 'Thunderdome',
    icon: <GameController size={20} weight="duotone" />,
  },
  {
    to: '/live',
    label: 'Live Stream',
    icon: <Broadcast size={20} weight="duotone" />,
  },
  {
    to: '/contact',
    label: 'Contact',
    icon: <EnvelopeSimple size={20} weight="duotone" />,
  },
];

function isActive(pathname: string, hash: string, to: string) {
  if (to.startsWith('/#')) {
    return pathname === '/' && hash === to.slice(1);
  }
  if (to.includes('#')) {
    const [p, h] = to.split('#');
    return pathname === p && hash === h;
  }
  return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`));
}

function itemActive(pathname: string, hash: string, item: NavItem): boolean {
  if (item.to && !item.external && isActive(pathname, hash, item.to)) return true;
  return !!item.children?.some((c) => isActive(pathname, hash, c.to));
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

function DesktopDrop({ item }: { item: NavItem }) {
  const location = useLocation();
  const active = itemActive(location.pathname, location.hash, item);
  return (
    <div className={`v2-nav-drop${active ? ' is-active' : ''}`}>
      <NavLink
        to={item.to!}
        className={`v2-nav-link${active ? ' is-active' : ''}`}
        aria-haspopup="true"
      >
        {item.label}
        <CaretDown size={13} weight="bold" className="v2-drop-caret" aria-hidden="true" />
      </NavLink>
      <div className="v2-drop-menu" role="menu">
        {item.children!.map((c) => (
          <NavLink
            key={c.label}
            to={c.to}
            role="menuitem"
            className={({ isActive: rrActive }) =>
              `v2-drop-link${
                isActive(location.pathname, location.hash, c.to) || rrActive
                  ? ' is-active'
                  : ''
              }`
            }
          >
            {c.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const location = useLocation();
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    // Close the mobile menu on navigation (back/forward/programmatic).
    // Navigation-driven, not a render loop: React bails out when already closed.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
    setExpanded(null);
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
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  className="v2-nav-link"
                >
                  {item.label}
                </a>
              ) : item.children ? (
                <DesktopDrop key={item.label} item={item} />
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to!}
                  className={({ isActive: rrActive }) =>
                    `v2-nav-link${
                      itemActive(location.pathname, hash, item) || rrActive ? ' is-active' : ''
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ),
            )}
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
                {NAV_ITEMS.map((item, i) => {
                  const isOpen = expanded === item.label;
                  const active = itemActive(location.pathname, hash, item);
                  return (
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
                      {item.external ? (
                        <a
                          href={item.to}
                          target="_blank"
                          rel="noreferrer"
                          className="v2-menu-link"
                          onClick={() => setOpen(false)}
                        >
                          <span className="v2-menu-icon">{item.icon}</span>
                          <span>{item.label}</span>
                          <span className="v2-menu-arrow" aria-hidden="true">
                            ↗
                          </span>
                        </a>
                      ) : item.children ? (
                        <>
                          <div className={`v2-menu-parent${active ? ' is-active' : ''}`}>
                            <NavLink
                              to={item.to!}
                              className="v2-menu-link"
                              onClick={() => setOpen(false)}
                            >
                              <span className="v2-menu-icon">{item.icon}</span>
                              <span>{item.label}</span>
                            </NavLink>
                            <button
                              type="button"
                              className={`v2-menu-expand${isOpen ? ' is-open' : ''}`}
                              aria-expanded={isOpen}
                              aria-label={`Expand ${item.label} submenu`}
                              onClick={() => setExpanded(isOpen ? null : item.label)}
                            >
                              <CaretDown size={18} weight="bold" aria-hidden="true" />
                            </button>
                          </div>
                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.ul
                                className="v2-menu-sub"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22 }}
                              >
                                {item.children.map((c) => (
                                  <li key={c.label}>
                                    <NavLink
                                      to={c.to}
                                      className={`v2-menu-sublink${
                                        isActive(location.pathname, hash, c.to)
                                          ? ' is-active'
                                          : ''
                                      }`}
                                      onClick={() => setOpen(false)}
                                    >
                                      {c.label}
                                    </NavLink>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </>
                      ) : (
                        <NavLink
                          to={item.to!}
                          className={`v2-menu-link${active ? ' is-active' : ''}`}
                          onClick={() => setOpen(false)}
                        >
                          <span className="v2-menu-icon">{item.icon}</span>
                          <span>{item.label}</span>
                          <span className="v2-menu-arrow" aria-hidden="true">
                            →
                          </span>
                        </NavLink>
                      )}
                    </motion.li>
                  );
                })}
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
