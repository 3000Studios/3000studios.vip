ALTER TABLE sites ADD COLUMN workspace_key TEXT;
ALTER TABLE sites ADD COLUMN workspace_path TEXT;
ALTER TABLE sites ADD COLUMN bridge_origin TEXT;
ALTER TABLE sites ADD COLUMN cloudflare_zone_id TEXT;
ALTER TABLE sites ADD COLUMN cloudflare_zone_name TEXT;
ALTER TABLE sites ADD COLUMN bridge_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sites ADD COLUMN edit_surfaces TEXT NOT NULL DEFAULT '[]';

CREATE TABLE IF NOT EXISTS bridge_snapshots (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  origin TEXT NOT NULL,
  inspected_at TEXT NOT NULL,
  config_json TEXT NOT NULL DEFAULT '{}',
  endpoint_status_json TEXT NOT NULL DEFAULT '{}',
  selector_status_json TEXT NOT NULL DEFAULT '{}',
  page_status INTEGER,
  asset_url TEXT,
  error TEXT,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS zone_snapshots (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  captured_at TEXT NOT NULL,
  analytics_json TEXT NOT NULL DEFAULT '{}',
  error TEXT,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS command_runs (
  id TEXT PRIMARY KEY,
  site_id TEXT,
  command_text TEXT NOT NULL,
  parsed_action TEXT NOT NULL,
  result_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY(site_id) REFERENCES sites(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bridge_snapshots_site ON bridge_snapshots(site_id, inspected_at DESC);
CREATE INDEX IF NOT EXISTS idx_zone_snapshots_site ON zone_snapshots(site_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_command_runs_site ON command_runs(site_id, created_at DESC);

