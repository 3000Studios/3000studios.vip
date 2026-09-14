export const onRequestPost: PagesFunction = async ({ request }) => {
  const origin = request.headers.get('origin');
  if (origin !== 'https://3000studios.vip') {
    return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  }
  const upstream = await fetch(
    'https://apex-citadel-api.mr-jwswain.workers.dev/tiktok/oauth/exchange',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin },
      body: request.body,
    },
  );
  const payload = (await upstream.json()) as { ok?: boolean; session?: string; error?: string };
  if (!upstream.ok || !payload.session) {
    return Response.json(
      { error: payload.error || 'tiktok_exchange_failed' },
      { status: upstream.status },
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
