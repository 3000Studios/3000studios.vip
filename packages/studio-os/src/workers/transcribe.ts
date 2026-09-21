import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type { StudioOsConfig } from '../config.js';

/** Wraps the existing pipeline Whisper script. Does not invent a second engine. */
export function transcribeWithPipeline(
  config: StudioOsConfig,
  wavPath: string,
  opts?: { outPath?: string; skipIfComplete?: boolean },
): { text: string | null; skipped: boolean; error?: string } {
  const script = path.join(
    process.env.USERPROFILE ?? '',
    'Music',
    '3000-Studios-Music-Pipeline',
    'scripts',
    'transcribe_wav.py',
  );
  if (!fs.existsSync(script)) return { text: null, skipped: false, error: 'script missing' };
  if (!fs.existsSync(wavPath)) return { text: null, skipped: false, error: 'audio missing' };
  const outPath = opts?.outPath || path.join(config.dataDir, 'transcripts', `${path.basename(wavPath)}.txt`);
  if (opts?.skipIfComplete !== false && fs.existsSync(outPath) && fs.statSync(outPath).size > 20) {
    return { text: fs.readFileSync(outPath, 'utf8').trim(), skipped: true };
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const py =
    process.env.SONG_DROP_PYTHON ||
    path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Python', 'Python310', 'python.exe');
  const r = spawnSync(py, [script, wavPath, outPath], { encoding: 'utf8', timeout: 180000 });
  if (r.status !== 0) {
    return { text: null, skipped: false, error: (r.stderr || r.stdout || 'transcribe failed').slice(0, 400) };
  }
  const text = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8').trim() : (r.stdout || '').trim();
  return { text: text || null, skipped: false };
}
