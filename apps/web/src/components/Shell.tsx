import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { DudeAgent } from './DudeAgent';

const NAV = [
  { to: '/vault', end: true, icon: '◈', label: 'Command Center', title: 'Command Center', sub: 'Fleet health at a glance' },
  { to: '/vault/sites', end: false, icon: '▦', label: 'Fleet', title: 'Fleet', sub: 'Every site under watch' },
  { to: '/vault/ops', end: false, icon: '⌘', label: 'Ops Console', title: 'Ops Console', sub: 'Commands, bridges, analytics' },
  { to: '/vault/stream', end: false, icon: '⦿', label: 'Stream Vault', title: 'Stream Vault', sub: 'Private stream control' },
  { to: '/vault/settings', end: false, icon: '♪', label: 'Audio', title: 'Audio Console', sub: 'Ambient mix & SFX' },
];

function titleFor(pathname: string): { title: string; sub: string } {
  if (/^\/vault\/sites\/[^/]+$/.test(pathname)) return { title: 'Site Detail', sub: 'Deep dive & controls' };
  const match = [...NAV].reverse().find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)));
  return match ? { title: match.title, sub: match.sub } : { title: 'Vault', sub: '' };
}

const pageEase = [0.22, 1, 0.36, 1] as const;

const pageVariants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
};

export function Shell() {
  const { logout, ownerUsername } = useAuth();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { title, sub } = titleFor(pathname);

  return (
    <div className={`console ${navOpen ? 'navOpen' : ''`}>
      <aside className="cSidebar" onClick={() => setNavOpen(false)}>
        <motion.div
          className="cBrand"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="cBrandMark">3K</div>
          <div className="cBrandText">
            <Link to="/vault" className="cBrandName">3000 Studios</Link>
            <span className="cBrandSub">Fleet Control · Owner</span>
          </div>
        </motion.div>

        <div className="cNavGroup">
          <div className="cNavLabel">Operations</div>
          {NAV.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.35 }}
            >
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => (isActive ? 'cNavLink active' : 'cNavLink')}
              >
                <span className="cNavIcon">{item.icon}</span>
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </div>

        <div className="cNavSpacer" />

        <div className="cNavGroup">
          <Link to="/" className="cNavLink">
            <span className="cNavIcon">↗</span>
            Public Site
          </Link>
          <button className="cNavLink" onClick={logout} type="button">
            <span className="cNavIcon">⏻</span>
            Lock Vault
          </button>
        </div>
      </aside>

      <div className="cMain">
        <header className="cTopbar">
          <button
            className="cMobileToggle"
            aria-label="Toggle navigation"
            onClick={() => setNavOpen((v) => !v)}
            type="button"
          >
            ☰
          </button>
          <div className="cTitle">
            <motion.h1
              key={title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {title}
            </motion.h1>
            {sub ? <span className="cTitleSub">{sub}</span> : null}
          </div>
          <div className="cTopbarRight">
            <span className="cPill ok"><span className="cDot" />System nominal</span>
          </div>
        </header>

        <main className="cScroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.38, ease: pageEase }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <DudeAgent ownerEmail={ownerUsername} />
    </div>
  );
}
