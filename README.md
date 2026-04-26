# the3000studios.Vip — Apex Citadel

Owner-only control center for monitoring and self-healing across the 3000 Studios site portfolio.

## Architecture

This is a Turborepo monorepo with the following structure:

- **apps/api** - Cloudflare Workers API (Hono, TypeScript, D1 database)
  - Site management and health checks
  - Incident tracking with email alerts
  - Cloudflare zone analytics
  - Bridge inspection for origin monitoring
  - Natural language command parsing

- **apps/web** - React 19 web application (Vite, React Router)
  - Protected dashboard with Cloudflare Access authentication
  - Site monitoring and management UI
  - Real-time health check results
  - Deploy hook triggers

- **packages/shared** - Shared TypeScript types and utilities

## Local dev

1. Install dependencies:

   ```bash
   npm install
   ```

2. API (Cloudflare Workers):

   ```bash
   cd apps/api
   npx wrangler dev --local
   ```

3. Web (Vite dev server):

   ```bash
   cd apps/web
   npm run dev
   ```

4. Run tests:

   ```bash
   npm run test
   ```

5. Build:
   ```bash
   npm run build
   ```

## Features

- **Health Checks**: Automated site monitoring with configurable timeouts and thresholds
- **Incident Management**: Automatic incident creation and email alerts via MailChannels
- **Cloudflare Integration**: Zone analytics, DNS management, and deploy hooks
- **Bridge Inspection**: Monitor origin configuration and endpoint status
- **Natural Language Commands**: Parse and execute operations via text commands
- **Self-Healing**: Automatic deploy hook triggers for failed checks

## Deploy (Cloudflare)

This repo expects GitHub Actions secrets to be configured:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- `CF_PAGES_PROJECT` - Cloudflare Pages project name
- `VITE_API_BASE` - API base URL for web app
- `OWNER_EMAIL` - Email for alerts
- `ALERT_FROM_EMAIL` - From email for alerts
- `MAILCHANNELS_API_KEY` - MailChannels API key

## Environment Variables

### API

- `APP_ENV` - Environment (production/development)
- `ACCESS_REQUIRED` - Whether Cloudflare Access is required (1/0)
- `DB` - D1 database binding
- `MAILCHANNELS_API_KEY` - MailChannels API key for email alerts

### Web

- `VITE_API_BASE` - API base URL

## Tech Stack

- **API**: Hono, Zod, Cloudflare Workers, D1, Wrangler
- **Web**: React 19, Vite, React Router, Three.js, Framer Motion
- **Testing**: Vitest, Testing Library
- **Build**: Turborepo, TypeScript

<!-- deploy trigger: 2026-04-21 -->
