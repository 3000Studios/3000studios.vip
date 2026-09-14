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
import {
  extractOwnerEmail,
  isOwnerEmailAllowed,
  isSyncTokenAllowed,
  shouldPersistLearning,
  toDudeMessages,
} from './dude';
import { requireOwnerAccess } from './access';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
      'content-type',
      'cf-access-jwt-assertion',
      'x-owner-email',
      'x-music-device-token',
      'x-file-name',
      'x-pipeline-mode',
      'x-publish-confirmation',
    ],
    maxAge: 86400,
  }),
);

app.use('*', async (c, next) => {
  const env = c.env;
  if (env.APP_ENV === 'production' && env.ACCESS_REQUIRED === '1') {
    const deviceToken = c.req.header('x-music-device-token') ?? '';
    const musicDeviceAllowed =
      c.req.path.startsWith('/music/') &&
      Boolean(env.MUSIC_DEVICE_TOKEN) &&
      deviceToken.length >= 32 &&
      deviceToken === env.MUSIC_DEVICE_TOKEN;
    const publicTikTokFlow = c.req.path.startsWith('/tiktok/');
    if (publicTikTokFlow) {
      if (c.req.header('origin') !== 'https://3000studios.vip') {
        return c.json({ error: 'origin_not_allowed' }, 403);
      }
      await next();
      return;
    }
    if (musicDeviceAllowed) {
      await next();
      return;
    }
    if (
      c.req.path === '/dude/learn' &&
      isSyncTokenAllowed(c.req.header('x-dude-sync-token'), env.DUDE_SYNC_TOKEN)
    ) {
      await next();
      return;
    }
    const access = await requireOwnerAccess(c.req.raw, env);
    if (!access.ok) return c.json({ error: access.error }, access.status as 401 | 403 | 503);
  }
  await next();
});

app.get('/health', (c) => c.json({ ok: true, at: nowIso() }));

const TikTokExchangeSchema = z.object({
  code: z.string().min(8).max(2000),
  redirectUri: z.literal('https://3000studios.vip/tiktok'),
});

app.post('/tiktok/oauth/exchange', async (c) => {
  if (c.req.header('origin') !== 'https://3000studios.vip') {
    return c.json({ error: 'origin_not_allowed' }, 403);
  }
  if (!c.env.MUSIC_JOBS || !c.env.TIKTOK_CLIENT_KEY || !c.env.TIKTOK_CLIENT_SECRET) {
    return c.json({ error: 'tiktok_not_configured' }, 503);
  }
  const body = TikTokExchangeSchema.parse(await c.req.json());
  const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_key: c.env.TIKTOK_CLIENT_KEY,
      client_secret: c.env.TIKTOK_CLIENT_SECRET,
      code: body.code,
      grant_type: 'authorization_code',
      redirect_uri: body.redirectUri,
    }),
  });
  const token = await tokenResponse.json<Record<string, unknown>>();
  if (!tokenResponse.ok || typeof token.access_token !== 'string') {
    return c.json({ error: 'tiktok_token_exchange_failed' }, 502);
  }
  const session = crypto.randomUUID();
  await c.env.MUSIC_JOBS.put(
    `tiktok-sessions/${session}.json`,
    JSON.stringify({
      accessToken: token.access_token,
      openId: token.open_id,
      expiresAt: Date.now() + Number(token.expires_in ?? 3600) * 1000,
      usedAt: null,
    }),
    { httpMetadata: { contentType: 'application/json' } },
  );
  c.header('cache-control', 'no-store');
  c.header('referrer-policy', 'no-referrer');
  return c.json({ ok: true, session });
});

app.post('/tiktok/upload-draft', async (c) => {
  if (c.req.header('origin') !== 'https://3000studios.vip') {
    return c.json({ error: 'origin_not_allowed' }, 403);
  }
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'tiktok_not_configured' }, 503);
  const session = c.req.header('x-tiktok-session') ?? '';
  if (!/^[0-9a-f-]{36}$/i.test(session)) return c.json({ error: 'invalid_session' }, 401);
  const stored = await c.env.MUSIC_JOBS.get(`tiktok-sessions/${session}.json`);
  if (!stored) return c.json({ error: 'session_not_found' }, 401);
  const auth = (await stored.json()) as { accessToken?: string; expiresAt?: number };
  if (!auth.accessToken || Number(auth.expiresAt ?? 0) <= Date.now()) {
    return c.json({ error: 'session_expired' }, 401);
  }
  const video = await c.req.arrayBuffer();
  if (!video.byteLength || video.byteLength > 50 * 1024 * 1024) {
    return c.json({ error: 'video_size_must_be_1_to_50mb' }, 413);
  }
  if (c.req.header('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'video/mp4') {
    return c.json({ error: 'video_must_be_mp4' }, 415);
  }
  const signature = new Uint8Array(video.slice(4, 8));
  if (String.fromCharCode(...signature) !== 'ftyp') {
    return c.json({ error: 'invalid_mp4_signature' }, 415);
  }
  const initResponse = await fetch(
    'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/',
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${auth.accessToken}`,
        'content-type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: video.byteLength,
          chunk_size: video.byteLength,
          total_chunk_count: 1,
        },
      }),
    },
  );
  const init = await initResponse.json<Record<string, any>>();
  const uploadUrl = init?.data?.upload_url;
  const publishId = init?.data?.publish_id;
  if (!initResponse.ok || typeof uploadUrl !== 'string') {
    return c.json({ error: 'tiktok_upload_init_failed', details: init?.error?.message }, 502);
  }
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'content-type': c.req.header('content-type') ?? 'video/mp4',
      'content-length': String(video.byteLength),
      'content-range': `bytes 0-${video.byteLength - 1}/${video.byteLength}`,
    },
    body: video,
  });
  if (!uploadResponse.ok) return c.json({ error: 'tiktok_video_transfer_failed' }, 502);
  // Sessions are intentionally single-use. This limits replay if a browser URL,
  // extension, or device is compromised after a successful transfer.
  await c.env.MUSIC_JOBS.delete(`tiktok-sessions/${session}.json`);
  c.header('cache-control', 'no-store');
  return c.json({ ok: true, publishId, destination: 'TikTok inbox draft' });
});

const MusicJobMode = z.enum(['dry_run', 'build_only', 'publish']);
const MAX_MUSIC_UPLOAD_BYTES = 200 * 1024 * 1024;

function musicJobKey(id: string, file: string) {
  return `music-jobs/${id}/${file}`;
}

const MusicCatalogItem = z.object({
  id: z.string().min(8).max(80),
  title: z.string().min(1).max(240),
  relativePath: z.string().min(1).max(500),
  format: z.string().min(2).max(10),
  bytes: z.number().int().nonnegative(),
  modifiedAt: z.string().max(60),
  duplicateCount: z.number().int().nonnegative().default(0),
});
const MusicCatalog = z.object({
  generatedAt: z.string().max(60),
  scannedFiles: z.number().int().nonnegative(),
  totalBytes: z.number().int().nonnegative(),
  songs: z.array(MusicCatalogItem).max(2000),
});

app.get('/music/catalog', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const object = await c.env.MUSIC_JOBS.get('music-catalog/catalog.json');
  if (!object) return c.json({ catalog: null, songs: [] });
  return new Response(object.body, {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});

app.put('/music/catalog', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const parsed = MusicCatalog.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: 'invalid_music_catalog' }, 400);
  await c.env.MUSIC_JOBS.put('music-catalog/catalog.json', JSON.stringify(parsed.data), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json({ ok: true, songs: parsed.data.songs.length });
});

app.post('/music/catalog/:id/queue', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const object = await c.env.MUSIC_JOBS.get('music-catalog/catalog.json');
  if (!object) return c.json({ error: 'catalog_not_found' }, 404);
  const catalog = MusicCatalog.parse(await object.json());
  const song = catalog.songs.find((item) => item.id === c.req.param('id'));
  if (!song) return c.json({ error: 'song_not_found' }, 404);
  const input = z
    .object({ mode: MusicJobMode.default('dry_run'), publishConfirmation: z.string().optional() })
    .parse(await c.req.json().catch(() => ({})));
  if (input.mode === 'publish' && input.publishConfirmation !== 'PUBLISH 3000 STUDIOS') {
    return c.json({ error: 'publish_confirmation_required' }, 400);
  }
  const id = crypto.randomUUID();
  const now = nowIso();
  const status = {
    id,
    state: 'queued',
    mode: input.mode,
    originalName: song.title,
    catalogPath: song.relativePath,
    progress: 0,
    stage: 'Queued from music library',
    createdAt: now,
    updatedAt: now,
  };
  await c.env.MUSIC_JOBS.put(musicJobKey(id, 'status.json'), JSON.stringify(status), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json(status, 202);
});

const SiteEditSchema = z.object({
  request: z.string().min(8).max(3000),
  source: z.enum(['dashboard', 'dude']).default('dashboard'),
});

app.get('/music/site-edits', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const listed = await c.env.MUSIC_JOBS.list({ prefix: 'site-edits/' });
  const edits = await Promise.all(
    listed.objects.slice(-100).map(async (entry) => {
      const item = await c.env.MUSIC_JOBS?.get(entry.key);
      return item ? item.json() : null;
    }),
  );
  return c.json({ edits: edits.filter(Boolean).reverse() });
});

app.post('/music/site-edits', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const body = SiteEditSchema.parse(await c.req.json());
  const id = crypto.randomUUID();
  const edit = {
    id,
    ...body,
    state: 'awaiting_approval',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  await c.env.MUSIC_JOBS.put(`site-edits/${id}.json`, JSON.stringify(edit), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json(edit, 202);
});

app.put('/music/site-edits/:id', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const key = `site-edits/${c.req.param('id')}.json`;
  const object = await c.env.MUSIC_JOBS.get(key);
  if (!object) return c.json({ error: 'edit_not_found' }, 404);
  const current = (await object.json()) as Record<string, unknown>;
  const body = z.object({ state: z.enum(['approved', 'rejected']) }).parse(await c.req.json());
  const next = { ...current, state: body.state, updatedAt: nowIso() };
  await c.env.MUSIC_JOBS.put(key, JSON.stringify(next), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json(next);
});

app.post('/music/jobs', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const length = Number(c.req.header('content-length') ?? 0);
  if (!length || length > MAX_MUSIC_UPLOAD_BYTES) {
    return c.json({ error: 'audio_size_must_be_1_to_200mb' }, 413);
  }
  const mode = MusicJobMode.safeParse(c.req.header('x-pipeline-mode') ?? 'dry_run');
  if (!mode.success) return c.json({ error: 'invalid_pipeline_mode' }, 400);
  if (
    mode.data === 'publish' &&
    c.req.header('x-publish-confirmation') !== 'PUBLISH 3000 STUDIOS'
  ) {
    return c.json({ error: 'publish_confirmation_required' }, 400);
  }
  const originalName = (c.req.header('x-file-name') ?? 'song.wav')
    .replace(/[^a-zA-Z0-9._ -]/g, '_')
    .slice(0, 180);
  const id = crypto.randomUUID();
  const now = nowIso();
  const status = {
    id,
    state: 'queued',
    mode: mode.data,
    originalName,
    progress: 0,
    stage: 'Queued',
    createdAt: now,
    updatedAt: now,
  };
  await c.env.MUSIC_JOBS.put(musicJobKey(id, 'input'), c.req.raw.body, {
    httpMetadata: { contentType: c.req.header('content-type') ?? 'audio/wav' },
    customMetadata: { originalName, mode: mode.data },
  });
  await c.env.MUSIC_JOBS.put(musicJobKey(id, 'status.json'), JSON.stringify(status), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json(status, 202);
});

app.get('/music/jobs', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const listed = await c.env.MUSIC_JOBS.list({ prefix: 'music-jobs/', delimiter: '/' });
  const ids = listed.delimitedPrefixes
    .map((prefix) => prefix.split('/')[1])
    .filter(Boolean)
    .slice(-50);
  const jobs = await Promise.all(
    ids.map(async (id) => {
      const object = await c.env.MUSIC_JOBS.get(musicJobKey(id, 'status.json'));
      return object ? object.json() : null;
    }),
  );
  return c.json({ jobs: jobs.filter(Boolean) });
});

app.get('/music/jobs/:id', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const object = await c.env.MUSIC_JOBS.get(musicJobKey(c.req.param('id'), 'status.json'));
  if (!object) return c.json({ error: 'job_not_found' }, 404);
  return new Response(object.body, {
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
});

app.get('/music/jobs/:id/input', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const object = await c.env.MUSIC_JOBS.get(musicJobKey(c.req.param('id'), 'input'));
  if (!object) return c.json({ error: 'job_input_not_found' }, 404);
  return new Response(object.body, {
    headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream' },
  });
});

app.put('/music/jobs/:id/status', async (c) => {
  if (!c.env.MUSIC_JOBS) return c.json({ error: 'music_storage_not_configured' }, 503);
  const id = c.req.param('id');
  const existing = await c.env.MUSIC_JOBS.get(musicJobKey(id, 'status.json'));
  if (!existing) return c.json({ error: 'job_not_found' }, 404);
  const current = (await existing.json()) as Record<string, unknown>;
  const patch = await c.req.json<Record<string, unknown>>();
  const allowed = Object.fromEntries(
    Object.entries(patch).filter(([key]) =>
      ['state', 'progress', 'stage', 'result', 'error'].includes(key),
    ),
  );
  const next = { ...current, ...allowed, id, updatedAt: nowIso() };
  await c.env.MUSIC_JOBS.put(musicJobKey(id, 'status.json'), JSON.stringify(next), {
    httpMetadata: { contentType: 'application/json' },
  });
  return c.json(next);
});

const DudeChatSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.string().max(20).optional(),
        content: z.string().max(4000).optional(),
      }),
    )
    .max(20)
    .default([]),
});

app.post('/dude/chat', async (c) => {
  const ownerEmail = c.env.OWNER_EMAIL ?? 'mr.jwswain@gmail.com';
  const requesterEmail = extractOwnerEmail(c.req.raw.headers);
  if (!isOwnerEmailAllowed(requesterEmail, ownerEmail)) {
    return c.json({ error: 'owner_email_required' }, 403);
  }

  const body = DudeChatSchema.parse(await c.req.json());
  const learned = shouldPersistLearning(body.message);
  if (learned) {
    await c.env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS dude_memory (
        id TEXT PRIMARY KEY,
        owner_email TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    ).run();
    await c.env.DB.prepare(
      `INSERT INTO dude_memory (id, owner_email, content, created_at) VALUES (?1, ?2, ?3, ?4)`,
    )
      .bind(crypto.randomUUID(), ownerEmail, learned, nowIso())
      .run();
  }

  const rows = await c.env.DB.prepare(
    `SELECT content FROM dude_memory WHERE owner_email = ?1 ORDER BY created_at DESC LIMIT 12`,
  )
    .bind(ownerEmail)
    .all<{ content: string }>()
    .catch(() => ({ results: [] as Array<{ content: string }> }));

  const messages = toDudeMessages({
    ownerEmail,
    message: body.message,
    history: body.history,
    memories: rows.results?.map((row) => row.content) ?? [],
  });

  if (!c.env.AI) {
    return c.json({
      reply:
        'DUDE cloud brain is wired, but the Cloudflare Workers AI binding is not enabled on this deployment yet.',
      learned: Boolean(learned),
    });
  }

  const ai = c.env.AI as unknown as {
    run: (model: string, input: Record<string, unknown>) => Promise<{ response?: string } | string>;
  };
  const result = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages,
    max_tokens: 700,
  });
  const reply = typeof result === 'string' ? result : result.response;
  return c.json({
    reply: reply ?? 'No response from DUDE cloud brain.',
    learned: Boolean(learned),
  });
});

const DudeLearnSchema = z.object({
  content: z.string().min(3).max(4000),
  source: z.string().min(1).max(120).default('local-runner'),
});

app.post('/dude/learn', async (c) => {
  const ownerEmail = c.env.OWNER_EMAIL ?? 'mr.jwswain@gmail.com';
  const requesterEmail = extractOwnerEmail(c.req.raw.headers);
  const syncToken = c.req.header('x-dude-sync-token');
  const allowed =
    isOwnerEmailAllowed(requesterEmail, ownerEmail) ||
    isSyncTokenAllowed(syncToken, c.env.DUDE_SYNC_TOKEN);
  if (!allowed) return c.json({ error: 'owner_or_sync_token_required' }, 403);

  const body = DudeLearnSchema.parse(await c.req.json());
  await c.env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS dude_memory (
      id TEXT PRIMARY KEY,
      owner_email TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
  ).run();
  await c.env.DB.prepare(
    `INSERT INTO dude_memory (id, owner_email, content, created_at) VALUES (?1, ?2, ?3, ?4)`,
  )
    .bind(crypto.randomUUID(), ownerEmail, `[${body.source}] ${body.content}`, nowIso())
    .run();
  return c.json({ ok: true });
});

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
  adsense_client_id: z.string().max(128).nullable().default(null),
  adsense_enabled: z.boolean().default(false),
  ga_property_id: z.string().max(128).nullable().default(null),
  revenue_last_30d_cents: z.number().int().nonnegative().nullable().default(null),
  revenue_source: z.string().max(64).nullable().default(null),
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
    adsense_client_id: body.adsense_client_id,
    adsense_enabled: body.adsense_enabled ? 1 : 0,
    ga_property_id: body.ga_property_id,
    revenue_last_30d_cents: body.revenue_last_30d_cents,
    revenue_source: body.revenue_source,
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
      adsense_client_id: null,
      adsense_enabled: 0,
      ga_property_id: null,
      revenue_last_30d_cents: null,
      revenue_source: null,
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

app.get('/ops/sites/overview', async (c) => {
  const [sites, bridgeSnapshots, zoneSnapshots] = await Promise.all([
    listSites(c.env),
    listLatestBridgeSnapshots(c.env),
    listLatestZoneSnapshots(c.env),
  ]);

  const overview = sites.map((site) => {
    const bridge =
      bridgeSnapshots.find((snapshot) => snapshot.site_id === site.id) ??
      bridgeSnapshots.find((snapshot) => snapshot.origin === (site.bridge_origin ?? site.url)) ??
      null;
    const zone =
      zoneSnapshots.find((snapshot) => snapshot.site_id === site.id) ??
      zoneSnapshots.find((snapshot) => snapshot.zone_id === site.cloudflare_zone_id) ??
      null;

    const traffic = extractTraffic(zone?.analytics_json ? JSON.parse(zone.analytics_json) : null);
    const bridgeConfig = bridge?.config_json ? JSON.parse(bridge.config_json) : null;
    const selectors = bridge?.selector_status_json ? JSON.parse(bridge.selector_status_json) : {};
    const adsenseSignals = extractAdsenseSignals({
      configuredClientId: site.adsense_client_id,
      configuredEnabled: site.adsense_enabled === 1,
      bridgeConfig,
      selectors,
    });

    return {
      site,
      traffic: {
        ...traffic,
        capturedAt: zone?.captured_at ?? null,
      },
      monetization: {
        revenueLast30dCents: site.revenue_last_30d_cents,
        revenueSource: site.revenue_source,
        adsenseClientId: site.adsense_client_id,
        adsenseEnabled: site.adsense_enabled === 1,
        gaPropertyId: site.ga_property_id,
        lastBridgeInspectionAt: bridge?.inspected_at ?? null,
        pageStatus: bridge?.page_status ?? null,
        adsense: adsenseSignals,
      },
      workspace: {
        key: site.workspace_key,
        path: site.workspace_path,
        editSurfaces: JSON.parse(site.edit_surfaces || '[]'),
        criticalRoutes: JSON.parse(site.critical_routes || '[]'),
      },
    };
  });

  return c.json({ overview });
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

app.post('/sites/:id/adsense/restart', async (c) => {
  const siteId = c.req.param('id');
  const site = await getSite(c.env, siteId);
  if (!site) return c.json({ error: 'not_found' }, 404);

  const origin = site.bridge_origin ?? site.url;
  const inspection = await inspectBridge(origin);
  await insertBridgeSnapshot({
    env: c.env,
    siteId: site.id,
    origin,
    pageStatus: inspection.pageStatus,
    assetUrl: inspection.assetUrl,
    config: inspection.config,
    endpointStatus: inspection.endpointStatus,
    selectorStatus: inspection.selectorStatus,
    error: inspection.error ?? null,
  });

  const adsenseSignals = extractAdsenseSignals({
    configuredClientId: site.adsense_client_id,
    configuredEnabled: site.adsense_enabled === 1,
    bridgeConfig: inspection.config,
    selectors: inspection.selectorStatus,
  });

  let deploy: { ok: boolean; status: number | string } | null = null;
  if (
    site.deploy_hook_url &&
    (adsenseSignals.state === 'missing' || adsenseSignals.state === 'issue')
  ) {
    deploy = await runDeployHook({
      env: c.env,
      siteId: site.id,
      deployHookUrl: site.deploy_hook_url,
    });
  }

  await insertAudit({
    env: c.env,
    actor: 'owner',
    action: 'site.adsense.restart',
    target: `site:${site.id}`,
    diff: {
      inspectedOrigin: origin,
      adsenseState: adsenseSignals.state,
      deployTriggered: Boolean(deploy),
    },
  });

  return c.json({
    ok: true,
    inspection,
    adsense: adsenseSignals,
    deploy,
  });
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
  } else if (lower.includes('adsense') || lower.includes('ads')) {
    parsedAction = 'adsense_status';
    if (!site) return c.json({ error: 'site_required_for_adsense' }, 400);
    const origin = site.bridge_origin ?? site.url;
    const inspection = await inspectBridge(origin);
    result = {
      inspection,
      adsense: extractAdsenseSignals({
        configuredClientId: site.adsense_client_id,
        configuredEnabled: site.adsense_enabled === 1,
        bridgeConfig: inspection.config,
        selectors: inspection.selectorStatus,
      }),
    };
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
    adsense_client_id: null,
    adsense_enabled: 0,
    ga_property_id: null,
    revenue_last_30d_cents: null,
    revenue_source: null,
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

function extractTraffic(analytics: any): {
  requests24h: number | null;
  pageviews24h: number | null;
  visitors24h: number | null;
  bandwidth24h: number | null;
} {
  if (!analytics) {
    return {
      requests24h: null,
      pageviews24h: null,
      visitors24h: null,
      bandwidth24h: null,
    };
  }

  const totals = analytics?.result?.totals ?? analytics?.totals ?? analytics?.result ?? analytics;
  const requests24h = pickNumber(totals, [['requests', 'all'], ['requests']]);
  const pageviews24h = pickNumber(totals, [['pageviews', 'all'], ['pageviews']]);
  const visitors24h = pickNumber(totals, [
    ['uniques', 'all'],
    ['uniques'],
    ['visits', 'all'],
    ['visits'],
  ]);
  const bandwidth24h = pickNumber(totals, [['bandwidth', 'all'], ['bandwidth']]);

  return { requests24h, pageviews24h, visitors24h, bandwidth24h };
}

function pickNumber(input: any, paths: string[][]): number | null {
  for (const path of paths) {
    let current = input;
    for (const key of path) {
      current = current?.[key];
    }
    if (typeof current === 'number' && Number.isFinite(current)) {
      return current;
    }
  }
  return null;
}

function extractAdsenseSignals(params: {
  configuredClientId: string | null;
  configuredEnabled: boolean;
  bridgeConfig: any;
  selectors: Record<string, unknown>;
}) {
  const bridgeAdsense = params.bridgeConfig?.adsense ?? {};
  const scriptPresent = Boolean(bridgeAdsense.scriptPresent);
  const bridgeClientId =
    typeof bridgeAdsense.clientId === 'string' && bridgeAdsense.clientId.length > 0
      ? bridgeAdsense.clientId
      : null;
  const adSlotsDetected = Object.values(params.selectors ?? {}).some(Boolean);
  const configured = params.configuredEnabled || Boolean(params.configuredClientId);

  let state: 'live' | 'issue' | 'configured' | 'missing' = 'missing';
  if (scriptPresent && adSlotsDetected) {
    state = 'live';
  } else if (configured && (scriptPresent || adSlotsDetected || bridgeClientId)) {
    state = 'issue';
  } else if (configured) {
    state = 'configured';
  }

  return {
    state,
    scriptPresent,
    adSlotsDetected,
    bridgeClientId,
    configuredClientId: params.configuredClientId,
  };
}
