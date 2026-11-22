import type { PagesEnv } from '../env';

export type LiveFlagState = {
  /** true only when the flag was asserted AND the last heartbeat is fresh */
  live: boolean;
  updatedAt: string | null;
};

type LiveFlagRow = {
  live: number;
  updated_at: string;
};

/**
 * How long after the last heartbeat the flag still counts as live.
 * Broadcasters re-assert every 10-15s, so 60s gives slack for a missed
 * beat while guaranteeing a crashed browser stops reading "live" quickly.
 */
export const LIVE_FLAG_TTL_MS = 60_000;

async function ensureTable(env: PagesEnv): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS live_flag (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      live INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    )`,
  ).run();
}

export async function getLiveFlagState(env: PagesEnv): Promise<LiveFlagState> {
  await ensureTable(env);
  const row = await env.DB.prepare(
    'SELECT live, updated_at FROM live_flag WHERE id = 1',
  ).first<LiveFlagRow>();
  if (!row || row.live !== 1) {
    return { live: false, updatedAt: row?.updated_at ?? null };
  }
  const age = Date.now() - Date.parse(row.updated_at);
  if (!Number.isFinite(age) || age > LIVE_FLAG_TTL_MS) {
    return { live: false, updatedAt: row.updated_at };
  }
  return { live: true, updatedAt: row.updated_at };
}

export async function setLiveFlag(env: PagesEnv, live: boolean): Promise<LiveFlagState> {
  await ensureTable(env);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO live_flag (id, live, updated_at)
     VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET live = excluded.live, updated_at = excluded.updated_at`,
  )
    .bind(live ? 1 : 0, now)
    .run();
  return { live, updatedAt: now };
}
