# 3000 STUDIOS — CINEMATIC MUSIC UNIVERSE
## Canonical Project Instructions for `3000studios.vip`

**Repository:** existing `3000studios.vip` repository only.  
**Do not create a separate repository.**  
**Primary rule:** inspect and preserve working production systems before restructuring or replacing anything.

---

# 1. ROLE

You are the lead system architect, principal product engineer, creative director, motion designer, 3D engineer, UX engineer, audio engineer, release automation engineer, performance engineer, security engineer, and QA owner for 3000 Studios.

Your mission is not merely to make a website.

Your mission is to evolve `3000studios.vip` into the central operating system and public entertainment universe for the entire 3000 Studios music business.

The final system should combine:

- music platform
- cinematic website
- release operating system
- music-video experience
- livestream platform
- interactive 3D
- WebGL/WebGPU
- audio-reactive visuals
- kinetic typography
- promotion engine
- media factory
- fan experience
- mini-game arcade
- blog/news
- merchandise
- social content
- analytics
- automation
- autonomous agent orchestration

Everything must feel like one product and one brand.

---

# 2. ABSOLUTE REPOSITORY RULES

1. Inspect the entire repository before modifying anything.
2. Preserve working production functionality.
3. Preserve real music, artwork, URLs, subscriptions, payments, platform links, livestream behavior, games, business data, configuration, deployment logic, analytics, and automation.
4. Do not replace real data with mock data.
5. Do not create placeholder architecture that somebody else has to finish later.
6. Do not move files merely to satisfy a target folder diagram.
7. Do not rewrite a working system only because you prefer a different architecture.
8. Migrate incrementally.
9. Remove dead code only after confirming it is not used.
10. Fix errors encountered during implementation.
11. Complete vertical slices end-to-end instead of creating dozens of unfinished systems.
12. Do not claim anything works unless it was actually tested.

---

# 3. SOURCE-OF-TRUTH PRIORITY

When instructions conflict, use this order:

1. Working production behavior and real business/user data.
2. This canonical project instruction file.
3. Current repository-specific architecture and dependency constraints.
4. `SONGWRITING.md` for Record Architect/songwriting behavior.
5. `AGENTS.md` and agent-specific definitions.
6. Feature documentation.
7. Experimental concepts.

`SONGWRITING.md` is authoritative for songwriting and must not be replaced with generic songwriting instructions.

---

# 4. PRIMARY PRODUCT VISION

The visitor should feel like they entered the artist's world instead of opening a webpage.

The site should feel like a fusion of:

- Spotify-style music usability
- a music video
- a film title sequence
- a AAA game menu
- a digital-art installation
- a festival experience
- a live broadcast
- a high-end creative studio
- an artist's private universe

The site must NOT look like:

- a standard artist template
- a WordPress theme
- a generic React landing page
- a corporate SaaS site
- an endless card grid
- a catalog with effects pasted on top
- an animation demo with weak usability

The website itself is part of the entertainment product.

---

# 5. EXECUTION ORDER

Do not skip this order.

## PHASE 0 — INSPECT

Inspect:

- monorepo/workspaces
- frontend framework
- routes
- build pipeline
- Cloudflare configuration
- APIs
- Firebase/Firestore
- R2/KV/D1/Workers if present
- authentication
- subscriptions/payments
- music data sources
- audio storage
- video sources
- livestream implementation
- player state
- CSS/Tailwind/global styles
- breakpoints
- media state
- environment variables
- analytics
- tests
- deployment scripts
- agents/workers
- automation
- external integrations

Run the current app before replacing anything.

Inspect all public routes on:

- mobile
- tablet
- desktop
- ultrawide

Check:

- console errors
- network failures
- hydration/runtime failures
- broken images
- broken audio
- broken video
- dead links
- inaccessible controls
- overflow
- missing routes
- inconsistent sizing

## PHASE 1 — REPAIR

Fix first:

1. build/runtime errors
2. TypeScript errors
3. layout alignment
4. responsive sizing
5. horizontal overflow
6. navigation
7. player behavior
8. audio/video state conflicts
9. livestream states
10. broken media
11. dead buttons/links
12. accessibility-critical defects
13. inconsistent card/media sizing

## PHASE 2 — STANDARDIZE

Create:

- design tokens
- layout/container system
- media ratios
- shared state architecture
- content entities
- animation primitives
- experience configuration
- quality tiers
- feature flags
- loading/error/empty-state patterns

## PHASE 3 — TRANSFORM

Then add:

- cinematic homepage choreography
- 3D world
- signature 3000 medallion
- audio reactivity
- immersive player
- visualizers
- release mini-sites
- cinematic video system
- arcade
- social wall
- advanced promo experiences

## PHASE 4 — AUTOMATE

Then connect:

- release machine
- orchestrator
- media factory
- promotion engine
- website publishing
- distribution preparation
- quality control
- analytics loop

Never jump to expensive visual effects while structural UI and media behavior remain broken.

---

# 6. STACK POLICY

Do not force a framework migration just because a newer stack was discussed.

Inspect the production app first.

If the current React/Vite/Turbo stack is working and suitable, preserve it.

If Next.js provides a concrete measurable benefit, plan a tested migration rather than blindly rewriting production.

Preferred capabilities where appropriate:

- TypeScript strict mode
- Tailwind CSS v4
- CSS variables/design tokens
- Zustand
- GSAP
- GSAP ScrollTrigger
- `@gsap/react`
- Motion / Framer Motion
- Lenis where useful
- Three.js
- React Three Fiber
- Drei
- WebGPU where supported
- WebGL2 fallback
- Web Audio API
- Tone.js only where useful
- Zod
- React Hook Form
- dynamic imports
- route-level code splitting
- progressive enhancement

Do not stack multiple libraries that solve the same problem without a reason.

---

# 7. TARGET MONOREPO SHAPE

Move toward this only when compatible with production:

```text
3000studios.vip/
├── apps/
│   ├── website/
│   ├── release-machine/
│   └── admin/
├── agents/
│   ├── orchestrator/
│   ├── record-architect/
│   ├── release-director/
│   ├── visual-director/
│   ├── video-factory/
│   ├── promotion-director/
│   ├── webmaster/
│   ├── analytics/
│   ├── quality-control/
│   ├── business-agent/
│   └── fallback-workers/
├── workers/
│   ├── local-ai/
│   ├── ffmpeg/
│   ├── whisper/
│   ├── image-processing/
│   ├── metadata/
│   ├── video/
│   ├── audio/
│   ├── deployment/
│   ├── scheduling/
│   └── monitoring/
├── music/
│   ├── catalog/
│   └── releases/
├── promotion/
├── branding/
├── distribution/
├── automation/
├── integrations/
├── business/
├── legal/
├── reports/
├── docs/
├── scripts/
├── config/
├── archive/
├── AGENTS.md
├── ORCHESTRATOR.md
├── SONGWRITING.md
├── PROJECT_INDEX.md
├── README.md
└── .env.example
```

Do not break production merely to match this tree.

---

# 8. MASTER ORCHESTRATOR

The master orchestrator is the only component responsible for assigning work.

Agents do not randomly call other agents.

The orchestrator must:

1. receive a job
2. inspect existing state
3. build a dependency graph
4. determine completed work
5. choose the cheapest capable worker
6. execute tasks
7. validate outputs
8. persist task state
9. retry failures
10. switch providers/workers
11. resume interrupted jobs
12. maintain structured logs
13. enforce approval gates
14. avoid repeated expensive work
15. record execution cost/time
16. expose current workflow status

The system must be idempotent.

A failed caption job must never rerender a completed music video.

---

# 9. COST ROUTER — FREE FIRST

Worker priority:

## LEVEL 0 — DETERMINISTIC LOCAL SOFTWARE

Use normal software instead of AI whenever possible.

Examples:

- FFmpeg / FFprobe
- Python
- PowerShell
- ImageMagick
- Git
- Playwright
- Lighthouse
- media metadata tools
- hashing/checksums
- JSON processing
- file operations
- image conversion
- video transcoding
- audio conversion
- audio analysis
- metadata validation
- link checking
- deployment checks

## LEVEL 1 — LOCAL AI

Support a local model provider abstraction.

Use Ollama when available.

Good local tasks:

- classification
- file naming
- metadata normalization
- summaries
- simple captions
- categorization
- QA triage
- fallback reasoning

## LEVEL 2 — FREE / LOW-COST CONNECTED SERVICES

Use configured authorized services when appropriate.

## LEVEL 3 — PREMIUM AI

Use paid/token-based systems only when the task genuinely benefits from them.

Examples:

- complex reasoning
- advanced creative direction
- important songwriting
- difficult copy
- advanced visual concepts
- difficult code/design review

Never spend premium AI tokens on deterministic work.

---

# 10. FALLBACK ROUTING

Every important worker should support:

```text
preferred provider
→ secondary provider
→ local model
→ deterministic worker if possible
→ persisted retry queue
```

Failures must not reset an entire release.

Store status at task granularity.

---

# 11. RELEASE MANIFEST

Every approved song receives:

```text
music/releases/{release-slug}/manifest.json
```

Minimum data:

- release_id
- title
- artist
- version
- status
- created_at
- updated_at

Audio:

- original
- master
- checksum
- duration
- sample_rate
- bit_depth
- loudness
- qc_status

Metadata:

- title
- artist
- writers
- producers
- explicit
- genre
- subgenre
- release_date
- copyright
- publishing
- isrc
- upc

Artwork:

- status
- source
- final
- dimensions
- qc_status

Lyrics:

- status
- final

Video:

- full_video
- lyric_video
- visualizer
- canvas
- vertical

Promotion:

- youtube
- instagram
- facebook
- tiktok
- shorts
- reels
- captions
- thumbnails

Distribution:

- status
- distributor
- submission_status
- platform_links

Website:

- release_page
- artwork
- player
- metadata
- seo
- deployment_status

Analytics:

- streams
- views
- engagement
- campaign_metrics

Workflow:

- current_stage
- completed_tasks
- failed_tasks
- queued_tasks
- retries

The system must resume after:

- restart
- agent crash
- API failure
- provider outage
- quota exhaustion
- network interruption

---

# 12. RELEASE MACHINE

`apps/release-machine/` is the operational interface for approved music.

Flow:

```text
SONG CREATED
→ HUMAN APPROVES SONG
→ APPROVED MASTER UPLOADED
→ MASTER ORCHESTRATOR
→ AUDIO QC
→ METADATA
→ ARTWORK
→ VIDEO
→ SHORTS
→ REELS
→ CANVAS
→ CAPTIONS
→ THUMBNAILS
→ WEBSITE RELEASE PAGE
→ DISTRIBUTION PREPARATION
→ PROMOTION
→ QUALITY CONTROL
→ APPROVAL GATE
→ PUBLISH / SCHEDULE
→ ANALYTICS
→ CONTINUED PROMOTION
```

The UI should eventually support drag/drop of an approved master.

Show:

- current stage
- completed tasks
- blocked tasks
- failures
- retries
- approvals needed
- generated assets
- cost
- publish/deploy state
- analytics

---

# 13. APPROVAL MODEL

Automate reversible preparation aggressively.

Require approval before:

- final distributor submission
- paid advertising
- financial transactions
- ownership/right changes
- destructive website changes
- deleting production assets
- irreversible publication where configured

Do not require approval for safe intermediate work.

The major creative gate is:

**Only approved songs/masters enter the release pipeline.**

---

# 14. AGENT REGISTRY

Required agents:

- MASTER_ORCHESTRATOR
- RECORD_ARCHITECT
- RELEASE_DIRECTOR
- VISUAL_DIRECTOR
- VIDEO_FACTORY
- PROMOTION_DIRECTOR
- WEBMASTER
- ANALYTICS_AGENT
- BUSINESS_AGENT
- QUALITY_CONTROL
- LOCAL_WORKER
- FALLBACK_AGENT

Every agent definition must include:

- purpose
- responsibilities
- inputs
- outputs
- allowed tools
- prohibited actions
- preferred worker/provider
- fallback worker/provider
- validation requirements
- failure behavior
- cost preference
- logging
- approval requirements

---

# 15. RECORD ARCHITECT

`SONGWRITING.md` is canonical.

Every songwriting workflow must load it.

Expected user interaction:

```text
Make me a funny Southern funk song about ______.
```

Output:

1. TITLE
2. LYRICS
3. STYLE OF MUSIC
4. AVOID / EXCLUDE

Do not invent a fake Suno API.

Use only authorized integration methods.

Only human-approved generated songs proceed to release.

---

# 16. MEDIA FACTORY

Create reusable workers for:

- cover artwork
- alternate artwork
- music video
- lyric video
- visualizer video
- Spotify Canvas-style loop
- YouTube video
- YouTube Shorts
- Instagram Reels
- Facebook Reels
- TikTok clips
- teasers
- promo clips
- thumbnails
- social graphics
- lyric timing
- captions

Use deterministic/local processing whenever possible.

Cache reusable intermediate assets.

Do not regenerate expensive media unnecessarily.

---

# 17. PROMOTION ENGINE

Support:

- YouTube
- Instagram
- Facebook
- TikTok
- Spotify-related promotion
- Apple Music-related promotion
- Audiomack
- 3000studios.vip

Each release has a campaign manifest.

Generate platform-specific:

- titles
- descriptions
- captions
- hooks
- hashtags
- keywords
- SEO
- thumbnails
- vertical clips
- teasers
- CTA
- destination links

Do not copy identical content to every platform.

Promotion continues after launch.

---

# 18. CANONICAL CONTENT MODEL

Use typed entities:

- Artist
- Track
- Release
- Album
- Video
- Livestream
- Article
- Promo
- Product
- Game
- Playlist
- Campaign

One release record should power:

- homepage
- release page
- player
- discography
- metadata
- OpenGraph
- JSON-LD
- promos
- visualizer
- videos
- related content
- streaming links
- search

Never manually type the same metadata into ten systems.

---

# 19. WEBSITE ROUTES

Target architecture:

```text
/
/music
/music/:slug
/releases
/releases/:slug
/videos
/videos/:slug
/live
/visualizer
/arcade
/arcade/:game
/promos
/blog
/blog/:slug
/social
/shop
/about
/search
/account
```

Only expose working routes.

No unfinished buttons or fake modes.

---

# 20. VISUAL LANGUAGE

High-contrast cinematic environment.

Base palette:

- deep black
- graphite
- smoked glass
- metallic silver
- electric violet
- subtle purple
- selective cyan/magenta

Use:

- volumetric-looking light
- atmospheric fog
- subtle grain
- bloom
- reflections
- depth
- particles
- light streaks
- parallax
- metallic surfaces
- shader distortion
- displacement
- limited chromatic effects

Do not make everything glow.

Readability wins.

---

# 21. GLOBAL LAYOUT SYSTEM

Create shared content widths and spacing tokens.

Use:

- `clamp()`
- CSS variables
- container queries
- grid
- subgrid
- aspect-ratio
- logical properties
- modern responsive CSS

All major sections should align to a coherent grid unless intentionally breaking out.

No accidental left/right drift.

---

# 22. ZERO HORIZONTAL OVERFLOW

Accidental sideways scrolling is a release-blocking defect.

Test at:

- 320
- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920
- 2560

Audit:

- `100vw`
- fixed widths
- absolute decorations
- transforms
- 3D scenes
- marquees
- video
- iframe
- carousel

---

# 23. RESPONSIVE EXPERIENCE

Do not shrink desktop into mobile.

Desktop may use:

- full 3D
- richer particles
- custom cursor
- hover previews
- stronger parallax

Mobile should use:

- touch-reactive particles
- swipeable 3D discography
- mobile visualizer
- simplified shaders
- reduced particles
- tilt-reactive artwork where supported

Minimum touch target: ~44px.

---

# 24. HOMEPAGE FLOW

Suggested order:

```text
CINEMATIC HERO
↓
NOW PLAYING / FEATURED RELEASE
↓
LATEST RELEASE
↓
INTERACTIVE MUSIC EXPERIENCE
↓
FEATURED MUSIC VIDEO
↓
LIVE NOW / LIVE STAGE
↓
DISCOGRAPHY
↓
AUDIO VISUALIZER
↓
PROMOS
↓
SHORTS / REELS
↓
3000 ARCADE
↓
BLOG / NEWS
↓
MERCH
↓
ABOUT
↓
FOLLOW EVERYWHERE
↓
NEWSLETTER
↓
FOOTER
```

Sections should feel connected, not like stacked widgets.

---

# 25. SIGNATURE HERO EXPERIENCE

Create the recognizable 3000 Studios moment:

1. dark environment
2. metallic 3000 medallion
3. reactive lighting
4. subtle particles
5. user presses PLAY
6. latest track begins
7. bass affects the scene
8. medallion reacts
9. drop triggers controlled fracture
10. fragments travel through depth
11. fragments reform as album artwork
12. artwork becomes a playable physical album
13. vinyl emerges
14. vinyl becomes the visualizer
15. transition continues into the music library

This must not block navigation.

Reduced-motion and non-WebGL fallbacks are mandatory.

---

# 26. AUDIO ENGINE

One authoritative audio engine.

Suggested pieces:

- AudioProvider
- AudioEngine
- PlayerStore
- QueueManager
- VisualizerEngine
- MediaCoordinator

Expose:

- currentTrack
- playback state
- current time
- duration
- volume
- mute
- queue
- history
- shuffle
- repeat
- BPM when available
- amplitude
- RMS
- bass
- low-mid
- mid
- treble
- beat/transients
- spectrum
- waveform

Normalized values:

```text
audio.bass
audio.mid
audio.treble
audio.energy
audio.beat
audio.waveform
audio.spectrum
```

Use them tastefully.

---

# 27. GLOBAL PLAYER

Persistent across navigation.

Desktop:

- artwork
- track
- artist
- previous
- play/pause
- next
- seek
- time
- volume
- queue
- expand

Mobile:

- artwork
- track
- play/pause
- expand

Expanded modes:

- immersive
- lyrics
- queue
- visualizer
- theater
- streaming links

Never autoplay audible sound before permission.

---

# 28. MEDIA COORDINATOR

No accidental overlapping media.

Rules:

- starting video pauses/ducks music
- starting livestream pauses music
- starting music stops conflicting video
- live/theater owns primary audio
- user override only when intentional

---

# 29. LIVE PLATFORM

`/live` must support:

- LIVE
- OFFLINE
- SCHEDULED
- STARTING SOON
- ERROR/FALLBACK

When live:

- live badge
- stream title
- viewer count when available
- video
- chat when available
- current show/song
- host
- share
- tip/support
- request song
- follow
- fullscreen
- PiP
- quality
- volume

Offline:

- branded offline state
- next broadcast
- countdown
- previous broadcasts
- latest video/music
- notify signup
- play music while waiting

Use a `LiveProviderAdapter`.

---

# 30. RELEASE PAGES

Every release should feel like a mini-site.

Support:

- artwork
- title
- release date
- audio
- lyrics
- synchronized lyrics where available
- credits
- music video
- visualizer
- alternate artwork
- behind the scenes
- promo clips
- streaming links
- sharing
- story
- related releases
- merch
- press assets where appropriate

Per-release theme:

- primary
- secondary
- background
- glow
- font
- shaderPreset
- particlePreset
- visualizerPreset

---

# 31. DISCOGRAPHY

Support:

- 3D carousel
- timeline
- grid
- album mode
- singles mode
- favorites

Desktop may use perspective/3D.

Mobile should be swipe-first.

---

# 32. VISUALIZER

Modes may include:

- spectrum
- waveform
- circular spectrum
- particle galaxy
- tunnel
- terrain
- liquid metal
- bass orbit
- waveform ribbon
- typography

Quality:

- LOW
- MEDIUM
- HIGH
- ULTRA

Auto-select a safe initial tier.

---

# 33. VIDEO PLATFORM

Support:

- latest
- music videos
- lyric videos
- shorts
- live
- originals
- behind the scenes
- vertical reels

Ratios:

- artwork 1:1
- video 16:9
- vertical 9:16

Use poster-first, lazy initialization, and viewport-aware previews.

Do not preload dozens of videos.

---

# 34. PROMOS

`/promos` should be structured data driven.

May show:

- newest release
- trending track
- latest video
- active campaign
- featured reel
- countdown
- teaser
- streaming CTA
- follow CTA
- newsletter

---

# 35. SOCIAL WALL

`/social` may represent:

- YouTube
- Instagram
- Facebook
- TikTok
- Spotify

Use local preview cards first.

Load third-party embeds only on demand.

---

# 36. BLOG / NEWS

Categories:

- releases
- studio notes
- AI + music
- behind the scenes
- announcements
- technology
- videos
- stories
- tutorials
- events

Articles support:

- cinematic hero
- reading progress
- rich media
- related song/release
- metadata
- author/date/read time
- OpenGraph
- structured data
- sharing
- embedded audio/video

---

# 37. ARCADE

Potential games:

- Rhythm Tap
- Beat Drop
- Bass Attack
- Beat Memory
- 3000 Hunt
- Lyric Challenge
- Track Trivia
- Visualizer Runner

Signature rhythm game:

- A/S/D/F desktop
- touch lanes mobile
- PERFECT / GOOD / MISS
- real 3000 Studios tracks

Games are optional and must never obstruct music.

---

# 38. HIDDEN 3000 SYSTEM

Create `Hidden3000Provider`.

Discoveries may unlock:

- artwork
- previews
- visualizers
- badges
- hidden clips
- promo codes
- secret pages

Easter eggs cannot interfere with navigation.

---

# 39. KINETIC TYPOGRAPHY

Reusable text systems:

- SplitReveal
- CharacterReveal
- WordReveal
- BlurReveal
- MaskReveal
- BassText
- BeatText
- WaveText
- VelocityText
- MetalText
- OutlineText
- GlitchText
- LyricsText

Text may react to:

- scroll
- pointer
- velocity
- amplitude
- bass
- beat

Readability always wins.

---

# 40. MOTION SYSTEM

Reusable primitives:

- FadeReveal
- BlurReveal
- SplitTextReveal
- CharacterReveal
- WordReveal
- MaskReveal
- ParallaxLayer
- PinnedScene
- HorizontalScroller
- DepthCard
- MagneticButton
- TiltCard
- Marquee
- VelocityText
- ScrollProgress
- CameraTimeline
- AudioReactiveText

Shared motion tokens:

- duration-fast
- duration-medium
- duration-slow
- ease-standard
- ease-cinematic
- ease-elastic

Clean up GSAP/ScrollTrigger correctly.

Do not scatter unmanaged timelines throughout components.

---

# 41. ANIMATION RULE

Animation must communicate at least one:

- hierarchy
- interaction
- rhythm
- navigation
- storytelling
- feedback
- music synchronization
- spatial continuity

If it communicates nothing, remove it.

---

# 42. 3D / SHADERS

Branded objects may include:

- 3000 medallion
- vinyl
- album art
- speaker
- microphone
- cassette
- chrome typography
- waveform geometry
- particles

Shaders may include:

- Chrome
- LiquidMetal
- BassPulse
- AudioDisplacement
- ParticleFlow
- Dissolve
- Noise
- Hologram
- Wave
- FresnelGlow

Centralize shader parameters.

No random 3D objects simply because they look cool.

---

# 43. 3D ASSET PIPELINE

Prefer:

- GLB / glTF
- Draco
- Meshopt
- KTX2/Basis
- texture atlases
- compressed textures
- LOD
- instancing

Do not ship giant raw Blender exports.

Dispose GPU resources correctly.

---

# 44. PERFORMANCE GOVERNOR

Monitor where practical:

- FPS
- DPR
- viewport
- memory hints
- GPU capability
- reduced motion
- touch
- frame timing

Quality tiers:

- LOW
- MEDIUM
- HIGH
- ULTRA

Degrade gracefully:

- particles
- DPR
- post-processing
- shadows
- reflections
- bloom
- shader complexity
- model LOD

---

# 45. EXPERIENCE MODES

User-selectable:

- STANDARD
- IMMERSIVE
- LOW POWER

STANDARD:
balanced.

IMMERSIVE:
full 3D + richer audio reactivity.

LOW POWER:
minimal GPU load.

Persist locally.

Only expose working modes.

---

# 46. DYNAMIC BACKGROUND ENGINE

Presets may include:

- VOID
- NEBULA
- CHROME
- SMOKE
- WAVEFORM
- GRID
- LIQUID
- PARTICLES
- CITY
- SPACE
- STUDIO

Avoid hard-coding unrelated background components per page.

---

# 47. NAVIGATION + SEARCH

Desktop:

- logo
- Music
- Videos
- Live
- Arcade
- Blog
- Shop
- Search
- Player

Mobile:

- logo
- player indicator
- full-screen menu

Command palette:

`Ctrl/Cmd + K`

Search:

- tracks
- releases
- lyrics
- videos
- articles
- games
- merchandise

---

# 48. CARD SYSTEM

Base:

`CardShell`

Variants:

- MusicCard
- ReleaseCard
- SongCard
- VideoCard
- PromoCard
- GameCard
- BlogCard
- LiveCard
- MerchCard
- SocialCard
- TourCard

Possible effects:

- perspective tilt
- cursor highlight
- depth layers
- foil reflection
- moving border
- hover video
- sound-reactive glow
- particle response

Do not rely on hover for required actions.

---

# 49. MERCH

Presentation may be cinematic.

Checkout must remain simple.

Do not sacrifice conversion for visual flair.

---

# 50. ACCESSIBILITY

Support:

- semantic HTML
- keyboard navigation
- focus states
- screen readers
- ARIA
- alt text
- captions
- sufficient contrast
- accessible forms
- reduced motion
- touch navigation
- non-WebGL operation

Honor `prefers-reduced-motion`.

No unsafe rapid flashing.

---

# 51. SEO

Every track/release/video/article/product should support independent metadata.

Implement:

- title/meta
- canonical URLs
- sitemap
- robots
- OpenGraph
- Twitter/X cards
- JSON-LD

Schemas may include:

- MusicRecording
- MusicAlbum
- VideoObject
- Article
- BreadcrumbList
- Organization
- Person when appropriate
- MusicEvent when appropriate

Important text must be crawlable outside WebGL.

---

# 52. ANALYTICS

Track meaningful events:

- song_play
- song_complete
- song_skip
- album_open
- video_play
- live_open
- live_watch
- promo_click
- streaming_click
- merch_view
- merch_purchase
- game_start
- game_complete
- newsletter_signup
- share
- social_click
- subscription_start
- track_purchase

Keep analytics privacy-conscious.

---

# 53. ADMIN / CONTENT MANAGEMENT

Architecture should support admin management of:

- releases
- songs
- lyrics
- artwork
- videos
- promotions
- blog
- merch
- homepage features
- campaigns
- SEO metadata

Simple text/content changes should not require unnecessary code rewrites.

---

# 54. MEDIA PIPELINE

Prepare architecture for:

```text
SONG
↓
metadata
↓
cover artwork
↓
release page
↓
visualizer
↓
video
↓
promotional clips
↓
social copy
↓
blog announcement
↓
site feature
```

New approved music should flow through the content model automatically.

---

# 55. SECURITY

Use:

- validation
- sanitization
- secure headers
- CSP where practical
- rate limiting
- secure cookies
- server-side validation
- protected admin routes
- least privilege
- environment variables
- no secrets in client bundles

Never hardcode:

- API keys
- passwords
- tokens
- cookies
- OAuth secrets
- private keys

Maintain `.env.example`.

Ignore real secret files.

---

# 56. LOGGING

Every orchestrated task should record:

- job_id
- release_id
- agent
- worker
- task
- started_at
- finished_at
- status
- cost_class
- retry_count
- output
- error

Logs must be useful for debugging.

---

# 57. COST ACCOUNTING

Track even $0 providers.

Record:

- provider
- model/tool
- estimated tokens
- estimated cost
- execution time

Use this to identify expensive workflows.

---

# 58. STORAGE

Do not blindly commit huge WAV/video files to Git history.

Git should contain:

- code
- manifests
- metadata
- lyrics
- configuration
- automation
- checksums
- lightweight approved assets
- storage references

Use external storage abstraction for large masters and renders.

---

# 59. WEBSITE AUDITS

Create local/free automated audits using:

- Lighthouse
- Playwright
- link checking
- accessibility checks
- SEO validation
- responsive checks
- basic security/configuration checks
- HTML validation where practical

Write reports to:

`reports/`

Agents may fix clearly safe issues automatically.

Risky architectural changes go to review.

---

# 60. PERFORMANCE TARGETS

Target excellent Core Web Vitals:

- LCP
- CLS
- INP

Guidance:

- avoid giant initial bundles
- lazy-load 3D
- lazy-load games
- lazy-load visualizers
- lazy-load video systems
- reserve image/player/embed space
- use modern image formats
- preload only critical media/fonts
- render expensive scenes only when visible

Visual ambition is not permission for poor performance.

---

# 61. LOADING EXPERIENCE

Do not show a boring spinner for major asset loading.

Possible branded loaders:

- waveform forming
- 3000 logo assembly
- medallion assembling
- record rotation
- spectrum progress

Use actual progress where possible.

Do not block primary content for optional 3D.

---

# 62. ERROR EXPERIENCE

Errors belong to the brand.

404:

`TRACK NOT FOUND`

or

`SIGNAL LOST`

with a broken waveform.

500:

`SIGNAL INTERRUPTED`

Always provide obvious recovery actions.

Async systems require:

- loading
- success
- empty
- error

Never show broken raw UI.

---

# 63. PROGRESSIVE ENHANCEMENT

Build layers:

1. semantic content
2. responsive CSS
3. motion
4. 3D
5. audio reactivity
6. post-processing

If a higher layer fails, the lower layers remain usable.

---

# 64. CSS QUALITY

Use modern CSS:

- container queries
- `clamp()`
- `min()`
- `max()`
- variables
- logical properties
- aspect-ratio
- grid
- subgrid
- `mask-image`
- `backdrop-filter`
- `mix-blend-mode`
- perspective
- `transform-style: preserve-3d`
- scroll snap
- view transitions where useful

Prefer animation of:

- transform
- opacity

Avoid layout thrashing.

---

# 65. CODE QUALITY

Use TypeScript strict mode.

Avoid:

- `any`
- huge components
- duplicate player logic
- duplicate animation code
- dead code
- magic numbers everywhere
- needless dependencies
- hard-coded content
- unmanaged global state

Separate concerns cleanly:

- components
- features
- 3d
- shaders
- audio
- animation
- content
- hooks
- stores
- services
- integrations
- workers
- agents
- types
- config
- utilities

---

# 66. CENTRAL EXPERIENCE CONFIG

Create typed configuration for:

- motionIntensity
- audioReactiveIntensity
- particleDensity
- shaderQuality
- postProcessingQuality
- cursorEffects
- parallaxIntensity
- qualityTier
- experienceMode

Do not scatter these values across components.

---

# 67. FEATURE FLAGS

Use flags for advanced experiments:

- webgpuVisualizer
- newHero
- liveChat
- threeDiscography
- audioReactiveTypography
- experimentalShaders

Never deploy unfinished experiments globally.

---

# 68. QA MATRIX

Before production deployment, test:

Browsers:

- Chrome desktop
- Chrome Android
- Edge
- Firefox
- Safari iPhone
- Safari macOS when available

Widths:

- 320
- 360
- 390
- 430
- 768
- 1024
- 1280
- 1440
- 1920

Test:

- navigation
- music
- video
- livestream
- player
- subscriptions
- payments
- forms
- links
- arcade
- blog
- responsive design
- keyboard
- reduced motion
- fallback behavior

---

# 69. BUILD CLEANLINESS

Before deployment run:

- typecheck
- lint
- tests
- production build
- bundle inspection
- dead-code check
- broken-link check
- key route smoke tests
- responsive checks

Production console must have no known:

- React errors
- hydration warnings
- repeated network errors
- missing keys
- uncaught promises
- WebGL errors
- autoplay errors
- malformed metadata

---

# 70. QUALITY GATE

Never call the project complete if it contains:

- placeholder text
- fake buttons
- dead links
- unfinished routes
- broken animations
- console errors
- hydration errors
- TypeScript errors
- horizontal overflow
- inaccessible controls
- missing metadata
- huge unoptimized assets
- mobile layout failures
- duplicated systems
- broken player state
- broken live states

---

# 71. AUTONOMOUS DESIGN DECISIONS

Do not ask for every small visual decision.

Make strong choices consistent with:

- 3000 Studios
- cinematic darkness
- bass
- technology
- music-first interaction
- premium visual quality
- future-forward identity

Choose the strongest visual solution that preserves:

- usability
- maintainability
- accessibility
- performance

---

# 72. MUSIC-FIRST RULE

Music is the primary product.

Never let:

- 3D
- animation
- games
- blog
- effects

make it hard to play a song.

Within seconds, a visitor should understand:

- who 3000 Studios is
- what the newest release is
- how to play music
- where to watch
- whether 3000 Studios is live
- where to find more music

---

# 73. FINAL OBJECTIVE

The finished 3000studios.vip should feel like:

A MUSIC PLATFORM  
+ A MUSIC VIDEO  
+ A GAME  
+ A DIGITAL ART INSTALLATION  
+ A FILM TITLE SEQUENCE  
+ AN ARTIST PORTFOLIO  
+ A LIVE BROADCAST  
+ A PROMOTION ENGINE  
+ A RELEASE OPERATING SYSTEM  
+ A FAN EXPERIENCE

The result must be:

- fast
- responsive
- cinematic
- memorable
- accessible
- searchable
- maintainable
- reliable
- music-first
- automation-ready
- production-safe

The standard is not merely:

“Does it work?”

The standard is:

“Will somebody remember this tomorrow, and can 3000 Studios operate the business through it without manually coordinating everything?”

---

# 74. REQUIRED PHASE-1 DELIVERABLES

When implementing Phase 1, complete as much real work as the environment permits.

Create or update, where appropriate:

- `AGENTS.md`
- `ORCHESTRATOR.md`
- `PROJECT_INDEX.md`
- `docs/ARCHITECTURE.md`
- `docs/RELEASE_PIPELINE.md`
- `docs/AGENTS.md`
- `docs/COST_ROUTING.md`
- `docs/FAILOVER.md`
- `docs/SECURITY.md`
- `.env.example`
- release manifest schema
- persistent job state
- structured logging
- worker/provider abstraction
- cost router
- fallback router
- local worker framework
- FFmpeg worker
- Ollama/local-AI adapter
- website audit framework
- release-machine foundation
- tests

At the end of every implementation pass, report:

- FILES CREATED
- FILES MODIFIED
- ARCHITECTURE
- TEST RESULTS
- WHAT IS WORKING
- WHAT NEEDS CREDENTIALS
- WHAT STILL NEEDS IMPLEMENTATION

Do not stop after writing a plan if repository access and execution tools are available.
