import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { transcribeWithPipeline } from './transcribe.js';
import type { StudioOsConfig } from '../config.js';

function cfg(root: string): StudioOsConfig {
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
    webDataDir: path.join(root, 'data'),
  };
}

describe('transcribe wrapper', () => {
  it('fails closed when audio missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tx-'));
    const r = transcribeWithPipeline(cfg(root), path.join(root, 'nope.wav'));
    expect(r.text).toBeNull();
    expect(r.skipped).toBe(false);
    expect(r.error).toMatch(/missing/);
    fs.rmSync(root, { recursive: true, force: true });
  });

  it('skips when transcript already complete', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'tx-'));
    const wav = path.join(root, 'clip.wav');
    fs.writeFileSync(wav, 'xxxx');
    const out = path.join(root, 'data', 'transcripts', 'clip.wav.txt');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, 'already transcribed lyrics for skip test\n');
    const r = transcribeWithPipeline(cfg(root), wav, { outPath: out, skipIfComplete: true });
    expect(r.skipped).toBe(true);
    expect(r.text).toMatch(/already transcribed/);
    fs.rmSync(root, { recursive: true, force: true });
  });
});
