# Failover

`fallback/router.ts` walks preferred → next → local → deterministic → queue.

A failed task does **not** restart the release. Completed artwork/video stays completed. Resume with the same `job_id`.
