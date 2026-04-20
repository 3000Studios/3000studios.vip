# Cloudflare setup (Owner-only)

## 1) Cloudflare Access (Zero Trust)
- Create an Access application for the Pages custom domain you will use.
- Restrict access to the single owner identity (your email).
- Optionally enforce MFA, device posture, and IP allowlist.

## 2) D1 database
- Database name: `apex_citadel`
- Apply migrations:
  - `cd apps/api`
  - `npx wrangler d1 migrations apply apex_citadel --remote`

## 3) Workers API
- Worker name: `apex-citadel-api`
- Deploy:
  - `cd apps/api`
  - `npx wrangler deploy`
- Set Worker secrets:
  - `OWNER_EMAIL`
  - `ALERT_FROM_EMAIL`
  - `MAILCHANNELS_API_KEY`

## 4) Pages Web
- Pages project name (suggested): `3000studios-vip`
- Build and deploy:
  - `cd apps/web`
  - `npm ci`
  - `npm run build`
  - `npx wrangler pages deploy dist --project-name 3000studios-vip`

## 5) Custom domain routing (recommended)
- Map the Pages project to the intended private domain.
- Route `/api/*` to the Worker (Workers Routes) on the same domain, so the web can call `/api`.

