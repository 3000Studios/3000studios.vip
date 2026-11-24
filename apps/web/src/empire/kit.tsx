import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import { Header } from '../v2/Header';
import { Footer } from '../v2/Footer';
import './pages.css';

/** Shell for every EMPIRE inner page: header, main, footer. */
export function EmpirePage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`em-home ep-page ${className}`.trim()}>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </div>
  );
}

/** The mockup's page hero: drifting orb, eyebrow, metal title, lead. */
export function PageHero({
  eyebrow,
  title,
  lead,
  orb,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  orb?: string;
  children?: ReactNode;
}) {
  return (
    <section className="ep-hero em-nostagger">
      <div className="ep-orb" style={{ '--orb': orb } as CSSProperties} aria-hidden="true" />
      <div className="em-wrap">
        <span className="em-kicker">{eyebrow}</span>
        <h1 className="em-3d em-dance">{title}</h1>
        {lead ? <p className="ep-lead">{lead}</p> : null}
        {children}
      </div>
    </section>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: string }) {
  return (
    <div className="ep-stat ep-glass">
      <b className={tone ? `t-${tone}` : undefined}>{value}</b>
      <span>{label}</span>
    </div>
  );
}

export function Head({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="ep-head">
      <div>
        <span className="em-kicker">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}

/** Outbound link styled as an em button. */
export function Ext({ href, children, gold = false }: { href: string; children: ReactNode; gold?: boolean }) {
  return (
    <a className={gold ? 'em-btn' : 'em-btn em-btn--ghost'} href={href} target="_blank" rel="noopener noreferrer">
      {children} <ArrowUpRight size={15} weight="bold" />
    </a>
  );
}

/** Internal link styled as an em button. */
export function Go({ to, children, gold = false }: { to: string; children: ReactNode; gold?: boolean }) {
  return (
    <Link className={gold ? 'em-btn' : 'em-btn em-btn--ghost'} to={to}>
      {children} <ArrowRight size={15} weight="bold" />
    </Link>
  );
}
