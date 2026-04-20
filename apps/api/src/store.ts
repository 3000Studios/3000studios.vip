import type { CheckRunStatus, CheckType } from './types';
import { nowIso } from './time';
import type { Env } from './env';

export type SiteRow = {
  id: string;
  name: string;
  url: string;
  environment: string;
  platform: string;
  tags: string;
  expected_status: number | null;
  expected_title: string | null;
  expected_canonical: string | null;
  expected_redirects: string;
  critical_routes: string;
  deploy_hook_url: string | null;
  enabled: number;
  created_at: string;
  updated_at: string;
};

export type CheckRow = {
  id: string;
  site_id: string;
  type: CheckType;
  schedule: string;
  timeout_ms: number;
  thresholds_json: string;
  enabled: number;
  created_at: string;
  updated_at: string;
};

export async function listSites(env: Env): Promise<SiteRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM sites ORDER BY updated_at DESC`,
  ).all<SiteRow>();
  return results;
}

export async function getSite(env: Env, id: string): Promise<SiteRow | null> {
  const row = await env.DB.prepare(`SELECT * FROM sites WHERE id = ?1`).bind(id).first<SiteRow>();
  return row ?? null;
}

export async function upsertSite(
  env: Env,
  site: Omit<SiteRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string },
): Promise<void> {
  const now = nowIso();
  const createdAt = site.created_at ?? now;
  const updatedAt = site.updated_at ?? now;
  await env.DB.prepare(
    `
    INSERT INTO sites (
      id, name, url, environment, platform, tags,
      expected_status, expected_title, expected_canonical, expected_redirects,
      critical_routes, deploy_hook_url, enabled, created_at, updated_at
    ) VALUES (
      ?1, ?2, ?3, ?4, ?5, ?6,
      ?7, ?8, ?9, ?10,
      ?11, ?12, ?13, ?14, ?15
    )
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      url=excluded.url,
      environment=excluded.environment,
      platform=excluded.platform,
      tags=excluded.tags,
      expected_status=excluded.expected_status,
      expected_title=excluded.expected_title,
      expected_canonical=excluded.expected_canonical,
      expected_redirects=excluded.expected_redirects,
      critical_routes=excluded.critical_routes,
      deploy_hook_url=excluded.deploy_hook_url,
      enabled=excluded.enabled,
      updated_at=excluded.updated_at
  `,
  )
    .bind(
      site.id,
      site.name,
      site.url,
      site.environment,
      site.platform,
      site.tags,
      site.expected_status,
      site.expected_title,
      site.expected_canonical,
      site.expected_redirects,
      site.critical_routes,
      site.deploy_hook_url,
      site.enabled,
      createdAt,
      updatedAt,
    )
    .run();
}

export async function deleteSite(env: Env, id: string): Promise<void> {
  await env.DB.prepare(`DELETE FROM sites WHERE id=?1`).bind(id).run();
}

export async function ensureDefaultChecks(env: Env, siteId: string): Promise<void> {
  const now = nowIso();
  const defaults: Array<{ type: CheckType; timeout_ms: number }> = [
    { type: 'uptime', timeout_ms: 12000 },
    { type: 'seo', timeout_ms: 12000 },
  ];
  for (const d of defaults) {
    const existing = await env.DB.prepare(`SELECT id FROM checks WHERE site_id=?1 AND type=?2`)
      .bind(siteId, d.type)
      .first<{ id: string }>();
    if (existing) continue;
    await env.DB.prepare(
      `INSERT INTO checks (id, site_id, type, schedule, timeout_ms, thresholds_json, enabled, created_at, updated_at)
       VALUES (?1, ?2, ?3, '*/5 * * * *', ?4, '{}', 1, ?5, ?6)`,
    )
      .bind(crypto.randomUUID(), siteId, d.type, d.timeout_ms, now, now)
      .run();
  }
}

export async function listEnabledChecksForSite(env: Env, siteId: string): Promise<CheckRow[]> {
  const { results } = await env.DB.prepare(
    `SELECT * FROM checks WHERE site_id=?1 AND enabled=1 ORDER BY created_at ASC`,
  )
    .bind(siteId)
    .all<CheckRow>();
  return results;
}

export async function listAllEnabledChecks(env: Env): Promise<Array<CheckRow & { site_url: string }>> {
  const { results } = await env.DB.prepare(
    `
    SELECT c.*, s.url as site_url
    FROM checks c
    JOIN sites s ON s.id = c.site_id
    WHERE c.enabled=1 AND s.enabled=1
  `,
  ).all<Array<CheckRow & { site_url: string }>>();
  return results;
}

export async function insertCheckRun(params: {
  env: Env;
  checkId: string;
  startedAt: string;
  durationMs: number;
  status: CheckRunStatus;
  metrics: unknown;
  evidence: unknown;
  error?: string | null;
}): Promise<string> {
  const id = crypto.randomUUID();
  await params.env.DB.prepare(
    `INSERT INTO check_runs (id, check_id, started_at, duration_ms, status, metrics_json, evidence_json, error)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
  )
    .bind(
      id,
      params.checkId,
      params.startedAt,
      params.durationMs,
      params.status,
      JSON.stringify(params.metrics ?? {}),
      JSON.stringify(params.evidence ?? {}),
      params.error ?? null,
    )
    .run();
  return id;
}

export async function upsertIncident(params: {
  env: Env;
  siteId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  state: 'open' | 'closed';
}): Promise<{ incidentId: string; isNew: boolean }> {
  const now = nowIso();
  const existing = await params.env.DB.prepare(
    `SELECT id, closed_at FROM incidents WHERE site_id=?1 AND summary=?2 AND closed_at IS NULL`,
  )
    .bind(params.siteId, params.summary)
    .first<{ id: string }>();

  if (existing) {
    await params.env.DB.prepare(`UPDATE incidents SET last_seen_at=?1 WHERE id=?2`)
      .bind(now, existing.id)
      .run();
    return { incidentId: existing.id, isNew: false };
  }

  const incidentId = crypto.randomUUID();
  await params.env.DB.prepare(
    `INSERT INTO incidents (id, site_id, opened_at, closed_at, severity, summary, current_state, last_seen_at)
     VALUES (?1, ?2, ?3, NULL, ?4, ?5, 'open', ?6)`,
  )
    .bind(incidentId, params.siteId, now, params.severity, params.summary, now)
    .run();
  return { incidentId, isNew: true };
}

export async function closeIncidentsForSiteAndPrefix(
  env: Env,
  siteId: string,
  summaryPrefix: string,
): Promise<void> {
  const now = nowIso();
  await env.DB.prepare(
    `UPDATE incidents SET closed_at=?1, current_state='closed' WHERE site_id=?2 AND closed_at IS NULL AND summary LIKE ?3`,
  )
    .bind(now, siteId, `${summaryPrefix}%`)
    .run();
}

export async function insertAlert(params: {
  env: Env;
  incidentId: string;
  channel: string;
  status: string;
  dedupeKey: string;
}): Promise<void> {
  const now = nowIso();
  await params.env.DB.prepare(
    `INSERT INTO alerts (id, incident_id, channel, sent_at, status, dedupe_key)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(crypto.randomUUID(), params.incidentId, params.channel, now, params.status, params.dedupeKey)
    .run();
}

export async function insertAudit(params: {
  env: Env;
  actor: string;
  action: string;
  target: string;
  diff: unknown;
}): Promise<void> {
  await params.env.DB.prepare(
    `INSERT INTO audit_log (id, actor, action, target, at, diff_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(crypto.randomUUID(), params.actor, params.action, params.target, nowIso(), JSON.stringify(params.diff ?? {}))
    .run();
}

