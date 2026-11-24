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
  /** Long-read pull quote, only where the mockup supplies one. */
  pullQuote?: string;
}

/**
 * The six Studio Notes posts from the redesign mockup (sections 15–16).
 * Titles and categories follow the mockup exactly. Four articles carry the
 * full body copy already in the repo; the last two have no body copy in the
 * repo, so they ship as long-read shells (title + category only) until the
 * studio supplies the text — see NOTES.md.
 */
export const BLOG_ARTICLES: BlogArticle[] = [
  {
    slug: 'how-aeropocalypses-24-bosses-were-designed',
    title: "How Aeropocalypse's 24 Bosses Were Designed: Threat Classes, Telegraphs and Fair Bullet Patterns",
    category: 'Game Design & Engineering',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-15',
    updatedAt: '2026-11-24',
    readTime: '8 min read',
    summary: 'How the 24 bosses of Aeropocalypse: Online were planned: four threat classes, weak points that grow out of each setting, telegraphed attacks, readable bullet patterns and one-thumb touch controls.',
    leadParagraph: 'Aeropocalypse: Online has 24 bosses spread across 24 levels, and every one of them has to do two jobs at once: look overwhelming on a phone screen, and still be fair to a player steering with one thumb. This is how the roster was planned, how the fights are paced, and the design rules every boss had to pass before it shipped.',
    sections: [
      {
        heading: 'Four threat classes set the pace',
        body: [
          'The 24 bosses are grouped into four threat classes, and each class marks a step in what the game expects from you. ALPHA covers levels 1 to 3: Vanguard Sentinel over Orbital Station Alpha, Pyroclast Titan above the Volcanic Ash Caldera, and Cybernetic Leviathan in the Sub-Zero Cloud Ocean. These fights teach the basic loop of dodging a pattern, finding the weak point and punishing it.',
          'OMEGA runs from level 4 to level 12 and is the longest stretch. It starts with Goliath Dread-Mech in the Neon Megacity Spire and ends with Neon Reaper in the Cyber City Ruins. In between are Void Harvester, Tempest Dread-Wing, Dune Revenant, Abyssal Maw, Frostbite Sovereign, Rust Colossus and Viridian Idol. OMEGA bosses add a second idea to every fight: a hazard, a moving weak point or a pattern that changes speed.',
          'TITAN covers levels 13 to 18, from Solar Inquisitor in the Solar Flare Corridor to Obsidian Mirror in the Lunar Dark Basin. These bosses attack the way you play: Quantum Harlequin sends a mirror copy of your own ship, Iron Matriarch floods the screen with fighters, and Obsidian Mirror answers with shadow clones.',
          'NEXUS is the final six, levels 19 to 24: Void Archon, Chrono Tyrant, Starforge Leviathan, Nightmare Protocol, Harbinger of Silence and Apex Overlord 3000 in The Dimensional Core. By this point the player knows every tool, so NEXUS fights combine them.',
        ],
      },
      {
        heading: 'Every boss is built from the same five parts',
        body: [
          'Each boss in the game data has the same fields: a name and codename, a level, a threat class, an environment, a weak point, a signature attack and a score value. That structure is deliberate. It forces every new boss to answer the same questions before any art is made: where does this fight happen, what does it do that no other boss does, and where should the player aim.',
          'The environment comes first because it decides what the boss is made of. A fight above lava suggests heat vents and magma bombs, so Pyroclast Titan is weak at its cooling exhaust ducts. A fight under the sea suggests pressure, so Abyssal Maw is weak at its pressure-sealed gill vents. When the weak point grows out of the setting, players can often guess where to shoot before the game tells them.',
        ],
      },
      {
        heading: 'Telegraphs: the rule that keeps a fight fair',
        body: [
          'A boss attack is only fair if the player can see it coming. Every signature attack in Aeropocalypse gets a telegraph: a change of colour, a charge-up sound, a pause or a visible wind-up before the damage arrives. Big attacks get long warnings and small ones get short warnings, so the size of the warning tells you how much trouble you are in.',
          'The same rule works in reverse for weak points. A weak point that opens without warning feels random. A weak point that opens right after a telegraphed attack feels like a reward for surviving it, and that rhythm of danger followed by an opening is the heartbeat of every fight in the game.',
        ],
      },
      {
        heading: 'Readable bullet patterns on a small screen',
        body: [
          'Bullet patterns are designed around one question: can a player on a phone read this at a glance? Patterns are built from shapes the eye picks up quickly, such as spirals, rings, fans and lanes, and each boss leans on one family of shapes so its fight has its own identity.',
          'Projectiles that hurt you are kept visually separate from your own fire and from the background, and the densest patterns always leave a gap. The goal is a screen that looks overwhelming but is always survivable for a player who reads it correctly.',
        ],
      },
      {
        heading: 'Designed for one thumb',
        body: [
          'Aeropocalypse is a mobile game first, so every boss is tested against touch controls. The ship sits above your thumb instead of under it, so you never hide your own plane, and attacks are tuned so you can dodge them with small movements rather than long swipes across the screen.',
          'That is also why fights avoid attacks that cover the bottom edge of the screen for long: that is where the thumb lives. Pressure comes from above and from the sides, where the player can see it.',
        ],
      },
      {
        heading: 'How difficulty climbs across 24 levels',
        body: [
          'Difficulty climbs in three ways at once: faster patterns, more simultaneous threats and shorter openings at the weak point. Score values climb with it, from 15,000 points for the first boss upward, so later fights are worth chasing even for players who have already beaten them once.',
          'Each class change is also a lesson change. ALPHA teaches dodging, OMEGA teaches reading the environment, TITAN teaches dealing with bosses that copy or swarm you, and NEXUS asks you to use everything at once.',
        ],
      },
      {
        heading: 'Play the fights yourself',
        body: [
          'Aeropocalypse: Online is free on Google Play. The game page on this site lists every boss with its environment, weak point and signature attack, so you can scout a fight before you take it on.',
        ],
      },
    ],
    tags: ['Game Design', 'Aeropocalypse', 'Boss Design', 'Mobile Games'],
    aliases: ['how-thunder-domes-24-bosses-were-designed'],
    pullQuote: 'Four threat classes set the pace: ALPHA, OMEGA, TITAN and NEXUS.',
  },
  {
    slug: 'inside-amped-ear-3000-spectral-audio',
    title: 'Inside Amped Ear 3000: How a 4096-Point FFT Helps You Fix a Mix',
    category: 'Software',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-10',
    updatedAt: '2026-11-24',
    readTime: '7 min read',
    summary: 'How Amped Ear 3000 uses a high-resolution FFT to show what is happening in a mix, why window size matters, and how to use a spectrum analyzer and ear training to fix muddy, harsh or crowded mixes.',
    leadParagraph: 'A spectrum analyzer shows you what your ears are hearing as a picture of frequencies. Amped Ear 3000 is the 3000 Studios audio analyzer and ear trainer, built around a 4096-point FFT. This article explains what that number means, why it matters for bass-heavy music, and how to use an analyzer alongside your ears to make better mixing decisions.',
    sections: [
      {
        heading: 'What an FFT actually does',
        body: [
          'A Fast Fourier Transform takes a short slice of audio and splits it into frequency bins, each one showing how much energy sits in a narrow band of the spectrum. Draw those bins side by side and you get the familiar spectrum display: low frequencies on the left, highs on the right, loudness going up.',
          'The width of each bin is the sample rate divided by the FFT size. At a 48 kHz sample rate, a 512-point FFT gives bins about 94 Hz wide, which means everything from a deep sub to the body of a kick drum can land in one or two bins. A 4096-point FFT gives bins about 11.7 Hz wide, enough to separate an 808 sitting at 45 Hz from a kick fundamental at 60 Hz.',
        ],
      },
      {
        heading: 'The trade-off: detail in frequency or detail in time',
        body: [
          'A larger FFT needs a longer slice of audio, so frequency detail comes at the cost of time detail. At 48 kHz, 4096 samples is about 85 milliseconds, which is long enough to blur very fast transients such as the click of a kick or a snare crack.',
          'That is why a good analyzer is used for the steady parts of a sound: the sustain of a bass note, the body of a vocal, the ring of a resonance. For transients, your ears and a level meter are better tools. Knowing which tool answers which question is half of using an analyzer well.',
        ],
      },
      {
        heading: 'Why windowing matters',
        body: [
          'Cutting audio into slices creates sharp edges, and sharp edges smear energy across neighbouring bins. A window function fades each slice in and out so the spectrum shows real peaks instead of a haze. Windows with steep side lobes, such as Blackman-Harris, keep a loud bass note from spilling into the bins around it, which matters when you are hunting a problem frequency just next to a strong one.',
        ],
      },
      {
        heading: 'Smooth display without dropped audio',
        body: [
          'Analysis and drawing are kept apart. The audio engine fills the frequency data, and the display reads the latest data once per screen refresh. If drawing ever falls behind, the picture skips a frame but the sound never does, which is the right priority for a tool that sits in a studio session.',
        ],
      },
      {
        heading: 'Using an analyzer to fix common mix problems',
        body: [
          'Muddy mixes usually have too much energy building up between about 200 and 400 Hz, where guitars, keys, vocals and the upper part of the bass all overlap. An analyzer shows that build-up as a hump. Cutting a little from the instruments that do not need that range clears space for the ones that do.',
          'Harshness usually lives between about 2 and 5 kHz, where the ear is most sensitive. A narrow peak that jumps out on the display and also sounds piercing is a good candidate for a small, narrow cut. Low-end clashes show up as two strong peaks close together under 100 Hz; deciding whether the kick or the bass owns the lowest octave, and shaping the other one around it, makes both hit harder.',
          'The display is a guide, not the judge. If a cut looks right but sounds worse, undo it.',
        ],
      },
      {
        heading: 'Ear training: learning to hear frequencies',
        body: [
          'The ear training mode plays audio with a narrow boost at a hidden frequency and asks you to name it. Over time this builds the skill that matters most: hearing a problem and knowing roughly where it lives before you ever look at a screen.',
          'Short daily sessions work better than long ones. Start with octave-wide guesses, then narrow them down as your accuracy improves.',
        ],
      },
      {
        heading: 'Where Amped Ear fits in the studio',
        body: [
          'At 3000 Studios the analyzer sits at the end of the chain while mixing singles, as a second opinion on the low end and on harsh peaks. You can find Amped Ear 3000 with the rest of the studio\'s tools on the Apps page.',
        ],
      },
    ],
    tags: ['Audio DSP', 'Web Audio', 'Music Production', 'Amped Ear', 'Sound Design'],
  },
  {
    slug: 'building-production-site-on-cloudflare-pages',
    title: 'How 3000studios.vip Runs on Cloudflare Pages, and the Deploy Lesson We Learned',
    category: 'Engineering',
    author: 'Jeremy Swain',
    publishedAt: '2026-09-05',
    updatedAt: '2026-11-24',
    readTime: '8 min read',
    summary: 'How 3000studios.vip is built: a Vite and React single-page app on Cloudflare Pages, edge functions that serve real content to search engines, D1 and R2 for data and media, and the deployment lesson that kept those functions offline for weeks.',
    leadParagraph: '3000studios.vip is a music, books, podcast and game site run by one studio, so it has to be fast, cheap to run and easy to change. It runs on Cloudflare Pages: a static app served from the edge, plus a small set of edge functions for the parts that need a server. This is how it fits together, and what we learned when part of it quietly stopped deploying.',
    sections: [
      {
        heading: 'The front end: a static app built with Vite',
        body: [
          'The site is a React single-page app built with Vite. Each page is loaded on demand, so a visitor on the home page does not download the code for the admin dashboard or the video vault. The build produces plain files, and Cloudflare Pages serves them from data centres close to each visitor.',
          'Styles are plain CSS with shared variables for colour and spacing, and fluid type sizes that scale with the screen. There is no CSS-in-JS runtime to download, which keeps the first paint fast on phones.',
        ],
      },
      {
        heading: 'Deploys from Git',
        body: [
          'Every change goes through a pull request. When it merges into main, Cloudflare Pages builds the site and swaps the new version in all at once, so visitors never see half of an update. Every pull request also gets its own preview address, which is where changes are checked before they reach the live site.',
        ],
      },
      {
        heading: 'Edge functions for what needs a server',
        body: [
          'A single-page app has one weakness: until the JavaScript runs, every page is the same empty shell. Search engines and link previews often see that shell. To fix it, an edge function runs in front of every page request and injects that page\'s real title, description, structured data and body text into the HTML before it leaves the server.',
          'The same layer handles the parts of the site that need private logic: the live stream access gate, the on-air flag that turns the live page on, signed playback for the broadcast, the live chat room, song requests and the music proxy that streams tracks from storage.',
        ],
      },
      {
        heading: 'D1 and R2 for data and media',
        body: [
          'Small pieces of state, such as whether the studio is live and who may watch a private stream, are stored in Cloudflare D1, a SQL database that runs next to the functions. Full-length audio is stored in R2, Cloudflare\'s object storage, and streamed through a function so the site controls exactly which files are reachable.',
        ],
      },
      {
        heading: 'Live video with WebRTC',
        body: [
          'Most live streams on the web use HLS, which delivers video in chunks and usually runs several seconds behind real life. The 3000 Studios live stage uses Cloudflare Stream with WebRTC ingest and playback instead, which keeps the delay to around a second, short enough for a real conversation with the chat. The broadcast studio lives inside the owner dashboard and sends video straight from a phone or laptop.',
        ],
      },
      {
        heading: 'The lesson: a build that failed without failing',
        body: [
          'In October the edge functions were moved to a new folder so Cloudflare would pick them up. Three of the files were deleted instead of moved, and another file still imported one of them. From then on the functions could not be built, but the site itself still deployed, so the problem was easy to miss: pages loaded, while every server route quietly fell back to the 404 page.',
          'The fix was to restore the missing files and make sure the functions folder is found from the project root that Cloudflare actually builds from. The bigger lesson is to test what you deploy, not just whether it deployed. A green deploy only means the build finished. A simple request to one API route after each deploy would have caught this on the first day.',
        ],
      },
      {
        heading: 'What keeps it fast and cheap',
        body: [
          'The whole site runs on Cloudflare\'s free tier. Most requests are static files served from cache, the functions are small and short-lived, and media streams from object storage without a separate server. For an independent studio, that means the site can grow with the catalogue without a hosting bill that grows with it.',
        ],
      },
    ],
    tags: ['Cloudflare', 'Web Architecture', 'Performance', 'WebRTC', 'Vite'],
  },
  {
    slug: 'how-3000-studios-uses-ai-to-build-faster',
    title: 'How 3000 Studios Uses AI to Accelerate Music, Visuals, and Code Production',
    category: 'Studio',
    author: 'Jeremy Swain',
    publishedAt: '2026-08-30',
    updatedAt: '2026-11-24',
    readTime: '7 min read',
    summary: 'An honest look at how a one-person studio uses AI agents for code, AI tools for music ideas and artwork, and human review at every step that ships.',
    leadParagraph: '3000 Studios is run by one person, Jeremy Swain, yet it ships a music catalogue, a podcast, a shelf of books, a mobile game and a set of websites. AI is a big part of how that is possible. This is an honest look at where AI helps, where it does not, and the rules that keep the work good.',
    sections: [
      {
        heading: 'AI agents for code, with every change reviewed',
        body: [
          'Most of the studio\'s software work is done with AI coding agents. They write features, fix bugs, update dependencies and run the tests, but they work the same way a human developer would: on a branch, through a pull request, with automated checks that have to pass before anything merges.',
          'That process matters more than the agent. A pull request leaves a record of what changed and why, a preview deploy shows the change running before it goes live, and nothing reaches the public site without a final yes.',
        ],
      },
      {
        heading: 'More than one agent, each with a job',
        body: [
          'Different agents handle different kinds of work. One runs on the studio\'s own machine and handles builds, media processing and anything that needs local files. Others work in the cloud on code changes and research. A shared set of notes records what each one is doing, so work is not repeated and finished tasks are not reopened by mistake.',
        ],
      },
      {
        heading: 'AI as a sketchpad for music',
        body: [
          'On the music side, AI generation is used as an idea sketchpad: a fast way to try a hook, a groove or an arrangement and hear whether it works. Ideas that survive are developed further, arranged, mixed and mastered before release through DistroKid to Spotify, Apple Music and the other platforms.',
          'Song titles, lyrics, concepts and the final say on every release stay with the artist. The step-by-step process is in the companion article on how a 3000 Studios single is made.',
        ],
      },
      {
        heading: 'Artwork, video and the podcast',
        body: [
          'Cover art, video clips and promotional images often start with AI image and video tools, then get edited, cropped and assembled by hand. The Follow and Subscribe podcast is produced with AI help too, and every episode has to pass its checks before it is published.',
        ],
      },
      {
        heading: 'Where AI does not help',
        body: [
          'AI is fast, but it is not careful on its own. It can be confidently wrong, it can repeat the same mistake across many files, and it does not know what the studio actually wants unless someone tells it. A recent example: a change to the website\'s deploy setup quietly stopped the server functions from building, and it took a deliberate check of the live site to find it.',
          'So the rules are simple. Every change is tested, every claim about what is live is checked against the live site, and anything that speaks for the studio, spends money or cannot be undone needs a human yes.',
        ],
      },
      {
        heading: 'Why this matters for a small studio',
        body: [
          'Without AI, a one-person studio has to choose between making things and running the business around them. With AI doing a large share of the repetitive work, more time goes into the parts only a person can do: deciding what to make, judging whether it is good, and talking to the people who listen, read and play.',
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

/** Old slug for the bosses article — kept resolving so existing links keep working. */
export const BLOG_SLUG_ALIASES: Record<string, string> = {
  'how-thunder-domes-24-bosses-were-designed': 'how-aeropocalypses-24-bosses-were-designed',
};

export function findBlogArticle(slug: string): BlogArticle | undefined {
  const resolved = BLOG_SLUG_ALIASES[slug] ?? slug;
  return BLOG_ARTICLES.find((a) => a.slug === resolved);
}
