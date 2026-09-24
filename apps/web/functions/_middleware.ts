const PERMISSIONS = 'camera=(self), microphone=(self), geolocation=(), payment=(), usb=()';

const CSP =
  "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://accounts.google.com; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://accounts.google.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' blob: https:; connect-src 'self' blob: https://apex-citadel-api.mr-jwswain.workers.dev https://*.googleapis.com https://accounts.google.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com https://region1.google-analytics.com https://static.cloudflareinsights.com https://www.youtube.com https://youtube.com https://*.cloudflarestream.com https://live.cloudflare.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://accounts.google.com https://*.firebaseapp.com https://*.cloudflarestream.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests";

import type { PagesEnv } from './env';
import {
  clearLiveSessionCookie,
  createLiveSession,
  hasLiveSession,
  isSameOrigin,
  liveAccessConfigured,
  liveSessionCookie,
} from './lib/live-access';
import { liveGatePage } from './lib/live-gate-page';
import { getLiveAccessState, verifyStoredLiveCode } from './lib/live-access-store';

type AttemptState = { failures: number; blockedUntil: number };
const LIVE_PATHS = ['/live', '/api/live-room', '/api/live-playback'];
const NO_STORE = 'no-store, private, max-age=0';

function getDefaultCache(): Cache {
  return (caches as unknown as { default: Cache }).default;
}

function isProtectedLivePath(pathname: string): boolean {
  return LIVE_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function gateResponse(message = '', retryAfter = 0, status = 401): Response {
  const headers = new Headers({
    'content-type': 'text/html; charset=utf-8',
    'cache-control': NO_STORE,
    'x-robots-tag': 'noindex, nofollow',
  });
  if (retryAfter > 0) headers.set('retry-after', String(retryAfter));
  return new Response(liveGatePage(message, retryAfter), { status, headers });
}

function attemptCacheKey(request: Request): Request {
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  return new Request(`https://live-access-rate-limit.invalid/${encodeURIComponent(ip)}`);
}

async function readAttemptState(request: Request): Promise<AttemptState> {
  const hit = await getDefaultCache().match(attemptCacheKey(request));
  if (!hit) return { failures: 0, blockedUntil: 0 };
  try {
    return await hit.json<AttemptState>();
  } catch {
    return { failures: 0, blockedUntil: 0 };
  }
}

async function writeAttemptState(request: Request, state: AttemptState): Promise<void> {
  await getDefaultCache().put(
    attemptCacheKey(request),
    new Response(JSON.stringify(state), {
      headers: { 'content-type': 'application/json', 'cache-control': 'max-age=900' },
    }),
  );
}

async function clearAttemptState(request: Request): Promise<void> {
  await getDefaultCache().delete(attemptCacheKey(request));
}

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  if (url.pathname === '/live/logout') {
    if (request.method !== 'POST' || !isSameOrigin(request))
      return new Response('Method not allowed', { status: 405 });
    return new Response(null, {
      status: 303,
      headers: {
        location: '/live',
        'set-cookie': clearLiveSessionCookie(),
        'cache-control': NO_STORE,
      },
    });
  }

  if (url.pathname === '/live/unlock') {
    if (request.method !== 'POST' || !isSameOrigin(request))
      return new Response('Method not allowed', { status: 405 });
    if (!liveAccessConfigured(env))
      return gateResponse('Live access is temporarily unavailable.', 0, 503);
    const state = await getLiveAccessState(env);
    if (!state.protected)
      return new Response(null, { status: 303, headers: { location: '/live' } });
    const now = Date.now();
    const attempt = await readAttemptState(request);
    if (attempt.blockedUntil > now) {
      const retryAfter = Math.max(1, Math.ceil((attempt.blockedUntil - now) / 1000));
      return gateResponse('Too many incorrect attempts.', retryAfter, 429);
    }
    const form = await request.formData();
    const valid = await verifyStoredLiveCode(String(form.get('code') || ''), env);
    if (!valid) {
      const failures = attempt.failures + 1;
      const delaySeconds = failures >= 5 ? Math.min(900, 30 * 2 ** Math.min(failures - 5, 5)) : 0;
      await writeAttemptState(request, { failures, blockedUntil: now + delaySeconds * 1000 });
      return gateResponse('Incorrect access code.', delaySeconds, delaySeconds ? 429 : 401);
    }
    await clearAttemptState(request);
    const session = await createLiveSession(env, state.sessionVersion, state.rememberViewer, now);
    return new Response(null, {
      status: 303,
      headers: {
        location: '/live',
        'set-cookie': liveSessionCookie(session, state.rememberViewer),
        'cache-control': NO_STORE,
      },
    });
  }

  if (isProtectedLivePath(url.pathname)) {
    if (!liveAccessConfigured(env))
      return gateResponse('Live access is temporarily unavailable.', 0, 503);
    const state = await getLiveAccessState(env);
    if (state.protected && !(await hasLiveSession(request, env, state.sessionVersion))) {
      if (url.pathname.startsWith('/api/')) {
        return Response.json(
          { ok: false, error: 'live_access_required' },
          { status: 401, headers: { 'cache-control': NO_STORE } },
        );
      }
      return gateResponse();
    }
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Permissions-Policy', PERMISSIONS);
  headers.set('Content-Security-Policy', CSP);
  if (isProtectedLivePath(url.pathname)) headers.set('Cache-Control', NO_STORE);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
