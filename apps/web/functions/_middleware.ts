const PERMISSIONS = 'camera=(self), microphone=(self), geolocation=(), payment=(), usb=()';

const CSP =
  "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self' https://accounts.google.com; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://accounts.google.com https://pagead2.googlesyndication.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; media-src 'self' blob: https:; connect-src 'self' blob: https://apex-citadel-api.mr-jwswain.workers.dev https://*.googleapis.com https://accounts.google.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google-analytics.com https://region1.google-analytics.com https://static.cloudflareinsights.com https://www.youtube.com https://youtube.com https://*.cloudflarestream.com https://live.cloudflare.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://youtube.com https://accounts.google.com https://*.firebaseapp.com https://*.cloudflarestream.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com; worker-src 'self' blob:; manifest-src 'self'; upgrade-insecure-requests";

import type { PagesEnv } from './env';

export const onRequest: PagesFunction<PagesEnv> = async (context) => {
  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set('Permissions-Policy', PERMISSIONS);
  headers.set('Content-Security-Policy', CSP);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
