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
  workspace_key: string | null;
  workspace_path: string | null;
  bridge_origin: string | null;
  cloudflare_zone_id: string | null;
  cloudflare_zone_name: string | null;
  bridge_enabled: number;
  edit_surfaces: string;
  adsense_client_id: string | null;
  adsense_enabled: number;
  ga_property_id: string | null;
  revenue_last_30d_cents: number | null;
  revenue_source: string | null;
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
      critical_routes, deploy_hook_url, workspace_key, workspace_path, bridge_origin,
      cloudflare_zone_id, cloudflare_zone_name, bridge_enabled, edit_surfaces,
      adsense_client_id, adsense_enabled, ga_property_id, revenue_last_30d_cents, revenue_source,
      enabled, created_at, updated_at
    ) VALUES (
      ?1, ?2, ?3, ?4, ?5, ?6,
      ?7, ?8, ?9, ?10,
      ?11, ?12, ?13, ?14, ?15,
      ?16, ?17, ?18, ?19,
      ?20, ?21, ?22, ?23, ?24,
      ?25, ?26, ?27
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
      workspace_key=excluded.workspace_key,
      workspace_path=excluded.workspace_path,
      bridge_origin=excluded.bridge_origin,
      cloudflare_zone_id=excluded.cloudflare_zone_id,
      cloudflare_zone_name=excluded.cloudflare_zone_name,
      bridge_enabled=excluded.bridge_enabled,
      edit_surfaces=excluded.edit_surfaces,
      adsense_client_id=excluded.adsense_client_id,
      adsense_enabled=excluded.adsense_enabled,
      ga_property_id=excluded.ga_property_id,
      revenue_last_30d_cents=excluded.revenue_last_30d_cents,
      revenue_source=excluded.revenue_source,
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
      site.workspace_key,
      site.workspace_path,
      site.bridge_origin,
      site.cloudflare_zone_id,
      site.cloudflare_zone_name,
      site.bridge_enabled,
      site.edit_surfaces,
      site.adsense_client_id,
      site.adsense_enabled,
      site.ga_property_id,
      site.revenue_last_30d_cents,
      site.revenue_source,
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
  ).all<CheckRow & { site_url: string }>();
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

export async function insertBridgeSnapshot(params: {
  env: Env;
  siteId: string | null;
  origin: string;
  pageStatus: number | null;
  assetUrl: string | null;
  config: unknown;
  endpointStatus: unknown;
  selectorStatus: unknown;
  error?: string | null;
}): Promise<void> {
  await params.env.DB.prepare(
    `INSERT INTO bridge_snapshots (
      id, site_id, origin, inspected_at, config_json, endpoint_status_json, selector_status_json,
      page_status, asset_url, error
    ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
  )
    .bind(
      crypto.randomUUID(),
      params.siteId,
      params.origin,
      nowIso(),
      JSON.stringify(params.config ?? {}),
      JSON.stringify(params.endpointStatus ?? {}),
      JSON.stringify(params.selectorStatus ?? {}),
      params.pageStatus,
      params.assetUrl,
      params.error ?? null,
    )
    .run();
}

export async function listLatestBridgeSnapshots(env: Env): Promise<
  Array<{
    site_id: string | null;
    origin: string;
    inspected_at: string;
    config_json: string;
    endpoint_status_json: string;
    selector_status_json: string;
    page_status: number | null;
    asset_url: string | null;
    error: string | null;
  }>
> {
  const { results } = await env.DB.prepare(
    `SELECT bs.*
     FROM bridge_snapshots bs
     JOIN (
       SELECT origin, MAX(inspected_at) as latest
       FROM bridge_snapshots
       GROUP BY origin
     ) latest ON latest.origin = bs.origin AND latest.latest = bs.inspected_at
     ORDER BY bs.inspected_at DESC`,
  ).all();
  return results as any[];
}

export async function insertZoneSnapshot(params: {
  env: Env;
  siteId: string | null;
  zoneId: string;
  zoneName: string;
  analytics: unknown;
  error?: string | null;
}): Promise<void> {
  await params.env.DB.prepare(
    `INSERT INTO zone_snapshots (id, site_id, zone_id, zone_name, captured_at, analytics_json, error)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`,
  )
    .bind(
      crypto.randomUUID(),
      params.siteId,
      params.zoneId,
      params.zoneName,
      nowIso(),
      JSON.stringify(params.analytics ?? {}),
      params.error ?? null,
    )
    .run();
}

export async function listLatestZoneSnapshots(env: Env): Promise<any[]> {
  const { results } = await env.DB.prepare(
    `SELECT zs.*
     FROM zone_snapshots zs
     JOIN (
       SELECT zone_id, MAX(captured_at) as latest
       FROM zone_snapshots
       GROUP BY zone_id
     ) latest ON latest.zone_id = zs.zone_id AND latest.latest = zs.captured_at
     ORDER BY zs.captured_at DESC`,
  ).all();
  return results as any[];
}

export async function insertCommandRun(params: {
  env: Env;
  siteId: string | null;
  commandText: string;
  parsedAction: string;
  result: unknown;
}): Promise<void> {
  await params.env.DB.prepare(
    `INSERT INTO command_runs (id, site_id, command_text, parsed_action, result_json, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
  )
    .bind(
      crypto.randomUUID(),
      params.siteId,
      params.commandText,
      params.parsedAction,
      JSON.stringify(params.result ?? {}),
      nowIso(),
    )
    .run();
}
