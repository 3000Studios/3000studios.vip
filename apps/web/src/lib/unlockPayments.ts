/* ============================================================================
   $1 UNLOCK PAYMENT SYSTEM — provider adapter + unlock persistence
   ----------------------------------------------------------------------------
   *** DEMO MODE IS CURRENTLY ACTIVE — READ THIS BEFORE GOING LIVE ***
   Real $1 charges are BLOCKED until Boss Man J completes identity/tax
   verification on Stripe (or Shopify Payments). Until then every checkout
   runs through the DemoProvider below: no card is charged, no money moves,
   unlocks are granted locally for demonstration only.
   HOW TO FLIP TO LIVE PAYMENTS (config change, not a rewrite):
     1. Complete Stripe identity/tax verification (or Shopify Payments).
     2. Create a $1 Stripe Payment Link (or a $1 Shopify digital product)
        for video unlocks and paste the URL into STRIPE_UNLOCK_LINK below
        (or set VITE_UNLOCK_PAYMENT_LINK at build time).
     3. Set unlockSettings.demoMode = false (Admin → Command Deck toggle,
        or localStorage 'nn-unlock-settings').
     4. The StripeLinkProvider takes over automatically: buyers complete
        checkout on Stripe, return with ?unlocked=1&item=<id>, and the
        unlock is granted + persisted.
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
/* Demo provider — clearly labeled, charges nothing.                   */
/* ------------------------------------------------------------------ */

class DemoProvider implements PaymentProvider {
  id = 'demo';
  label = 'Demo checkout (no charge)';

  async startCheckout(item: UnlockItem): Promise<CheckoutResult> {
    void item;
    // Simulate network round-trip so the UI can show a processing state.
    await new Promise((resolve) => setTimeout(resolve, 900));
    return {
      ok: true,
      provider: 'demo',
      reference: `DEMO-${Date.now().toString(36).toUpperCase()}`,
    };
  }
}

/* ------------------------------------------------------------------ */
/* Stripe Payment Link provider — takes over when configured.          */
/* ------------------------------------------------------------------ */

// Paste the live $1 Stripe Payment Link here (or VITE_UNLOCK_PAYMENT_LINK).
// Example: 'https://buy.stripe.com/xxxxxx'
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
    window.location.assign(url.toString());
    // Never resolves on success — the page unloads. Resolve failure only
    // if something goes wrong before navigation.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return { ok: false, provider: 'stripe-link', reason: 'navigation-failed' };
  }
}

/* ------------------------------------------------------------------ */
/* Settings (demo mode toggle lives here; Admin Command Deck flips it) */
/* ------------------------------------------------------------------ */

const SETTINGS_KEY = 'nn-unlock-settings';

export interface UnlockSettings {
  demoMode: boolean;
}

export function readUnlockSettings(): UnlockSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<UnlockSettings>;
      return { demoMode: parsed.demoMode !== false };
    }
  } catch {
    /* ignore */
  }
  return { demoMode: true };
}

export function writeUnlockSettings(next: UnlockSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('nn-unlock-settings', { detail: next }));
}

export function activeProvider(): PaymentProvider {
  const { demoMode } = readUnlockSettings();
  if (demoMode) return new DemoProvider();
  if (STRIPE_UNLOCK_LINK) return new StripeLinkProvider();
  // Live requested but nothing configured → stay honest, stay in demo.
  return new DemoProvider();
}

export function isLivePayments(): boolean {
  return !readUnlockSettings().demoMode && STRIPE_UNLOCK_LINK.length > 0;
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
