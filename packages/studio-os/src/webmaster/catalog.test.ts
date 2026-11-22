import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { emptyManifest } from '../schema/manifest.js';
import type { StudioOsConfig } from '../config.js';
import { upsertFromManifest, loadCatalog } from './catalog.js';
import { normalizeBands } from '../audio/normalize.js';

const tmp: string[] = [];

function cfg(): StudioOsConfig {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'webmaster-'));
  tmp.push(root);
  fs.mkdirSync(path.join(root, 'apps', 'web', 'src', 'data'), { recursive: true });
  return {
    repoRoot: root,
    dataDir: path.join(root, 'data'),
    musicReleasesDir: path.join(root, 'releases'),
    mediaStoreRoot: root,
    ollamaHost: 'http://127.0.0.1:9',
    ollamaModel: 'none',
    ffmpegBin: 'ffmpeg',
    ffprobeBin: 'ffprobe',
    requireApproval: true,
    siteUrl: 'https://3000studios.vip',
    webDataDir: path.join(root, 'apps', 'web', 'src', 'data'),
  };
}

afterEach(() => {
  for (const d of tmp.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

describe('webmaster catalog', () => {
  it('upserts once then is idempotent', () => {
    const config = cfg();
    const m = emptyManifest({ release_id: 'ngut', slug: 'not-giving-up-tonight', title: 'Not Giving Up Tonight' });
    const a = upsertFromManifest(config, m, { src: '/media/not-giving-up-tonight.mp3', cover: '/media/covers/not-giving-up-tonight.jpg' });
    expect(a.wrote).toBe(true);
    const b = upsertFromManifest(config, m, { src: '/media/not-giving-up-tonight.mp3', cover: '/media/covers/not-giving-up-tonight.jpg' });
    expect(b.wrote).toBe(false);
    expect(loadCatalog(config)).toHaveLength(1);
  });
});

describe('analyzer normalize', () => {
  it('returns 0-1 bands', () => {
    const f = normalizeBands([0.2, 0.9, 0.1, 0.4, 0.8]);
    expect(f.bass).toBeGreaterThanOrEqual(0);
    expect(f.energy).toBeLessThanOrEqual(1);
    expect(f.spectrum.length).toBe(5);
  });
});
