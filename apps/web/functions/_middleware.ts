const PERMISSIONS = 'camera=(self), microphone=(self), geolocation=(), payment=(), usb=()';

const CSP =
  "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://accounts.google.com; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://accounts.google.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' blob: https:; connect-src 'self' blob: https://apex-citadel-api.mr-jwswain.workers.dev https://*.googleapis.com https://accounts.google.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com https://region1.google-analytics.com https://static.cloudflareinsights.com https://www.youtube.com https://youtube.com https://*.cloudflarestream.com https://live.cloudflare.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://accounts.google.com https://*.firebaseapp.com https://*.cloudflarestream.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests";

import type { PagesEnv } from './env';
import { isFilePath, redirectFor, transformHtmlResponse } from './lib/route-meta';
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
const NO_STORE = 'no-store, private, max-age=0';

function getDefaultCache(): Cache | null {
  try {
    return (caches as unknown as { default: Cache }).default;
  } catch {
    return null;
  }
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
  const cache = getDefaultCache();
  if (!cache) return { failures: 0, blockedUntil: 0 };
  try {
    const hit = await cache.match(attemptCacheKey(request));
    if (!hit) return { failures: 0, blockedUntil: 0 };
    return await hit.json<AttemptState>();
  } catch {
    return { failures: 0, blockedUntil: 0 };
  }
}

async function writeAttemptState(request: Request, state: AttemptState): Promise<void> {
  const cache = getDefaultCache();
  if (!cache) return;
  try {
    await cache.put(
      attemptCacheKey(request),
      new Response(JSON.stringify(state), {
        headers: { 'content-type': 'application/json', 'cache-control': 'max-age=900' },
      }),
    );
  } catch {
    /* ignore */
  }
}

async function clearAttemptState(request: Request): Promise<void> {
  const cache = getDefaultCache();
  if (!cache) return;
  try {
    await cache.delete(attemptCacheKey(request));
  } catch {
    /* ignore */
  }
}

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Crew A serving layer: www -> apex 301 (same path + query) and the
  // Crew B redirects contract. GET/HEAD only — never rewrite a POST.
  if (request.method === 'GET' || request.method === 'HEAD') {
    const redirect = redirectFor(url);
    if (redirect) {
      return new Response(null, {
        status: redirect.status,
        headers: {
          location: redirect.location,
          'cache-control': 'public, max-age=3600',
        },
      });
    }
  }

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
    try {
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
    } catch {
      return new Response(null, { status: 303, headers: { location: '/live' } });
    }
  }

  if (url.pathname.startsWith('/api/live-room') || url.pathname.startsWith('/api/live-playback')) {
    try {
      if (liveAccessConfigured(env)) {
        const state = await getLiveAccessState(env);
        if (state.protected && !(await hasLiveSession(request, env, state.sessionVersion))) {
          return Response.json(
            { ok: false, error: 'live_access_required' },
            { status: 401, headers: { 'cache-control': NO_STORE } },
          );
        }
      }
    } catch {
      /* pass through */
    }
  }

  try {
    const response = await context.next();
    if (response.status === 304 || response.status === 204 || response.status === 101) {
      return response;
    }
    const headers = new Headers(response.headers);
    headers.set('Permissions-Policy', PERMISSIONS);
    headers.set('Content-Security-Policy', CSP);

    // Crew A serving layer: per-route head injection + real 404s.
    // The SPA fallback serves the same shell for every path; rewrite its
    // <head> from the generated route->meta map so crawlers and link
    // previews see the real page. Direct static files (own <head>) and
    // non-HTML responses pass through untouched.
    const contentType = headers.get('content-type') || '';
    if (
      contentType.includes('text/html') &&
      (request.method === 'GET' || request.method === 'HEAD') &&
      !isFilePath(url.pathname)
    ) {
      const html = await response.text();
      if (html) {
        const out = transformHtmlResponse({ url, status: response.status, html });
        if (out.noindex) headers.set('x-robots-tag', 'noindex, nofollow');
        headers.delete('content-length');
        headers.delete('etag');
        return new Response(out.html, {
          status: out.status,
          statusText: response.statusText,
          headers,
        });
      }
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    // Never call context.next() twice: re-invoking the downstream chain can
    // double side-effects (D1 writes, rate-limit counters) and masks the real
    // error. Fail closed with a plain 500 instead.
    return new Response('Internal Server Error', { status: 500 });
  }
};
