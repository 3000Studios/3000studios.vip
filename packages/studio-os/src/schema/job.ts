import { z } from 'zod';
import type { CostClass, TaskStatus } from '../types.js';

export const JobLogSchema = z.object({
  job_id: z.string(),
  release_id: z.string().optional(),
  agent: z.string(),
  worker: z.string(),
  task: z.string(),
  started_at: z.string(),
  finished_at: z.string().optional(),
  status: z.string(),
  cost_class: z.number().int().min(0).max(3),
  retry_count: z.number().int().default(0),
  output: z.unknown().optional(),
  error: z.string().optional(),
  provider: z.string().optional(),
  model_or_tool: z.string().optional(),
  estimated_tokens: z.number().optional(),
  estimated_cost_usd: z.number().optional(),
  execution_ms: z.number().optional(),
});

export type JobLog = z.infer<typeof JobLogSchema>;

export type TaskDef = {
  id: string;
  stage: string;
  agent: string;
  preferredWorkers: string[];
  costClass: CostClass;
  dependsOn: string[];
  requiresApproval?: boolean;
  expensive?: boolean;
};

export type TaskResult = {
  status: TaskStatus;
  output?: unknown;
  error?: string;
  worker: string;
  costClass: CostClass;
  skippedReason?: string;
};

export type JobRecord = {
  job_id: string;
  type: string;
  release_id?: string;
  status: TaskStatus | 'completed' | 'failed' | 'running' | 'queued';
  created_at: string;
  updated_at: string;
  payload: Record<string, unknown>;
  tasks: Record<string, TaskResult & { retry_count: number }>;
};
