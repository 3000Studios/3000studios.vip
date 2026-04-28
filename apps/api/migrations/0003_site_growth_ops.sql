ALTER TABLE sites ADD COLUMN adsense_client_id TEXT;
ALTER TABLE sites ADD COLUMN adsense_enabled INTEGER NOT NULL DEFAULT 0;
ALTER TABLE sites ADD COLUMN ga_property_id TEXT;
ALTER TABLE sites ADD COLUMN revenue_last_30d_cents INTEGER;
ALTER TABLE sites ADD COLUMN revenue_source TEXT;
