import { SignJWT, jwtVerify } from 'jose';
import type { Env } from './env';

export type OwnerSession = {
  email: string;
  role: 'owner';
  iat: number;
  exp: number;
};

const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Verify owner credentials server-side. The SHA-256 hashes are stored as Worker
 * secrets, never shipped to the browser bundle.
 */
export async function verifyOwnerCredentials(
  email: string,
  passcode: string,
  secretAnswer: string,
  env: Env,
): Promise<{ ok: true; normalizedEmail: string } | { ok: false; error: string }> {
  const ownerEmail = env.OWNER_EMAIL?.trim().toLowerCase();
  const passcodeHash = env.VAULT_PASSCODE_SHA256?.trim();
  const secretHash = env.VAULT_SECRET_ANSWER_SHA256?.trim();
  if (!ownerEmail || !passcodeHash || !secretHash) {
    return { ok: false, error: 'owner_auth_not_configured' };
  }
  const normalizedEmail = normalizeEmail(email);
  if (normalizedEmail !== ownerEmail) {
    return { ok: false, error: 'invalid_credentials' };
  }
  const [providedPasscodeHash, providedSecretHash] = await Promise.all([
    sha256(passcode),
    sha256(secretAnswer.trim().toLowerCase()),
  ]);
  if (
    providedPasscodeHash.toLowerCase() !== passcodeHash.toLowerCase() ||
    providedSecretHash.toLowerCase() !== secretHash.toLowerCase()
  ) {
    return { ok: false, error: 'invalid_credentials' };
  }
  return { ok: true, normalizedEmail };
}

export async function issueOwnerSessionToken(email: string, env: Env): Promise<string | null> {
  const secret = env.AUTH_JWT_SECRET?.trim();
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ email: normalizeEmail(email), role: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + TOKEN_MAX_AGE_SECONDS)
    .sign(new TextEncoder().encode(secret));
}

export async function verifyOwnerSessionToken(
  token: string,
  env: Env,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const secret = env.AUTH_JWT_SECRET?.trim();
  if (!secret) return { ok: false, error: 'owner_auth_not_configured' };
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      algorithms: ['HS256'],
    });
    const email = typeof payload.email === 'string' ? normalizeEmail(payload.email) : '';
    if (!email || payload.role !== 'owner') return { ok: false, error: 'invalid_token' };
    return { ok: true, email };
  } catch {
    return { ok: false, error: 'invalid_token' };
  }
}

export function getBearerToken(headers: Headers): string | null {
  const auth = headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7).trim();
}
