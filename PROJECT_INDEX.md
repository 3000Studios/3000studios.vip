# PROJECT_INDEX — 3000studios.vip

## Production (do not relocate)

| Path | Role |
|---|---|
| `apps/web` | Public website + owner admin UI (Cloudflare Pages) |
| `apps/api` | Cloudflare Worker API (Hono, D1) |
| `apps/web/functions` | Pages Functions |
| `apps/web/public` | robots, sitemap, ads.txt, media, listen.html |
| `packages/shared` | Shared TS types for the citadel |

## Empire OS (Phase 1)

| Path | Role |
|---|---|
| `packages/studio-os` | Orchestrator, routers, schemas, workers, audits |
| `apps/release-machine` | CLI for write / ingest / approve |
| `apps/admin` | Pointer only — live admin is `apps/web` |
| `apps/website` | Pointer only — live site is `apps/web` |
| `apps/android-agent` | Existing Android agent |
| `apps/song-drop-android` | Existing song-drop Android app |

## Content / ops dirs

`agents/` `workers/` `music/` `promotion/` `branding/` `distribution/` `automation/` `integrations/` `business/` `legal/` `docs/` `scripts/` `config/` `archive/` `reports/`

## Canonical docs

`AGENTS.md` `ORCHESTRATOR.md` `SONGWRITING.md` `README.md` `docs/ARCHITECTURE.md`
