import type { PagesEnv } from '../env';

/**
 * /media/* guard (music model flip — Boss order 2026-10-27).
 *
 * Until today this function served the catalog's full-track MP3 masters
 * from the R2 bucket `studios-vip-media` at predictable public URLs —
 * anyone could download every song free while the site also tried to
 * sell them. The model flipped: songs are free on the streaming
 * platforms, on-site listening is the 1-minute preview, and FULL-TRACK
 * FILES ARE NO LONGER PUBLICLY SERVED from this domain.
 *
 * What this function does now:
 *  - Any *.mp3 outside /media/previews/ → 404 JSON. The masters stay in
 *    R2 (nothing is deleted); they are simply unreachable from the site.
 *    This also retires the old range-request defect (v2 full-check
 *    P1-1/P1-2): nothing is function-proxied anymore, so there is no
 *    broken range handling and no per-play origin fetch — previews are
 *    static assets, edge-cached, with Cloudflare's correct range support.
 *  - Everything else (covers, images, the preview MP4s under
 *    /media/previews/) is served from the static asset bundle — but a
 *    MISSING media file now answers a real 404 instead of falling
 *    through to the SPA shell with 200 text/html (full-check P2-6/P2-7).
 *
 * Requires _routes.json to keep "/media/*" in `include`.
 */
export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));
  const lower = key.toLowerCase();

  if (lower.endsWith('.mp3') && !lower.startsWith('previews/')) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'full_track_not_public',
        detail:
          'Full songs live on the streaming platforms; this site serves 1-minute previews under /media/previews/.',
      }),
      {
        status: 404,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'public, max-age=300',
        },
      },
    );
  }

  const res = env.ASSETS ? await env.ASSETS.fetch(request) : await context.next();

  // A missing media file falls through to the SPA shell (200 text/html).
  // For real media extensions that is a lie — answer a real 404.
  const type = res.headers.get('content-type') || '';
  if (
    res.ok &&
    type.includes('text/html') &&
    /\.(mp3|wav|mp4|webm|mov|jpg|jpeg|png|webp|gif|svg|avif)$/.test(lower)
  ) {
    return new Response('Not found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=300',
      },
    });
  }
  return res;
};
