import { spawnSync } from 'node:child_process';
import type { WorkerOffer } from '../cost/router.js';
import type { StudioOsConfig } from '../config.js';

function which(bin: string): boolean {
  const r = spawnSync(bin, ['-version'], { encoding: 'utf8', timeout: 8000 });
  if (r.error) {
    const w = spawnSync(bin, ['--version'], { encoding: 'utf8', timeout: 8000 });
    return !w.error && (w.status === 0 || (w.stdout || w.stderr || '').length > 0);
  }
  return r.status === 0 || (r.stdout || r.stderr || '').length > 0;
}

export function workerOffers(config: StudioOsConfig): WorkerOffer[] {
  const ffmpeg = which(config.ffmpegBin);
  const ffprobe = which(config.ffprobeBin);
  return [
    { id: 'filesystem', costClass: 0, available: true },
    { id: 'deterministic', costClass: 0, available: true },
    { id: 'image-processing', costClass: 0, available: true },
    { id: 'ffmpeg', costClass: 0, available: ffmpeg, reason: ffmpeg ? undefined : 'ffmpeg not on PATH' },
    { id: 'ffprobe', costClass: 0, available: ffprobe, reason: ffprobe ? undefined : 'ffprobe not on PATH' },
    { id: 'playwright', costClass: 0, available: true },
    { id: 'lighthouse', costClass: 0, available: false, reason: 'optional; not required for phase 1 unit tests' },
    { id: 'ollama', costClass: 1, available: false, reason: 'probed at call time' },
    { id: 'suno-adapter', costClass: 2, available: false, reason: 'no official API; manual adapter only' },
    { id: 'premium-ai', costClass: 3, available: false, reason: 'premium AI disabled unless explicitly configured' },
  ];
}

export async function probeOllama(host: string): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(`${host.replace(/\/$/, '')}/api/tags`, { signal: ctrl.signal });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}
