import { describe, expect, it } from 'vitest';
import type { PagesEnv } from '../env';
import {
  getLiveAccessState,
  updateLiveAccessState,
  verifyStoredLiveCode,
} from './live-access-store';

type StoredRow = {
  protected: number;
  remember_viewer: number;
  code_salt: string;
  code_hash: string;
  session_version: number;
  updated_at: string;
};

function fakeEnv(initialCode = 'initial-test-code'): PagesEnv {
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
          if (query.startsWith('INSERT OR IGNORE') && !row) {
            row = {
              protected: 1,
              remember_viewer: 0,
              code_salt: String(values[0]),
              code_hash: String(values[1]),
              session_version: 1,
              updated_at: String(values[2]),
            };
          }
          if (query.startsWith('UPDATE live_access_settings') && row) {
            row = {
              protected: Number(values[0]),
              remember_viewer: Number(values[1]),
              code_salt: String(values[2]),
              code_hash: String(values[3]),
              session_version: Number(values[4]),
              updated_at: String(values[5]),
            };
          }
          return { success: true };
        },
      };
    },
  } as unknown as D1Database;
  return {
    DB: db,
    LIVE_ACCESS_CODE: initialCode,
    LIVE_ACCESS_SESSION_SECRET: 'test-session-secret',
  } as PagesEnv;
}

describe('durable live access settings', () => {
  it('starts protected, persists public/protected transitions, and remembers the viewer preference', async () => {
    const env = fakeEnv();
    await expect(getLiveAccessState(env)).resolves.toMatchObject({
      protected: true,
      rememberViewer: false,
      sessionVersion: 1,
    });
    await expect(updateLiveAccessState(env, { protected: false })).resolves.toMatchObject({
      protected: false,
      sessionVersion: 2,
    });
    await expect(
      updateLiveAccessState(env, { protected: true, rememberViewer: true }),
    ).resolves.toMatchObject({
      protected: true,
      rememberViewer: true,
      sessionVersion: 3,
    });
    await expect(getLiveAccessState(env)).resolves.toMatchObject({
      protected: true,
      rememberViewer: true,
      sessionVersion: 3,
    });
  });

  it('hashes code changes and revokes existing session versions', async () => {
    const env = fakeEnv();
    await expect(verifyStoredLiveCode('initial-test-code', env)).resolves.toBe(true);
    await expect(verifyStoredLiveCode('wrong', env)).resolves.toBe(false);
    const changed = await updateLiveAccessState(env, { code: 'new-test-code' });
    expect(changed.sessionVersion).toBe(2);
    await expect(verifyStoredLiveCode('initial-test-code', env)).resolves.toBe(false);
    await expect(verifyStoredLiveCode('new-test-code', env)).resolves.toBe(true);
    await expect(updateLiveAccessState(env, { revoke: true })).resolves.toMatchObject({
      sessionVersion: 3,
    });
  });
});
