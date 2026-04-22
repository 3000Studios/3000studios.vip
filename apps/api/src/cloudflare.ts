import type { Env } from './env';

type ZoneSummary = {
  id: string;
  name: string;
  status: string;
  name_servers: string[];
};

export async function listManagedZones(env: Env): Promise<ZoneSummary[]> {
  if (!env.CLOUDFLARE_API_TOKEN || !env.CLOUDFLARE_ACCOUNT_ID) {
    return [];
  }

  const url = new URL('https://api.cloudflare.com/client/v4/zones');
  url.searchParams.set('per_page', '100');
  const res = await fetch(url.toString(), {
    headers: {
      authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'content-type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`cloudflare_zones_failed:${res.status}`);
  }
  const json = (await res.json()) as { result?: ZoneSummary[] };
  return json.result ?? [];
}

export async function getZoneDashboard(env: Env, zoneId: string): Promise<unknown> {
  if (!env.CLOUDFLARE_API_TOKEN) {
    throw new Error('cloudflare_token_missing');
  }
  const url = `https://api.cloudflare.com/client/v4/zones/${zoneId}/analytics/dashboard`;
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'content-type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`cloudflare_dashboard_failed:${res.status}`);
  }
  return await res.json();
}

