# 3000 Studios VIP — Secrets, Deploy & Ops

## Auto-deploy (Cloudflare only)

- GitHub is source control only.
- Cloudflare Pages project `3000studios-vip` is connected to `3000Studios/3000studios.vip`.
- **Every push and every PR to `main` auto-builds and deploys.**
- Local Git hooks can also run Wrangler deploys after commits and before pushes:
  - `npm run hooks:install`
  - hooks call `scripts/Deploy-Cloudflare.ps1`
- Only one branch: `main`.
- Build: `npm ci && npm run build` → output `apps/web/dist`

GitHub Actions is not required for production deployment. Cloudflare direct Git integration and Wrangler are the supported production paths.

## global.env source

Secrets stay outside Git. The sync/deploy scripts load the first existing file from:

1. `C:\WorkSpaces\global.env`
2. `C:\Users\Servi\.config\env\global.env`
3. `C:\Users\Servi\OneDrive\Documents\global.env`

Run:

```powershell
npm run env:sync
npm run deploy:cloudflare
```

The scripts print variable names and counts only. They do not print secret values.

## Required secrets to inject

### Cloudflare Pages (production + preview)
- NODE_VERSION=20
- APP_ENV=production
- VITE_API_BASE=https://api.3000studios.vip
- OWNER_EMAIL / VITE_VAULT_USERNAME = Mr.jwswain@gmail.com
- VITE_VAULT_PASSCODE_SHA256  (sha256 hex of owner passcode)
- VITE_VAULT_SECRET_ANSWER_SHA256  (sha256 hex of secret answer lowercase)
- VITE_STREAM_CUSTOMER_CODE / VITE_STREAM_LIVE_INPUT_ID / VITE_STREAM_TITLE when Cloudflare Stream is enabled

### Worker `apex-citadel-api` (deploy with wrangler)
```bash
npm run env:sync
npm run deploy:cloudflare
```

Vars already in `apps/api/wrangler.toml`: OWNER_EMAIL, APP_ENV, ACCESS_REQUIRED, D1 binding.

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
