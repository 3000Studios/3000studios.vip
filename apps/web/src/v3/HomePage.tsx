import { Link } from 'react-router-dom';
import { Header } from '../v2/Header';
import { Footer } from '../v2/Footer';
import { PageFade, Reveal } from '../v2/Reveal';
import { AdSenseUnit } from '../pages/PublicLayout';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import { usePageMeta } from '../lib/usePageMeta';
import { VAULT_SONG_COUNT } from '../data/vaultSongs';
import {
  VaultSection,
  EpisodeSection,
  PressSection,
  StudioNotesSection,
  DifferentSection,
  FaqSection,
  NewsletterSection,
} from './HomeSections';
import './home-empire.css';

const PODCAST_EPISODES = 26;
const BOOKS_IN_STORE = 8;
const COMBAT_STAGES = 25;

type Division = {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  cta: string;
  to: string;
};

// Division copy is the mockup's, verbatim. The song count is live
// (vaultSongs.length), never the mockup's 51. /books and /aeropocalypse
// routes are owned by the books and game slices — see home/NOTES.md.
const DIVISIONS: Division[] = [
  {
    index: '01',
    eyebrow: 'Games',
    title: 'Aeropocalypse: Online',
    copy: 'Arcade flight combat. 25 stages, 25 boss encounters, 15 jets. In closed testing on Google Play.',
    cta: 'Enter the hangar',
    to: '/thunder-dome',
  },
  {
    index: '02',
    eyebrow: 'Music',
    title: 'Music Vault',
    copy: `${VAULT_SONG_COUNT} published songs. Every track previews free for one minute.`,
    cta: 'Open the vault',
    to: '/music',
  },
  {
    index: '03',
    eyebrow: 'Podcast',
    title: 'Follow and Subscribe',
    copy: '26 episodes with hosts Follow and Subscribe.',
    cta: 'Tune in',
    to: '/podcast',
  },
  {
    index: '04',
    eyebrow: 'Press',
    title: '3000 Studios Press',
    copy: 'Fiction, mystery, cookbooks and creator guides.',
    cta: 'Browse the shelf',
    to: '/books',
  },
  {
    index: '05',
    eyebrow: 'Software',
    title: 'Apps Lab',
    copy: 'Amped Ear 3000, Velvet Sound Engine and the broadcast hub.',
    cta: 'See the lab',
    to: '/apps',
  },
  {
    index: '06',
    eyebrow: 'Broadcast',
    title: 'Live Command',
    copy: 'Broadcast deck, schedule and chat. The podcast tapes here.',
    cta: 'Go to the stage',
    to: '/live',
  },
  {
    index: '07',
    eyebrow: 'Members',
    title: 'VIP Vault',
    copy: 'Unreleased stems, exclusive drops and the live badge, from $3.99 a month.',
    cta: 'Get on the list',
    to: '/vip',
  },
];

function StatsRow() {
  return (
    <dl className="empire-stats" aria-label="Studio at a glance">
      <div className="empire-stat">
        <dt>Songs released</dt>
        <dd>{VAULT_SONG_COUNT}</dd>
      </div>
      <div className="empire-stat">
        <dt>Podcast episodes</dt>
        <dd>{PODCAST_EPISODES}</dd>
      </div>
      <div className="empire-stat">
        <dt>Books in store</dt>
        <dd>{BOOKS_IN_STORE}</dd>
      </div>
      <div className="empire-stat">
        <dt>Combat stages</dt>
        <dd>{COMBAT_STAGES}</dd>
      </div>
    </dl>
  );
}

function Divisions() {
  return (
    <section className="empire-section" id="divisions" aria-labelledby="divisions-title">
      <Reveal>
        <p className="empire-kicker">The Divisions</p>
        <h2 className="empire-h2" id="divisions-title">
          Seven doors. One empire.
        </h2>
        <p className="empire-lede">
          Every part of the studio in one view, so a visitor sees the whole operation before
          choosing where to go.
        </p>
      </Reveal>
      <div className="empire-divisions">
        {DIVISIONS.map((d) => (
          <article className="empire-division" key={d.index}>
            <p className="empire-division-index">
              Division {d.index} · {d.eyebrow}
            </p>
            <h3 className="empire-division-title">{d.title}</h3>
            <p className="empire-division-copy">{d.copy}</p>
            <Link className="empire-text-link" to={d.to}>
              {d.cta} <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturedGame() {
  return (
    <section className="empire-section empire-featured" aria-labelledby="featured-title">
      <Reveal>
        <p className="empire-kicker">Featured · Closed testing on Google Play</p>
        <h2 className="empire-h2" id="featured-title">
          Aeropocalypse: Online
        </h2>
        <p className="empire-lede">
          An arcade flight combat game with 24 named bosses across four threat classes, 19
          weapons, 32 paint schemes and a 30-track soundtrack, all in closed testing on Google
          Play.
        </p>
        <p className="empire-featured-stats" aria-label="Game stats">
          <span>
            <strong>15</strong> Jets
          </span>
          <span>
            <strong>19</strong> Weapons
          </span>
          <span>
            <strong>32</strong> Paint schemes
          </span>
        </p>
        <div className="empire-cta-row">
          <Link className="empire-btn empire-btn--gold" to="/thunder-dome">
            Join the launch list <span aria-hidden="true">→</span>
          </Link>
          <Link className="empire-btn empire-btn--ghost" to="/thunder-dome">
            Meet the bosses <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="empire-stage-line">
          <span>Stage 01 / 25</span>
          <span aria-hidden="true"> — </span>
          <span>Vanguard Sentinel</span>
          <span aria-hidden="true"> — </span>
          <span>Iron-01</span>
        </p>
      </Reveal>
    </section>
  );
}

export function HomePage() {
  usePageMeta({
    title: '3000 Studios — Games, Music, Books & Live Shows',
    description:
      '3000 Studios — games, music, books, software and live shows, built by one independent studio in Acworth, Georgia. Start with the war in the sky.',
  });

  return (
    <div className="empire-home">
      <Header />
      <PageFade routeKey="/">
        <main>
          <section className="empire-hero" aria-labelledby="empire-hero-title">
            <div className="empire-hero-veil" aria-hidden="true" />
            <div className="empire-hero-copy">
              <p className="empire-kicker">Independent Studio · Acworth, Georgia</p>
              <h1 className="empire-hero-title" id="empire-hero-title">
                The 3000 Studios Empire
              </h1>
              <p className="empire-hero-sub">
                Games, music, books, software and live shows, built by one independent studio.
                Start with the war in the sky.
              </p>
              <div className="empire-cta-row">
                <Link className="empire-btn empire-btn--gold" to="/thunder-dome">
                  Enter Aeropocalypse <span aria-hidden="true">→</span>
                </Link>
                <a className="empire-btn empire-btn--ghost" href="#divisions">
                  Explore the empire <span aria-hidden="true">→</span>
                </a>
              </div>
              <StatsRow />
            </div>
          </section>

          <div className="empire-wrap">
            <Divisions />
            <FeaturedGame />
            <VaultSection />
            <div className="empire-ad">
              <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
            </div>
            <EpisodeSection />
            <PressSection />
            <StudioNotesSection />
            <DifferentSection />
            <FaqSection />
            <NewsletterSection />
          </div>
        </main>
      </PageFade>
      <Footer />
    </div>
  );
}
