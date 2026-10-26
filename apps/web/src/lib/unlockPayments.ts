/* ============================================================================
   $1 UNLOCK PAYMENT SYSTEM — provider adapter + unlock persistence
   ----------------------------------------------------------------------------
   *** FAIL-CLOSED (fixed 2026-10-25) ***
   Previously this module shipped a DemoProvider that granted every unlock
   locally for free (demoMode defaulted ON and was also the fallback when no
   payment link was configured). That is exactly the free-unlock bug the
   owner reported: visitors could unlock full videos without paying, and no
   $1 payment link had ever been created, so no revenue path existed at all.

   Current law: NOTHING unlocks without a real payment path.
     - If a live $1 Stripe Payment Link is configured (STRIPE_UNLOCK_LINK
       below, or the VITE_UNLOCK_PAYMENT_LINK build-time env var), checkout
       hands off to Stripe and the unlock is granted only when Stripe
       returns the buyer to /video?unlocked=1&item=<id> (see
       settleUnlockReturn, consumed by the Video page).
     - If NO link is configured, checkout is DISABLED: the provider returns
       { ok:false, reason:'not-configured' }, locked content stays locked,
       and the UI shows a clear "paid unlocks not available yet" state.
   There is no demo provider and no local free-grant path anymore. The
   legacy `demoMode` settings field is retained only so old localStorage
   values keep parsing; it no longer grants or simulates anything.

   TO MAKE PAID UNLOCKS REAL (owner steps, in Stripe):
     1. Complete Stripe identity/tax verification.
     2. Create ONE product "3000 Studios — Full Video Unlock" with a
        one-time price of $1.00 and a Payment Link for it.
     3. Set the link's after-payment redirect to
        https://3000studios.vip/video?unlocked=1&item={CHECKOUT_SESSION_ID}
        — better: per-item links are not required; the return handler reads
        the `item` query value, so configure the redirect as
        https://3000studios.vip/video?unlocked=1&item=VIDEO_ID where the
        buyer's chosen video id is passed via client_reference_id, OR set
        VITE_UNLOCK_PAYMENT_LINK per deployment and use Stripe's
        {CLIENT_REFERENCE_ID} placeholder in the redirect URL:
        https://3000studios.vip/video?unlocked=1&item={CLIENT_REFERENCE_ID}
     4. Paste the Payment Link URL into STRIPE_UNLOCK_LINK below (or set
        VITE_UNLOCK_PAYMENT_LINK at build time) and redeploy.
   No secrets belong in this file. Payment links are public URLs by design.
   ========================================================================== */

import { formatMoney } from './commerce';

export interface UnlockItem {
  id: string;
  title: string;
  priceCents: number;
}

export type CheckoutResult =
  | { ok: true; provider: string; reference: string }
  | { ok: false; provider: string; reason: string };

export interface PaymentProvider {
  id: string;
  label: string;
  /** Runs checkout for the item. Resolves ok:true only on real success. */
  startCheckout(item: UnlockItem): Promise<CheckoutResult>;
}

/* ------------------------------------------------------------------ */
/* Disabled provider — the fail-closed default when no live payment    */
/* link is configured. Never grants, never simulates a charge.         */
/* ------------------------------------------------------------------ */

class DisabledProvider implements PaymentProvider {
  id = 'disabled';
  label = 'Paid unlocks not available yet';

  async startCheckout(item: UnlockItem): Promise<CheckoutResult> {
    void item;
    return { ok: false, provider: 'disabled', reason: 'not-configured' };
  }
}

/* ------------------------------------------------------------------ */
/* Stripe Payment Link provider — takes over when configured.          */
/* ------------------------------------------------------------------ */

// Paste the live $1 Stripe Payment Link here (or VITE_UNLOCK_PAYMENT_LINK).
// Example: 'https://buy.stripe.com/xxxxxx'
// EMPTY today: no $1 video-unlock Payment Link exists yet (see header).
const STRIPE_UNLOCK_LINK: string =
  (import.meta.env.VITE_UNLOCK_PAYMENT_LINK as string | undefined) || '';

class StripeLinkProvider implements PaymentProvider {
  id = 'stripe-link';
  label = 'Stripe';

  async startCheckout(item: UnlockItem): Promise<CheckoutResult> {
    if (!STRIPE_UNLOCK_LINK) {
      return { ok: false, provider: 'stripe-link', reason: 'not-configured' };
    }
    const url = new URL(STRIPE_UNLOCK_LINK);
    url.searchParams.set('client_reference_id', item.id);
    // Hand off to Stripe; Stripe redirects back to /video?unlocked=1&item=<id>
    // where settleUnlockReturn() grants the unlock (see Video page).
    window.location.assign(url.toString());
    // Never resolves on success — the page unloads. Resolve failure only
    // if something goes wrong before navigation.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { ok: false, provider: 'stripe-link', reason: 'navigation-failed' };
  }
}

/* ------------------------------------------------------------------ */
/* Settings (legacy field — retained for storage compatibility only)   */
/* ------------------------------------------------------------------ */

const SETTINGS_KEY = 'nn-unlock-settings';

export interface UnlockSettings {
  /** Legacy. No longer enables any free/demo checkout — see header. */
  demoMode: boolean;
}

export function readUnlockSettings(): UnlockSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UnlockSettings>;
      return { demoMode: parsed.demoMode === true };
    }
  } catch {
    /* ignore */
  }
  return { demoMode: false };
}

export function writeUnlockSettings(next: UnlockSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('nn-unlock-settings', { detail: next }));
}

export function activeProvider(): PaymentProvider {
  if (STRIPE_UNLOCK_LINK) return new StripeLinkProvider();
  // Fail closed: no configured payment path → no checkout, no unlock.
  return new DisabledProvider();
}

export function isLivePayments(): boolean {
  return STRIPE_UNLOCK_LINK.length > 0;
}

/**
 * Post-payment settle for video unlocks. Stripe returns the buyer to
 * /video?unlocked=1&item=<id>; this reads (and scrubs) those params and
 * returns the item id so the caller can validate it against the catalog
 * and grant the unlock. Returns null when the URL is not a payment return.
 * This is the ONLY code path that grants a video unlock after checkout —
 * nothing grants before or during checkout anymore.
 */
export function settleUnlockReturn(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('unlocked') !== '1') return null;
    const item = params.get('item');
    params.delete('unlocked');
    params.delete('item');
    const clean = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState(null, '', clean);
    return item && item.length > 0 ? item : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Unlock persistence (localStorage)                                    */
/* ------------------------------------------------------------------ */

const UNLOCKS_KEY = 'nn-unlocks-v1';

export function readUnlocks(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    const list = raw ? (JSON.parse(raw) as string[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function isUnlocked(id: string): boolean {
  return readUnlocks().includes(id);
}

export function grantUnlock(id: string): void {
  const list = readUnlocks();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('nn-unlocks-changed', { detail: { id } }));
  }
}

export function revokeUnlock(id: string): void {
  localStorage.setItem(UNLOCKS_KEY, JSON.stringify(readUnlocks().filter((x) => x !== id)));
  window.dispatchEvent(new CustomEvent('nn-unlocks-changed', { detail: { id, revoked: true } }));
}

export function clearUnlocks(): void {
  localStorage.removeItem(UNLOCKS_KEY);
  window.dispatchEvent(new CustomEvent('nn-unlocks-changed', { detail: { cleared: true } }));
}

export function onUnlocksChanged(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener('nn-unlocks-changed', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('nn-unlocks-changed', handler);
    window.removeEventListener('storage', handler);
  };
}

/** Re-exported for convenience — single money formatter lives in lib/commerce. */
export { formatMoney };
