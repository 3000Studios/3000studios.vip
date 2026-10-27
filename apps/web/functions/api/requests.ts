/**
 * /api/requests — the site inbox (business audit P0-6 / P1-7).
 *
 * POST accepts song requests (from /requests) and VIP-list signups
 * (kind: 'subscribe', from the footer) and stores them in D1 — before this
 * endpoint existed, song requests were written to the VISITOR's own
 * localStorage and the studio never saw a single one.
 *
 * GET lists the latest rows for the owner only: send the live access code
 * in the `x-access-code` header (same code that gates /live).
 */
import type { PagesEnv } from '../env';

type InboxBody = {
  kind?: string;
  name?: string;
  email?: string;
  mood?: string;
  body?: string;
};

const clip = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/* Per-isolate throttle: 20 posts / 10 min / IP (same shape as /api/advisor). */
const HITS = new Map<string, number[]>();
function throttled(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const hits = (HITS.get(ip) || []).filter((t) => t > windowStart);
  hits.push(now);
  HITS.set(ip, hits);
  if (HITS.size > 2000) HITS.clear();
  return hits.length > 20;
}

async function ensureTable(env: PagesEnv) {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS site_inbox (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       kind TEXT NOT NULL,
       name TEXT,
       email TEXT,
       mood TEXT,
       body TEXT NOT NULL,
       created_at TEXT NOT NULL
     )`,
  ).run();
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
  if (!env.DB) return json({ ok: false, error: 'inbox_not_configured' }, 503);
  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (throttled(ip)) return json({ ok: false, error: 'rate_limited' }, 429);

  let parsed: InboxBody;
  try {
    parsed = (await request.json()) as InboxBody;
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400);
  }

  const kind = parsed.kind === 'subscribe' ? 'subscribe' : 'request';
  const name = clip(parsed.name, 80);
  const email = clip(parsed.email, 160);
  const mood = clip(parsed.mood, 40);
  const body = clip(parsed.body, 1000);

  if (kind === 'subscribe') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'valid_email_required' }, 400);
    }
  } else if (!body) {
    return json({ ok: false, error: 'request_body_required' }, 400);
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'invalid_email' }, 400);
  }

  try {
    await ensureTable(env);
    const result = await env.DB.prepare(
      'INSERT INTO site_inbox (kind, name, email, mood, body, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
      .bind(kind, name || null, email || null, mood || null, body || email, new Date().toISOString())
      .run();
    return json({ ok: true, id: result.meta?.last_row_id ?? null });
  } catch {
    return json({ ok: false, error: 'store_failed' }, 500);
  }
};

export const onRequestGet: PagesFunction<PagesEnv> = async ({ request, env }) => {
  if (!env.DB) return json({ ok: false, error: 'inbox_not_configured' }, 503);
  const code = request.headers.get('x-access-code') || '';
  if (!env.LIVE_ACCESS_CODE || code !== env.LIVE_ACCESS_CODE) {
    return json({ ok: false, error: 'owner_only' }, 401);
  }
  try {
    await ensureTable(env);
    const { results } = await env.DB.prepare(
      'SELECT id, kind, name, email, mood, body, created_at FROM site_inbox ORDER BY id DESC LIMIT 100',
    ).all();
    return json({ ok: true, rows: results });
  } catch {
    return json({ ok: false, error: 'read_failed' }, 500);
  }
};
