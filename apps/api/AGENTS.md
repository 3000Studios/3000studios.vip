# AGENTS.md — 3000Studios Project Rules

- Start by reading package.json, framework config, Firebase config, Cloudflare config, and env examples.
- Default deployment target is Cloudflare Pages unless repo says otherwise.
- Use Cloudflare Workers or Pages Functions for lightweight APIs.
- Use Firebase Auth, Firestore, Storage, Functions, and App Check where useful.
- Check C:\Users\Servi\.config\env\global.env for required variable names only.
- Never print, expose, commit, or invent secrets.
- Do not rename env variables unless every reference is updated and documented.
- Every site must be AdSense-review-ready when applicable.
- Maintain robots.txt, sitemap.xml, ads.txt, _headers, and _redirects where applicable.
- Run lint, typecheck, build, tests, gitleaks, trivy, and semgrep when available.
- Fix real spelling issues. Whitelist valid technical/project/domain words in cspell.json.
- Keep UI mobile-first, accessible, fast, high-contrast, and production-ready.
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
