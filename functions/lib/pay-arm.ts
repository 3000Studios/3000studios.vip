/**
 * Signed "checkout arm" cookie for purchase returns (business audit P0-1).
 *
 * Flow: /api/pay sets this cookie (HttpOnly, HMAC-signed) at the moment it
 * 302s the buyer to Stripe. When Stripe returns the buyer to the site with
 * ?paid=1, the client asks /api/pay/session to validate the cookie
 * server-side, and only a valid arm matching the pending purchase lets the
 * entitlement settle. A bare, shared, or bookmarked ?paid=1 URL — the old
 * unverified grant path — now settles nothing.
 *
 * HONEST LIMIT: the arm proves this browser transited the pay redirector
 * shortly before returning; it is NOT cryptographic proof of payment. Full
 * server-side payment verification requires Stripe session/webhook checks
 * (STRIPE_SECRET_KEY + webhook endpoint), which lands after the owner's
 * Stripe reconnect. Until then this is the strongest check the existing
 * Payment Link architecture supports — and unlike the old code, nothing is
 * ever granted before the buyer has gone to Stripe and come back.
 */
import type { PagesEnv } from '../env';

export const PAY_ARM_COOKIE = 'pay_arm';
const ARM_TTL_MS = 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of view) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

function timingSafeEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index % Math.max(a.length, 1)] ?? 0) ^ (b[index % Math.max(b.length, 1)] ?? 0);
  }
  return difference === 0;
}

function readCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('cookie') || '';
  for (const item of cookies.split(';')) {
    const [key, ...parts] = item.trim().split('=');
    if (key === name) return parts.join('=');
  }
  return null;
}

export type PayArm = { sku: string; slug: string; ts: number };

export function payArmConfigured(env: PagesEnv): boolean {
  return Boolean(env.LIVE_ACCESS_SESSION_SECRET);
}

export async function createPayArmCookie(arm: PayArm, env: PagesEnv): Promise<string | null> {
  const secret = env.LIVE_ACCESS_SESSION_SECRET;
  if (!secret) return null;
  const payload = toBase64Url(encoder.encode(JSON.stringify({ v: 1, ...arm })));
  const signature = await hmac(`pay-arm:${payload}`, secret);
  return (
    `${PAY_ARM_COOKIE}=${payload}.${signature}; Path=/; Max-Age=${Math.floor(ARM_TTL_MS / 1000)}; ` +
    'HttpOnly; Secure; SameSite=Lax'
  );
}

export async function readPayArm(request: Request, env: PagesEnv): Promise<PayArm | null> {
  const secret = env.LIVE_ACCESS_SESSION_SECRET;
  if (!secret) return null;
  const raw = readCookie(request, PAY_ARM_COOKIE);
  if (!raw) return null;
  const [payload, signature, extra] = raw.split('.');
  if (!payload || !signature || extra) return null;
  if (!timingSafeEqual(signature, await hmac(`pay-arm:${payload}`, secret))) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as PayArm & {
      v?: number;
    };
    if (parsed.v !== 1 || typeof parsed.ts !== 'number') return null;
    if (Date.now() - parsed.ts > ARM_TTL_MS) return null;
    return { sku: String(parsed.sku || ''), slug: String(parsed.slug || ''), ts: parsed.ts };
  } catch {
    return null;
  }
}
