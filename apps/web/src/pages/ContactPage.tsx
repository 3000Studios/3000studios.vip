import { PublicLayout, StudioButton } from './PublicLayout';
const OWNER_EMAIL = 'mr.jwswain@gmail.com';
export function ContactPage() {
  return (
    <PublicLayout variant="pulse">
      <main className="vipMain">
        <section className="vipPageHero">
          <span className="vipKicker">Contact Us</span>
          <h1>Book music, video, sponsorship, licensing, or live stream support.</h1>
          <p>
            Reach 3000 Studios directly by email for releases, budgets, timelines, rights, Spotify
            account access, and booking.
          </p>
        </section>
        <section className="contactEmailBlock" aria-label="Contact email">
          <div className="contactEmailInner">
            <p className="contactEmailLabel">Primary contact email</p>
            <p className="contactEmailValue">
              <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a>
            </p>
            <p className="contactEmailNote">
              Owner / artist: 3000 Studios · Write to{' '}
              <a href={`mailto:${OWNER_EMAIL}`}>{OWNER_EMAIL}</a> with your project details.
            </p>
            <StudioButton href={`mailto:${OWNER_EMAIL}?subject=3000%20Studios%20contact`}>
              Email {OWNER_EMAIL}
            </StudioButton>
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
