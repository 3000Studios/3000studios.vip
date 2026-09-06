type ChatMessage = {
  id: string;
  name: string;
  text: string;
  createdAt: number;
};

type RoomState = {
  messages: ChatMessage[];
  viewers: Record<string, number>;
};

const CACHE_KEY = 'https://3000studios.vip/__live-room-v1';
const MAX_MESSAGES = 80;
const VIEWER_TTL_MS = 25_000;

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
  'access-control-allow-origin': '*',
};

function emptyRoom(): RoomState {
  return { messages: [], viewers: {} };
}

async function readRoom(cache: Cache): Promise<RoomState> {
  const hit = await cache.match(CACHE_KEY);
  if (!hit) return emptyRoom();
  try {
    return (await hit.json()) as RoomState;
  } catch {
    return emptyRoom();
  }
}

async function writeRoom(cache: Cache, room: RoomState) {
  await cache.put(
    CACHE_KEY,
    new Response(JSON.stringify(room), {
      headers: { 'content-type': 'application/json', 'cache-control': 'max-age=60' },
    }),
  );
}

function pruneViewers(room: RoomState, now: number) {
  for (const [id, ts] of Object.entries(room.viewers)) {
    if (now - ts > VIEWER_TTL_MS) delete room.viewers[id];
  }
}

function sanitize(value: string, max: number) {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, max);
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      ...JSON_HEADERS,
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'content-type',
    },
  });
}

export async function onRequestGet() {
  const cache = caches.default;
  const room = await readRoom(cache);
  pruneViewers(room, Date.now());
  return new Response(
    JSON.stringify({
      ok: true,
      messages: room.messages,
      viewers: Object.keys(room.viewers).length,
    }),
    { headers: JSON_HEADERS },
  );
}

export async function onRequestPost({ request }: { request: Request }) {
  const cache = caches.default;
  let body: { type?: string; id?: string; name?: string; text?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const now = Date.now();
  const room = await readRoom(cache);
  pruneViewers(room, now);

  if (body.type === 'presence') {
    const id = sanitize(body.id || crypto.randomUUID(), 64) || crypto.randomUUID();
    room.viewers[id] = now;
    await writeRoom(cache, room);
    return new Response(
      JSON.stringify({ ok: true, id, viewers: Object.keys(room.viewers).length, messages: room.messages }),
      { headers: JSON_HEADERS },
    );
  }

  if (body.type === 'chat') {
    const name = sanitize(body.name || 'Guest', 32) || 'Guest';
    const text = sanitize(body.text || '', 280);
    if (!text) {
      return new Response(JSON.stringify({ ok: false, error: 'Message required' }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      name,
      text,
      createdAt: now,
    };
    room.messages = [...room.messages, message].slice(-MAX_MESSAGES);
    await writeRoom(cache, room);
    return new Response(
      JSON.stringify({ ok: true, message, messages: room.messages, viewers: Object.keys(room.viewers).length }),
      { headers: JSON_HEADERS },
    );
  }

  return new Response(JSON.stringify({ ok: false, error: 'Unknown action' }), {
    status: 400,
    headers: JSON_HEADERS,
  });
}
