import { useEffect } from 'react';

export function StageFX() {
  useEffect(() => {
    const bolt = document.createElement('div');
    bolt.className = 'boltCursor';
    document.body.appendChild(bolt);

    const onMove = (x: number, y: number) => {
      bolt.style.transform = `translate(${x - 10}px, ${y - 18}px)`;
      document.documentElement.style.setProperty('--ptr-x', `${x}px`);
      document.documentElement.style.setProperty('--ptr-y', `${y}px`);
      const header = document.querySelector('.vipHeader') as HTMLElement | null;
      const footer = document.querySelector('.vipFooter') as HTMLElement | null;
      if (header) {
        const r = header.getBoundingClientRect();
        header.style.setProperty('--gx', `${((x - r.left) / Math.max(r.width, 1)) * 100}%`);
        header.style.setProperty('--gy', `${((y - r.top) / Math.max(r.height, 1)) * 100}%`);
        header.classList.toggle('hasPtr', y >= r.top && y <= r.bottom);
      }
      if (footer) {
        const r = footer.getBoundingClientRect();
        footer.style.setProperty('--rx', `${((x - r.left) / Math.max(r.width, 1)) * 100}%`);
        footer.style.setProperty('--ry', `${((y - r.top) / Math.max(r.height, 1)) * 100}%`);
        footer.classList.toggle('hasPtr', y >= r.top && y <= r.bottom);
      }
    };

    const mm = (e: PointerEvent) => onMove(e.clientX, e.clientY);
    window.addEventListener('pointermove', mm, { passive: true });

    const splash = (e: PointerEvent) => {
      const footer = (e.target as HTMLElement).closest?.('.vipFooter');
      if (!footer) return;
      const r = footer.getBoundingClientRect();
      const drop = document.createElement('span');
      drop.className = 'waterRipple';
      drop.style.left = `${e.clientX - r.left}px`;
      drop.style.top = `${e.clientY - r.top}px`;
      footer.appendChild(drop);
      window.setTimeout(() => drop.remove(), 700);
    };
    window.addEventListener('pointerdown', splash);

    return () => {
      window.removeEventListener('pointermove', mm);
      window.removeEventListener('pointerdown', splash);
      bolt.remove();
    };
  }, []);
  return null;
}
