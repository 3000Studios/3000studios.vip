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
  insertCheckRun,
  listAllEnabledChecks,
  listEnabledChecksForSite,
  listSites,
  upsertIncident,
  upsertSite,
} from './store';
import { nowIso } from './time';
import { runCheck } from './checks';
import { sendOwnerEmail } from './mailer';
import { runDeployHook } from './playbooks';

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
    enabled: body.enabled ? 1 : 0,
    created_at: now,
    updated_at: now,
  });
  await ensureDefaultChecks(c.env, id);
  await insertAudit({ env: c.env, actor: 'owner', action: 'site.upsert', target: `site:${id}`, diff: body });
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
  await insertAudit({ env: c.env, actor: 'owner', action: 'site.delete', target: `site:${id}`, diff: {} });
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
  return c.json({ sites: sites?.n ?? 0, openIncidents: openIncidents?.n ?? 0 });
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
    enabled: 1,
    created_at: now,
    updated_at: now,
  });
  await ensureDefaultChecks(c.env, id);
  await insertAudit({ env: c.env, actor: 'owner', action: 'admin.seed', target: 'seed', diff: { id } });
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
    const site = await env.DB.prepare(`SELECT * FROM sites WHERE id=?1`).bind(check.site_id).first<any>();
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
