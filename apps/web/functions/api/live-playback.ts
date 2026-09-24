import type { PagesEnv } from '../env';
import { hasLiveSession } from '../lib/live-access';
import { getLiveAccessState } from '../lib/live-access-store';

type StreamJwk = JsonWebKey & {
  d: string;
  p: string;
  q: string;
  dp: string;
  dq: string;
  qi: string;
};

type LivePlaybackEnv = PagesEnv & {
  STREAM_SIGNING_KEY_ID?: string;
  STREAM_SIGNING_JWK?: string;
  STREAM_LIVE_INPUT_ID?: string;
  STREAM_CUSTOMER_CODE?: string;
};

const encoder = new TextEncoder();
const base64Url = (value: string | ArrayBuffer) => {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

async function createPlaybackToken(env: LivePlaybackEnv): Promise<string> {
  const keyId = env.STREAM_SIGNING_KEY_ID?.trim();
  const inputId = env.STREAM_LIVE_INPUT_ID?.trim();
  const jwkText = env.STREAM_SIGNING_JWK?.trim();
  if (!keyId || !inputId || !jwkText) throw new Error('Stream signing configuration is incomplete');
  // Cloudflare returns Stream signing JWKs as base64-encoded JSON.
  const jwk = JSON.parse(atob(jwkText)) as StreamJwk;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: 'RS256', kid: keyId }));
  const payload = base64Url(
    JSON.stringify({ sub: inputId, kid: keyId, nbf: now - 15, exp: now + 90 }),
  );
  const unsigned = `${header}.${payload}`;
  const key = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, encoder.encode(unsigned));
  return `${unsigned}.${base64Url(signature)}`;
}

export async function onRequestGet({ request, env }: { request: Request; env: LivePlaybackEnv }) {
  const state = await getLiveAccessState(env);
  if (state.protected && !(await hasLiveSession(request, env, state.sessionVersion))) {
    return Response.json(
      { ok: false, error: 'live_access_required' },
      { status: 401, headers: { 'cache-control': 'no-store' } },
    );
  }
  try {
    const token = await createPlaybackToken(env);
    const customer = env.STREAM_CUSTOMER_CODE?.trim();
    if (!customer) throw new Error('Stream customer code is not configured');
    return Response.json(
      { ok: true, playerUrl: `https://customer-${customer}.cloudflarestream.com/${token}/iframe` },
      {
        headers: { 'cache-control': 'no-store, private', 'referrer-policy': 'same-origin' },
      },
    );
  } catch {
    return Response.json(
      { ok: false, error: 'playback_unavailable' },
      { status: 503, headers: { 'cache-control': 'no-store' } },
    );
  }
}
