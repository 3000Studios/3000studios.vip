# AGENTS.md — 3000Studios Project Rules

## Cloud coding agents (Jules and similar) — read this first

- Work from the root of this repository clone. Windows/OneDrive paths elsewhere in this file describe the owner's local machine, not this repo — ignore them in cloud environments.
- Stack: npm 11 workspaces + Turbo monorepo. Web app = `apps/web` (Vite + React + TypeScript). Install: `npm ci`. Build: `npm run build`. Test: `npm test`. Lint: `npm run lint`. Extra gates that must pass: `npm run check:placeholders` (no placeholder content ever ships) and `npm run smoke:sitemap`.
- Deployment: Cloudflare Pages project `3000studios-vip`, build root `apps/web`. Deploys are handled by the owner outside the agent workflow — your job ends at a pull request. Never deploy, never run wrangler.
- Pull requests only: never merge, never push to `main` directly, never create or modify GitHub Actions workflows.
- Standing rules: the brand is always written "3000 Studios". No placeholder or lorem content. No new paid services, paid dependencies, or subscriptions. Never print, commit, or expose secrets or env values. Keep changes small, tested, and explained in the PR description.

- Workspace root: the root of this repository's working clone (on the owner's Windows machine: its local clone of this repo). Never work from temp directories.
- Deploy through Cloudflare Pages (project `3000studios-vip`, build root `apps/web`). The owner handles deploys; agents deliver work via pull requests to `main`. No GitHub Actions.
- One repo, one branch (`main`), one Cloudflare Pages project.
- Secrets & env vars: `C:\Users\MrJws\Documents\global.env` is the canonical global environment file. Keep it clean, organized, and deduplicated. Use it for required API access and safe secret injection only; never print, commit, screenshot, upload, or expose secret values.

- Start by reading package.json, framework config, Firebase config, Cloudflare config, and env examples.
- Default deployment target is Cloudflare Pages unless repo says otherwise.
- Use Cloudflare Workers or Pages Functions for lightweight APIs.
- Use Firebase Auth, Firestore, Storage, Functions, and App Check where useful.
- Check `C:\Users\MrJws\Documents\global.env` for required variable names/readiness only. Use values only inside trusted local/deployment commands that need them, without echoing or logging secrets.
- Never print, expose, commit, or invent secrets.
- Do not rename env variables unless every reference is updated and documented.
- Every site must be AdSense-review-ready when applicable.
- Maintain robots.txt, sitemap.xml, ads.txt, _headers, and _redirects where applicable.
- Run lint, typecheck, build, tests, gitleaks, trivy, and semgrep when available.
- Fix real spelling issues. Whitelist valid technical/project/domain words in cspell.json.
- Keep UI mobile-first, accessible, fast, high-contrast, and production-ready.
- Quality checklist (review & auto-fix every session):
  - Read ALL AGENTS.md instructions and full repo codebase for context
  - Fix all errors, broken features, and UI issues automatically
  - Check mobile (<=720px) and desktop — no flickering, messy UI, broken spacing, or visual bugs
  - Verify all buttons, links, and features work as designed
  - Confirm payment/Stripe links are correct
  - Sweep all API endpoints (Worker routes end-to-end)
  - Audit all secrets and env vars — ensure they're set in Cloudflare (Pages + Worker) and match `C:\Users\MrJws\Documents\global.env`
  - Optimize all graphics/images for quality and performance
  - Polish UI to look professional (high-contrast, accessible, smooth animations)
- Final report must include files changed, commands run, issues fixed, and manual blockers.

# One-Done Agent Rules

- When creating a one-done script, create, save, and run every required generated file from the script itself.
- Back up before edits.
- Do not expose secrets.
- Do not print .env values.
- Do not delete files without explicit approval.
- Do not enable paid services without explicit approval.
- Continue through safe fixes automatically.
- Verify build/lint/typecheck/test where available.
- Produce a final report.
- For Google login, use Google Identity Services instead of deprecated Google Sign-In libraries.
