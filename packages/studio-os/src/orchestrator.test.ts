import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { selectCheapestWorker } from './cost/router.js';
import { fallbackChain, runWithFallback } from './fallback/router.js';
import { emptyManifest, ReleaseManifestSchema } from './schema/manifest.js';
import { topoSort, RELEASE_TASKS } from './pipeline/release-graph.js';
import { AGENTS } from './agents/registry.js';
import { requiresApproval } from './approvals.js';
import { draftSongPackage } from './songwriting.js';
import { runReleaseJob } from './orchestrator.js';
import type { StudioOsConfig } from './config.js';
import { slugify } from './workers/deterministic.js';
import { auditWebsiteLocal } from './audits/website.js';
import { findRepoRoot } from './config.js';

const tmpDirs: string[] = [];

function testConfig(): StudioOsConfig {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'studio-os-'));
  tmpDirs.push(root);
  const repoRoot = findRepoRoot(process.cwd());
  const webDataDir = path.join(root, 'apps', 'web', 'src', 'data');
  fs.mkdirSync(webDataDir, { recursive: true });
  return {
    repoRoot,
    dataDir: path.join(root, 'data'),
    musicReleasesDir: path.join(root, 'releases'),
    mediaStoreRoot: root,
    ollamaHost: 'http://127.0.0.1:9',
    ollamaModel: 'none',
    ffmpegBin: 'ffmpeg',
    ffprobeBin: 'ffprobe',
    requireApproval: true,
    siteUrl: 'https://3000studios.vip',
    webDataDir,
  };
}

afterEach(() => {
  for (const d of tmpDirs.splice(0)) {
    fs.rmSync(d, { recursive: true, force: true });
  }
});

describe('cost router', () => {
  it('picks level 0 over premium', () => {
    const pick = selectCheapestWorker([
      { id: 'premium-ai', costClass: 3, available: true },
      { id: 'ffmpeg', costClass: 0, available: true },
      { id: 'ollama', costClass: 1, available: true },
    ]);
    expect(pick.id).toBe('ffmpeg');
  });
});

describe('fallback', () => {
  it('skips unavailable then succeeds', async () => {
    const { used, attempts } = await runWithFallback(
      [
        { id: 'premium-ai', costClass: 3, available: false, reason: 'off' },
        { id: 'deterministic', costClass: 0, available: true },
      ],
      async (o) => o.id,
    );
    expect(used.id).toBe('deterministic');
    expect(attempts.some((a) => a.startsWith('premium-ai:unavailable'))).toBe(true);
  });

  it('keeps preferred order', () => {
    const chain = fallbackChain([
      { id: 'a', costClass: 0, available: false },
      { id: 'b', costClass: 1, available: true },
    ]);
    expect(chain[0].id).toBe('a');
    expect(chain[1].id).toBe('b');
  });
});

describe('manifest + graph', () => {
  it('parses empty manifest', () => {
    const m = emptyManifest({ release_id: 'x', slug: 'x', title: 'X' });
    expect(ReleaseManifestSchema.parse(m).artist).toBe('3000 Studios');
  });

  it('topo-sorts dependencies before dependents', () => {
    const order = topoSort(RELEASE_TASKS).map((t) => t.id);
    expect(order.indexOf('ingest_master')).toBeLessThan(order.indexOf('audio_qc'));
    expect(order.indexOf('approval_gate')).toBeLessThan(order.indexOf('publish'));
    expect(order.indexOf('quality_control')).toBeLessThan(order.indexOf('approval_gate'));
  });

  it('registers all required agents', () => {
    const ids = AGENTS.map((a) => a.id);
    expect(ids).toContain('MASTER_ORCHESTRATOR');
    expect(ids).toContain('RECORD_ARCHITECT');
    expect(ids).toHaveLength(12);
  });
});

describe('approvals', () => {
  it('does not gate metadata', () => {
    expect(requiresApproval('metadata', true)).toBe(false);
  });
  it('gates publish', () => {
    expect(requiresApproval('publish', true)).toBe(true);
  });
});

describe('songwriting', () => {
  it('builds TITLE/LYRICS/STYLE/AVOID', () => {
    const pkg = draftSongPackage('Make me a funny Southern funk song about a wifi fridge', 'canon');
    expect(pkg.title.length).toBeGreaterThan(3);
    expect(pkg.lyrics).toMatch(/Chorus/i);
    expect(pkg.style_of_music.toLowerCase()).toMatch(/funk/);
    expect(pkg.avoid.length).toBeGreaterThan(10);
    expect(slugify(pkg.title).length).toBeGreaterThan(0);
  });
});

describe('orchestrator', () => {
  it('stops at approval gate and is resumable/idempotent', async () => {
    const config = testConfig();
    const job = await runReleaseJob(config, { title: 'Wifi Fridge Funk' });
    expect(job.status).toBe('blocked_approval');
    expect(job.tasks.ingest_master.status).toBe('completed');
    expect(job.tasks.publish).toBeUndefined();

    const again = await runReleaseJob(config, {
      title: 'Wifi Fridge Funk',
      slug: 'wifi-fridge-funk',
      resume_job_id: job.job_id,
    });
    expect(again.tasks.ingest_master.status).toBe('completed');
    expect(again.status).toBe('blocked_approval');

    const published = await runReleaseJob(config, {
      title: 'Wifi Fridge Funk',
      slug: 'wifi-fridge-funk',
      resume_job_id: job.job_id,
      approved: true,
    });
    expect(published.tasks.approval_gate.status).toBe('completed');
    expect(published.tasks.publish.status).toBe('completed');
  });
});

describe('website audit', () => {
  it('finds production public files on apps/web', () => {
    const config = testConfig();
    config.repoRoot = findRepoRoot(process.cwd());
    const report = auditWebsiteLocal(config);
    expect(report.checks.every((c) => c.ok)).toBe(true);
  });
});
