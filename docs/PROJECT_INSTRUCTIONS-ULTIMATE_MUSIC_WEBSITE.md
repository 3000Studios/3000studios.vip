# Project Instructions — 3000 Studios Ultimate Music Website

## 1. Vision

Build the most immersive, animated, and technically impressive musician website on the internet for **3000 Studios**. The site should feel like stepping into a living album — every scroll, hover, click, and beat produces a visual reaction. It must be fully responsive, accessible, performant, and AdSense-review-ready while delivering cinema-grade motion, 3D elements, sound-reactive text, a full music player, games, promos, and blog.

**North Star:** When a visitor lands on the site, they should immediately say _"I've never seen a musician website like this."_

---

## 2. Tech Stack (Use What's Already Installed)

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Framework      | React 19 + Vite + TypeScript                           |
| Routing        | React Router DOM                                       |
| State          | Zustand                                                |
| Styling        | Tailwind CSS v4 + CSS Modules for complex components   |
| Motion         | Framer Motion + GSAP (ScrollTrigger, Flip)             |
| 3D             | React Three Fiber + Three.js + Drei                    |
| Audio          | Howler.js + Web Audio API analyser                     |
| Icons          | Phosphor Icons                                         |
| Build/Monorepo | Turbo (existing `apps/web`)                            |
| Backend / API  | Cloudflare Pages Functions or Hono Worker (`apps/api`) |
| CMS / Data     | Firebase Firestore + Cloudflare KV for dynamic content |
| Deploy         | Cloudflare Pages auto-deploy from `main`               |

**Do NOT install heavy new frameworks** unless they solve a specific problem not covered above.

---

## 3. Design System

### 3.1 Brand Tokens

- **Primary accent:** Electric violet `#8B5CF6` / neon magenta `#FF00FF` gradient pair.
- **Secondary:** Cyan `#06B6D4`, hot-pink `#EC4899`.
- **Dark ground:** Deep space black `#050507` with subtle noise texture overlay.
- **Light ground:** Off-white `#F8F7F4` for blog/promo contrast sections.
- **Typography:** Bold condensed display font for headlines (Impact/Oswald/Bebas Neue family), clean sans-serif body (Inter / Geist).
- **Corner radius:** Cards use `2xl` (`1rem`) for UI, `full` for pills.
- **Shadows:** Layered colored glows (`0 0 40px rgba(139,92,246,0.3)`).

### 3.2 Motion Language

- **Entrances:** Elements arrive with `y: 40 → 0`, `opacity: 0 → 1`, `scale: 0.95 → 1`, ease `power3.out` / `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Scroll:** Pin sections, reveal by scrubbing, parallax depth (background 0.3x, foreground 1.2x).
- **Hover:** Magnetic buttons, 3D card tilt, glow bloom, letter-spacing micro-expand.
- **Transitions:** Page transitions are full-screen wipes or 3D camera moves, never plain fades.
- **Rhythm:** All major animations feel musical — use staggered reveals timed like 16th notes.

---

## 4. Sections & Features

### 4.1 Hero — "The Portal"

- **Full viewport immersive stage.**
- **3D background:** React Three Fiber scene with floating audio-reactive geometric shards, album art floating in 3D space, and a subtle particle field.
- **Kinetic headline:** Artist name "3000 STUDIOS" rendered with `troika-three-text` or large CSS text that subtly warps/glows.
- **Sound-reactive headline (optional audio preview):** When the user clicks "Preview", the headline letters pulse to the beat using Web Audio API analyser data.
- **CTAs:** "Play Latest", "Watch Visualizer", "Enter Studio".
- **Scroll indicator:** Animated chevron that transforms into a sound wave on hover.

### 4.2 Sticky Full-Featured Music Player

A persistent bottom player bar + expandable full-screen player:

- **Playback:** Play/pause, skip, previous, shuffle, repeat, seek, volume.
- **Playlist:** Queue with drag-to-reorder, album art thumbnails.
- **Waveform:** Real-time canvas waveform visualizer using Web Audio AnalyserNode.
- **Now Playing screen:** Big album art, lyrics sync (LRC format), background blur/average-color extraction.
- **Mini-player:** Collapses to a compact bar with artwork, title, artist, play/pause, expand button.
- **Keyboard shortcuts:** Space = play/pause, arrows = seek/volume, `P` = toggle player.
- **Persist state:** Current song, volume, queue to `localStorage`.

### 4.3 Releases — "3D Album Gallery"

- Horizontal scroll section with 3D album cards.
- Each card uses CSS `transform-style: preserve-3d` + mouse-driven tilt.
- On hover: card lifts, reflects light, tracklist peeks out from the side, play button emerges.
- Click expands card into a full-screen modal with streaming links (Spotify, Apple Music, YouTube, SoundCloud, Bandcamp).

### 4.4 Visualizer Stage

- Dedicated canvas/visualizer section.
- Multiple visualizer modes: bars, circular, particles, frequency mesh.
- Toggle between tracks; visualizer reacts to currently playing audio.
- Fullscreen button for a Spotify-like "Canvas" experience.

### 4.5 Sound-Reactive Text

- Headlines and lyric snippets that animate based on audio frequencies.
- Techniques:
  - Variable font weight oscillation on bass hits.
  - Letter y-offset jitter synced to high frequencies.
  - Text gradient shimmer speed tied to tempo.
- Fallback: smooth ambient shimmer when no audio is playing.

### 4.6 Games — "Arcade"

At least two browser mini-games themed around the music/brand:

1. **Rhythm Tap Game:** Hit falling notes in lanes synced to a chosen track.
2. **Audio-Reactive Runner:** Obstacles spawn to the beat; the world pulses with the music.
3. **Easter Egg:** Konami code unlocks a hidden visualizer or 8-bit chiptune version of a track.

- Keep scoreboards in Firebase Firestore with player initials.
- Share score to socials with generated card image.

### 4.7 Promos — "Campaigns & Merch"

- Countdown timers for single drops, album releases, ticket sales.
- 3D merch cards (T-shirts, hoodies, vinyl) that rotate on hover.
- Stripe checkout integration for digital + physical products.
- Promo video background sections with subtle parallax.

### 4.8 Blog / News — "The Feed"

- Masonry or bento-grid layout.
- Cards with cover images, category pills, read-time, publish date.
- Filter by category (News, Behind the Beat, Tour, Merch).
- Rich text rendering, embedded players, pull quotes.
- CMS-managed via Firestore or markdown frontmatter.

### 4.9 Tour / Events

- Map or timeline view of upcoming shows.
- Animated event cards with ticket links.
- "Notify Me" form for new dates (turnstile-protected).

### 4.10 Newsletter & Footer

- Animated input field that turns into a confetti burst on success.
- Footer with social links, legal pages, and a miniature audio-reactive logo.

---

## 5. Animation Requirements (Must-Haves)

### 5.1 Scroll-Driven Animations

- Use GSAP ScrollTrigger for pinned storytelling sections.
- Parallax layers on every major section.
- Progress-based reveals: text chars reveal as you scroll, images scale up, colors shift.
- Section transitions: diagonal wipes, lens-flare reveals, particle dissolves.

### 5.2 Micro-Interactions

- Magnetic buttons that follow cursor within 20px radius.
- Custom oversized cursor on desktop (brand motif cursor).
- Hover sounds (subtle UI clicks) — optional, muted by default.
- Page load sequence: loader → logo animation → hero reveal.

### 5.3 3D Elements

- Floating album art shards in hero.
- 3D card tilts with specular highlights.
- Rotating vinyl record in player.
- Depth-based parallax with `translateZ`.
- Optional: Three.js portal/wormhole background sequence.

### 5.4 Text Effects

- Split-text reveals (line-by-line, word-by-word, char-by-char).
- Gradient text with animated `background-position`.
- Variable font axis animation (weight, width, slant) tied to scroll/audio.
- Glitch/scanline effects for "cyberpunk" promo moments.

---

## 6. Responsiveness

### 6.1 Breakpoints

- Mobile: < 640px
- Tablet: 640px – 1024px
- Desktop: 1024px – 1440px
- Ultrawide: > 1440px

### 6.2 Mobile Rules

- 3D scenes downsample particle counts.
- Sticky player becomes bottom sheet.
- Horizontal scroll galleries become swipeable carousels.
- Games support touch controls.
- Disable heavy shaders on low-power devices using `detect-gpu` tier.
- Touch-friendly tap targets (min 44x44px).

### 6.3 Desktop Rules

- Full 3D scene, hover interactions, magnetic cursors.
- Split layouts, large type, immersive visualizer.

---

## 7. Performance & Quality

### 7.1 Performance Budget

- First Contentful Paint < 1.2s
- Largest Contentful Paint < 2.5s
- Total Blocking Time < 200ms
- Cumulative Layout Shift < 0.1
- Lighthouse mobile score ≥ 90

### 7.2 Optimization Rules

- Lazy-load 3D scenes, heavy canvases, and below-fold images.
- Use `requestAnimationFrame` for all custom animations; throttle to 30fps on low-end devices.
- Use `will-change` sparingly and remove after animation.
- Compress images to AVIF/WebP with fallbacks.
- Code-split routes and heavy game bundles.
- Preload critical fonts and hero image.
- Use Web Workers for audio analysis if it blocks main thread.

### 7.3 Accessibility

- WCAG 2.1 AA contrast ratios (text over animated backgrounds must have backdrops).
- `prefers-reduced-motion`: disable parallax, auto-play motion, and rapid flashes; keep static equivalents.
- Keyboard navigation for player, games, and modals.
- ARIA labels on custom audio controls and canvas visualizers.
- Focus visible states on all interactive elements.

---

## 8. SEO, AdSense & Social

- Maintain `robots.txt`, `sitemap.xml`, `ads.txt`, `_headers`, `_redirects`.
- Every release page has meta tags, Open Graph, Twitter Cards, JSON-LD `MusicAlbum` schema.
- Blog posts use `Article` schema.
- Event pages use `MusicEvent` schema.
- AdSense placements in blog sidebar and between release cards (non-intrusive).
- Social share cards auto-generated for releases, blog posts, and game scores.

---

## 9. Data & Integrations

### 9.1 Required Secrets/Env (from `global.env`)

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, etc.
- `STRIPE_PUBLISHABLE_KEY` for merch checkout.
- `VITE_CLOUDFLARE_TURNSTILE_SITE_KEY` for forms.
- `SPOTIFY_CLIENT_ID` / secret if using Spotify embed API.
- `RESEND_API_KEY` for newsletter emails (worker-side).

### 9.2 Data Sources

- Firestore: blog posts, events, release metadata, game scores.
- R2: audio files, images, videos, game assets.
- Stripe: product catalog.
- Cloudflare Worker / Pages Function: newsletter API, score API, analytics edge function.

---

## 10. Files & Architecture (Within `apps/web`)

```
apps/web/src/
  components/
    3d/              # Three.js scenes, particles, portals
    audio/           # Player, visualizer, analyser hook
    cards/           # Album cards, merch cards, blog cards
    games/           # Rhythm game, runner, arcade shell
    layout/          # Header, footer, nav, page transitions
    sections/        # Hero, releases, visualizer, blog, etc.
    ui/              # Buttons, magnetic button, loaders, forms
  hooks/
    useAudioAnalyser.ts
    useScrollProgress.ts
    useMagnetic.ts
    useReducedMotion.ts
  stores/
    playerStore.ts
    uiStore.ts
  pages/
    Home.tsx
    Release.tsx
    Blog.tsx
    BlogPost.tsx
    Games.tsx
    GameShell.tsx
    Promos.tsx
  lib/
    firebase.ts
    stripe.ts
    utils.ts
  styles/
    globals.css
    animations.css
```

---

## 11. Deliverables

1. **Design.md** — visual direction, keyframes, color/motion spec.
2. **Component library** — reusable animated components.
3. **Home page** with all hero/release/visualizer sections.
4. **Full music player** with queue, waveform, lyrics.
5. **Games page** with two playable games.
6. **Blog system** with CMS-backed posts.
7. **Promos/merch** section with Stripe links.
8. **Mobile-first responsive build**.
9. **Accessibility audit** and reduced-motion support.
10. **Lighthouse score ≥ 90** on mobile and desktop.
11. **Deployed** to `3000studios.vip` via Cloudflare Pages.

---

## 12. Acceptance Criteria

- [ ] Site loads and is fully interactive on mobile, tablet, desktop.
- [ ] Music player plays audio, shows waveform, supports queue/seek/volume.
- [ ] At least one 3D scene is present and reacts to scroll or audio.
- [ ] At least one sound-reactive text effect is present.
- [ ] Two playable games exist and submit scores.
- [ ] Blog can be updated via CMS without code changes.
- [ ] Promos/merch link to correct Stripe products.
- [ ] All buttons/links work; no broken routes.
- [ ] `prefers-reduced-motion` disables intense motion.
- [ ] Lighthouse performance ≥ 90, accessibility ≥ 95.
- [ ] No placeholder text, no secret leaks, no console errors.

---

## 13. Tone & Personality

Bold, cinematic, futuristic, slightly rebellious. The site should feel like a headline show — loud when it needs to be, intimate when it wants to be. Every pixel should serve the music.

**Keywords:** immersive, kinetic, reactive, cinematic, next-level, audio-driven, 3000.
