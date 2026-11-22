import fs from 'node:fs';
import path from 'node:path';
import type { StudioOsConfig } from './config.js';
import type { CostClass } from './types.js';

export type CostRecord = {
  at: string;
  job_id: string;
  task: string;
  provider: string;
  model_or_tool: string;
  cost_class: CostClass;
  estimated_tokens?: number;
  estimated_cost_usd: number;
  execution_ms: number;
};

export function recordCost(config: StudioOsConfig, rec: CostRecord) {
  fs.mkdirSync(path.join(config.dataDir, 'costs'), { recursive: true });
  const file = path.join(config.dataDir, 'costs', 'ledger.jsonl');
  fs.appendFileSync(file, `${JSON.stringify(rec)}\n`, 'utf8');
}
