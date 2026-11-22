import { describe, expect, it } from 'vitest';
import type { PagesEnv } from '../env';
import { getLiveFlagState, setLiveFlag, LIVE_FLAG_TTL_MS } from './live-flag-store';

type StoredRow = { live: number; updated_at: string };

function fakeEnv(): PagesEnv {
  let row: StoredRow | null = null;
  const db = {
    prepare(query: string) {
      let values: unknown[] = [];
      return {
        bind(...next: unknown[]) {
          values = next;
          return this;
        },
        async first<T>() {
          return row as T | null;
        },
        async run() {
          if (query.includes('INSERT INTO live_flag')) {
            row = { live: Number(values[0]), updated_at: String(values[1]) };
          }
          return { success: true };
        },
      };
    },
  } as unknown as D1Database;
  return { DB: db };
}

describe('live-flag-store', () => {
  it('returns not-live when nothing was ever asserted', async () => {
    const state = await getLiveFlagState(fakeEnv());
    expect(state.live).toBe(false);
  });

  it('returns live right after an assert', async () => {
    const env = fakeEnv();
    await setLiveFlag(env, true);
    const state = await getLiveFlagState(env);
    expect(state.live).toBe(true);
    expect(state.updatedAt).toBeTruthy();
  });

  it('returns not-live after the heartbeat TTL expires', async () => {
    const env = fakeEnv();
    await setLiveFlag(env, true);
    // Backdate the heartbeat beyond the TTL.
    const stale = new Date(Date.now() - LIVE_FLAG_TTL_MS - 1000).toISOString();
    const db = env.DB as unknown as {
      prepare: (q: string) => { bind: (...v: unknown[]) => { run: () => Promise<unknown> } };
    };
    await db
      .prepare('INSERT INTO live_flag (id, live, updated_at) VALUES (1, ?, ?)')
      .bind(1, stale)
      .run();
    const state = await getLiveFlagState(env);
    expect(state.live).toBe(false);
  });

  it('clearing the flag reads not-live immediately', async () => {
    const env = fakeEnv();
    await setLiveFlag(env, true);
    await setLiveFlag(env, false);
    const state = await getLiveFlagState(env);
    expect(state.live).toBe(false);
  });
});
