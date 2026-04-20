export type Env = {
  DB: D1Database;
  APP_ENV: string;
  ACCESS_REQUIRED?: string;
  OWNER_EMAIL?: string;
  ALERT_FROM_EMAIL?: string;
  MAILCHANNELS_API_KEY?: string;
};
