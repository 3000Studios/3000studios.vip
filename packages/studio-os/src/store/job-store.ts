import path from 'node:path';
import type { StudioOsConfig } from '../config.js';
import type { JobRecord } from '../schema/job.js';
import { readJson, writeJson } from './json-store.js';

export function jobPath(config: StudioOsConfig, jobId: string) {
  return path.join(config.dataDir, 'jobs', `${jobId}.json`);
}

export function loadJob(config: StudioOsConfig, jobId: string): JobRecord | null {
  const file = jobPath(config, jobId);
  return readJson<JobRecord | null>(file, null);
}

export function saveJob(config: StudioOsConfig, job: JobRecord) {
  job.updated_at = new Date().toISOString();
  writeJson(jobPath(config, job.job_id), job);
}
