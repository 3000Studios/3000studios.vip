export type Env = {
  DB: D1Database;
  AI?: Ai;
  APP_ENV: string;
  ACCESS_REQUIRED?: string;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  OWNER_EMAIL?: string;
  /** Server-side SHA-256 of the owner vault passcode. Never expose to the browser. */
  VAULT_PASSCODE_SHA256?: string;
  /** Server-side SHA-256 of the owner vault secret answer. Never expose to the browser. */
  VAULT_SECRET_ANSWER_SHA256?: string;
  /** HS256 secret for issuing / verifying owner session JWTs. */
  AUTH_JWT_SECRET?: string;
  DUDE_SYNC_TOKEN?: string;
  ALERT_FROM_EMAIL?: string;
  MAILCHANNELS_API_KEY?: string;
  MUSIC_JOBS?: R2Bucket;
  MUSIC_DEVICE_TOKEN?: string;
  TIKTOK_CLIENT_KEY?: string;
  TIKTOK_CLIENT_SECRET?: string;
};
