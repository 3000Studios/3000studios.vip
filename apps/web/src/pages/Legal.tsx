import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LiveBackdrop } from '../components/LiveBackdrop';

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
    <div className="legalPage">
      <LiveBackdrop variant="legal" />
      <div className="legalShade" />
      <motion.div
        className="legalShell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="lead legalLead">{intro}</p>
        <div className="legalCard">{children}</div>
        <div className="legalLinkRow">
          <Link className="btn" to="/">
            Return Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export function About() {
  return (
    <LegalFrame
      eyebrow="3000 Studios"
      title="Premium music and media experiences."
      intro="3000 Studios VIP is a private creative rollout for music, media, and high-impact digital experiences."
    >
      <section className="legalSection">
        <h2>What this controls</h2>
        <p>
          3000 Studios builds original media, interactive web experiences, launch pages, and
          production systems for a growing network of digital properties.
        </p>
      </section>
      <section className="legalSection">
        <h2>How it is used</h2>
        <p>
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
      <section className="legalSection">
        <h2>Primary contact</h2>
        <p>
          Email: <a href="mailto:Mr.jwswain@gmail.com">Mr.jwswain@gmail.com</a>
        </p>
      </section>
      <section className="legalSection">
        <h2>Operations note</h2>
        <p>
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
      <section className="legalSection">
        <h2>Information use</h2>
        <p>
          Information is used to operate the website network, improve reliability, monitor
          performance, and respond to direct inquiries.
        </p>
      </section>
      <section className="legalSection">
        <h2>Third-Party Advertising &amp; Cookies</h2>
        <p>
          We use third-party advertising companies, including Google AdSense, to serve ads when you visit our website.
          Google uses cookies (such as the DoubleClick DART cookie) to serve ads based on your prior visits to this website or other websites across the Internet.
        </p>
        <p>
          You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or by visiting <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">www.aboutads.info</a>.
        </p>
      </section>
      <section className="legalSection">
        <h2>Storage and disclosure</h2>
        <p>
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
      <section className="legalSection">
        <h2>Use conditions</h2>
        <p>
          Access may be restricted, revoked, or updated at any time to protect production systems,
          customers, or network integrity.
        </p>
      </section>
      <section className="legalSection">
        <h2>Refund and liability</h2>
        <p>
          Unless otherwise stated on a specific offer page, transactions are handled under the
          applicable product terms, and software/services are provided as-is to the maximum extent
          permitted by law.
        </p>
      </section>
    </LegalFrame>
  );
}
