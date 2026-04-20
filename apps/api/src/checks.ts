import type { CheckRow, SiteRow } from './store';
import type { CheckRunStatus } from './types';
import { fetchWithTimeout } from './http';
import { extractCanonical, extractRobots, extractTitle } from './seo';
import { queryDnsJson } from './dns';

export type CheckResult = {
  status: CheckRunStatus;
  metrics: Record<string, unknown>;
  evidence: Record<string, unknown>;
  error?: string;
};

export async function runCheck(params: {
  check: CheckRow;
  site: SiteRow;
}): Promise<CheckResult> {
  const { check, site } = params;

  if (check.type === 'uptime' || check.type === 'route') {
    const url = new URL(site.url);
    const started = Date.now();
    try {
      const res = await fetchWithTimeout(url.toString(), { redirect: 'manual' }, check.timeout_ms);
      const ms = Date.now() - started;
      const statusOk = res.status >= 200 && res.status < 400;
      const expectedStatus = site.expected_status ?? null;

      const ok =
        expectedStatus === null ? statusOk : res.status === expectedStatus || res.status === 200;

      return {
        status: ok ? 'ok' : 'fail',
        metrics: { http_status: res.status, duration_ms: ms },
        evidence: { headers: Object.fromEntries(res.headers.entries()) },
      };
    } catch (e) {
      const ms = Date.now() - started;
      return {
        status: 'fail',
        metrics: { duration_ms: ms },
        evidence: {},
        error: e instanceof Error ? e.message : 'unknown_error',
      };
    }
  }

  if (check.type === 'seo') {
    const started = Date.now();
    try {
      const res = await fetchWithTimeout(site.url, { redirect: 'follow' }, check.timeout_ms);
      const html = await res.text();
      const ms = Date.now() - started;
      const title = extractTitle(html);
      const canonical = extractCanonical(html);
      const robots = extractRobots(html);

      const titleOk = site.expected_title ? title === site.expected_title : Boolean(title);
      const canonicalOk = site.expected_canonical ? canonical === site.expected_canonical : true;
      const resOk = res.ok;

      const ok = resOk && titleOk && canonicalOk;
      const status: CheckRunStatus = ok ? 'ok' : resOk ? 'warn' : 'fail';

      return {
        status,
        metrics: {
          http_status: res.status,
          duration_ms: ms,
          has_title: Boolean(title),
          has_canonical: Boolean(canonical),
        },
        evidence: {
          title,
          canonical,
          robots,
        },
      };
    } catch (e) {
      const ms = Date.now() - started;
      return {
        status: 'fail',
        metrics: { duration_ms: ms },
        evidence: {},
        error: e instanceof Error ? e.message : 'unknown_error',
      };
    }
  }

  if (check.type === 'dns') {
    const started = Date.now();
    try {
      const hostname = new URL(site.url).hostname;
      const json = await queryDnsJson(hostname, 'A');
      const ms = Date.now() - started;
      const ips = (json.Answer ?? [])
        .filter((a) => a.type === 1)
        .map((a) => a.data)
        .slice(0, 20);
      return {
        status: ips.length > 0 ? 'ok' : 'warn',
        metrics: { duration_ms: ms, a_count: ips.length },
        evidence: { hostname, a_records: ips },
      };
    } catch (e) {
      const ms = Date.now() - started;
      return {
        status: 'fail',
        metrics: { duration_ms: ms },
        evidence: {},
        error: e instanceof Error ? e.message : 'unknown_error',
      };
    }
  }

  return {
    status: 'warn',
    metrics: {},
    evidence: { note: `unsupported_check_type:${check.type}` },
  };
}

