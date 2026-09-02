# 3000 Studios VIP — Agent Handoff

## Canonical project

- Workspace: `C:\Users\MrJws\OneDrive\Workspaces\3000studios.vip`
- Repository: `3000Studios/3000studios.vip`
- Production branch: `main` only
- Web host: Cloudflare Pages project `3000studios-vip` via Git integration
- API: Cloudflare Worker `apex-citadel-api`
- Public URLs: `https://3000studios.vip/` and `https://api.3000studios.vip/`

## Safe start sequence

1. Read `AGENTS.md`, this handoff, `package.json`, `apps/web/AGENTS.md`, and `apps/api/AGENTS.md`.
2. Use `C:\Program Files\Git\cmd\git.exe` if `git` is unavailable in PowerShell.
3. Check `git status --short --branch`, remotes, and recent `main` commits. Preserve unrelated changes.
4. Run `npm.cmd ci --ignore-scripts` if dependencies are incomplete, then `npm.cmd run lint`, `npm.cmd run test`, and `npm.cmd run build`.
5. For a scoped production change: commit directly to `main`, push `origin main`, wait for Cloudflare Pages Git deployment, then verify the fresh custom-domain page on desktop and mobile. A successful HTTP response alone is insufficient.

## Security and owner approvals

- Never print, commit, upload, or screenshot values from `C:\Users\MrJws\Documents\global.env`; inspect variable names/readiness only.
- Do not run broad `env:sync` or `deploy:cloudflare` scripts for ordinary Pages releases. Cloudflare Pages Git integration deploys pushes to `main`.
- Require owner approval before credentials, DNS, billing, payments, publishing, account changes, deletions, or other irreversible/public actions.
- Preserve Cloudflare Access, Defender, firewall, PIA/VPN, and browser protections.

## Current continuation plan

1. Confirm the commit that follows this handoff has completed its Cloudflare Pages build and that the custom domain serves its new asset hash.
2. Visually test `/`, `/music`, `/live`, `/admin`, and `/vault` at 320px and desktop in a fresh browser context; capture only non-secret evidence.
3. Verify `api.3000studios.vip` fails closed without valid Cloudflare Access credentials; do not weaken `ACCESS_REQUIRED`.
4. Treat Stream publishing, owner vault access, outbound email, deploy hooks, analytics, and payment links as unverified until confirmed with current server-side or account evidence.
5. Address the remaining bundle-size warning only as a focused performance task; do not mix it into production fixes.

## Known validation note

The repository is expected to build after a clean lockfile install. Vite currently reports non-blocking large media bundle warnings for `dashjs` and `hls.js`; handle code splitting separately after confirming real route usage.
