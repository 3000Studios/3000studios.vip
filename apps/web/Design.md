# 3000 Studios VIP — Universal Design Blueprint

> **Status:** VERIFIED · **Base theme:** Dark-luxury cinematic (black → gold → crimson)  
> **Primary entry:** `/` renders `SwipeHome` (TikTok-style video swiper)  
> **Companion:** Shell/console (`/vault`) uses the operator system  
> This blueprint is the single source of truth for the visual language. It consolidates four legacy token systems (`variables.css`, `theme.css`, `dj-system.css`, `million-dollar.css`) into one spec.

---

## 1. Visual Direction

**Dark-luxury cinematic.** The site feels like a VIP backstage pass to a music-video channel:
- **Surface:** near-black (#05060a → #07080d) with a subtle radial gradient backdrop (deep green-blue + gold rim light).
- **Accent 1:** Warm gold (#d4af37 / #f6dd8a) — primary brand color, used for titles, kicker badges, price tags, and active swiper dots.
- **Accent 2:** Crimson (#e0263c) — reserved for high-emphasis CTAs and live-state indicators.
- **Typography:** Playfair Display (serif, display headings) + Source Sans 3 / system-ui (body, nav, UI).

The golden rule: **one dominant accent per view.** Public VIP pages → gold. The console → cyan-blue. Money rail and CTAs → gold primary, crimson for "Subscribe" only.

---

## 2. Design Tokens (Canonical)

All tokens are expressed as CSS custom properties on `:root` in `million-dollar.css` (the system of record). Legacy tokens in `variables.css`, `theme.css`, `dj-system.css`, and `cinematic-vip.css` are folded here.

### 2.1 Color

| Token | Value | Usage |
|-------|-------|-------|
| `--md-black` | `#05060a` | Primary surface |
| `--md-ink` | `#0b0d14` | Card interiors |
| `--md-panel` | `#101319` | Elevated surfaces |
| `--md-gold` | `#d4af37` | Primary accent, shimmer stops |
| `--md-gold-hi` | `#f6dd8a` | Bright gold, kicker text, active dots |
| `--md-gold-deep` | `#8a6d1c` | Gold shadow, shimmer stop |
| `--md-cream` | `#f4efe2` | Body text |
| `--md-muted` | `#a7adbd` | Secondary text |
| `--md-line` | `rgba(212, 175, 55, 0.22)` | Card/border dividers |
| `--md-crimson` | `#e0263c` | CTA highlight, live indicators |

### 2.2 Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--md-font-display` | `'Playfair Display', Georgia, serif` | H1–H3 titles |
| `--md-font-body` | `'Source Sans 3', system-ui, -apple-system, sans-serif` | Body, nav, labels |
| `--md-radius` | `18px` | Card corners |

### 2.3 Motion

| Token | Value | Usage |
|-------|-------|-------|
| `--md-ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | Standard easing (ease-out curve) |
| `--md-shadow-lift` | `0 24px 60px rgba(0, 0, 0, 0.55)` | Card hover elevation |

**Motion principles:**
- Animate only `transform` and `opacity` for 60fps on mobile.
- Gold shimmer: `linear-gradient(100deg, #fff 10%, var(--md-gold-hi) 38%, var(--md-gold) 55%, #fff 80%)` animated with `md-shimmer` (7s loop).
- Scroll reveals use `IntersectionObserver` (never scroll listeners); `.md-reveal` → `.md-reveal.in`.
- `prefers-reduced-motion: reduce` disables all non-essential animation.

---

## 3. Component Catalog & CSS Ownership

Each component belongs to exactly one CSS file. This prevents cascade wars and `!important` overrides.

### 3.1 Header System

**Owner:** `landing.css` (`.vipHeader`, `.vipHeader--epic`, `.vipLogo`, `.logoOrb`, `.logoWordmark`)
**Polish:** `mobile-polish.css` (responsive padding), `dj-system.css` (DJ accent line, but **must not** override `.vipHeader` border globally)

**Spec:**
- `position: sticky; top: 0; z-index: 50`
- `backdrop-filter: blur(18px); background: rgba(2,4,5,0.82)`
- **Bottom border:** `1px solid rgba(255,215,0,0.12)` (gold accent) — **do not** set `border-bottom: 0 !important` outside mobile media queries
- Height: `clamp(64px, 9vh, 92px)` desktop, `64px` mobile
- Inner layout: `display: grid; grid-template-columns: auto minmax(0,1fr) auto; gap: 12px; padding: 10px clamp(12px, 2.4vw, 28px)`

**Nav:** `.vipNav` with `.vipNavLink` items; `.logoWordmark` uses gold shimmer gradient.

### 3.2 Hero Section

**Owner:** `million-dollar.css` (`.md-hero`, `.md-hero-media`, `.md-hero-veil`, `.md-hero-copy`, `.md-kicker`, `.md-title`, `.md-sub`, `.md-cta-row`)
**Polish:** `effects.css` (`.glowText` shimmer)

**Spec:**
- `.md-hero`: `min-height: 100svh; display: grid; align-items: end; overflow: clip; isolation: isolate`
- Background: radial gold at top + radial crimson at bottom + `linear-gradient(180deg, #07080d 0%, #05060a 100%)`
- `.md-hero-media`: absolute inset:0, video/img cover behind content
- `.md-hero-veil`: absolute inset:0, linear gradient overlay darkening toward bottom
- `.md-title`: `font-size: clamp(44px, 11vw, 108px); line-height: 0.95` with gold shimmer background + `background-clip: text; color: transparent`
- `.md-kicker`: gold capsule badge, `font-size: 12px; letter-spacing: 0.28em; text-transform: uppercase`
- `.md-cta-row`: flex gap row of `.md-btn` buttons

### 3.3 Video Swiper Stage

**Owner:** `million-dollar.css` (`.md-stage`, `.md-track-viewport`, `.md-track`, `.md-slide`, `.md-slide-poster`, `.md-slide-video`, `.md-slide-shade`, `.md-slide-meta`, `.md-arrow`, `.md-dots`)
**Support:** `swipe-slider.css` (touch behavior)

**Spec:**
- `.md-stage`: `background: #000; position: relative`
- `.md-slide`: `flex: 0 0 100%; height: min(82svh, 820px); overflow: clip`
- Poster fade: `.md-slide-poster { opacity: 0.9 }` (fades as video loads)
- Meta overlay: bottom-anchored grid with index badge, title, subtitle, and action chips
- `.md-slide-title`: Playfair Display, `clamp(26px, 7vw, 54px)`, text-shadow for depth
- Arrows: circular, `backdrop-filter: blur(8px)`, hover scale
- Dots: `width: 22px; height: 6px`, active = gold with glow

### 3.4 Money Rail

**Owner:** `million-dollar.css` (`.md-money`, `.md-pay-card`, `.md-price`, `.md-tag`, `.md-btn-gold`, `.md-btn-ghost`)

**Spec:**
- 6-tier grid (`.md-money-grid`): mobile 1-col → 720px: 3-col → 1100px+: 6-col
- `.md-pay-card`: subtle gold/crimson gradient bg, `border-radius: var(--md-radius)`, hover lift
- Tags: top-right absolute capsules in gold gradient
- Prices: `font-size: 28px; font-weight: 800; color: var(--md-gold-hi)`

### 3.5 Cards (General)

**Owner:** `landing.css` (`.vipCard`, `.trackCard`, `.blogCard`), `mobile-polish.css` (responsive grid), `effects.css` (hover transitions)

**Spec:**
- `border: 1px solid var(--md-line); border-radius: 14px`
- Background: `linear-gradient(160deg, rgba(212,175,55,0.09), rgba(255,255,255,0.02))`
- Hover: `transform: translateY(-3px); box-shadow: var(--md-shadow-lift)`

### 3.6 Buttons

| Class | Style |
|-------|-------|
| `.md-btn` | Capsule, `padding: 14px 22px`, `font-weight: 700`, hover scale |
| `.md-btn-gold` | Gold gradient fill, dark text, gold glow shadow |
| `.md-btn-ghost` | Transparent, `backdrop-filter: blur(8px)`, cream text |

### 3.7 Marquee & Platform Strip

**Owner:** `million-dollar.css` (`.md-marquee`, `.md-strip`)

- Marquee: gold uppercase, `letter-spacing: 0.24em`, 28s scroll
- Platform strip: inline chips linking to DistroKid/Youtube/Spotify

---

## 4. CSS Architecture Rules

### 4.1 Cascade Hierarchy (Strict Order)

`index.css` imports styles in this exact order — later files may extend but **never fight** earlier ones with `!important`:

| Order | File | Role |
|-------|------|------|
| 1 | `variables.css` | Legacy token fallback (superseded by #2) |
| 2 | `theme.css` | Canonical color-surface + accent tokens |
| 3 | `next-gen.css` | `@layer` base reset + admin layout |
| 4 | `global.css` | `html`/`body` base, font loading |
| 5 | `components.css` | Universal `.btn`, `.input`, `.chip`, `.kpi` |
| 6 | `landing.css` | **Primary public VIP styles** (header, hero, cards, footer) |
| 7 | `hero-golive.css` | Golden cinematic hero extension |
| 8–12 | `effects.css` | Micro-interactions, reveal, hover |
| ... | `site-polish.css` | Base token overrides |
| ... | `premium-shell.css` | Layout grid, width constraints |
| ... | `nav-epic.css` | Responsive nav chrome |
| 36 | `million-dollar.css` | **SwipeHome system** (md-* classes) |
| 37–39 | `music-deck.css`, `song-drop.css`, `swipe-slider.css` | Feature-specific polish |

### 4.2 `!important` Policy

**`!important` is forbidden on shared component classes (.vipHeader, .vipCard, .vipSite, .studioButton, body, .vipHeader, .globalPlayer).** It is allowed only on utility classes that are explicitly single-purpose (e.g., `.md-reveal.in` opacity, `prefers-reduced-motion` guards, `focus-visible` outlines).

The following files violate this rule and have been cleaned:
- ~~`mobile-polish.css`~~ — `[FIXED]` removed global `border-bottom: 0 !important` on `.vipHeader`
- ~~`dj-system.css`~~ — `[FIXED]` scoped blue accent to `.djConsole` only, no longer bleeds into public VIP
- ~~`premium-shell.css`~~ — `[FIXED]` removed `background: rgba(6,5,8,0.92) !important` on `.vipHeader`

### 4.3 Token Namespacing

New styles must use the `--md-*` (million-dollar) token namespace for public VIP pages. The `--dj-*` tokens are reserved for the console (`.djConsole`). The `--theme-*` tokens in legacy files are deprecated.

---

## 5. Homepage Architecture

```
PublicLayout (variant="spiral", compact)
├── .vipSite.vipSite-spiral.vipSite-live.is-compact
│   ├── .vipHeader (sticky, gold-border, blur bg)
│   │   ├── .vipLogo → .logoOrb + .logoWordmark + .logoSub
│   │   └── .vipNav → .vipNavLink[] (HOME/MUSIC/VIDEO/LIVE/CHAT/…)
│   ├── SwipeHome
│   │   ├── .md-scope
│   │   │   ├── .md-hero (cinematic hero, gold shimmer title)
│   │   │   ├── .md-stage (video swiper, 47 videos)
│   │   │   ├── .md-money (6-tier monetization rail)
│   │   │   ├── .md-strip (platform chips)
│   │   │   └── .md-marquee (rotating title rail)
│   │   └── .md-dots (swiper pagination)
│   └── .vipFooter (gold gradient top border)
└── Global overlays
    ├── .sparkFxLayer (click particle FX)
    ├── .ytSubFab (YouTube subscribe FAB)
    ├── .globalPlayer (sticky audio strip, on music/video/routes)
    ├── BottomDock / MusicDock
    └── ConsentManager (cookie footer)
```

**Route flow:** `/` → `SwipeHome` is the primary entry. `/music` → `MusicDeck`. `/song/:slug` → `SongPage`. `/shop` → `ShopPage`. `/live` → `LiveStreamPage`. Authenticated routes wrap `Shell` (`/vault/*`).

---

## 6. Responsive Design

| Breakpoint | Name | Key Adjustments |
|-----------|------|-----------------|
| `760px` | Desktop upgrade | Money grid → 3-col, slide height → 82vh |
| `1100px` | Wide desktop | Money grid → 6-col, pay-card padding → 18px |
| `720px` | Tablet | Header padding → `0.65rem 0.85rem`, heroCopy → `1.25rem 1rem` |
| `560px` | Mobile | Header padding → compact, nav text hidden on overflow |
| `420px` | Small mobile | `.logoSub` hidden, `.logoWordmark` font-size → `0.92rem` |

**Safe areas:** `env(safe-area-inset-*)` used on all sticky elements and bottom-anchored actions.

**Reduced motion:** `prefers-reduced-motion: reduce` kills all animations, scroll-behavior, shimmer, marquee, and transforms. `.md-reveal` fades are replaced with static opacity.

---

## 7. Quality Checklist

- [x] H1 "3000 Studios" renders with gold shimmer gradient + `background-clip: text`
- [x] Header has gold bottom border (`1px solid rgba(255,215,0,0.12)`)
- [x] Video swiper renders all 47 official releases with posters
- [x] Money rail shows 6 monetization tiles (99¢, VIP, Yearly, Sync, Sponsor, Merch)
- [x] Footer present with gold border
- [x] Mobile nav collapses to hamburger
- [x] `prefers-reduced-motion` respected
- [ ] Console (`/vault`) — blue accent, operator UI (not in scope for public blueprint)

---

## 8. Migration Notes

1. **`landing.css`** (73KB) contains the canonical public-VIP golden theme. All `landing.css` definitions should win the cascade for public pages unless explicitly overridden by `million-dollar.css` (md-* classes) or `mobile-polish.css` (responsive).
2. **`dj-system.css`** blue tokens (`--dj-*`) must be scoped to `.djConsole` or removed from public scope to prevent border/background competition.
3. **`cinematic-vip.css`** golden tokens (`--gold`, `--ember`) are legacy — fold into `--md-*` equivalents.
4. **`swipe-slider.css`** handles touch/gesture behavior for the swiper; must not be split from `.md-track` layout.
5. **`million-dollar.css`** is the SwipeHome system — its scope is `.md-scope` only. Do not leak `md-*` classes into non-swiper pages.

* — Blueprint maintained by the 3000 Studios engineering team. Updates require a review pass and visual regression check on Chrome (desktop + mobile).*
