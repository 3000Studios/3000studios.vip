/**
 * Daily auto blog for 3000studios.vip.
 *
 * One new long-form post per day (UTC), built deterministically from the
 * date: the same date always produces the same post, so the page the
 * browser renders and the page the edge serves to crawlers
 * (functions/lib/route-meta.ts) always match. Every post keeps its own
 * permanent URL, /blog/daily/YYYY-MM-DD, once its day has passed.
 *
 * Pure data + string logic only: no DOM, no Vite imports, because the
 * Pages Functions middleware imports this file too.
 */

export const DAILY_START = '2026-11-24';
export const DAILY_BASE = '/blog/daily';

export type DailyTopicId = 'game' | 'music' | 'books' | 'podcast' | 'live' | 'creator';

export type DailyTopic = {
  id: DailyTopicId;
  label: string;
  short: string;
  tint: string;
  blurb: string;
  keywords: string[];
  cta: { label: string; to: string };
};

export type DailySection = { heading: string; paragraphs: string[] };
export type DailyFaq = { q: string; a: string };

export type DailyPost = {
  date: string;
  slug: string;
  path: string;
  topic: DailyTopic;
  title: string;
  description: string;
  keywords: string[];
  lead: string;
  sections: DailySection[];
  faq: DailyFaq[];
  readMinutes: number;
  wordCount: number;
};

export const DAILY_TOPICS: DailyTopic[] = [
  {
    id: 'game',
    label: 'Aeropocalypse Online',
    short: 'Game',
    tint: '#ff5a2c',
    blurb: 'Our free aerial combat shooter for Android: bosses, jets, upgrades and updates.',
    keywords: [
      'Aeropocalypse Online',
      'free Android shooter',
      'mobile aerial combat game',
      'arcade jet fighter game',
      'boss battle mobile game',
      'Google Play action game',
      'shoot em up for Android',
      'indie mobile game',
    ],
    cta: { label: 'See Aeropocalypse Online', to: '/aeropocalypse' },
  },
  {
    id: 'music',
    label: 'Independent Music',
    short: 'Music',
    tint: '#9b6bff',
    blurb: 'How 3000 Studios writes, produces and releases original songs and videos.',
    keywords: [
      'independent music',
      'new music releases',
      'music production process',
      'AI assisted music production',
      'official music videos',
      'stream new songs',
      'indie artist releases',
      '3000 Studios music',
    ],
    cta: { label: 'Open the Music Vault', to: '/music' },
  },
  {
    id: 'books',
    label: 'Books and Publishing',
    short: 'Books',
    tint: '#f2c867',
    blurb: '3000 Studios Press: mysteries, guides, cookbooks and how indie books get made.',
    keywords: [
      'indie publishing',
      'ebooks to read',
      'self published books',
      'new mystery novels',
      'creator guide books',
      'EPUB and PDF ebooks',
      'IngramSpark print books',
      '3000 Studios Press',
    ],
    cta: { label: 'Browse the books', to: '/books' },
  },
  {
    id: 'podcast',
    label: 'Podcast',
    short: 'Podcast',
    tint: '#3df2a8',
    blurb: 'Episodes, show notes and the craft of making a creator podcast.',
    keywords: [
      'creator podcast',
      'new podcast episodes',
      'podcast for indie creators',
      'Spotify podcast',
      'how to start a podcast',
      'podcast show notes',
      'studio podcast',
      '3000 Studios podcast',
    ],
    cta: { label: 'Listen to the podcast', to: '/podcast' },
  },
  {
    id: 'live',
    label: 'Live Streaming',
    short: 'Live',
    tint: '#ff3d3d',
    blurb: 'Going live from a phone: setup, looks, overlays and what viewers see.',
    keywords: [
      'live stream from phone',
      'mobile live streaming',
      'stream overlays and filters',
      'browser live streaming',
      'WebRTC live video',
      'creator live shows',
      'watch live music',
      '3000 Studios live',
    ],
    cta: { label: 'Watch live', to: '/live' },
  },
  {
    id: 'creator',
    label: 'Creator Tech',
    short: 'Tech',
    tint: '#3ee8ff',
    blurb: 'The web, design and tools behind a one-studio media brand.',
    keywords: [
      'creator website design',
      'fast website performance',
      'Cloudflare Pages',
      'web animation design',
      'creator business tools',
      'build a media brand',
      'mobile first web design',
      'indie studio tech stack',
    ],
    cta: { label: 'See the studio apps', to: '/apps' },
  },
];

type TopicCopy = {
  titles: string[];
  intros: string[];
  sections: DailySection[];
  faq: DailyFaq[];
};

const COPY: Record<DailyTopicId, TopicCopy> = {
  game: {
    titles: [
      'Aeropocalypse Online: The Free Android Aerial Combat Shooter Built for Fast Thumbs',
      'Why a Mobile Jet Fighter Game Lives or Dies on Its Boss Battles',
      'Arcade Shooter Tips: How to Survive Longer in Aeropocalypse Online',
      'Inside an Indie Mobile Game: Building a Boss Battle Shooter for Google Play',
      'Free Shoot Em Up for Android: What Makes Aeropocalypse Online Replayable',
    ],
    intros: [
      'Aeropocalypse Online is the free aerial combat shooter from 3000 Studios, made for Android and tuned for short, intense sessions on a phone. This post looks at what makes a mobile jet fighter game feel good in the hand, and why the boss fights carry so much of the weight.',
      'Mobile action games have to earn attention in seconds. Aeropocalypse Online, the free arcade jet fighter game from 3000 Studios on Google Play, is built around that idea: drop in, fly, fight a boss, and come back for one more run.',
      'If you want a free Android shooter that plays like an old arcade cabinet but runs on the phone in your pocket, this is a look at how Aeropocalypse Online approaches controls, enemies, bosses and upgrades.',
    ],
    sections: [
      {
        heading: 'Touch controls that keep the jet visible',
        paragraphs: [
          'The first rule of a mobile aerial combat game is simple: your thumb must never hide your own plane. Aeropocalypse Online keeps the jet offset from the touch point, so you can steer with precision and still see every bullet coming at you.',
          'That one decision changes how the whole game feels. Dodging becomes a skill instead of a guess, and the shooter rewards players who learn enemy patterns instead of players who get lucky.',
        ],
      },
      {
        heading: 'Boss battles as the heartbeat of every level',
        paragraphs: [
          'Each stage of a good arcade shooter builds toward a boss, and the boss is where the game teaches you what it wants from you. Big attacks are telegraphed, weak points open for short windows, and a clean dodge is always possible if you are paying attention.',
          'Boss battles on mobile have to be readable on a small screen. Clear colours, strong silhouettes and short pauses before heavy attacks keep the fight fair while still feeling dangerous.',
        ],
      },
      {
        heading: 'Upgrades, power ups and the one more run feeling',
        paragraphs: [
          'Power ups give a run its rhythm. Shields buy time, boosters change your position fast, and missiles turn a crowded screen into an opening. Picking the right moment to use each one is half the fun.',
          'Progression matters just as much between runs. Saving your progress and unlocking stronger jets gives every session a purpose, even a two minute one on the bus.',
        ],
      },
      {
        heading: 'Graphics and performance on real phones',
        paragraphs: [
          'A great looking shooter is pointless if it stutters. The goal for Aeropocalypse Online is smooth frame pacing first, then detail: animated environments, bright effects and explosions that read clearly without slowing the game down.',
          'Mobile hardware varies a lot, so effects scale with the device. Players on newer phones get more detail, and players on older phones still get a responsive, fair game.',
        ],
      },
      {
        heading: 'Why free to play can still feel fair',
        paragraphs: [
          'Aeropocalypse Online is free to download on Google Play. Fairness comes from keeping the core game skill based: practice and pattern reading are what get you further, and optional extras are there for players who want them.',
          'That balance keeps the game welcoming for new players and still interesting for players who want to master every boss and chase a better score.',
        ],
      },
    ],
    faq: [
      { q: 'Is Aeropocalypse Online free?', a: 'Yes. Aeropocalypse Online is free to download on Google Play for Android phones and tablets.' },
      { q: 'What kind of game is Aeropocalypse Online?', a: 'It is an arcade style aerial combat shooter: you fly a jet, fight waves of enemies, and take on boss battles at the end of each stage.' },
      { q: 'Who makes Aeropocalypse Online?', a: 'Aeropocalypse Online is made by 3000 Studios, the independent studio behind 3000studios.vip.' },
      { q: 'Where can I learn more about the game?', a: 'The Aeropocalypse page on 3000studios.vip has the trailer, screenshots and the Google Play link.' },
    ],
  },
  music: {
    titles: [
      'New Music From 3000 Studios: How an Independent Release Comes Together',
      'From Demo to Release Day: The 3000 Studios Music Production Process',
      'Independent Music in 2026: Writing, Producing and Releasing Without a Label',
      'AI Assisted Music Production, Done Honestly: How 3000 Studios Uses It',
      'Official Music Videos for Independent Songs: Why Every Release Gets One',
    ],
    intros: [
      '3000 Studios writes, produces and releases original music independently, from the first idea to release day on the major streaming platforms. This post walks through how a song moves from a rough demo to a finished release you can stream.',
      'Independent music has never had more tools, and never had more noise. Here is how 3000 Studios approaches new music releases: songwriting first, careful production, and a release plan that puts each song in front of listeners.',
      'Every song in the 3000 Studios catalogue starts as a small idea and ends up on Spotify, Apple Music and YouTube. This is a plain look at the production process in between.',
    ],
    sections: [
      {
        heading: 'Songwriting comes before sound',
        paragraphs: [
          'A strong production cannot rescue a weak song, so the work starts with the writing: a hook that sticks, verses that move the story forward, and a chorus that lands on the first listen.',
          'Demos stay rough on purpose. The point of a demo is to prove the song works with almost nothing around it, before any time goes into sound design.',
        ],
      },
      {
        heading: 'Production, arrangement and the mix',
        paragraphs: [
          'Arrangement gives the song its shape, from the intro to the final chorus. Drums and low end come first because they decide how a track feels on real speakers, then harmonies and the details that reward a second listen.',
          'Mixes are checked on studio monitors, ordinary earbuds and a car stereo, because that is where most people will actually hear the song.',
        ],
      },
      {
        heading: 'How AI tools fit, and where they stop',
        paragraphs: [
          'AI assisted music production is part of the toolkit at 3000 Studios, and the studio is open about it. Generated ideas and stems work like a fast sketchpad, never like a finished product.',
          'Every element that ships is chosen, edited and arranged by hand. The tools speed up exploration; the taste and the final decisions stay human.',
        ],
      },
      {
        heading: 'Release day and official music videos',
        paragraphs: [
          'Each release goes out to the major streaming platforms with clean metadata and artwork that reads at thumbnail size, because that is how most listeners will first see it.',
          'Most songs also get an official music video, so the release has a home on YouTube and in the Video Vault on this site, not only in a playlist.',
        ],
      },
      {
        heading: 'Where to listen first',
        paragraphs: [
          'The Music Vault on 3000studios.vip lets you preview songs right on the site, with links to stream the full tracks on your favourite platform.',
          'Following the studio on Spotify, Apple Music or YouTube is the easiest way to catch new music releases the day they land.',
        ],
      },
    ],
    faq: [
      { q: 'Where can I stream 3000 Studios music?', a: 'Songs are on the major streaming platforms, including Spotify, Apple Music and YouTube, with previews in the Music Vault on 3000studios.vip.' },
      { q: 'Does 3000 Studios use AI in its music?', a: 'AI tools are used openly as a sketchpad during production. Everything that ships is chosen, edited and arranged by hand.' },
      { q: 'Do the songs have music videos?', a: 'Many releases have official music videos on YouTube, also collected in the Video Vault on this site.' },
      { q: 'How often is new music released?', a: 'New songs and videos arrive throughout the year. Following the studio on your streaming platform is the best way to hear them first.' },
    ],
  },
  books: {
    titles: [
      'Indie Publishing Done Right: How 3000 Studios Press Makes a Book',
      'Ebooks to Read Next: Mysteries, Guides and Cookbooks From 3000 Studios Press',
      'Self Published Books That Read Like Professional Ones: The Press Workflow',
      'EPUB, PDF and Print: How an Indie Book Reaches Every Kind of Reader',
      'Why an Independent Press Can Publish a Big Catalogue Without Cutting Corners',
    ],
    intros: [
      '3000 Studios Press is the book imprint of 3000 Studios, publishing mysteries, creator guides, cookbooks and more as ebooks and print editions. This post looks at how a manuscript becomes a book you can buy.',
      'Indie publishing has a reputation problem: too many books are rushed. 3000 Studios Press takes the opposite route, with a real production pipeline from manuscript to store listing.',
      'Looking for your next ebook? Here is a look inside 3000 Studios Press, how its books are made, and where to find them in EPUB, PDF and print.',
    ],
    sections: [
      {
        heading: 'A complete manuscript before anything else',
        paragraphs: [
          'Every title starts as a finished manuscript, not a sample chapter. Fiction gets a full structural read for pacing and fairness; guides are checked to make sure every promise in the introduction is kept.',
          'Line editing comes after the structure is right, tightening repetition, continuity and the places where the writer knew what they meant but the reader would not.',
        ],
      },
      {
        heading: 'Covers built for the genre shelf',
        paragraphs: [
          'Each book gets an original cover designed to sit naturally beside the best books in its genre. A cover has to work at thumbnail size, because that is how most readers meet it first.',
          'The imprint and publisher details are consistent across every title, so the catalogue reads as one press rather than a pile of unrelated files.',
        ],
      },
      {
        heading: 'Ebooks that are validated, not assumed',
        paragraphs: [
          'EPUB files are checked against the standard before they are listed anywhere, and the file that passes the check is the exact file readers download.',
          'PDF editions are built separately for comfortable reading on larger screens, so every reader gets a file made for their device.',
        ],
      },
      {
        heading: 'Direct sales and print distribution',
        paragraphs: [
          'Ebooks are sold direct from the studio store, delivered at checkout in EPUB and PDF. Direct sales keep things simple: one store, both formats, no lock in.',
          'Print editions go out through IngramSpark, which places Press titles in the catalogues that bookstores and libraries order from.',
        ],
      },
      {
        heading: 'Finding your next read',
        paragraphs: [
          'The Books page on 3000studios.vip shows the whole catalogue with covers, descriptions and buy links, grouped so you can browse by what you like to read.',
          'New titles join the shelf regularly, so it is worth checking back or joining the VIP list for release news.',
        ],
      },
    ],
    faq: [
      { q: 'What is 3000 Studios Press?', a: '3000 Studios Press is the book imprint of 3000 Studios, publishing fiction, creator guides, cookbooks and more.' },
      { q: 'What formats are the books in?', a: 'Ebooks come in EPUB and PDF from the studio store, and many titles are also available in print.' },
      { q: 'Where can I buy the books?', a: 'The Books page on 3000studios.vip links every title to its store page.' },
      { q: 'Are the ebooks DRM free?', a: 'Ebooks bought direct from the studio store are delivered as standard EPUB and PDF files at checkout.' },
    ],
  },
  podcast: {
    titles: [
      'The 3000 Studios Podcast: Episodes for Creators Who Build Everything Themselves',
      'How to Start a Creator Podcast Without a Studio Budget',
      'Podcast Show Notes That Actually Help Listeners: Our Approach',
      'New Podcast Episodes: Music, Games, Books and the Business of Creating',
      'Why Every Indie Studio Should Have a Podcast',
    ],
    intros: [
      'The 3000 Studios podcast covers the work behind the studio: music, games, books, live shows and the business of being an independent creator. Here is what the show is about and how it gets made.',
      'Starting a creator podcast is easier than ever, but keeping one going is the real challenge. This post shares how the 3000 Studios podcast is planned, recorded and published.',
      'If you make things on your own, the 3000 Studios podcast is made for you. Here is a look at the show, the format and where to listen.',
    ],
    sections: [
      {
        heading: 'A show about making things',
        paragraphs: [
          'Each episode looks at a real part of studio life: a song release, a game update, a new book, or a lesson learned the hard way. The aim is practical value, not filler.',
          'Topics come from what the studio is building right now, so listeners hear about the work while it is happening.',
        ],
      },
      {
        heading: 'Simple gear, careful sound',
        paragraphs: [
          'A good podcast does not need an expensive studio. A decent microphone, a quiet room and a consistent recording routine matter more than any single piece of gear.',
          'Editing focuses on pace: cutting dead air and repeated points so each episode respects the listener’s time.',
        ],
      },
      {
        heading: 'Show notes that earn their place',
        paragraphs: [
          'Show notes are written for people deciding whether to listen and for people coming back to find something they heard. They summarise the episode and link to everything mentioned.',
          'Clear episode titles and descriptions also help new listeners find the show in podcast apps and search.',
        ],
      },
      {
        heading: 'Publishing everywhere listeners are',
        paragraphs: [
          'Episodes are published to Spotify and the other major podcast apps, and every episode is also listed on the Podcast page of 3000studios.vip.',
          'Listening on the site is the quickest way in: pick an episode and press play without installing anything.',
        ],
      },
      {
        heading: 'Keeping a podcast going',
        paragraphs: [
          'Consistency beats intensity. A realistic schedule that the studio can keep is better than a burst of episodes followed by silence.',
          'Batching recording sessions and keeping a running list of topic ideas makes it much easier to stay on schedule.',
        ],
      },
    ],
    faq: [
      { q: 'Where can I listen to the 3000 Studios podcast?', a: 'On Spotify and other podcast apps, and on the Podcast page of 3000studios.vip.' },
      { q: 'What is the podcast about?', a: 'Music, games, books, live streaming and the practical side of being an independent creator.' },
      { q: 'How long are episodes?', a: 'Episode length varies with the topic; each page lists the episode details before you press play.' },
      { q: 'Do I need an app to listen?', a: 'No. You can play episodes right on 3000studios.vip in your browser.' },
    ],
  },
  live: {
    titles: [
      'How to Live Stream From Your Phone With Real Overlays and Filters',
      'Mobile Live Streaming in the Browser: No App, No Studio Required',
      'Going Live at 3000 Studios: What Viewers See and How It Works',
      'Stream Overlays That Look Professional on a Phone Screen',
      'Live Music and Creator Shows: Watching 3000 Studios Live',
    ],
    intros: [
      '3000 Studios goes live straight from a phone, in the browser, with filters and overlays built into the stream. This post explains how mobile live streaming works here and what viewers see on the Live page.',
      'Live streaming from a phone used to mean a pile of apps and a weak picture. Modern browsers changed that. Here is how 3000 Studios streams live with nothing but a phone and a web page.',
      'Want to catch a 3000 Studios live show? Here is how the stream is produced and where to watch it.',
    ],
    sections: [
      {
        heading: 'Browser live streaming with WebRTC',
        paragraphs: [
          'The studio streams using WebRTC from the browser, so going live does not need a separate streaming app. The camera, microphone and look are all handled on one page.',
          'WebRTC keeps delay low, which makes a live show feel live: reactions and moments land close to when they happen.',
        ],
      },
      {
        heading: 'Filters and overlays built into the picture',
        paragraphs: [
          'Looks such as cinematic, warm gold or neon are applied to the picture before it is sent, along with overlays like a live badge, a lower third with the show title, and animated frames.',
          'Because the overlays are part of the stream itself, every viewer sees exactly the same polished picture on any device.',
        ],
      },
      {
        heading: 'Designed for the phone first',
        paragraphs: [
          'The studio controls are made for thumbs: big buttons, quick camera flips and one tap looks, so the host can focus on the show instead of the settings.',
          'The page also keeps the screen awake while streaming, and detects the device and camera so the setup is right from the start.',
        ],
      },
      {
        heading: 'What viewers get on the Live page',
        paragraphs: [
          'The public Live page shows the stream when the studio is on air and a clear standby screen when it is not, so viewers always know what is happening.',
          'The player stays mounted the whole time, which means no awkward reload when the show starts.',
        ],
      },
      {
        heading: 'Tips for a better phone stream',
        paragraphs: [
          'Light your face from the front, keep the phone steady, and plug in power for longer shows. Small changes make a phone stream look far more professional.',
          'Test the microphone before going live and keep background noise low. Viewers forgive a soft picture much faster than bad sound.',
        ],
      },
    ],
    faq: [
      { q: 'Where can I watch 3000 Studios live?', a: 'On the Live page of 3000studios.vip, which shows the stream whenever the studio is on air.' },
      { q: 'Do I need an app to watch?', a: 'No. The stream plays in your browser on phones, tablets and computers.' },
      { q: 'How does 3000 Studios stream from a phone?', a: 'It streams from the browser using WebRTC, with filters and overlays added to the picture before it is sent.' },
      { q: 'How do I know when a stream starts?', a: 'The Live page switches from standby to the stream as soon as the studio goes on air.' },
    ],
  },
  creator: {
    titles: [
      'Mobile First Web Design for Creators: Building a Site That Feels Special on a Phone',
      'Fast Website Performance on Cloudflare Pages: Lessons From 3000studios.vip',
      'Web Animation Design Without the Lag: Effects That Stay Smooth',
      'How One Indie Studio Runs a Media Brand: The Tech Stack',
      'Creator Business Tools: Music, Books, Games and Live Shows on One Site',
    ],
    intros: [
      '3000studios.vip is home to the studio’s music, books, game, podcast and live shows. This post looks at the design and technology choices that keep a busy creator site fast and fun to use, especially on a phone.',
      'A creator website has to do a lot: sell, stream, inform and impress. Here is how 3000 Studios builds its site with mobile first design, smooth animation and fast hosting.',
      'Building a media brand as an independent studio means picking tools carefully. This is a look at the stack and the design ideas behind 3000studios.vip.',
    ],
    sections: [
      {
        heading: 'Mobile first, not mobile later',
        paragraphs: [
          'Most visitors arrive on a phone, so every page is designed for a phone first: thumb friendly controls, readable type and layouts that never scroll sideways.',
          'Larger screens then get extra room and detail, rather than phones getting a squeezed copy of a desktop page.',
        ],
      },
      {
        heading: 'Animation that stays smooth',
        paragraphs: [
          'Live wallpapers, glowing headings and liquid effects only work if they stay smooth. Effects animate with the browser’s fastest paths and pause when they are off screen or the tab is hidden.',
          'Visitors who prefer reduced motion get a calm, still version of every page automatically.',
        ],
      },
      {
        heading: 'Fast hosting at the edge',
        paragraphs: [
          'The site is built with Vite and React and served from Cloudflare Pages, so pages load from a location close to each visitor.',
          'Server side page details give every route its own title, description and content for search engines, even though the site runs as a modern web app.',
        ],
      },
      {
        heading: 'One home for every product',
        paragraphs: [
          'Music, videos, books, the game, the podcast, merch and live shows all live on one domain. That keeps the brand consistent and makes it easy for a fan of one thing to discover another.',
          'Every product links out to where it is sold or streamed, so the site works as a hub rather than a dead end.',
        ],
      },
      {
        heading: 'Measuring what matters',
        paragraphs: [
          'Speed, accessibility and clear navigation are checked with every update, because a beautiful site that is slow or confusing loses visitors.',
          'Small improvements, shipped often, add up to a site that keeps getting better instead of needing a full rebuild every year.',
        ],
      },
    ],
    faq: [
      { q: 'What is 3000studios.vip built with?', a: 'The site is built with Vite and React and hosted on Cloudflare Pages.' },
      { q: 'Why mobile first design?', a: 'Most visitors arrive on phones, so designing for phones first gives the best experience to the most people.' },
      { q: 'Do the animations slow the site down?', a: 'Effects pause when they are off screen, and visitors who prefer reduced motion get a still version automatically.' },
      { q: 'What can I find on 3000studios.vip?', a: 'Music, videos, books, the Aeropocalypse Online game, the podcast, merch and live shows.' },
    ],
  },
};

/* ---------------- date helpers (UTC, so browser and edge agree) ---------------- */

const DAY_MS = 86_400_000;

export function utcDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function dayNumber(dateKey: string): number {
  return Math.floor(Date.parse(`${dateKey}T00:00:00Z`) / DAY_MS);
}

export function isDailyDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && utcDateKey(new Date(Date.parse(`${value}T00:00:00Z`))) === value;
}

/** True when a daily post exists for that date (from DAILY_START through today). */
export function dailyPostExists(dateKey: string, now: Date = new Date()): boolean {
  if (!isDailyDateKey(dateKey)) return false;
  const n = dayNumber(dateKey);
  return n >= dayNumber(DAILY_START) && n <= dayNumber(utcDateKey(now));
}

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rand: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function formatDailyDate(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${dateKey}T12:00:00Z`),
  );
}

export function topicForDate(dateKey: string): DailyTopic {
  const n = dayNumber(dateKey) - dayNumber(DAILY_START);
  const idx = ((n % DAILY_TOPICS.length) + DAILY_TOPICS.length) % DAILY_TOPICS.length;
  return DAILY_TOPICS[idx];
}

/** Build the post for one date. Same date in, same post out. */
export function buildDailyPost(dateKey: string): DailyPost {
  const n = dayNumber(dateKey) - dayNumber(DAILY_START);
  const topic = topicForDate(dateKey);
  const copy = COPY[topic.id];
  const cycle = Math.floor(n / DAILY_TOPICS.length);
  const rand = rng(dayNumber(dateKey) * 2654435761);
  const baseTitle = copy.titles[((cycle % copy.titles.length) + copy.titles.length) % copy.titles.length];
  const nice = formatDailyDate(dateKey);
  const title = `${baseTitle} (${nice})`;
  const lead = copy.intros[Math.floor(rand() * copy.intros.length)];
  const sections = shuffle(copy.sections, rand).slice(0, 4);
  const faq = shuffle(copy.faq, rand).slice(0, 3);
  const keywords = [...shuffle(topic.keywords, rand).slice(0, 6), '3000 Studios', '3000studios.vip'];
  const description = `${lead.split('. ')[0].replace(/\.$/, '')}.`.slice(0, 158);
  const words =
    lead.split(/\s+/).length +
    sections.reduce((s, sec) => s + sec.heading.split(/\s+/).length + sec.paragraphs.join(' ').split(/\s+/).length, 0) +
    faq.reduce((s, f) => s + `${f.q} ${f.a}`.split(/\s+/).length, 0);
  return {
    date: dateKey,
    slug: `daily/${dateKey}`,
    path: `${DAILY_BASE}/${dateKey}`,
    topic,
    title,
    description,
    keywords,
    lead,
    sections,
    faq,
    wordCount: words,
    readMinutes: Math.max(2, Math.round(words / 220)),
  };
}

/** Every published daily post, newest first. */
export function listDailyPosts(now: Date = new Date(), limit = 400): DailyPost[] {
  const today = dayNumber(utcDateKey(now));
  const start = dayNumber(DAILY_START);
  const out: DailyPost[] = [];
  for (let d = today; d >= start && out.length < limit; d -= 1) {
    out.push(buildDailyPost(utcDateKey(new Date(d * DAY_MS))));
  }
  return out;
}

function esc(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Full article HTML for the edge (crawlers see the real post before JS runs). */
export function dailyPostHtml(post: DailyPost): string {
  const body = post.sections
    .map((s) => `<h2>${esc(s.heading)}</h2>\n${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('\n')}`)
    .join('\n');
  const faq = post.faq.map((f) => `<h3>${esc(f.q)}</h3>\n<p>${esc(f.a)}</p>`).join('\n');
  return (
    `<main>\n<article>\n<h1>${esc(post.title)}</h1>\n` +
    `<p><time datetime="${post.date}">${formatDailyDate(post.date)}</time> · ${esc(post.topic.label)} · ${post.readMinutes} min read</p>\n` +
    `<p>${esc(post.lead)}</p>\n${body}\n<h2>Frequently asked questions</h2>\n${faq}\n` +
    `<p><a href="${post.topic.cta.to}">${esc(post.topic.cta.label)}</a> · <a href="/blog">More from the 3000 Studios blog</a></p>\n` +
    `</article>\n</main>`
  );
}

/** BlogPosting + FAQPage JSON-LD for one post. */
export function dailyPostJsonLd(post: DailyPost, origin = 'https://3000studios.vip', video?: { name: string; thumbnailUrl: string; contentUrl?: string; embedUrl?: string }): string {
  const url = `${origin}${post.path}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: `${post.date}T00:00:00Z`,
      dateModified: `${post.date}T00:00:00Z`,
      keywords: post.keywords.join(', '),
      articleSection: post.topic.label,
      wordCount: post.wordCount,
      mainEntityOfPage: url,
      url,
      author: { '@type': 'Person', name: 'Jeremy Swain' },
      publisher: { '@type': 'Organization', name: '3000 Studios', url: origin },
      ...(video
        ? {
            video: {
              '@type': 'VideoObject',
              name: video.name,
              description: post.description,
              thumbnailUrl: video.thumbnailUrl,
              uploadDate: `${post.date}T00:00:00Z`,
              ...(video.contentUrl ? { contentUrl: video.contentUrl } : {}),
              ...(video.embedUrl ? { embedUrl: video.embedUrl } : {}),
            },
          }
        : {}),
    },
    {
      '@type': 'FAQPage',
      mainEntity: post.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

/** Sitemap XML for every daily post. */
export function dailySitemapXml(now: Date = new Date(), origin = 'https://3000studios.vip'): string {
  const urls = listDailyPosts(now, 5000)
    .map((p) => `  <url><loc>${origin}${p.path}</loc><lastmod>${p.date}</lastmod><changefreq>monthly</changefreq></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${origin}/blog</loc><changefreq>daily</changefreq></url>\n${urls}\n</urlset>\n`;
}
