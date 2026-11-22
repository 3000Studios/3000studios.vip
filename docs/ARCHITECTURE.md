# Architecture

3000studios.vip is one GitHub repository. Cloudflare Pages deploys **`apps/web`**. The Worker API is **`apps/api`**. GitHub Actions is not the production deploy path.

## Mapping (Phase 1)

Requested `apps/website` → existing **`apps/web`** (not moved).  
Requested `apps/admin` → existing web admin routes (folder is a pointer).  
Requested orchestrator → **`packages/studio-os`**.

## Data

- Release manifests: `music/releases/{slug}/manifest.json`
- Job state / logs / cost: `.studio-os/` (gitignored)
- Large WAV/MP4: external store (`MEDIA_STORE_ROOT`), checksums in the manifest
- Public catalog still lives in `apps/web/src/data/` until a later migration copies from manifests
