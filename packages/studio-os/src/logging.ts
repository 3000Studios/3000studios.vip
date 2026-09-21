import fs from 'node:fs';
import path from 'node:path';
import type { JobLog } from './schema/job.js';
import type { StudioOsConfig } from './config.js';

export function appendLog(config: StudioOsConfig, entry: JobLog) {
  fs.mkdirSync(path.join(config.dataDir, 'logs'), { recursive: true });
  const file = path.join(config.dataDir, 'logs', `${entry.job_id}.jsonl`);
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8');
}

export function readLogs(config: StudioOsConfig, jobId: string): JobLog[] {
  const file = path.join(config.dataDir, 'logs', `${jobId}.jsonl`);
  if (!fs.existsSync(file)) return [];
  return fs
    .readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as JobLog);
}
