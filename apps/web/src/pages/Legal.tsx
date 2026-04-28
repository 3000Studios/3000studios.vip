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
          <Link className="btn primary" to="/vault">
            Open Dashboard
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
      title="Portfolio command center for live sites."
      intro="3000 Studios VIP is the owner console for site operations, analytics visibility, monetization controls, bridge telemetry, and production-safe rollout management."
    >
      <section className="legalSection">
        <h2>What this controls</h2>
        <p>
          The dashboard tracks connected websites, traffic snapshots, edit surfaces, ad readiness,
          and deployment utilities from one control plane.
        </p>
      </section>
      <section className="legalSection">
        <h2>How it is used</h2>
        <p>
          Owner workflows stay focused on real production websites, live custom domains,
          operational health, and measurable business outcomes.
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
          Email: <a href="mailto:admin@3000studios.vip">admin@3000studios.vip</a>
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
      title="Privacy practices for the 3000 Studios web portfolio."
      intro="This site respects visitor privacy and limits collection to what is needed for operations, analytics, lead handling, and site performance."
    >
      <section className="legalSection">
        <h2>Information use</h2>
        <p>
          Information is used to operate the website network, improve reliability, monitor
          performance, and respond to direct inquiries.
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
      title="Terms for access to 3000 Studios properties and tools."
      intro="Use of the site network and associated tools means acceptance of the operational, legal, and platform-specific terms that govern access."
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
