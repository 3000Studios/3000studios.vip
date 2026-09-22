# 3000 Studios VIP — Official Music & Live Stage

Cinematic music universe for **3000 Studios**: full-length catalog, live stage, official videos, shop, and on-site arcade — served at [3000studios.vip](https://3000studios.vip).

Public product surface (organic only — no paid ads required for core UX):

- **Music** — coverflow deck + song pages (`/music`, `/song/:slug`)
- **Live** — Cloudflare Stream stage (`/live`)
- **Video** — official release hub (`/video`)
- **Shop** — merch + Stripe/PayPal helpers (`/shop`)
- **Arcade** — TikTok mini-games (`/tiktok-games/`)
- **Blog / About / Contact** — editorial and legal pages

Owner ops live under a protected vault (see below) — they are not the public product.

## Architecture

Turborepo monorepo (npm workspaces):

| Package | Role |
|---------|------|
| `apps/web` | React 19 + Vite 8 + React Router → Cloudflare Pages (`3000studios-vip`) |
| `apps/api` | Hono Worker `apex-citadel-api` + D1 + R2 (owner/ops API) |
| `apps/web/functions` | Cloudflare Pages Functions (`/api/*` live-room, stream-config, pay, …) |
| `packages/shared` | Shared Zod types |

## Local dev

Requires **Node ≥ 22** (`.nvmrc`). Node 20 may install/build with `EBADENGINE` warnings.

```bash
npm install
npm run dev          # turbo: web + api
npm run build
npm run test -- --filter=web
npm run lint -- --filter=web
```

Web only:

```bash
cd apps/web && npm run dev
```

Catalog path audit / repair (media hygiene):

```bash
node apps/web/scripts/audit-catalog-paths.mjs --json ../website/catalog_path_audit.json
node apps/web/scripts/repair-catalog-paths.mjs   # copies DistroKid-named MP3s → /media/{slug}.mp3
```

## Owner vault / ops (Apex Citadel)

Protected routes (`/vault`, `/agent`) and the Worker API are the **owner monitoring / self-healing control center** for the site portfolio. Fail-closed Cloudflare Access is intentional — do not weaken it for public music playback.

Vault features: site health, incidents, Stream vault, Dude agent, AdSense observability.

## Deploy (Cloudflare Pages)

- GitHub is source control; push to `main` auto-deploys Pages project `3000studios-vip`.
- Build: `npm ci && npm run build` → output `apps/web/dist`.
- Pages Functions live in `apps/web/functions`. Root directory must be `apps/web` (or pass `--functions apps/web/functions` on wrangler deploy). See `docs/secrets-and-deploy.md` and `/workspace` ops notes if `/api/*` returns SPA HTML.
- Do not commit secrets. Use Cloudflare Pages env + Worker secrets (`global.env` on the owner machine only).

### Web build env (names)

- `VITE_API_BASE`, `VITE_VAULT_*`, Stream `VITE_STREAM_*`
- Stripe (read by `apps/web/src/lib/commerce.ts`): `VITE_STRIPE_TRACK_LINK`, `VITE_STRIPE_MONTHLY_LINK`, `VITE_STRIPE_YEARLY_LINK`
- AdSense: `VITE_ADSENSE_CLIENT_ID` (+ optional slot vars). If unset, the AdSense meta tag is omitted from HTML (no `%VITE_…%` placeholder).

## License / contact

Owner: 3000 Studios · site https://3000studios.vip
