# Suno adapter

There is **no** fake API. Mode = `manual`.

1. Record Architect writes TITLE / LYRICS / STYLE / AVOID.
2. Human generates in Suno (or another authorized tool).
3. Human drops approved audio into `MEDIA_STORE_ROOT/01-Incoming-Suno-Raws` (or passes `master_path` to ingest).
4. Only then does the release orchestrator run.
