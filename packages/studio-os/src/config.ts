import fs from 'node:fs';
import path from 'node:path';

export type StudioOsConfig = {
  repoRoot: string;
  dataDir: string;
  musicReleasesDir: string;
  mediaStoreRoot: string;
  ollamaHost: string;
  ollamaModel: string;
  ffmpegBin: string;
  ffprobeBin: string;
  requireApproval: boolean;
  siteUrl: string;
  webDataDir: string;
};

function loadDotEnvFile(file: string, into: Record<string, string>) {
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in into)) into[key] = value;
  }
}

export function loadEnvMap(repoRoot: string): Record<string, string> {
  const map: Record<string, string> = { ...process.env } as Record<string, string>;
  const globalEnv = path.join(process.env.USERPROFILE ?? '', 'Documents', 'global.env');
  loadDotEnvFile(globalEnv, map);
  loadDotEnvFile(path.join(repoRoot, '.env'), map);
  return map;
}

export function findRepoRoot(start = process.cwd()): string {
  let dir = start;
  for (let i = 0; i < 12; i++) {
    if (fs.existsSync(path.join(dir, 'package.json')) && fs.existsSync(path.join(dir, 'apps', 'web'))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return start;
}

export function loadConfig(repoRoot = findRepoRoot()): StudioOsConfig {
  const env = loadEnvMap(repoRoot);
  const dataDir = path.resolve(repoRoot, env.STUDIO_OS_DATA_DIR || '.studio-os');
  return {
    repoRoot,
    dataDir,
    musicReleasesDir: path.join(repoRoot, 'music', 'releases'),
    mediaStoreRoot: env.MEDIA_STORE_ROOT || path.join(process.env.USERPROFILE ?? '', 'Music', '3000-Studios-Music-Pipeline'),
    ollamaHost: env.OLLAMA_HOST || 'http://127.0.0.1:11434',
    ollamaModel: env.OLLAMA_MODEL || 'llama3.2',
    ffmpegBin: env.FFMPEG_BIN || 'ffmpeg',
    ffprobeBin: env.FFPROBE_BIN || 'ffprobe',
    requireApproval: env.STUDIO_OS_REQUIRE_APPROVAL !== '0',
    siteUrl: env.CITADEL_LIVE_URL || 'https://3000studios.vip',
    webDataDir: path.join(repoRoot, 'apps', 'web', 'src', 'data'),
  };
}
