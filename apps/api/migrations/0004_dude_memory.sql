CREATE TABLE IF NOT EXISTS dude_memory (
  id TEXT PRIMARY KEY,
  owner_email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dude_memory_owner_created
  ON dude_memory(owner_email, created_at DESC);
