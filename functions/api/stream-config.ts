type Env = {
  STREAM_WHIP_URL?: string;
  STREAM_RTMPS_SERVER?: string;
  VITE_API_BASE?: string;
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

async function verifyOwnerToken(token: string, apiBase: string): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase}/auth/verify`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const apiBase = env.VITE_API_BASE?.trim() || 'https://apex-citadel-api.mr-jwswain.workers.dev';

  let token: string | undefined;
  try {
    const body = (await request.json()) as { token?: string };
    token = body.token;
  } catch {
    token = undefined;
  }

  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_token' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const valid = await verifyOwnerToken(token, apiBase);
  if (!valid) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_token' }), {
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
