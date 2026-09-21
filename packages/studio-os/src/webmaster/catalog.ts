import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { StudioOsConfig } from '../config.js';
import type { ReleaseManifest } from '../schema/manifest.js';
import { writeJson } from '../store/json-store.js';

export const StudioOsCatalogEntrySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  artist: z.string().default('3000 Studios'),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  src: z.string().optional(),
  cover: z.string().optional(),
  youtubeId: z.string().optional(),
  lyrics: z.string().optional(),
  credits: z.array(z.string()).optional(),
  streaming: z.record(z.string(), z.string()).optional(),
  video: z.string().optional(),
  story: z.string().optional(),
  duration: z.string().optional(),
  sampleRate: z.number().optional(),
  channels: z.number().optional(),
  loudness: z.number().optional(),
  waveform: z.array(z.number()).optional(),
  transcript: z.string().optional(),
  updatedAt: z.string(),
  source: z.literal('studio-os'),
});

export type StudioOsCatalogEntry = z.infer<typeof StudioOsCatalogEntrySchema>;

export function catalogPath(config: StudioOsConfig) {
  return path.join(config.webDataDir, 'studioOsCatalog.generated.json');
}

export function loadCatalog(config: StudioOsConfig): StudioOsCatalogEntry[] {
  const file = catalogPath(config);
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as unknown;
  if (!Array.isArray(raw)) return [];
  return raw.map((row) => StudioOsCatalogEntrySchema.parse(row));
}

export function upsertFromManifest(
  config: StudioOsConfig,
  manifest: ReleaseManifest,
  extras: Partial<StudioOsCatalogEntry> = {},
): { wrote: boolean; entry: StudioOsCatalogEntry } {
  const existing = loadCatalog(config);
  const prev = existing.find((e) => e.slug === manifest.slug);
  const next: StudioOsCatalogEntry = StudioOsCatalogEntrySchema.parse({
    slug: manifest.slug,
    title: manifest.title,
    artist: manifest.artist,
    description: extras.description ?? prev?.description ?? manifest.metadata.genre,
    releaseDate: extras.releaseDate ?? prev?.releaseDate ?? manifest.metadata.release_date,
    src: extras.src ?? prev?.src ?? manifest.website.player,
    cover: extras.cover ?? prev?.cover ?? manifest.website.artwork,
    youtubeId: extras.youtubeId ?? prev?.youtubeId ?? manifest.distribution.platform_links.youtube?.replace(/.*v=/, ''),
    lyrics: extras.lyrics ?? prev?.lyrics ?? manifest.lyrics.final,
    credits: extras.credits ?? prev?.credits ?? [
      ...manifest.metadata.writers.map((w) => `Writer: ${w}`),
      ...manifest.metadata.producers.map((p) => `Producer: ${p}`),
    ].filter(Boolean),
    streaming: extras.streaming ?? prev?.streaming ?? manifest.distribution.platform_links,
    video: extras.video ?? prev?.video,
    story: extras.story ?? prev?.story,
    duration: extras.duration ?? prev?.duration,
    sampleRate: extras.sampleRate ?? prev?.sampleRate ?? manifest.audio.sample_rate,
    channels: extras.channels ?? prev?.channels,
    loudness: extras.loudness ?? prev?.loudness ?? manifest.audio.loudness,
    waveform: extras.waveform ?? prev?.waveform,
    transcript: extras.transcript ?? prev?.transcript,
    updatedAt: new Date().toISOString(),
    source: 'studio-os',
  });

  const same =
    prev &&
    JSON.stringify({ ...prev, updatedAt: '' }) === JSON.stringify({ ...next, updatedAt: '' });
  if (same && prev) {
    return { wrote: false, entry: prev };
  }

  const merged = [...existing.filter((e) => e.slug !== next.slug), next].sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
  writeJson(catalogPath(config), merged);
  return { wrote: true, entry: next };
}
