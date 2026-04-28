import { Link, NavLink, Outlet } from 'react-router-dom';
import { CitadelCore } from './CitadelCore';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';
import { useState } from 'react';
import { LiveBackdrop } from './LiveBackdrop';

export function Shell() {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <LiveBackdrop variant="vault" />
      <header className="topbar">
        <div className="brand">
          <CitadelCore />
          <div className="brandText">
            <Link to="/vault" className="brandName">
              3000 Studios Vault
            </Link>
            <div className="brandSub">the3000studios.Vip - Owner Console</div>
          </div>
        </div>
        <button
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          className={`lockMenuButton ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen((value) => !value)}
          type="button"
        >
          <span className="lockMenuShackle" />
          <span className="lockMenuBody">LOCK</span>
        </button>
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/vault" end className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            Vault
          </NavLink>
          <NavLink to="/vault/sites" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            Sites
          </NavLink>
          <NavLink to="/vault/settings" className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}>
            Audio
          </NavLink>
          <Link to="/" className="navLink">
            Public
          </Link>
          <button className="navLink navButton" onClick={logout} type="button">
            Logout
          </button>
        </nav>
      </header>

      <main className="content">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="page"
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="footer">
        <div className="footerGrid" />
        <div className="footerInner">
          <span>© {new Date().getFullYear()} 3000 Studios</span>
          <span className="footerHint">Private system. Access required.</span>
        </div>
      </footer>
    </div>
  );
}
