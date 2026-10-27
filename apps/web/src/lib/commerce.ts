export const SAMPLE_SECONDS = 30;
export const TRACK_PRICE_CENTS = 99;
export const MONTHLY_PRICE_CENTS = 399;
export const YEARLY_PRICE_CENTS = 1999;

export const OWNER_EMAIL = 'mr.jwswain@gmail.com';

/** Primary buy destinations — every song/track links to a purchase path. */
export const SHOPIFY_STORE_URL = 'https://boughtitonline.com';
export const HYPERFOLLOW_URL = 'https://distrokid.com/hyperfollow/3000studios';

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@3000Studio' },
  { id: 'ytmusic', label: 'YouTube Music', url: 'https://music.youtube.com/channel/UCnQTLksEH7Paj4teEEBU8qQ' },
  { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik' },
  { id: 'apple', label: 'Apple Music', url: 'https://music.apple.com/us/artist/3000-studios/6802721597' },
  { id: 'amazon', label: 'Amazon Music', url: 'https://music.amazon.com/artists/B0GXLYCZXD/3000-studios' },
  { id: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@3000STUDIOS' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/3000studios.vip/' },
  { id: 'hyperfollow', label: 'HyperFollow', url: 'https://distrokid.com/hyperfollow/3000studios' },
  { id: 'facebook', label: 'Facebook', url: 'https://facebook.com/3000Studios.vip' },
  { id: 'live', label: 'Live', url: 'https://3000studios.vip/live' },
  { id: 'site', label: '3000 Studios', url: 'https://3000studios.vip' },
  { id: 'shop', label: 'Shop', url: '/shop' },
  { id: 'games', label: 'Games · Arcade', url: '/tiktok-games/' },
] as const;

const ENTITLEMENT_KEY = '3000-music-entitlement-v1';
const PURCHASES_KEY = '3000-track-purchases-v1';
const EVENTS_KEY = '3000-ops-events-v1';

export type Plan = 'none' | 'monthly' | 'yearly' | 'admin';

export type Entitlement = {
  plan: Plan;
  expiresAt: number;
  tracks: string[];
};

export function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function emptyEntitlement(): Entitlement {
  return { plan: 'none', expiresAt: 0, tracks: [] };
}

export function readEntitlement(): Entitlement {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY);
    if (!raw) return emptyEntitlement();
    const parsed = JSON.parse(raw) as Entitlement;
    if (parsed.plan === 'monthly' || parsed.plan === 'yearly' || parsed.plan === 'admin') {
      if (parsed.expiresAt > Date.now()) return parsed;
      return { ...parsed, plan: 'none', expiresAt: 0 };
    }
    return { plan: 'none', expiresAt: 0, tracks: parsed.tracks || [] };
  } catch {
    return emptyEntitlement();
  }
}

export function writeEntitlement(next: Entitlement) {
  localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('3000-entitlement', { detail: next }));
}

export function hasFullAccess(slug?: string) {
  // Was hard-coded `return true` (business audit P0-2): any gate that asked
  // this question got "yes" for every visitor. Now it answers from the real
  // entitlement — an active plan covers everything; otherwise the specific
  // track must be owned. NOTE: full-length streaming stays free by design
  // (see llms.txt / terms); this gates paid extras (downloads, vault perks)
  // at the call sites that choose to check it.
  const ent = readEntitlement();
  if (ent.plan !== 'none') return true;
  return slug ? ent.tracks.includes(slug) : false;
}

export function grantTrack(slug: string) {
  const ent = readEntitlement();
  if (!ent.tracks.includes(slug)) ent.tracks.push(slug);
  writeEntitlement(ent);
  logOpsEvent('purchase_track', { slug });
}

export function grantPlan(plan: 'monthly' | 'yearly' | 'admin') {
  const now = Date.now();
  const expiresAt =
    plan === 'admin' ? now + 1000 * 60 * 60 * 24 * 365 * 10 : plan === 'yearly' ? now + 1000 * 60 * 60 * 24 * 365 : now + 1000 * 60 * 60 * 24 * 31;
  writeEntitlement({ plan, expiresAt, tracks: readEntitlement().tracks });
  logOpsEvent('subscribe', { plan });
}

/* ------------------------------------------------------------------ */
/* Purchase returns — FAIL-CLOSED settlement (business audit P0-1).    */
/*                                                                     */
/* Nothing is granted when a buy button is clicked. Clicking records   */
/* a *pending intent* only; the entitlement settles on the Stripe      */
/* success return (?paid=1) and only when the server validates the     */
/* signed checkout-arm cookie that /api/pay set as the buyer left for  */
/* Stripe (see functions/lib/pay-arm.ts for what the arm proves and    */
/* what it cannot — full Stripe session/webhook verification lands     */
/* with the owner's Stripe reconnect). A bare ?paid=1 URL, or a        */
/* pending record older than 24h, settles nothing.                     */
/* ------------------------------------------------------------------ */

export const TRACK_PENDING_KEY = '3000-pending-track';
export const SHOP_PENDING_KEY = '3000-pending-shop-item';
const PENDING_TTL_MS = 24 * 60 * 60 * 1000;

export type PendingPurchase = {
  id: string; // 'track' (with slug), 'monthly', 'yearly', shop item id
  slug?: string;
  via?: 'stripe' | 'paypal';
  ts: number;
};

export function writePending(key: string, pending: PendingPurchase) {
  try {
    localStorage.setItem(key, JSON.stringify(pending));
  } catch {
    /* private mode */
  }
}

export function readPending(key: string): PendingPurchase | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    if (raw.startsWith('{')) {
      const parsed = JSON.parse(raw) as PendingPurchase;
      return typeof parsed.id === 'string' ? parsed : null;
    }
    // Legacy pre-2026-10-27 records stored a bare slug/id with no timestamp;
    // treat them as just-created so an in-flight checkout is not stranded.
    return key === TRACK_PENDING_KEY
      ? { id: 'track', slug: raw, ts: Date.now() }
      : { id: raw, ts: Date.now() };
  } catch {
    return null;
  }
}

export function clearPending(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function pendingFresh(pending: PendingPurchase) {
  return Date.now() - pending.ts < PENDING_TTL_MS;
}

/** Begin the $0.99 track checkout: record intent, hand off to Stripe. */
export function startTrackCheckout(slug: string) {
  writePending(TRACK_PENDING_KEY, { id: 'track', slug, via: 'stripe', ts: Date.now() });
  window.location.assign(`/api/pay?sku=track&slug=${encodeURIComponent(slug)}`);
}

type PayArmResponse = { ok: boolean; sku?: string; slug?: string; ts?: number };

async function fetchPayArm(): Promise<PayArmResponse | null> {
  try {
    const res = await fetch('/api/pay/session', { headers: { accept: 'application/json' } });
    if (!res.ok) return null;
    return (await res.json()) as PayArmResponse;
  } catch {
    return null;
  }
}

/**
 * Settle any pending purchase on a ?paid=1 return. Grants ONLY when:
 *  - a pending record exists from a real buy click and is < 24h old, AND
 *  - the server validates the signed checkout arm for the same sku/slug.
 * PayPal shop returns have no arm (PayPal never transits /api/pay); those
 * settle on the pending record alone, as before — documented residual.
 * The generic shop "track" item carries no slug, so it never auto-grants a
 * (previously hard-coded, wrong) track; the buyer picks in the catalog.
 * Returns true when something was granted. Always strips ?paid from the URL.
 */
export async function settleReturnPurchase(): Promise<boolean> {
  let granted = false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('paid') !== '1') return false;

    const arm = await fetchPayArm();
    const trackPending = readPending(TRACK_PENDING_KEY);
    const shopPending = readPending(SHOP_PENDING_KEY);

    if (
      trackPending?.id === 'track' &&
      trackPending.slug &&
      pendingFresh(trackPending) &&
      arm?.ok &&
      arm.sku === 'track' &&
      arm.slug === trackPending.slug
    ) {
      grantTrack(trackPending.slug);
      granted = true;
    }
    if (trackPending) clearPending(TRACK_PENDING_KEY);

    if (shopPending && pendingFresh(shopPending)) {
      const plan =
        shopPending.id === 'monthly' ? 'monthly' : shopPending.id === 'yearly' ? 'yearly' : null;
      const armed =
        arm?.ok && plan !== null && arm.sku === plan ? true : shopPending.via === 'paypal';
      if (plan && armed) {
        grantPlan(plan);
        granted = true;
      } else if (shopPending.id === 'track') {
        logOpsEvent('shop_track_return_unassigned', {});
      }
    }
    if (shopPending) clearPending(SHOP_PENDING_KEY);

    if (!granted) logOpsEvent('purchase_return_unverified', {});
    params.delete('paid');
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', clean);
  } catch {
    /* ignore — fail closed: no grant */
  }
  return granted;
}

export function checkoutMailto(kind: 'track' | 'monthly' | 'yearly', title?: string) {
  const stripe =
    kind === 'track'
      ? (import.meta.env.VITE_STRIPE_TRACK_LINK as string | undefined)
      : kind === 'monthly'
        ? (import.meta.env.VITE_STRIPE_MONTHLY_LINK as string | undefined)
        : (import.meta.env.VITE_STRIPE_YEARLY_LINK as string | undefined);
  if (stripe) return stripe;
  const subject =
    kind === 'track'
      ? `Buy ${title || 'track'} — $0.99`
      : kind === 'monthly'
        ? 'Unlock all songs — $3.99/mo'
        : 'Unlock all songs — $19.99/year';
  return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

export function logOpsEvent(type: string, extra?: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const list = raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : [];
    list.unshift({ type, ts: Date.now(), ...extra });
    localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(0, 80)));
  } catch {
    /* ignore */
  }
}

export function readOpsEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    return raw ? (JSON.parse(raw) as Array<{ type: string; ts: number }>) : [];
  } catch {
    return [];
  }
}

export function readPurchases() {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
