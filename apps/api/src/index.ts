import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import type { Env } from './env';
import {
  closeIncidentsForSiteAndPrefix,
  deleteSite,
  ensureDefaultChecks,
  getSite,
  insertAlert,
  insertAudit,
  insertBridgeSnapshot,
  insertCheckRun,
  insertCommandRun,
  insertZoneSnapshot,
  listAllEnabledChecks,
  listLatestBridgeSnapshots,
  listLatestZoneSnapshots,
  listEnabledChecksForSite,
  listSites,
  upsertIncident,
  upsertSite,
} from './store';
import { nowIso } from './time';
import { runCheck } from './checks';
import { sendOwnerEmail } from './mailer';
import { runDeployHook } from './playbooks';
import { catalogSites } from './catalog';
import { inspectBridge } from './bridge';
import { getZoneDashboard, listManagedZones } from './cloudflare';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['content-type', 'cf-access-jwt-assertion'],
    maxAge: 86400,
  }),
);

app.use('*', async (c, next) => {
  const env = c.env;
  if (env.APP_ENV === 'production' && env.ACCESS_REQUIRED === '1') {
    const token = c.req.header('cf-access-jwt-assertion');
    if (!token) return c.json({ error: 'unauthorized' }, 401);
  }
  await next();
});

app.get('/health', (c) => c.json({ ok: true, at: nowIso() }));

app.get('/sites', async (c) => {
  const sites = await listSites(c.env);
  return c.json({ sites });
});

const SiteUpsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  url: z.string().url(),
  environment: z.string().default('prod'),
  platform: z.string().default('unknown'),
  tags: z.array(z.string()).default([]),
  expected_status: z.number().int().min(100).max(599).nullable().default(null),
  expected_title: z.string().max(180).nullable().default(null),
  expected_canonical: z.string().max(500).nullable().default(null),
  expected_redirects: z.array(z.string().max(500)).default([]),
  critical_routes: z.array(z.string().max(500)).default([]),
  deploy_hook_url: z.string().url().nullable().default(null),
  workspace_key: z.string().max(120).nullable().default(null),
  workspace_path: z.string().max(400).nullable().default(null),
  bridge_origin: z.string().url().nullable().default(null),
  cloudflare_zone_id: z.string().max(64).nullable().default(null),
  cloudflare_zone_name: z.string().max(255).nullable().default(null),
  bridge_enabled: z.boolean().default(false),
  edit_surfaces: z.array(z.string().max(255)).default([]),
  enabled: z.boolean().default(true),
});

app.post('/sites', async (c) => {
  const body = SiteUpsertSchema.parse(await c.req.json());
  const now = nowIso();
  const id = body.id ?? crypto.randomUUID();

  await upsertSite(c.env, {
    id,
    name: body.name,
    url: body.url,
    environment: body.environment,
    platform: body.platform,
    tags: JSON.stringify(body.tags),
    expected_status: body.expected_status,
    expected_title: body.expected_title,
    expected_canonical: body.expected_canonical,
    expected_redirects: JSON.stringify(body.expected_redirects),
    critical_routes: JSON.stringify(body.critical_routes),
    deploy_hook_url: body.deploy_hook_url,
    workspace_key: body.workspace_key,
    workspace_path: body.workspace_path,
    bridge_origin: body.bridge_origin,
    cloudflare_zone_id: body.cloudflare_zone_id,
    cloudflare_zone_name: body.cloudflare_zone_name,
    bridge_enabled: body.bridge_enabled ? 1 : 0,
    edit_surfaces: JSON.stringify(body.edit_surfaces),
    enabled: body.enabled ? 1 : 0,
    created_at: now,
    updated_at: now,
  });
  await ensureDefaultChecks(c.env, id);
  await insertAudit({
    env: c.env,
    actor: 'owner',
    action: 'site.upsert',
    target: `site:${id}`,
    diff: body,
  });
  return c.json({ ok: true, id });
});

app.get('/sites/:id', async (c) => {
  const site = await getSite(c.env, c.req.param('id'));
  if (!site) return c.json({ error: 'not_found' }, 404);
  const checks = await listEnabledChecksForSite(c.env, site.id);
  return c.json({ site, checks });
});

app.delete('/sites/:id', async (c) => {
  const id = c.req.param('id');
  await deleteSite(c.env, id);
  await insertAudit({
    env: c.env,
    actor: 'owner',
    action: 'site.delete',
    target: `site:${id}`,
    diff: {},
  });
  return c.json({ ok: true });
});

app.post('/sites/:id/run', async (c) => {
  const siteId = c.req.param('id');
  const site = await getSite(c.env, siteId);
  if (!site) return c.json({ error: 'not_found' }, 404);

  const checks = await listEnabledChecksForSite(c.env, siteId);
  const startedAt = nowIso();
  const results = [];

  let anyFail = false;
  for (const check of checks) {
    const start = Date.now();
    const r = await runCheck({ check, site });
    const durationMs = Date.now() - start;
    await insertCheckRun({
      env: c.env,
      checkId: check.id,
      startedAt,
      durationMs,
      status: r.status,
      metrics: r.metrics,
      evidence: r.evidence,
      error: r.error ?? null,
    });
    results.push({ checkId: check.id, type: check.type, ...r });
    if (r.status === 'fail') anyFail = true;
  }

  if (!anyFail) {
    await closeIncidentsForSiteAndPrefix(c.env, siteId, 'Check failed:');
  }

  return c.json({ ok: true, results });
});

async function handleFailureAlert(params: {
  env: Env;
  siteId: string;
  siteName: string;
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}): Promise<void> {
  const { incidentId, isNew } = await upsertIncident({
    env: params.env,
    siteId: params.siteId,
    severity: params.severity,
    summary: params.summary,
    state: 'open',
  });
  if (!isNew) return;

  const subject = `[Apex Citadel] ${params.severity.toUpperCase()} — ${params.siteName}`;
  const text = `${params.summary}\n\nSite: ${params.siteName}\nWhen: ${nowIso()}`;
  const send = await sendOwnerEmail(params.env, subject, text);
  await insertAlert({
    env: params.env,
    incidentId,
    channel: 'email',
    status: send.status,
    dedupeKey: `email:${incidentId}`,
  });
}

app.post('/sites/:id/playbooks/deploy-hook', async (c) => {
  const siteId = c.req.param('id');
  const site = await getSite(c.env, siteId);
  if (!site) return c.json({ error: 'not_found' }, 404);
  if (!site.deploy_hook_url) return c.json({ error: 'missing_deploy_hook_url' }, 400);

  const r = await runDeployHook({ env: c.env, siteId, deployHookUrl: site.deploy_hook_url });
  return c.json({ ok: r.ok, status: r.status });
});

app.get('/stats', async (c) => {
  const sites = await c.env.DB.prepare(`SELECT COUNT(*) as n FROM sites`).first<{ n: number }>();
  const openIncidents = await c.env.DB.prepare(
    `SELECT COUNT(*) as n FROM incidents WHERE closed_at IS NULL`,
  ).first<{ n: number }>();
  const bridgeCount = await c.env.DB.prepare(
    `SELECT COUNT(*) as n FROM sites WHERE bridge_enabled = 1`,
  ).first<{ n: number }>();
  const commandCount = await c.env.DB.prepare(`SELECT COUNT(*) as n FROM command_runs`).first<{
    n: number;
  }>();
  return c.json({
    sites: sites?.n ?? 0,
    openIncidents: openIncidents?.n ?? 0,
    bridgeEnabledSites: bridgeCount?.n ?? 0,
    commandRuns: commandCount?.n ?? 0,
  });
});

app.get('/ops/catalog', async (c) => {
  const sites = await listSites(c.env);
  return c.json({ catalog: catalogSites, sites });
});

app.post('/ops/seed-network', async (c) => {
  const now = nowIso();
  const zones = await listManagedZones(c.env).catch(() => []);
  const existingSites = await listSites(c.env);

  for (const entry of catalogSites) {
    const foundZone = zones.find(
      (zone) => zone.name === entry.zoneName || zone.name === new URL(entry.origin).hostname,
    );
    const existing = existingSites.find((site) => site.url === entry.origin);
    await upsertSite(c.env, {
      id: existing?.id ?? crypto.randomUUID(),
      name: entry.name,
      url: entry.origin,
      environment: 'prod',
      platform: foundZone ? 'cloudflare' : 'external',
      tags: JSON.stringify([entry.workspaceKey]),
      expected_status: 200,
      expected_title: null,
      expected_canonical: null,
      expected_redirects: JSON.stringify([]),
      critical_routes: JSON.stringify(['/']),
      deploy_hook_url: null,
      workspace_key: entry.workspaceKey,
      workspace_path: entry.workspacePath,
      bridge_origin: entry.bridgeEnabled ? entry.origin : null,
      cloudflare_zone_id: foundZone?.id ?? null,
      cloudflare_zone_name: foundZone?.name ?? null,
      bridge_enabled: entry.bridgeEnabled ? 1 : 0,
      edit_surfaces: JSON.stringify(entry.editSurfaces ?? []),
      enabled: 1,
      created_at: now,
      updated_at: now,
    });
  }

  await insertAudit({
    env: c.env,
    actor: 'owner',
    action: 'ops.seed_network',
    target: 'catalog',
    diff: { count: catalogSites.length },
  });

  return c.json({ ok: true, seeded: catalogSites.length });
});

app.get('/ops/zones', async (c) => {
  try {
    const zones = await listManagedZones(c.env);
    if (zones.length > 0) {
      return c.json({ zones });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'zones_failed';
    const sites = await listSites(c.env);
    const fallback = sites
      .filter((site) => site.cloudflare_zone_name || site.cloudflare_zone_id)
      .map((site) => ({
        id: site.cloudflare_zone_id ?? site.id,
        name: site.cloudflare_zone_name ?? new URL(site.url).hostname,
        status: 'cached',
        name_servers: [],
      }));
    return c.json({ zones: fallback, error: message }, 200);
  }
  const sites = await listSites(c.env);
  const fallback = sites
    .filter((site) => site.cloudflare_zone_name || site.cloudflare_zone_id)
    .map((site) => ({
      id: site.cloudflare_zone_id ?? site.id,
      name: site.cloudflare_zone_name ?? new URL(site.url).hostname,
      status: 'cached',
      name_servers: [],
    }));
  return c.json({ zones: fallback });
});

app.get('/ops/analytics/:zoneId', async (c) => {
  const zoneId = c.req.param('zoneId');
  try {
    const analytics = await getZoneDashboard(c.env, zoneId);
    const site =
      (await listSites(c.env)).find((entry) => entry.cloudflare_zone_id === zoneId) ?? null;
    await insertZoneSnapshot({
      env: c.env,
      siteId: site?.id ?? null,
      zoneId,
      zoneName: site?.cloudflare_zone_name ?? zoneId,
      analytics,
    });
    return c.json({ zoneId, analytics });
  } catch (error) {
    const snapshots = await listLatestZoneSnapshots(c.env);
    const cached = snapshots.find((snapshot) => snapshot.zone_id === zoneId) ?? null;
    return c.json(
      {
        zoneId,
        cached,
        error: error instanceof Error ? error.message : 'analytics_failed',
      },
      cached ? 200 : 500,
    );
  }
});

app.get('/ops/analytics', async (c) => {
  const snapshots = await listLatestZoneSnapshots(c.env);
  return c.json({ snapshots });
});

app.get('/ops/bridge-inspect', async (c) => {
  const origin = c.req.query('origin');
  if (!origin) return c.json({ error: 'origin_required' }, 400);

  const sites = await listSites(c.env);
  const site =
    sites.find((entry) => entry.url === origin || entry.bridge_origin === origin) ?? null;
  const result = await inspectBridge(origin);
  await insertBridgeSnapshot({
    env: c.env,
    siteId: site?.id ?? null,
    origin,
    pageStatus: result.pageStatus,
    assetUrl: result.assetUrl,
    config: result.config,
    endpointStatus: result.endpointStatus,
    selectorStatus: result.selectorStatus,
    error: result.error ?? null,
  });
  return c.json(result);
});

app.get('/ops/bridges', async (c) => {
  const snapshots = await listLatestBridgeSnapshots(c.env);
  return c.json({ snapshots });
});

const CommandSchema = z.object({
  siteId: z.string().uuid().nullable().default(null),
  command: z.string().min(3).max(500),
});

app.post('/ops/command', async (c) => {
  const body = CommandSchema.parse(await c.req.json());
  const site = body.siteId ? await getSite(c.env, body.siteId) : null;
  const commandText = body.command.trim();
  const lower = commandText.toLowerCase();

  let parsedAction = 'noop';
  let result: Record<string, unknown> = { note: 'No matching action' };

  if (lower.includes('run check') || lower.includes('status')) {
    if (!site) return c.json({ error: 'site_required_for_checks' }, 400);
    parsedAction = 'run_checks';
    const checks = await listEnabledChecksForSite(c.env, site.id);
    const runs = [];
    for (const check of checks) {
      const startedAt = nowIso();
      const start = Date.now();
      const run = await runCheck({ check, site });
      const durationMs = Date.now() - start;
      await insertCheckRun({
        env: c.env,
        checkId: check.id,
        startedAt,
        durationMs,
        status: run.status,
        metrics: run.metrics,
        evidence: run.evidence,
        error: run.error ?? null,
      });
      runs.push({ type: check.type, status: run.status, metrics: run.metrics });
    }
    result = { site: site.name, runs };
  } else if (lower.includes('bridge')) {
    parsedAction = 'inspect_bridge';
    const origin = site?.bridge_origin ?? site?.url;
    if (!origin) return c.json({ error: 'site_required_for_bridge' }, 400);
    result = await inspectBridge(origin);
  } else if (lower.includes('analytics')) {
    parsedAction = 'fetch_analytics';
    if (!site?.cloudflare_zone_id) return c.json({ error: 'cloudflare_zone_required' }, 400);
    result = (await getZoneDashboard(c.env, site.cloudflare_zone_id)) as Record<string, unknown>;
  } else if (lower.includes('deploy hook') || lower.includes('redeploy')) {
    parsedAction = 'trigger_deploy_hook';
    if (!site?.deploy_hook_url) return c.json({ error: 'deploy_hook_missing' }, 400);
    result = await runDeployHook({
      env: c.env,
      siteId: site.id,
      deployHookUrl: site.deploy_hook_url,
    });
  } else if (lower.includes('editor') || lower.includes('route')) {
    parsedAction = 'list_edit_surfaces';
    result = { surfaces: JSON.parse(site?.edit_surfaces ?? '[]') };
  }

  await insertCommandRun({
    env: c.env,
    siteId: site?.id ?? null,
    commandText,
    parsedAction,
    result,
  });

  return c.json({ parsedAction, result });
});

app.post('/admin/seed', async (c) => {
  const now = nowIso();
  const id = crypto.randomUUID();
  await upsertSite(c.env, {
    id,
    name: '3000 Studios (Home)',
    url: 'https://3000studios.vip',
    environment: 'prod',
    platform: 'unknown',
    tags: JSON.stringify(['core']),
    expected_status: 200,
    expected_title: null,
    expected_canonical: null,
    expected_redirects: JSON.stringify([]),
    critical_routes: JSON.stringify(['/']),
    deploy_hook_url: null,
    workspace_key: '3000studios-vip',
    workspace_path: null,
    bridge_origin: null,
    cloudflare_zone_id: null,
    cloudflare_zone_name: '3000studios.vip',
    bridge_enabled: 0,
    edit_surfaces: JSON.stringify([
      '/dashboard',
      '/admin',
      '/products',
      '/pricing',
      '/blog',
      '/contact',
    ]),
    enabled: 1,
    created_at: now,
    updated_at: now,
  });
  await ensureDefaultChecks(c.env, id);
  await insertAudit({
    env: c.env,
    actor: 'owner',
    action: 'admin.seed',
    target: 'seed',
    diff: { id },
  });
  return c.json({ ok: true, id });
});

export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runScheduledChecks(env));
  },
};

async function runScheduledChecks(env: Env): Promise<void> {
  const checks = await listAllEnabledChecks(env);
  for (const check of checks) {
    const site = await env.DB.prepare(`SELECT * FROM sites WHERE id=?1`)
      .bind(check.site_id)
      .first<any>();
    if (!site) continue;
    const startedAt = nowIso();
    const start = Date.now();
    const r = await runCheck({ check, site });
    const durationMs = Date.now() - start;
    await insertCheckRun({
      env,
      checkId: check.id,
      startedAt,
      durationMs,
      status: r.status,
      metrics: r.metrics,
      evidence: r.evidence,
      error: r.error ?? null,
    });
    if (r.status === 'fail') {
      await handleFailureAlert({
        env,
        siteId: site.id,
        siteName: site.name,
        summary: `Check failed: ${check.type}`,
        severity: 'high',
      });
    }
  }
}
