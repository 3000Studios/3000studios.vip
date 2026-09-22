import fs from 'node:fs';
import path from 'node:path';
import type { StudioOsConfig } from '../config.js';
import { writeJson } from '../store/json-store.js';

export type SiteAudit = {
  at: string;
  siteUrl: string;
  checks: Array<{ id: string; ok: boolean; detail: string }>;
};

export function auditWebsiteLocal(config: StudioOsConfig): SiteAudit {
  const webPublic = path.join(config.repoRoot, 'apps', 'web', 'public');
  const checks = [
    {
      id: 'robots',
      ok: fs.existsSync(path.join(webPublic, 'robots.txt')),
      detail: 'apps/web/public/robots.txt',
    },
    {
      id: 'sitemap',
      ok: fs.existsSync(path.join(webPublic, 'sitemap.xml')),
      detail: 'apps/web/public/sitemap.xml',
    },
    {
      id: 'ads_txt',
      ok: fs.existsSync(path.join(webPublic, 'ads.txt')),
      detail: 'apps/web/public/ads.txt',
    },
    {
      id: 'headers',
      ok: fs.existsSync(path.join(webPublic, '_headers')),
      detail: 'apps/web/public/_headers',
    },
    {
      id: 'web_package',
      ok: fs.existsSync(path.join(config.repoRoot, 'apps', 'web', 'package.json')),
      detail: 'production website remains apps/web',
    },
  ];
  const report: SiteAudit = {
    at: new Date().toISOString(),
    siteUrl: config.siteUrl,
    checks,
  };
  const outDir = path.join(config.repoRoot, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  writeJson(path.join(outDir, 'website-audit-latest.json'), report);
  return report;
}
