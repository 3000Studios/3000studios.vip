# 3000 Studios — Agent Instructions

## Overview
- **Domain:** 3000studios.vip
- **Stack:** Turborepo monorepo — React 19 + Vite (web), Hono + Cloudflare Workers (api)
- **Deploy:** Cloudflare Pages (web) + Cloudflare Workers (api)
- **Package Manager:** npm (workspaces)
- **Repo:** github.com/3000Studios/3000studios.vip

## Key Commands (root)
```bash
npm install             # Installs all workspace dependencies
npm run dev             # turbo dev — runs all apps in parallel
npm run build           # turbo build — builds all apps
npm run lint            # turbo lint — lints all apps
npm run test            # turbo test — runs all tests
npm run format          # turbo format — formats all apps
```

## Apps

### apps/web (React frontend)
```bash
npm run dev -w web      # Vite dev server
npm run build -w web    # tsc + vite build
npm run lint -w web     # ESLint
npm run test -w web     # Vitest
```
- React 19 + React Router 7 + Three.js + Framer Motion + Howler.js
- TypeScript strict

### apps/api (Hono Worker backend)
```bash
npm run dev -w api      # wrangler dev --local
npm run deploy -w api   # wrangler deploy
npm run test -w api     # Vitest
```
- Hono framework + Zod validation
- Cloudflare Workers runtime

## Structure
- `apps/web/` — React frontend (Vite + TypeScript)
- `apps/api/` — Hono API Worker (wrangler)
- `packages/` — Shared packages (if any)
- `docs/` — Documentation
- `.turbo/` — Turborepo cache

## Constraints
- Deploy through Cloudflare only (Pages for web, Workers for api)
- Secrets from global.env, never hardcode
- Always run commands from the monorepo root or use `-w <workspace>` flag
- Turborepo handles build ordering and caching — do not bypass it
- Both apps use TypeScript 6.x — strict mode
- Web uses React Three Fiber for 3D content — test visual changes carefully
