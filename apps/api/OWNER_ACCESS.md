# Owner API access

The production Worker fails closed when `ACCESS_REQUIRED=1` until Cloudflare Access is configured.

Configure a self-hosted Cloudflare Access application for the API hostname and protect all routes except the public `/health` check if a public check is needed. Restrict its allow policy to the owner identity only. Then add these Worker environment variables through Cloudflare's secret/environment settings, never source control:

- `CF_ACCESS_TEAM_DOMAIN` — the full Access team-domain URL.
- `CF_ACCESS_AUD` — the Access application's audience tag.
- `OWNER_EMAIL` — the approved owner identity email.

The Worker validates the signed `Cf-Access-Jwt-Assertion` against the team JWKS, issuer, audience, and owner email. Do not replace this with a passcode, browser storage flag, or a client-provided email header.
