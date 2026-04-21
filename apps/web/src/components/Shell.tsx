import { Link, NavLink, Outlet } from 'react-router-dom';
import { CitadelCore } from './CitadelCore';
import { motion } from 'framer-motion';
import { useAuth } from '../lib/auth';

export function Shell() {
  const { logout } = useAuth();

  return (
    <div className="app">
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
        <nav className="nav">
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
