import React from 'react';
import { motion } from 'framer-motion';

export function Legal({ title, content }: { title: string; content: React.ReactNode }) {
  return (
    <div className="landing lockLanding">
      <div className="section-shell py-20 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel bg-glass-strong p-10 rounded-3xl border border-white/10"
        >
          <h1 className="text-4xl font-bold mb-8">{title}</h1>
          <div className="prose prose-invert max-w-none text-subtle leading-relaxed space-y-6">
            {content}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function Privacy() {
  return (
    <Legal
      title="Privacy Policy"
      content={
        <>
          <p>Your privacy is important to us. It is 3000 Studios' policy to respect your privacy regarding any information we may collect from you across our website, https://3000studios.vip, and other sites we own and operate.</p>
          <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
          <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
          <p>We don’t share any personally identifying information publicly or with third-parties, except when required to by law.</p>
        </>
      }
    />
  );
}

export function Terms() {
  return (
    <Legal
      title="Terms of Service"
      content={
        <>
          <p>By accessing the website at https://3000studios.vip, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.</p>
          <p>If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.</p>
          <h2>Use License</h2>
          <p>Permission is granted to temporarily download one copy of the materials (information or software) on 3000 Studios' website for personal, non-commercial transitory viewing only.</p>
        </>
      }
    />
  );
}

export function About() {
  return (
    <Legal
      title="About 3000 Studios"
      content={
        <>
          <p>3000 Studios is a premium web development and digital asset management firm. We specialize in building high-performance, secure, and beautiful web applications.</p>
          <p>The VIP Hub is our proprietary control plane for managing the 3000 Studios ecosystem, providing real-time analytics, bridge telemetry, and management tools for our portfolio of sites.</p>
        </>
      }
    />
  );
}

export function Contact() {
  return (
    <Legal
      title="Contact Us"
      content={
        <>
          <p>For inquiries regarding 3000 Studios or the VIP Hub, please contact the master administrator.</p>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <p className="font-bold text-ink">Email</p>
            <p>admin@3000studios.vip</p>
          </div>
        </>
      }
    />
  );
}
