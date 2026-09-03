const CACHE_URL = 'https://3000studios.vip/__internal/live-flag';
const MAX_AGE_MS = 45_000;

type Flag = { live: boolean; ts: number };

async function readFlag(): Promise<Flag> {
  try {
    const hit = await caches.default.match(CACHE_URL);
    if (!hit) return { live: false, ts: 0 };
    const data = (await hit.json()) as Flag;
    if (!data?.live) return { live: false, ts: data?.ts || 0 };
    if (Date.now() - Number(data.ts || 0) > MAX_AGE_MS) return { live: false, ts: data.ts };
    return { live: true, ts: data.ts };
  } catch {
    return { live: false, ts: 0 };
  }
}

async function writeFlag(live: boolean) {
  const body = JSON.stringify({ live, ts: Date.now() });
  const res = new Response(body, {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=45',
    },
  });
  await caches.default.put(CACHE_URL, res);
}

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'access-control-allow-origin': '*',
};

export async function onRequestGet() {
  const flag = await readFlag();
  return new Response(JSON.stringify({ ok: true, ...flag }), { headers: JSON_HEADERS });
}

export async function onRequestPost({ request }: { request: Request }) {
  let body: { live?: boolean; passcode?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  if (body.passcode && body.passcode !== '3000') {
    return new Response(JSON.stringify({ ok: false }), { status: 401, headers: JSON_HEADERS });
  }
  await writeFlag(Boolean(body.live));
  return new Response(JSON.stringify({ ok: true, live: Boolean(body.live), ts: Date.now() }), {
    headers: JSON_HEADERS,
  });
}
