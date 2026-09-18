import type { PagesEnv } from '../env';

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request }) => {
  const origin = request.headers.get('origin');
  if (origin !== 'https://3000studios.vip') {
    return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  }
  let upstream: Response;
  try {
    upstream = await fetch(
      'https://apex-citadel-api.mr-jwswain.workers.dev/tiktok/oauth/exchange',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', origin },
        body: request.body,
      },
    );
  } catch {
    return Response.json({ error: 'tiktok_service_unavailable' }, { status: 502 });
  }
  const text = await upstream.text();
  let payload: { ok?: boolean; session?: string; error?: string } = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }
  if (!upstream.ok || !payload.session) {
    return Response.json(
      { error: payload.error || 'tiktok_service_unavailable' },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }
  return Response.json(
    { ok: true },
    {
      headers: {
        'cache-control': 'no-store',
        'set-cookie': `__Host-tiktok-session=${payload.session}; Path=/; Max-Age=3600; HttpOnly; Secure; SameSite=Lax`,
      },
    },
  );
};
