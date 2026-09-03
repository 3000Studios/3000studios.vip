import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/music', label: 'Music', icon: '♪' },
  { to: '/live', label: 'Live', icon: '●' },
  { to: 'https://getnexa.space', label: 'Games', icon: '▶', external: true },
  { to: '/video', label: 'More', icon: '▣' },
] as const;

export function BottomDock() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/vault') || pathname.startsWith('/agent')) {
    return null;
  }
  return (
    <nav className="bottomDock ytPerkSafe" aria-label="Primary mobile navigation">
      {items.map((item) => {
        const active = !('external' in item && item.external) && (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to));
        if ('external' in item && item.external) {
          return (
            <a key={item.label} className="dockItem" href={item.to} target="_blank" rel="noreferrer">
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </a>
          );
        }
        return (
          <Link key={item.label} className={active ? 'dockItem is-active' : 'dockItem'} to={item.to}>
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
