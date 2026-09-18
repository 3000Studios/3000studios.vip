import { PublicLayout } from './PublicLayout';
const OWNER_EMAIL = 'mr.jwswain@gmail.com';
const content = {
  privacy: {
    title: 'Privacy Policy',
    text: '3000 Studios VIP limits personal data collection to contact requests, site operations, security, analytics, advertising measurement, legal compliance, and optional community submissions. Google AdSense may use cookies or similar technologies to serve and measure ads when ad serving is active. Do not submit sensitive personal information in public forms.',
  },
  terms: {
    title: 'Terms Of Use',
    text: 'By using this site you agree to lawful use, respectful community behavior, no scraping or abuse, and no unauthorized copying of music, videos, visuals, source code, private streams, or protected admin content.',
  },
  copyright: {
    title: 'Copyright And DMCA',
    text: 'All original music, video, graphics, branding, and site content are owned by 3000 Studios or their respective rights holders. For takedown or licensing requests, send a detailed notice to the contact email.',
  },
  cookies: {
    title: 'Cookie Notice',
    text: 'The site may use necessary storage for preferences, local community entries, playback settings, security, analytics, AdSense advertising, fraud prevention, and advertising review. Browser controls can clear local data at any time.',
  },
  disclaimer: {
    title: 'Legal Disclaimer',
    text: 'The site provides music, media, entertainment, community, and business information. It is not legal, financial, medical, or professional advice. Sponsorships and offers require separate written approval.',
  },
};
export function LegalPage({ type }: { type: keyof typeof content }) {
  const page = content[type];
  return (
    <PublicLayout variant="blackhole">
      <main className="vipMain">
        <section className="vipPageHero legalHero">
          <span className="vipKicker">Legal</span>
          <h1>{page.title}</h1>
          <p>{page.text}</p>
          <p>
            Contact: <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>
          </p>
        </section>
      </main>
    </PublicLayout>
  );
}
