# 3000 Studios VIP — Secrets, Deploy & Ops

## Auto-deploy (Cloudflare only)

- GitHub is source control only.
- Cloudflare Pages project `3000studios-vip` is connected to `3000Studios/3000studios.vip`.
- **Every push and every PR to `main` auto-builds and deploys.**
- Only one branch: `main`.
- Build: `npm ci && npm run build` → output `apps/web/dist`

## Required secrets to inject

### Cloudflare Pages (production + preview)
Already partially set:
- NODE_VERSION=20
- APP_ENV=production
- VITE_API_BASE=https://api.3000studios.vip
- OWNER_EMAIL / VITE_VAULT_USERNAME = Mr.jwswain@gmail.com

Still required (set via dashboard or API as secret_text):
- VITE_VAULT_PASSCODE_SHA256  (sha256 hex of owner passcode)
- VITE_VAULT_SECRET_ANSWER_SHA256  (sha256 hex of secret answer lowercase)

### Worker `apex-citadel-api` (deploy with wrangler)
```bash
cd apps/api
npx wrangler secret put MAILCHANNELS_API_KEY
npx wrangler secret put DUDE_SYNC_TOKEN
npx wrangler deploy
```

Vars already in wrangler.toml: OWNER_EMAIL, APP_ENV, ACCESS_REQUIRED, D1 binding.

## Google AdSense
- Client: ca-pub-5800977493749262
- ads.txt present at root and public/
- Script loaded in index.html
- Ready for ad units; add `<ins class="adsbygoogle">` blocks in components as needed.

## Media assets
Place full tracks under `apps/web/public/media/` (or R2 CDN):
- always-feel-like.mp3 (already present)
- spotify-signing.mp4 (opener, already present)
- Add the rest of the catalog listed in `src/data/music.ts`

## Secret admin entrance
1. Tap © at bottom 10 times
2. Enter code `5555`
3. Then owner email + passcode + secret answer
4. Routes to `/vault` dashboard (existing auth preserved)

## Content / auto blogs / music upload
Dashboard (protected) already supports site ops, AdSense health, stream vault, and command surface. Extend `/vault` with media manager as next iteration using R2.
