import type { PagesEnv } from '../env';

const COOKIE_NAME = '__Host-live_access';
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

type LiveAccessEnv = PagesEnv & {
  LIVE_ACCESS_CODE?: string;
  LIVE_ACCESS_SESSION_SECRET?: string;
};

function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
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

export function liveAccessConfigured(env: LiveAccessEnv): boolean {
  return Boolean(env.LIVE_ACCESS_CODE?.trim() && env.LIVE_ACCESS_SESSION_SECRET?.trim());
}

export async function verifyLiveCode(candidate: string, env: LiveAccessEnv): Promise<boolean> {
  const expected = env.LIVE_ACCESS_CODE?.trim() || '';
  return Boolean(expected) && timingSafeEqual(candidate.trim(), expected);
}

export async function createLiveSession(env: LiveAccessEnv, now = Date.now()): Promise<string> {
  const secret = env.LIVE_ACCESS_SESSION_SECRET?.trim() || '';
  if (!secret) throw new Error('Live access session secret is not configured');
  const payload = toBase64Url(
    encoder.encode(JSON.stringify({ exp: Math.floor(now / 1000) + SESSION_SECONDS })),
  );
  return `${payload}.${await hmac(payload, secret)}`;
}

export async function hasLiveSession(
  request: Request,
  env: LiveAccessEnv,
  now = Date.now(),
): Promise<boolean> {
  const secret = env.LIVE_ACCESS_SESSION_SECRET?.trim() || '';
  const cookie = readCookie(request, COOKIE_NAME);
  if (!secret || !cookie) return false;
  const [payload, signature, extra] = cookie.split('.');
  if (!payload || !signature || extra) return false;
  if (!timingSafeEqual(signature, await hmac(payload, secret))) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as { exp?: number };
    return typeof data.exp === 'number' && data.exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}

export function liveSessionCookie(value: string): string {
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearLiveSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}
