export type Site = {
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
  enabled: number;
  created_at: string;
  updated_at: string;
};

export type BridgeSnapshot = {
  site_id: string | null;
  origin: string;
  inspected_at: string;
  config_json: string;
  endpoint_status_json: string;
  selector_status_json: string;
  page_status: number | null;
  asset_url: string | null;
  error: string | null;
};

export type ZoneSummary = {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
};

const API_BASE =
  import.meta.env.VITE_API_BASE?.toString() || 'https://apex-citadel-api.mr-jwswain.workers.dev';

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`api:${res.status}:${text || res.statusText}`);
  }
  return res.json();
}

export async function getStats(): Promise<{
  sites: number;
  openIncidents: number;
  bridgeEnabledSites: number;
  commandRuns: number;
}> {
  return apiFetch('/stats');
}

export async function listSites(): Promise<{ sites: Site[] }> {
  return apiFetch('/sites');
}

export async function getSite(id: string): Promise<any> {
  return apiFetch(`/sites/${encodeURIComponent(id)}`);
}

export async function upsertSite(input: {
  id?: string;
  name: string;
  url: string;
  tags?: string[];
  deploy_hook_url?: string | null;
  enabled?: boolean;
}): Promise<{ ok: boolean; id: string }> {
  return apiFetch('/sites', { method: 'POST', body: JSON.stringify(input) });
}

export async function deleteSite(id: string): Promise<{ ok: boolean }> {
  return apiFetch(`/sites/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function runSiteChecks(id: string): Promise<any> {
  return apiFetch(`/sites/${encodeURIComponent(id)}/run`, { method: 'POST', body: '{}' });
}

export async function runDeployHook(id: string): Promise<any> {
  return apiFetch(`/sites/${encodeURIComponent(id)}/playbooks/deploy-hook`, {
    method: 'POST',
    body: '{}',
  });
}

export async function getCatalog(): Promise<{ catalog: any[]; sites: Site[] }> {
  return apiFetch('/ops/catalog');
}

export async function seedNetwork(): Promise<{ ok: boolean; seeded: number }> {
  return apiFetch('/ops/seed-network', { method: 'POST', body: '{}' });
}

export async function listZones(): Promise<{ zones: ZoneSummary[]; error?: string }> {
  return apiFetch('/ops/zones');
}

export async function getZoneAnalytics(zoneId: string): Promise<any> {
  return apiFetch(`/ops/analytics/${encodeURIComponent(zoneId)}`);
}

export async function listZoneSnapshots(): Promise<{ snapshots: any[] }> {
  return apiFetch('/ops/analytics');
}

export async function inspectBridge(origin: string): Promise<any> {
  const encoded = encodeURIComponent(origin);
  return apiFetch(`/ops/bridge-inspect?origin=${encoded}`);
}

export async function listBridgeSnapshots(): Promise<{ snapshots: BridgeSnapshot[] }> {
  return apiFetch('/ops/bridges');
}

export async function runNaturalCommand(input: {
  siteId?: string | null;
  command: string;
}): Promise<{ parsedAction: string; result: any }> {
  return apiFetch('/ops/command', {
    method: 'POST',
    body: JSON.stringify({
      siteId: input.siteId ?? null,
      command: input.command,
    }),
  });
}
