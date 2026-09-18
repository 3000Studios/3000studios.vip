import { PublicLayout } from './PublicLayout';
export function AboutPage() {
  return (
    <PublicLayout variant="electric">
      <main className="vipMain">
        <section className="vipPageHero">
          <span className="vipKicker">About</span>
          <h1>3000 Studios is a music, video, and creator media brand.</h1>
          <p>
            Built for original releases, live moments, fan feedback, sponsor packages, and premium
            digital rollouts.
          </p>
        </section>
      </main>
    </PublicLayout>
  );
}
