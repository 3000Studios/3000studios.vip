import type { Env } from './env';
import { insertAudit } from './store';

export async function runDeployHook(params: {
  env: Env;
  siteId: string;
  deployHookUrl: string;
}): Promise<{ ok: boolean; status: string }> {
  try {
    const res = await fetch(params.deployHookUrl, { method: 'POST' });
    await insertAudit({
      env: params.env,
      actor: 'owner',
      action: 'playbook.deploy_hook',
      target: `site:${params.siteId}`,
      diff: { deployHookUrl: redactUrl(params.deployHookUrl), status: res.status },
    });
    return res.ok ? { ok: true, status: `hook_triggered:${res.status}` } : { ok: false, status: `hook_failed:${res.status}` };
  } catch (e) {
    await insertAudit({
      env: params.env,
      actor: 'owner',
      action: 'playbook.deploy_hook',
      target: `site:${params.siteId}`,
      diff: { error: e instanceof Error ? e.message : 'unknown_error' },
    });
    return { ok: false, status: 'hook_error' };
  }
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = '';
    return u.toString();
  } catch {
    return 'invalid_url';
  }
}

