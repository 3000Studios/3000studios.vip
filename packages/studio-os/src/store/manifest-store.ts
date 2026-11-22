import path from 'node:path';
import type { StudioOsConfig } from '../config.js';
import { emptyManifest, ReleaseManifestSchema, type ReleaseManifest } from '../schema/manifest.js';
import { readJson, writeJson } from './json-store.js';

export function manifestPath(config: StudioOsConfig, slug: string) {
  return path.join(config.musicReleasesDir, slug, 'manifest.json');
}

export function loadManifest(config: StudioOsConfig, slug: string): ReleaseManifest | null {
  const file = manifestPath(config, slug);
  const raw = readJson<unknown | null>(file, null);
  if (!raw) return null;
  return ReleaseManifestSchema.parse(raw);
}

export function saveManifest(config: StudioOsConfig, manifest: ReleaseManifest) {
  manifest.updated_at = new Date().toISOString();
  const parsed = ReleaseManifestSchema.parse(manifest);
  writeJson(manifestPath(config, parsed.slug), parsed);
}

export function createManifest(
  config: StudioOsConfig,
  input: { release_id: string; slug: string; title: string; artist?: string },
): ReleaseManifest {
  const existing = loadManifest(config, input.slug);
  if (existing) return existing;
  const m = emptyManifest(input);
  saveManifest(config, m);
  return m;
}
