CREATE TABLE IF NOT EXISTS sites (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  environment TEXT NOT NULL DEFAULT 'prod',
  platform TEXT NOT NULL DEFAULT 'unknown',
  tags TEXT NOT NULL DEFAULT '[]',
  expected_status INTEGER,
  expected_title TEXT,
  expected_canonical TEXT,
  expected_redirects TEXT NOT NULL DEFAULT '[]',
  critical_routes TEXT NOT NULL DEFAULT '[]',
  deploy_hook_url TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS checks (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  type TEXT NOT NULL,
  schedule TEXT NOT NULL DEFAULT '*/5 * * * *',
  timeout_ms INTEGER NOT NULL DEFAULT 12000,
  thresholds_json TEXT NOT NULL DEFAULT '{}',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS check_runs (
  id TEXT PRIMARY KEY,
  check_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  status TEXT NOT NULL,
  metrics_json TEXT NOT NULL DEFAULT '{}',
  evidence_json TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  FOREIGN KEY(check_id) REFERENCES checks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  severity TEXT NOT NULL,
  summary TEXT NOT NULL,
  current_state TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  status TEXT NOT NULL,
  dedupe_key TEXT NOT NULL,
  FOREIGN KEY(incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS playbooks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  trigger_types TEXT NOT NULL DEFAULT '[]',
  safe_mode_rules TEXT NOT NULL DEFAULT '{}',
  steps_json TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS remediation_runs (
  id TEXT PRIMARY KEY,
  playbook_id TEXT NOT NULL,
  incident_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,
  actions_json TEXT NOT NULL DEFAULT '[]',
  rollback_json TEXT NOT NULL DEFAULT '[]',
  FOREIGN KEY(playbook_id) REFERENCES playbooks(id) ON DELETE CASCADE,
  FOREIGN KEY(incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  at TEXT NOT NULL,
  diff_json TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_checks_site ON checks(site_id);
CREATE INDEX IF NOT EXISTS idx_runs_check ON check_runs(check_id);
CREATE INDEX IF NOT EXISTS idx_incidents_site ON incidents(site_id);
CREATE INDEX IF NOT EXISTS idx_alerts_incident ON alerts(incident_id);

