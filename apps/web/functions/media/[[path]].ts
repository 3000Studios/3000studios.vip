import type { PagesEnv } from '../env';

type MediaEnv = PagesEnv & {
  MEDIA_BUCKET?: R2Bucket;
};

/**
 * R2-backed MP3 serving for /media/*.mp3.
 *
 * Migration context: the 85 MP3s (~253MB) that used to be committed under
 * apps/web/public/media/ are moving to the R2 bucket `studios-vip-media`.
 * This function keeps every existing /media/*.mp3 URL working without any
 * src/ changes: it serves the bytes from R2 and falls back to the static
 * asset bundle (env.ASSETS) whenever R2 is not bound or the key is missing,
 * so it is safe to deploy BEFORE, DURING, and AFTER the migration.
 *
 * Only *.mp3 is served from R2. Covers, images, and mp4 under /media/
 * continue to come from static assets untouched.
 *
 * Range requests are forwarded to R2 and answered with 206 + Content-Range
 * so audio seeking keeps working.
 *
 * Requires in _routes.json: "/media/*" in `include`, otherwise this function
 * never fires and /media/* is served statically (which is the safe default).
 */
export const onRequestGet: PagesFunction<MediaEnv> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  // Keys in R2 are the raw filenames (see r2-migration/migrate-mp3-to-r2.sh);
  // request paths are percent-encoded by encodeMediaPath in src/data/music.ts.
  const key = decodeURIComponent(url.pathname.replace(/^\/media\//, ''));

  const serveStatic = () =>
    env.ASSETS ? env.ASSETS.fetch(request) : context.next();

  if (!key || !key.toLowerCase().endsWith('.mp3')) return serveStatic();

  const bucket = env.MEDIA_BUCKET;
  if (!bucket) return serveStatic(); // R2 not bound yet — pre-migration.

  try {
    const obj = await bucket.get(key, { range: request.headers });
    if (!obj) return serveStatic(); // not in R2 yet — mid-migration.

    const headers = new Headers();
    obj.writeHttpMetadata(headers);
    headers.set('etag', obj.httpEtag);
    headers.set('accept-ranges', 'bytes');
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    if (!headers.has('content-type')) headers.set('content-type', 'audio/mpeg');

    if (obj.range) {
      const start = obj.range.offset;
      const end = start + obj.range.length - 1;
      headers.set('content-range', `bytes ${start}-${end}/${obj.size}`);
      return new Response(obj.body, { status: 206, headers });
    }
    return new Response(obj.body, { headers });
  } catch {
    return serveStatic();
  }
};
