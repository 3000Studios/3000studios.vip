export type Env = {
  DB: D1Database;
  APP_ENV: string;
  ACCESS_REQUIRED?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
  OWNER_EMAIL?: string;
  ALERT_FROM_EMAIL?: string;
  MAILCHANNELS_API_KEY?: string;
};
