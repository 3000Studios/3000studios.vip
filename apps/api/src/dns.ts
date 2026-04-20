export type DnsAnswer = { name: string; type: number; TTL: number; data: string };

export async function queryDnsJson(name: string, type: string): Promise<{ Answer?: DnsAnswer[] }> {
  const url = new URL('https://cloudflare-dns.com/dns-query');
  url.searchParams.set('name', name);
  url.searchParams.set('type', type);
  const res = await fetch(url.toString(), {
    headers: { accept: 'application/dns-json' },
  });
  if (!res.ok) throw new Error(`dns_query_failed:${res.status}`);
  return (await res.json()) as { Answer?: DnsAnswer[] };
}

