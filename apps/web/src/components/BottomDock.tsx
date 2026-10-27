import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { attachNavDance } from '../liquid/loader';

const items = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/thunder-dome', label: 'Games', icon: '🛸' },
  { to: '/music', label: 'Music', icon: '♪' },
  { to: '/apps', label: 'Apps', icon: '⚡' },
  { to: '/video', label: 'Video', icon: '▶' },
  { to: '/live', label: 'Live', icon: '●' },
  { to: '/shop', label: 'Shop', icon: '▣' },
  { to: '/about', label: 'About', icon: '◇' },
] as const;

export function BottomDock() {
  const { pathname, hash } = useLocation();
  const dockRef = useRef<HTMLElement | null>(null);

  /* Liquid A: the bottom thumb bar dances too (small amplitude — the
     specialist's engine keeps tap targets hittable). */
  useEffect(() => {
    void attachNavDance(dockRef.current);
  }, [pathname]);
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vault') ||
    pathname.startsWith('/agent')
  )
    return null;

  const handleNavClick = (to: string) => {
    if (to.includes('#')) {
      const hashTarget = to.split('#')[1];
      const el = document.getElementById(hashTarget);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav ref={dockRef} className="bottomDock ytPerkSafe" aria-label="Primary mobile navigation">
      {items.map((item) => {
        const active = item.to === '/'
          ? pathname === '/' && (!hash || hash === '')
          : pathname === item.to || pathname.startsWith(`${item.to}/`);

        return (
          <Link
            key={item.label}
            className={active ? 'dockItem is-active' : 'dockItem'}
            to={item.to}
            onClick={() => handleNavClick(item.to)}
            aria-current={active ? 'page' : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
