import type { TaskDef } from '../schema/job.js';

export const RELEASE_TASKS: TaskDef[] = [
  { id: 'ingest_master', stage: 'ingest_master', agent: 'RELEASE_DIRECTOR', preferredWorkers: ['filesystem', 'deterministic'], costClass: 0, dependsOn: [] },
  { id: 'audio_qc', stage: 'audio_qc', agent: 'QUALITY_CONTROL', preferredWorkers: ['ffprobe', 'ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['ingest_master'] },
  { id: 'metadata', stage: 'metadata', agent: 'RELEASE_DIRECTOR', preferredWorkers: ['deterministic', 'ollama'], costClass: 0, dependsOn: ['ingest_master'] },
  { id: 'artwork', stage: 'artwork', agent: 'VISUAL_DIRECTOR', preferredWorkers: ['image-processing', 'ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['metadata'], expensive: true },
  { id: 'lyrics', stage: 'metadata', agent: 'RECORD_ARCHITECT', preferredWorkers: ['filesystem', 'ollama'], costClass: 0, dependsOn: ['ingest_master'] },
  { id: 'video', stage: 'video', agent: 'VIDEO_FACTORY', preferredWorkers: ['ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['audio_qc', 'artwork'], expensive: true },
  { id: 'canvas', stage: 'canvas', agent: 'VIDEO_FACTORY', preferredWorkers: ['ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['artwork'], expensive: true },
  { id: 'shorts', stage: 'shorts', agent: 'VIDEO_FACTORY', preferredWorkers: ['ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['video'] },
  { id: 'reels', stage: 'reels', agent: 'VIDEO_FACTORY', preferredWorkers: ['ffmpeg', 'deterministic'], costClass: 0, dependsOn: ['video'] },
  { id: 'captions', stage: 'captions', agent: 'PROMOTION_DIRECTOR', preferredWorkers: ['deterministic', 'ollama'], costClass: 0, dependsOn: ['lyrics'] },
  { id: 'thumbnails', stage: 'thumbnails', agent: 'VISUAL_DIRECTOR', preferredWorkers: ['ffmpeg', 'image-processing'], costClass: 0, dependsOn: ['artwork'] },
  { id: 'website', stage: 'website', agent: 'WEBMASTER', preferredWorkers: ['deterministic'], costClass: 0, dependsOn: ['metadata', 'artwork'] },
  { id: 'distribution', stage: 'distribution', agent: 'BUSINESS_AGENT', preferredWorkers: ['deterministic'], costClass: 0, dependsOn: ['audio_qc', 'artwork', 'metadata'] },
  { id: 'promotion', stage: 'promotion', agent: 'PROMOTION_DIRECTOR', preferredWorkers: ['deterministic', 'ollama'], costClass: 0, dependsOn: ['website', 'thumbnails'] },
  { id: 'quality_control', stage: 'quality_control', agent: 'QUALITY_CONTROL', preferredWorkers: ['ffprobe', 'deterministic'], costClass: 0, dependsOn: ['audio_qc', 'artwork', 'website'] },
  { id: 'approval_gate', stage: 'approval_gate', agent: 'MASTER_ORCHESTRATOR', preferredWorkers: ['deterministic'], costClass: 0, dependsOn: ['quality_control', 'distribution', 'promotion'], requiresApproval: true },
  { id: 'publish', stage: 'publish', agent: 'MASTER_ORCHESTRATOR', preferredWorkers: ['deterministic'], costClass: 0, dependsOn: ['approval_gate'], requiresApproval: true },
  { id: 'analytics', stage: 'analytics', agent: 'ANALYTICS_AGENT', preferredWorkers: ['deterministic'], costClass: 0, dependsOn: ['publish'] },
];

export function topoSort(tasks: TaskDef[] = RELEASE_TASKS): TaskDef[] {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const seen = new Set<string>();
  const out: TaskDef[] = [];
  function visit(id: string) {
    if (seen.has(id)) return;
    const t = byId.get(id);
    if (!t) throw new Error(`Unknown task ${id}`);
    seen.add(id);
    for (const dep of t.dependsOn) visit(dep);
    out.push(t);
  }
  for (const t of tasks) visit(t.id);
  return out;
}
