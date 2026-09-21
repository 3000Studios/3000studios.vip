import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { StudioOsConfig } from '../config.js';

/** Wraps the existing pipeline Whisper script. Does not invent a second engine. */
export function transcribeWithPipeline(config: StudioOsConfig, wavPath: string): string | null {
  const script = path.join(
    process.env.USERPROFILE ?? '',
    'Music',
    '3000-Studios-Music-Pipeline',
    'scripts',
    'transcribe_wav.py',
  );
  if (!fs.existsSync(script) || !fs.existsSync(wavPath)) return null;
  const py =
    process.env.SONG_DROP_PYTHON ||
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python310', 'python.exe');
  const r = spawnSync(py, [script, wavPath], { encoding: 'utf8', timeout: 180000 });
  if (r.status !== 0) return null;
  const text = (r.stdout || '').trim();
  return text || null;
}
