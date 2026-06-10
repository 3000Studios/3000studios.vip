import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
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

export function Shell() {
  const { logout, ownerUsername } = useAuth();
  const { pathname } = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const { title, sub } = titleFor(pathname);

  return (
    <div className={`console ${navOpen ? 'navOpen' : ''}`}>
      <aside className="cSidebar" onClick={() => setNavOpen(false)}>
        <div className="cBrand">
          <div className="cBrandMark">3K</div>
          <div className="cBrandText">
            <Link to="/vault" className="cBrandName">3000 Studios</Link>
            <span className="cBrandSub">Fleet Control · Owner</span>
          </div>
        </div>

        <div className="cNavGroup">
          <div className="cNavLabel">Operations</div>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => (isActive ? 'cNavLink active' : 'cNavLink')}
            >
              <span className="cNavIcon">{item.icon}</span>
              {item.label}
            </NavLink>
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
            <h1>{title}</h1>
            {sub ? <span className="cTitleSub">{sub}</span> : null}
          </div>
          <div className="cTopbarRight">
            <span className="cPill ok"><span className="cDot" />System nominal</span>
          </div>
        </header>

        <main className="cScroll">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
      <DudeAgent ownerEmail={ownerUsername} />
    </div>
  );
}
