export type PagesEnv = {
  ASSETS?: { fetch: typeof fetch };
  DB: D1Database;
  VITE_ADSENSE_CLIENT_ID?: string;
  VITE_ADSENSE_HOME_SLOT?: string;
  VITE_ADSENSE_VIDEO_SLOT?: string;
  VITE_ADSENSE_LIVE_SLOT?: string;
  VITE_ADSENSE_BLOG_SLOT?: string;
  VITE_API_BASE?: string;
  GEMINI_API_KEY?: string;
  VITE_GEMINI_API_KEY?: string;
  VITE_GEMINI_MODEL?: string;
  STREAM_WHIP_URL?: string;
  STREAM_RTMPS_SERVER?: string;
  STRIPE_TRACK_LINK?: string;
  STRIPE_MONTHLY_LINK?: string;
  STRIPE_YEARLY_LINK?: string;
  TIKTOK_CLIENT_KEY?: string;
  TIKTOK_CLIENT_SECRET?: string;
  LIVE_ROOM_API?: string;
  LIVE_ACCESS_CODE?: string;
  LIVE_ACCESS_SESSION_SECRET?: string;
  API_BASE?: string;
  STREAM_SIGNING_KEY_ID?: string;
  STREAM_SIGNING_JWK?: string;
  STREAM_LIVE_INPUT_ID?: string;
  STREAM_CUSTOMER_CODE?: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Env extends PagesEnv {}
}

export {};
