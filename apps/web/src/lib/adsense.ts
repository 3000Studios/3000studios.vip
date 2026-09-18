/**
 * Central AdSense configuration. The publisher ID and slot IDs are loaded from
 * environment variables so the same build can be reused across accounts and so
 * secrets are not scattered through components.
 */

export const ADSENSE_PUBLISHER_ID =
  (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim() || '';

export const ADSENSE_HOME_SLOT =
  (import.meta.env.VITE_ADSENSE_HOME_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_VIDEO_SLOT =
  (import.meta.env.VITE_ADSENSE_VIDEO_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_LIVE_SLOT =
  (import.meta.env.VITE_ADSENSE_LIVE_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_BLOG_SLOT =
  (import.meta.env.VITE_ADSENSE_BLOG_SLOT as string | undefined)?.trim() || '';

export function adsenseClientId(): string {
  return ADSENSE_PUBLISHER_ID;
}

export function hasAdsenseConfig(): boolean {
  return Boolean(ADSENSE_PUBLISHER_ID);
}
