const SYSTEM = `You are the 3000 Studios marketing advisor inside the password-protected /admin console.
Brand: velvet / gold, Atlanta independent studio, site https://3000studios.vip
Catalog: DistroKid official videos, 30-second samples free, $0.99 per track, vault $3.99/mo or $19.99/year.
Merch: hoodie $44, tee $24, cap $28, stickers $8. Sponsor homepage slot $99/30 days.
Live: /live Cloudflare Stream. Games: https://getnexa.space. YouTube: @3000Studio.
Give short, specific campaigns. Never print API keys, tokens, passcodes, or env values.`;

import type { PagesEnv } from '../env';

/**
 * Owner gate for the paid Gemini proxy.
 * Accepts the local passcode-session token (see lib/auth.tsx — the same
 * token the /admin UI mints after the 5555 passcode) or any bearer token
 * the remote backend verifies. Anonymous callers get 401: no free rides
 * on the owner's Gemini quota.
 */
const LOCAL_OWNER_TOKEN = 'owner-token-5555-passcode';

async function requireOwner(request: Request, env: PagesEnv): Promise<boolean> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.toLowerCase().startsWith('bearer ')) return false;
  const token = authorization.slice(7).trim();
  if (!token) return false;
  if (token === LOCAL_OWNER_TOKEN) return true;
  const apiBase = (
    env.API_BASE ||
    env.VITE_API_BASE ||
    'https://apex-citadel-api.mr-jwswain.workers.dev'
  ).replace(/\/$/, '');
  try {
    const response = await fetch(`${apiBase}/auth/verify`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/* Per-isolate throttle: 20 advisor calls / 10 min / IP. Defense in depth. */
const HITS = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const hits = (HITS.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  HITS.set(ip, hits);
  if (HITS.size > 2000) HITS.clear();
  return hits.length > 20;
}

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
  if (!(await requireOwner(request, env))) {
    return new Response(JSON.stringify({ ok: false, error: 'owner_only' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown';
  if (throttled(ip)) {
    return new Response(JSON.stringify({ ok: false, error: 'rate_limited' }), {
      status: 429,
      headers: { 'content-type': 'application/json' },
    });
  }
  const key = String(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '');
  const model = String(env.VITE_GEMINI_MODEL || 'gemini-2.0-flash');
  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: 'advisor key missing on Pages' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  let body: { message?: string; history?: { role: string; text: string }[] } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad json' }), { status: 400 });
  }
  const message = (body.message || '').slice(0, 2000);
  if (!message) return new Response(JSON.stringify({ ok: false, error: 'empty' }), { status: 400 });
  const contents = [
    ...(body.history || [])
      .slice(-8)
      .map((h) => ({ role: h.role === 'advisor' ? 'model' : 'user', parts: [{ text: h.text }] })),
    { role: 'user', parts: [{ text: message }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    },
  );
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || '')
      .join('\n')
      .trim() || 'No reply.';
  return new Response(JSON.stringify({ ok: true, text }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
