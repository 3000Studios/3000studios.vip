# the3000studios.Vip — Apex Citadel

Owner-only control center for monitoring and self-healing across the 3000 Studios site portfolio.

## Local dev

1. API
   - `cd apps/api`
   - `npx wrangler dev`
2. Web
   - `cd apps/web`
   - `npm run dev`

## Deploy (Cloudflare)

This repo expects GitHub Actions secrets to be configured:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CF_PAGES_PROJECT`
- `VITE_API_BASE`
- `OWNER_EMAIL`
- `ALERT_FROM_EMAIL`
- `MAILCHANNELS_API_KEY`

<!-- deploy trigger: 2026-04-21 -->
