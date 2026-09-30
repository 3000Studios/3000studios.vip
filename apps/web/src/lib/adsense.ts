/**
 * Central AdSense configuration. The publisher ID and slot IDs are loaded from
 * environment variables so the same build can be reused across accounts and so
 * secrets are not scattered through components.
 *
 * WHAT TO PASTE HERE (values come from YOUR AdSense account — never invent them):
 *   1. Sign in at https://www.google.com/adsense/ → left nav "Ads" → "By ad unit".
 *   2. Create one display ad unit per slot below (name them e.g. "VIP Home",
 *      "VIP Video", "VIP Live", "VIP Blog"), or open an existing unit.
 *   3. Click "Get code" / copy the HTML snippet and take ONLY the numeric
 *      `data-ad-slot="1234567890"` value — that number is the slot ID.
 *   4. Set each as a Cloudflare Pages environment variable (Pages project →
 *      Settings → Environment variables), e.g. VITE_ADSENSE_HOME_SLOT=1234567890.
 *   5. IMPORTANT: Vite bakes these values in at BUILD time — after changing
 *      them in Cloudflare, trigger a redeploy (Retry deployment) so the new
 *      build picks them up. Until then every slot stays '' and NO ad unit
 *      renders (that is why the live homepage shows zero data-ad-slot today).
 *
 * The publisher ID below is real (verified live on 3000studios.vip).
 */

export const ADSENSE_PUBLISHER_ID =
  (import.meta.env.VITE_ADSENSE_CLIENT_ID as string | undefined)?.trim() ||
  'ca-pub-5800977493749262';

export const ADSENSE_HOME_SLOT =
  (import.meta.env.VITE_ADSENSE_HOME_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_VIDEO_SLOT =
  (import.meta.env.VITE_ADSENSE_VIDEO_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_LIVE_SLOT =
  (import.meta.env.VITE_ADSENSE_LIVE_SLOT as string | undefined)?.trim() || '';

export const ADSENSE_BLOG_SLOT =
  (import.meta.env.VITE_ADSENSE_BLOG_SLOT as string | undefined)?.trim() || '';

/** Env-var name → resolved slot value, for status pages and admin tooling. */
export const ADSENSE_SLOTS = {
  VITE_ADSENSE_HOME_SLOT: ADSENSE_HOME_SLOT,
  VITE_ADSENSE_VIDEO_SLOT: ADSENSE_VIDEO_SLOT,
  VITE_ADSENSE_LIVE_SLOT: ADSENSE_LIVE_SLOT,
  VITE_ADSENSE_BLOG_SLOT: ADSENSE_BLOG_SLOT,
} as const;

/** Env-var names whose slot is still empty (nothing renders for those). */
export function missingAdSlotEnvs(): string[] {
  return (Object.entries(ADSENSE_SLOTS) as [string, string][])
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

export function adsenseClientId(): string {
  return ADSENSE_PUBLISHER_ID;
}

export function hasAdsenseConfig(): boolean {
  return Boolean(ADSENSE_PUBLISHER_ID);
}
