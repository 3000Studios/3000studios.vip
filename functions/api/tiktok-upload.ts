export const onRequestPost: PagesFunction = async ({ request }) => {
  const origin = request.headers.get('origin');
  if (origin !== 'https://3000studios.vip') {
    return Response.json({ error: 'origin_not_allowed' }, { status: 403 });
  }

  const session =
    request.headers
      .get('cookie')
      ?.match(/(?:^|;\s*)__Host-tiktok-session=([0-9a-f-]{36})(?:;|$)/i)?.[1] || '';
  if (!session) return Response.json({ error: 'tiktok_session_required' }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(
      'https://apex-citadel-api.mr-jwswain.workers.dev/tiktok/upload-draft',
      {
        method: 'POST',
        headers: {
          'content-type': request.headers.get('content-type') || 'video/mp4',
          'x-tiktok-session': session,
          origin,
        },
        body: request.body,
      },
    );
  } catch {
    return Response.json({ error: 'tiktok_service_unavailable' }, { status: 502 });
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set('cache-control', 'no-store');
  if (upstream.ok) {
    responseHeaders.append(
      'set-cookie',
      '__Host-tiktok-session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    );
  }
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};
