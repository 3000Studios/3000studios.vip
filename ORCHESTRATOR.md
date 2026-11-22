# MASTER ORCHESTRATOR

The orchestrator is the **only** component that assigns work. Agents do not call other agents.

Implementation: `packages/studio-os/src/orchestrator.ts`

## Loop

1. Receive a job (`release`, later `songwrite`).
2. Determine tasks from `pipeline/release-graph.ts`.
3. Topologically sort the dependency graph.
4. Select the cheapest capable worker (`cost/router.ts`).
5. Execute the task.
6. Validate outputs (schema + QC tasks).
7. Record task status in `.studio-os/jobs/` and `music/releases/{slug}/manifest.json`.
8. Retry via `fallback/router.ts` without restarting the release.
9. Switch workers when the preferred one is down.
10. Resume from `resume_job_id`.
11. Append JSONL logs under `.studio-os/logs/`.
12. Require approval for publish / DistroKid submit / paid / destructive ops.
13. Skip completed expensive tasks (artwork, video, canvas).

## Cost levels

| Level | Class | Examples |
|---|---|---|
| 0 | Deterministic local | FFmpeg, hashes, JSON, filesystem |
| 1 | Local AI | Ollama |
| 2 | Free/low-cost connected | configured APIs only |
| 3 | Premium AI | only when the task needs it |

Premium AI is **off** until explicitly configured. DistroKid has **no upload API**.
