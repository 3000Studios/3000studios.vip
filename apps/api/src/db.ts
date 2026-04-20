import type { Env } from './env';

export async function migrateIfNeeded(env: Env): Promise<void> {
  const { results } = await env.DB.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='schema_migrations'`,
  ).all();
  if (results.length === 0) {
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);
  }
}

