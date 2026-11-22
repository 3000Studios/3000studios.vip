import type { PagesEnv } from '../env';

export type LiveAccessState = {
  protected: boolean;
  rememberViewer: boolean;
  sessionVersion: number;
  updatedAt: string;
};

type LiveAccessRow = {
  protected: number;
  remember_viewer: number;
  code_salt: string;
  code_hash: string;
  session_version: number;
  updated_at: string;
};

const encoder = new TextEncoder();

function hex(bytes: ArrayBuffer | Uint8Array): string {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

function timingSafeEqual(left: string, right: string): boolean {
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (a[index % Math.max(a.length, 1)] ?? 0) ^ (b[index % Math.max(b.length, 1)] ?? 0);
  }
  return difference === 0;
}

async function hashCode(code: string, salt: string): Promise<string> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(code), 'PBKDF2', false, [
    'deriveBits',
  ]);
  return hex(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(salt), iterations: 120_000 },
      material,
      256,
    ),
  );
}

async function ensureTable(env: PagesEnv): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS live_access_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      protected INTEGER NOT NULL DEFAULT 1,
      remember_viewer INTEGER NOT NULL DEFAULT 0,
      code_salt TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      session_version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    )`,
  ).run();
}

async function row(env: PagesEnv): Promise<LiveAccessRow> {
  await ensureTable(env);
  let current = await env.DB.prepare(
    'SELECT * FROM live_access_settings WHERE id = 1',
  ).first<LiveAccessRow>();
  if (!current) {
    const initialCode = env.LIVE_ACCESS_CODE?.trim();
    if (!initialCode) throw new Error('LIVE_ACCESS_CODE is required for initial setup');
    const salt = crypto.randomUUID();
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT OR IGNORE INTO live_access_settings
       (id, protected, remember_viewer, code_salt, code_hash, session_version, updated_at)
       VALUES (1, 1, 0, ?, ?, 1, ?)`,
    )
      .bind(salt, await hashCode(initialCode, salt), now)
      .run();
    current = await env.DB.prepare(
      'SELECT * FROM live_access_settings WHERE id = 1',
    ).first<LiveAccessRow>();
  }
  if (!current) throw new Error('Live access settings could not be initialized');
  return current;
}

export async function getLiveAccessState(env: PagesEnv): Promise<LiveAccessState> {
  const current = await row(env);
  return {
    protected: current.protected === 1,
    rememberViewer: current.remember_viewer === 1,
    sessionVersion: current.session_version,
    updatedAt: current.updated_at,
  };
}

export async function verifyStoredLiveCode(code: string, env: PagesEnv): Promise<boolean> {
  const current = await row(env);
  return timingSafeEqual(await hashCode(code.trim(), current.code_salt), current.code_hash);
}

export async function updateLiveAccessState(
  env: PagesEnv,
  changes: { protected?: boolean; rememberViewer?: boolean; code?: string; revoke?: boolean },
): Promise<LiveAccessState> {
  const current = await row(env);
  const salt = changes.code ? crypto.randomUUID() : current.code_salt;
  const codeHash = changes.code ? await hashCode(changes.code.trim(), salt) : current.code_hash;
  const nextProtected = changes.protected ?? current.protected === 1;
  const nextRemember = changes.rememberViewer ?? current.remember_viewer === 1;
  const securityChanged =
    changes.protected !== undefined || Boolean(changes.code) || changes.revoke;
  const version = current.session_version + (securityChanged ? 1 : 0);
  const now = new Date().toISOString();
  await env.DB.prepare(
    `UPDATE live_access_settings SET protected = ?, remember_viewer = ?, code_salt = ?,
     code_hash = ?, session_version = ?, updated_at = ? WHERE id = 1`,
  )
    .bind(nextProtected ? 1 : 0, nextRemember ? 1 : 0, salt, codeHash, version, now)
    .run();
  return {
    protected: nextProtected,
    rememberViewer: nextRemember,
    sessionVersion: version,
    updatedAt: now,
  };
}
