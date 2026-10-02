import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal } from '../v2/Reveal';

function LegalFrame({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <PublicLayoutV2 wallpaper="nebula">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 840 }}>
          <Reveal>
            <span className="v2-kicker">{eyebrow}</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display" style={{ marginTop: 8 }}>
              {title}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16 }}>
              {intro}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="v2-card" style={{ padding: 'clamp(24px, 5vw, 40px)', marginTop: 28 }}>
              {children}
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 28 }}>
              <Link className="v2-btn v2-btn--ghost" to="/">
                Return Home
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <LiveLine />
    </PublicLayoutV2>
  );
}

const sectionStyle: React.CSSProperties = { marginBottom: 24 };
const headingStyle: React.CSSProperties = {
  fontFamily: 'var(--v2-font-display)',
  fontSize: 20,
  margin: '0 0 8px',
};
const paraStyle: React.CSSProperties = {
  color: 'var(--v2-muted)',
  fontSize: 15,
  lineHeight: 1.7,
  margin: '0 0 10px',
};
const linkStyle: React.CSSProperties = {
  color: 'var(--v2-neon)',
  fontWeight: 700,
  textDecoration: 'none',
};

export function About() {
  return (
    <LegalFrame
      eyebrow="3000 Studios"
      title="Premium music and media experiences."
      intro="3000 Studios VIP is a private creative rollout for music, media, and high-impact digital experiences."
    >
      <section style={sectionStyle}>
        <h2 style={headingStyle}>What this controls</h2>
        <p style={paraStyle}>
          3000 Studios builds original media, interactive web experiences, launch pages, and
          production systems for a growing network of digital properties.
        </p>
      </section>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>How it is used</h2>
        <p style={paraStyle}>
          Public releases stay focused on polished media, fast pages, accessible design, and
          reliable production delivery.
        </p>
      </section>
    </LegalFrame>
  );
}

export function Contact() {
  return (
    <LegalFrame
      eyebrow="Contact"
      title="Reach the operator of the 3000 Studios network."
      intro="Use the owner contact channel for production operations, partnership inquiries, and site management requests."
    >
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Primary contact</h2>
        <p style={paraStyle}>
          Email:{' '}
          <a href="mailto:Mr.jwswain@gmail.com" style={linkStyle}>
            Mr.jwswain@gmail.com
          </a>
        </p>
      </section>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Operations note</h2>
        <p style={paraStyle}>
          Requests tied to deployments, analytics, monetization, or compliance should include the
          site name and production domain.
        </p>
      </section>
    </LegalFrame>
  );
}

export function Privacy() {
  return (
    <LegalFrame
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="How 3000studios.vip uses data for the site, ads, and official TikTok / YouTube / Instagram promo."
    >
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Information use</h2>
        <p style={paraStyle}>
          Information is used to operate the website network, improve reliability, monitor
          performance, and respond to direct inquiries.
        </p>
      </section>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Third-Party Advertising &amp; Cookies</h2>
        <p style={paraStyle}>
          We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website.
          Google uses cookies (such as the DoubleClick DART cookie) to serve ads based on your prior visits to this website or other websites across the Internet.
        </p>
        <p style={paraStyle}>
          You may opt out of personalized advertising by visiting{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Google Ads Settings
          </a>{' '}
          or by visiting{' '}
          <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            www.aboutads.info
          </a>.
        </p>
      </section>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Storage and disclosure</h2>
        <p style={paraStyle}>
          Data is retained only as long as operationally necessary and is not publicly disclosed
          except where required by law or platform compliance requirements.
        </p>
      </section>
    </LegalFrame>
  );
}

export function Terms() {
  return (
    <LegalFrame
      eyebrow="Terms"
      title="Terms of Service"
      intro="Use of 3000studios.vip, DistroKid HyperFollow, and official social promo tools."
    >
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Use conditions</h2>
        <p style={paraStyle}>
          Access may be restricted, revoked, or updated at any time to protect production systems,
          customers, or network integrity.
        </p>
      </section>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Refund and liability</h2>
        <p style={paraStyle}>
          Unless otherwise stated on a specific offer page, transactions are handled under the
          applicable product terms, and software/services are provided as-is to the maximum extent
          permitted by law.
        </p>
      </section>
    </LegalFrame>
  );
}
