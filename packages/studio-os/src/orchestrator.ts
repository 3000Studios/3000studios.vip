import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { requiresApproval } from './approvals.js';
import { recordCost } from './accounting.js';
import type { StudioOsConfig } from './config.js';
import { selectCheapestWorker, type WorkerOffer } from './cost/router.js';
import { runWithFallback } from './fallback/router.js';
import { appendLog } from './logging.js';
import { ffprobeJson } from './workers/ffmpeg.js';
import { applyIngest, writeCampaign } from './workers/deterministic.js';
import { workerOffers } from './workers/probe.js';
import { RELEASE_TASKS, topoSort } from './pipeline/release-graph.js';
import type { JobRecord, TaskDef, TaskResult } from './schema/job.js';
import type { ReleaseManifest } from './schema/manifest.js';
import { loadJob, saveJob } from './store/job-store.js';
import { createManifest, saveManifest } from './store/manifest-store.js';
import { upsertFromManifest } from './webmaster/catalog.js';
import { probeAudio, loudnessSummary, waveformPeaks } from './workers/ffmpeg-tasks.js';

function offersFor(task: TaskDef, all: WorkerOffer[]): WorkerOffer[] {
  const preferred = new Set(task.preferredWorkers);
  const matched = all.filter((o) => preferred.has(o.id));
  return matched.length ? matched : all.filter((o) => o.costClass === 0);
}

async function executeTask(
  config: StudioOsConfig,
  task: TaskDef,
  manifest: ReleaseManifest,
  payload: Record<string, unknown>,
): Promise<{ result: TaskResult; manifest: ReleaseManifest }> {
  const all = workerOffers(config);
  const chain = offersFor(task, all);
  const cheapest = selectCheapestWorker(chain);

  if (requiresApproval(task.id, config.requireApproval) && payload.approved !== true) {
    return {
      manifest,
      result: {
        status: 'blocked_approval',
        worker: cheapest.id,
        costClass: cheapest.costClass,
        output: { needs: 'owner approval' },
      },
    };
  }

  const started = Date.now();
  const { result: execOut, used } = await runWithFallback(chain, async (offer) => {
    switch (task.id) {
      case 'ingest_master': {
        const master = typeof payload.master_path === 'string' ? payload.master_path : undefined;
        return applyIngest(manifest, master);
      }
      case 'audio_qc': {
        const file = manifest.audio.master?.path;
        if (!file || !fs.existsSync(file)) {
          manifest.audio.qc_status = 'fail';
          return manifest;
        }
        const probe = probeAudio(config, file);
        const json = ffprobeJson(config, file);
        if (json) {
          const format = json.format as { duration?: string } | undefined;
          if (format?.duration) manifest.audio.duration = Number(format.duration);
        }
        if (probe?.sampleRate) manifest.audio.sample_rate = probe.sampleRate;
        if (probe?.checksum) manifest.audio.checksum = probe.checksum;
        const lufs = loudnessSummary(config, file);
        if (lufs != null) manifest.audio.loudness = lufs;
        manifest.audio.qc_status = 'pass';
        return manifest;
      }
      case 'metadata': {
        manifest.metadata.title = manifest.title;
        manifest.metadata.artist = manifest.artist;
        return manifest;
      }
      case 'lyrics': {
        if (manifest.lyrics.final) manifest.lyrics.status = 'complete';
        else manifest.lyrics.status = 'pending';
        return manifest;
      }
      case 'artwork': {
        if (manifest.artwork.status === 'complete' && manifest.artwork.qc_status === 'pass') {
          return manifest;
        }
        const existing = typeof payload.artwork_path === 'string' ? payload.artwork_path : undefined;
        if (existing && fs.existsSync(existing)) {
          manifest.artwork.status = 'complete';
          manifest.artwork.qc_status = 'pass';
          manifest.artwork.dimensions = '3000x3000';
        }
        return manifest;
      }
      case 'website': {
        const master = typeof payload.master_path === 'string' ? payload.master_path : manifest.audio.master?.path;
        const peaks = master ? waveformPeaks(config, master) : null;
        const { entry } = upsertFromManifest(config, manifest, {
          src: extrasSrc(payload),
          cover: extrasCover(payload),
          youtubeId: extrasYoutube(payload),
          waveform: peaks ?? undefined,
          duration: manifest.audio.duration ? formatDuration(manifest.audio.duration) : undefined,
        });
        manifest.website.release_page = `/song/${entry.slug}`;
        manifest.website.artwork = entry.cover;
        manifest.website.player = entry.src;
        manifest.website.seo = `/song/${entry.slug}`;
        manifest.website.deployment_status = 'prepared';
        return manifest;
      }
      case 'distribution': {
        manifest.distribution.status = 'prepared';
        manifest.distribution.distributor = 'DistroKid';
        return manifest;
      }
      case 'promotion': {
        const dir = path.join(config.repoRoot, 'promotion', 'campaigns', manifest.slug);
        manifest.promotion = writeCampaign(dir, manifest) as typeof manifest.promotion;
        return manifest;
      }
      case 'quality_control': {
        return manifest;
      }
      case 'approval_gate':
      case 'publish': {
        if (payload.approved === true && task.id === 'publish') {
          manifest.status = 'published';
        }
        return manifest;
      }
      case 'analytics': {
        return manifest;
      }
      default: {
        return manifest;
      }
    }
  });

  manifest = execOut;
  const execution_ms = Date.now() - started;
  recordCost(config, {
    at: new Date().toISOString(),
    job_id: String(payload.job_id ?? ''),
    task: task.id,
    provider: used.id,
    model_or_tool: used.id,
    cost_class: used.costClass,
    estimated_cost_usd: 0,
    execution_ms,
  });

  return {
    manifest,
    result: {
      status: 'completed',
      worker: used.id,
      costClass: used.costClass,
      output: { stage: task.stage },
    },
  };
}

export async function runReleaseJob(
  config: StudioOsConfig,
  input: {
    title: string;
    slug?: string;
    master_path?: string;
    artwork_path?: string;
    approved?: boolean;
    job_id?: string;
    resume_job_id?: string;
    web_src?: string;
    web_cover?: string;
    youtube_id?: string;
  },
): Promise<JobRecord> {
  const slug = input.slug || input.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const job_id = input.resume_job_id || input.job_id || crypto.randomUUID();
  let job = input.resume_job_id ? loadJob(config, input.resume_job_id) : null;
  if (!job) {
    job = {
      job_id,
      type: 'release',
      release_id: slug,
      status: 'running',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payload: { ...input, slug },
      tasks: {},
    };
  }
  job.status = 'running';
  let manifest = createManifest(config, {
    release_id: slug,
    slug,
    title: input.title,
  });

  const order = topoSort(RELEASE_TASKS);
  for (const task of order) {
    const prior = job.tasks[task.id];
    if (prior?.status === 'completed') continue;
    const depFailed = task.dependsOn.some((id) => job.tasks[id]?.status === 'failed');
    if (depFailed) {
      job.tasks[task.id] = {
        status: 'skipped',
        worker: 'deterministic',
        costClass: 0,
        skippedReason: 'dependency failed',
        retry_count: 0,
      };
      continue;
    }

    const started_at = new Date().toISOString();
    try {
      const { result, manifest: next } = await executeTask(config, task, manifest, {
        ...input,
        job_id,
      });
      manifest = next;
      job.tasks[task.id] = { ...result, retry_count: prior?.retry_count ?? 0 };
      if (result.status === 'completed') {
        if (!manifest.workflow.completed_tasks.includes(task.id)) {
          manifest.workflow.completed_tasks.push(task.id);
        }
        manifest.workflow.failed_tasks = manifest.workflow.failed_tasks.filter((id) => id !== task.id);
        manifest.workflow.current_stage = task.stage;
      } else if (result.status === 'blocked_approval') {
        job.status = 'blocked_approval';
        manifest.status = 'awaiting_publish_approval';
        saveManifest(config, manifest);
        saveJob(config, job);
        appendLog(config, {
          job_id,
          release_id: slug,
          agent: task.agent,
          worker: result.worker,
          task: task.id,
          started_at,
          finished_at: new Date().toISOString(),
          status: result.status,
          cost_class: result.costClass,
          retry_count: job.tasks[task.id].retry_count,
          output: result.output,
        });
        return job;
      }
      appendLog(config, {
        job_id,
        release_id: slug,
        agent: task.agent,
        worker: result.worker,
        task: task.id,
        started_at,
        finished_at: new Date().toISOString(),
        status: result.status,
        cost_class: result.costClass,
        retry_count: job.tasks[task.id].retry_count,
        output: result.output,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      job.tasks[task.id] = {
        status: 'failed',
        worker: 'fallback',
        costClass: 0,
        error: message,
        retry_count: (prior?.retry_count ?? 0) + 1,
      };
      if (!manifest.workflow.failed_tasks.includes(task.id)) manifest.workflow.failed_tasks.push(task.id);
      manifest.workflow.retries[task.id] = job.tasks[task.id].retry_count;
      appendLog(config, {
        job_id,
        release_id: slug,
        agent: task.agent,
        worker: 'fallback',
        task: task.id,
        started_at,
        finished_at: new Date().toISOString(),
        status: 'failed',
        cost_class: 0,
        retry_count: job.tasks[task.id].retry_count,
        error: message,
      });
    }
    saveManifest(config, manifest);
    saveJob(config, job);
  }

  const failed = Object.values(job.tasks).some((t) => t.status === 'failed');
  job.status = failed ? 'failed' : 'completed';
  saveJob(config, job);
  saveManifest(config, manifest);
  return job;
}

function extrasSrc(payload: Record<string, unknown>) {
  return typeof payload.web_src === 'string' ? payload.web_src : undefined;
}
function extrasCover(payload: Record<string, unknown>) {
  return typeof payload.web_cover === 'string' ? payload.web_cover : undefined;
}
function extrasYoutube(payload: Record<string, unknown>) {
  return typeof payload.youtube_id === 'string' ? payload.youtube_id : undefined;
}
function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
