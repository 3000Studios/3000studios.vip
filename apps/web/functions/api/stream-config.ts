type Env = {
  STREAM_WHIP_URL?: string;
  STREAM_RTMPS_SERVER?: string;
  STREAM_ADMIN_PASSCODE?: string;
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  let body: { passcode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const expected = env.STREAM_ADMIN_PASSCODE || '3000';
  if (body.passcode !== expected) {
    return new Response(JSON.stringify({ ok: false }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const whipUrl = env.STREAM_WHIP_URL?.trim() || '';
  return new Response(
    JSON.stringify({
      ok: Boolean(whipUrl),
      whipUrl,
      rtmpsServer: env.STREAM_RTMPS_SERVER?.trim() || '',
    }),
    { headers: JSON_HEADERS },
  );
}
