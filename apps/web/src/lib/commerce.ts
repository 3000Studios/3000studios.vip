export const SAMPLE_SECONDS = 30;
export const TRACK_PRICE_CENTS = 99;
export const MONTHLY_PRICE_CENTS = 399;
export const YEARLY_PRICE_CENTS = 1999;

export const OWNER_EMAIL = 'mr.jwswain@gmail.com';

export const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@3000Studio' },
  { id: 'ytmusic', label: 'YouTube Music', url: 'https://music.youtube.com/channel/UCTQnEFZUIutrFuDlxGj9cDA' },
  { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com/artist/6VVHgvCMlHO6Ah7dkAIlik' },
  { id: 'apple', label: 'Apple Music', url: 'https://music.apple.com/us/artist/3000-studios/6802721597' },
  { id: 'live', label: 'Live', url: 'https://3000studios.vip/live' },
  { id: 'site', label: '3000 Studios', url: 'https://3000studios.vip' },
  { id: 'games', label: 'Games · Nexa', url: 'https://getnexa.space' },
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
  const ent = readEntitlement();
  if (ent.plan === 'admin') return true;
  if ((ent.plan === 'monthly' || ent.plan === 'yearly') && ent.expiresAt > Date.now()) return true;
  if (slug && ent.tracks.includes(slug)) return true;
  return false;
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
