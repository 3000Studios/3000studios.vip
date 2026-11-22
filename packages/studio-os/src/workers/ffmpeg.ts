import { spawnSync } from 'node:child_process';
import type { StudioOsConfig } from '../config.js';

export function ffmpegVersion(config: StudioOsConfig): string | null {
  const r = spawnSync(config.ffmpegBin, ['-version'], { encoding: 'utf8', timeout: 8000 });
  if (r.error || r.status !== 0) return null;
  return (r.stdout || '').split(/\r?\n/)[0] ?? null;
}

export function ffprobeJson(config: StudioOsConfig, file: string): Record<string, unknown> | null {
  const r = spawnSync(
    config.ffprobeBin,
    ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file],
    { encoding: 'utf8', timeout: 20000 },
  );
  if (r.error || r.status !== 0) return null;
  try {
    return JSON.parse(r.stdout) as Record<string, unknown>;
  } catch {
    return null;
  }
}
