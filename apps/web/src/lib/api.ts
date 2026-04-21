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
  enabled: number;
  created_at: string;
  updated_at: string;
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

export async function getStats(): Promise<{ sites: number; openIncidents: number }> {
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
