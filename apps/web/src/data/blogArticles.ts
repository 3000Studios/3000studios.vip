export interface BlogArticle {
  slug: string;
  /* Former slugs that must keep resolving after a rename. */
  aliases?: string[];
  title: string;
  category: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  summary: string;
  leadParagraph: string;
  sections: {
    heading: string;
    body: string[];
  }[];
  tags: string[];
}

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'how-aeropocalypses-24-bosses-were-designed',
    title: "How Aeropocalypse's 24 Bosses Were Designed: Multi-Phase Combat & Algorithmic Bullet Patterns",
    category: 'Game Design & Engineering',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-15',
    updatedAt: '2026-09-28',
    readTime: '6 min read',
    summary: 'A deep dive into the mathematical algorithms, spatial collision matrices, and telegraphing systems behind Aeropocalypse’s 24 unique boss fights.',
    leadParagraph: 'When building a high-speed arcade flight combat game in pure JavaScript and Canvas, the biggest architectural challenge is creating boss encounters that feel visually overwhelming while remaining completely fair, readable, and responsive on mobile touchscreens.',
    sections: [
      {
        heading: '1. The Mathematics of Bullet Emitters',
        body: [
          'Rather than spawning hundreds of unmanaged particle objects every frame, Aeropocalypse utilizes a high-efficiency pre-allocated object pool. Each boss phase calculates trigonometric bullet trajectories using parametric spiral equations:',
          'By varying the rotational delta θ and velocity vectors dynamically against the game clock, we create complex geometric bullet curtains—like the "Magma Caldera Eruption" in Level 2 or the "Chronos Vortex" in Level 24—with virtually zero garbage collection stutter.',
        ],
      },
      {
        heading: '2. Multi-Phase Telegraphing & Weak Points',
        body: [
          'Every boss in Aeropocalypse features distinct visual telegraphs before executing devastating signature attacks. Glowing obsidian armor plates shift to molten gold, indicating a 600ms vulnerability window where precision hits deal 3x critical damage.',
          'This dynamic risk-reward loop ensures that players who master evasive maneuvers can speedrun boss stages and climb the global leaderboards.',
        ],
      },
      {
        heading: '3. Mobile Touch Optimization & Input Latency',
        body: [
          'On mobile devices, touch lag can destroy the arcade experience. Aeropocalypse bypasses standard DOM event bubbling, capturing direct PointerEvents on the raw canvas viewport with sub-millisecond interpolation.',
        ],
      },
    ],
    tags: ['Game Dev', 'TypeScript', 'Canvas 2D', 'Aeropocalypse', 'Boss Design'],
    aliases: ['how-thunder-domes-24-bosses-were-designed'],
  },
  {
    slug: 'inside-amped-ear-3000-spectral-audio',
    title: 'Inside Amped Ear 3000: Real-Time Audio Analysis & Low-Latency Web Audio DSP',
    category: 'Audio Engineering',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-10',
    updatedAt: '2026-09-25',
    readTime: '5 min read',
    summary: 'How Amped Ear achieves 4096-bin Fast Fourier Transform decomposition and ultra-low latency acoustic visualization in browser and Android runtimes.',
    leadParagraph: 'Pro music producers and mixing engineers need instantaneous feedback when hunting down harsh resonances and muddiness in frequency spectra. Amped Ear 3000 was built to bring laboratory-grade FFT waterfall graphs and precision EQ ear training directly into the studio workflow.',
    sections: [
      {
        heading: '1. Web Audio API & 4096-Bin FFT Resolution',
        body: [
          'Standard browser visualizers use low-resolution 512-point FFTs that smear low-end bass frequencies below 150 Hz. Amped Ear utilizes a 4096-sample AnalyserNode paired with Blackman-Harris windowing to resolve sub-bass fundamentals down to 10 Hz.',
          'This allows mixing engineers to isolate 808 sub rumble from kick drum punch with surgical precision.',
        ],
      },
      {
        heading: '2. GPU-Accelerated Spectral Waterfall Rendering',
        body: [
          'To render 60 FPS waterfall spectrums without dropping audio frames, rendering is decoupled from the audio processing thread using requestAnimationFrame and OffscreenCanvas where available.',
        ],
      },
      {
        heading: '3. Ear Training & Resonance Recognition',
        body: [
          'The ear training module generates randomized narrow-Q frequency boosts and challenges users to identify the exact resonant center frequency by ear, developing sharp auditory instincts for mixing and mastering.',
        ],
      },
    ],
    tags: ['Audio DSP', 'Web Audio', 'Music Production', 'Amped Ear', 'Sound Design'],
  },
  {
    slug: 'building-production-site-on-cloudflare-pages',
    title: 'Building a Zero-Lag Production Website on Cloudflare Pages & Workers',
    category: 'Web Architecture',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-05',
    updatedAt: '2026-09-22',
    readTime: '5 min read',
    summary: 'The architectural decisions behind 3000studios.vip: static Vite bundling, Cloudflare native Git CI, WebRTC WHIP streaming, and edge caching.',
    leadParagraph: 'Modern media websites often crumble under heavy JavaScript bundles, bloated analytics, and slow CDN roundtrips. At 3000 Studios, we engineered 3000studios.vip to deliver instant 47-song streaming, live broadcast stage integration, and full commerce with sub-second page loads globally.',
    sections: [
      {
        heading: '1. Native Cloudflare Pages Git Integration',
        body: [
          'Rather than relying on third-party CI/CD chains with billing limits, our production deployment pipeline leverages Cloudflare Pages native Git integration. A direct push to main automatically triggers an edge-optimized build and atomic worldwide deployment in under 60 seconds.',
        ],
      },
      {
        heading: '2. Sub-Second Live Video via WebRTC WHIP/WHEP',
        body: [
          'Traditional HLS streaming introduces 6 to 15 seconds of latency. By pairing Cloudflare Stream WebRTC WHIP ingress with WHEP playback, our live stage achieves sub-500ms glass-to-glass latency directly on mobile phones.',
        ],
      },
      {
        heading: '3. CSS Tokens & Zero-Runtime Styles',
        body: [
          'We eliminated heavy runtime CSS-in-JS libraries in favor of clean CSS variables, clamp() typography, and modular stylesheets, keeping our first contentful paint (FCP) blazing fast on mobile 4G networks.',
        ],
      },
    ],
    tags: ['Cloudflare', 'Web Architecture', 'Performance', 'WebRTC', 'Vite'],
  },
  {
    slug: 'how-3000-studios-uses-ai-to-build-faster',
    title: 'How 3000 Studios Uses AI to Accelerate Music, Visuals, and Code Production',
    category: 'AI Workflows',
    author: 'Jeremy Swain',
    publishedAt: '2026-08-30',
    updatedAt: '2026-09-20',
    readTime: '6 min read',
    summary: 'An honest look at how autonomous agent fleets, neural audio generation, and multimodal AI tools supercharge solo and indie studio execution.',
    leadParagraph: 'The modern digital studio is no longer constrained by the traditional boundaries of team size. By orchestrating AI across software development, musical composition, and visual art creation, 3000 Studios ships full-length music catalogs, games, and web apps with studio-grade velocity.',
    sections: [
      {
        heading: '1. Agentic Coding & Autonomous Refactoring',
        body: [
          'We utilize advanced AI agents equipped with local tools to handle dependency updates, test automation, accessibility auditing, and code cleanups, freeing our focus for core creative direction and user experience.',
        ],
      },
      {
        heading: '2. Neural Audio Ideation to Master Release',
        body: [
          'AI audio generation serves as a rapid idea scratchpad. Raw generated stems are imported into digital audio workstations (DAWs), resampled, mixed with analog synthesizers, and mastered to DistroKid standards.',
        ],
      },
      {
        heading: '3. Creative Ownership & Human Curation',
        body: [
          'AI accelerates production velocity, but human curation, sound design, and engineering rigor define the final quality of everything released under the 3000 Studios banner.',
        ],
      },
    ],
    tags: ['AI Workflows', 'Music Production', 'Indie Studio', 'Agentic Coding'],
  },
  {
    slug: 'from-demo-to-distrokid-how-a-3000-studios-single-is-made',
    title: 'From Demo to DistroKid: How a 3000 Studios Single Is Made, Start to Finish',
    category: 'Music Production',
    author: 'Jeremy Swain',
    publishedAt: '2026-11-04',
    updatedAt: '2026-11-08',
    readTime: '7 min read',
    summary: 'The complete pipeline behind a 3000 Studios weekly single: idea capture, arrangement, vocal production, mix and master, artwork, and worldwide distribution — with the quality gates at each step.',
    leadParagraph: 'A new 3000 Studios single lands every week, and from the outside it can look effortless: a title appears, a cover appears, and the song is suddenly on every platform. In reality every track passes through the same six-stage pipeline, and any stage can send it back. This is that pipeline, exactly as it runs in the studio.',
    sections: [
      {
        heading: '1. Idea Capture and the Demo',
        body: [
          'Every song starts as a captured idea — a voice memo, a four-bar loop, a title with a mood attached. Ideas are logged the moment they happen, because the idea you do not write down is the one you lose. The demo that follows is deliberately rough: tempo, key, a scratch melody, and the emotional target of the track in one sentence. If the one-sentence target cannot be written, the idea is not ready, and it goes back into the log instead of into production.',
          'Demos are also where the catalog stays honest. A demo that duplicates an existing release too closely gets caught here, while it is still cheap to change — a new angle, a new tempo, or a merge with another fragment in the log.',
        ],
      },
      {
        heading: '2. Arrangement and Production',
        body: [
          'Arrangement turns the demo into a structure: intro, verses, choruses, a bridge that earns its place, and an ending that resolves instead of stopping. Production builds the sound world around that structure — drums and low end first, because they decide how the track feels on real speakers, then harmonic layers, then the ear candy that rewards a second listen.',
          'AI assistance is part of this stage at 3000 Studios, and we are open about it: generated stems and variations serve as raw material and a fast scratchpad. Nothing generated ships as-is. Every element is auditioned, edited, re-performed or re-processed, and arranged by hand before it is allowed into the mix.',
        ],
      },
      {
        heading: '3. Vocal Production, Mix, and Master',
        body: [
          'Vocals are recorded, comped, and tuned with a light hand — the goal is the performance, not the polish line. The mix then balances the track on three references: studio monitors, ordinary earbuds, and a car stereo, because most listeners will meet the song on the second and third. A mix that only works on expensive speakers is not finished.',
          'Mastering targets the loudness and tonal standards the streaming platforms expect, without crushing the dynamics that make the track breathe. The master is checked as a full start-to-finish listen, in order, at listening volume — the same way a fan will hear it.',
        ],
      },
      {
        heading: '4. Artwork, Metadata, and Release',
        body: [
          'Cover art is made per release and checked against a simple rule: it has to read at thumbnail size, because that is how most people will first see it. Metadata — title, credits, genre, and the clean/explicit flag — is entered once, carefully, because a metadata error follows a song to every platform at once.',
          'Distribution runs through DistroKid to Spotify, Apple Music, YouTube, and the other major platforms. On release day the track also lands here: a one-minute preview in the Music Vault, the official video in the Video Vault, and full streams one tap away on the listener’s platform of choice.',
        ],
      },
    ],
    tags: ['Music Production', 'Releases', 'DistroKid', 'Studio Process'],
  },
  {
    slug: 'inside-3000-studios-press-how-a-book-is-published',
    title: 'Inside 3000 Studios Press: How a Book Goes From Manuscript to Print and Ebook',
    category: 'Publishing',
    author: 'Jeremy Swain',
    publishedAt: '2026-11-07',
    updatedAt: '2026-11-10',
    readTime: '7 min read',
    summary: 'How 3000 Studios Press publishes a book: manuscript standards, editing passes, cover and interior production, EPUB validation, direct ebook sales, and print distribution through IngramSpark.',
    leadParagraph: '3000 Studios Press is the book imprint of 3000 Studios, and it runs on the same principle as the music side: a real pipeline with quality gates, not a folder of drafts. This article walks a title through the whole route — manuscript, edits, production files, store listings, and print distribution.',
    sections: [
      {
        heading: '1. The Manuscript Standard',
        body: [
          'A Press title starts with a complete manuscript, not a sample. Fiction titles are full novels; the creator guides are complete playbooks with checklists and plans a reader can execute. Before anything else happens, the manuscript is read end to end for structure: does the mystery play fair, does the guide keep its promises, does the cookbook’s twelfth recipe belong with the other eleven?',
          'Only after the structural read does line editing begin — continuity, repetition, dead scenes, and the places where the writer knew what they meant but the reader cannot. The goal is a book that a stranger can finish and recommend, because that is the only marketing that compounds.',
        ],
      },
      {
        heading: '2. Production: Cover, Interior, and EPUB',
        body: [
          'Each book gets an original cover designed for its genre shelf, with the imprint line on the cover and the publisher information on the copyright page: written by Jeremy Swain, published under the 3000 Studios Press imprint. Interior files are built separately for print and ebook, because a PDF that prints beautifully is not the same file an e-reader wants.',
          'Ebooks are validated, not assumed. Every EPUB passes a full EPUBCheck run before it is listed anywhere, and the file that is checked is the file that ships — checksums are kept so a store can never silently end up with a different build than the one that passed.',
        ],
      },
      {
        heading: '3. Selling Direct, and Print Through IngramSpark',
        body: [
          'Ebooks are sold direct from the studio store on Payhip at $9.99, in EPUB and PDF, delivered at checkout — the Books page on this site is the front door. Direct sales keep the relationship with the reader simple: one store, one price, both formats, no platform lock-in.',
          'Print editions are distributed through IngramSpark, which puts Press titles into the catalogs bookstores and libraries actually order from. That split — direct for digital, IngramSpark for print — is deliberate: each channel does the job it is best at, and a reader who wants the physical book can order it through their usual store.',
        ],
      },
      {
        heading: '4. Why an Indie Press at All',
        body: [
          'The honest answer is control over the whole chain. A traditional route would put months between a finished manuscript and a reader, and would hand the pricing, the formats, and the release calendar to someone else. The Press keeps all four in the studio, which is how a catalog of dozens of titles can exist at all — each book is produced once, properly, and then it keeps working: on the shelf, in the store, and in the hands of the next reader who finds it.',
        ],
      },
    ],
    tags: ['Publishing', 'Books', '3000 Studios Press', 'IngramSpark'],
  },
];
