import { z } from 'zod';

export const FileRefSchema = z.object({
  path: z.string().optional(),
  uri: z.string().optional(),
  checksum: z.string().optional(),
  bytes: z.number().optional(),
  stored: z.enum(['git', 'external', 'missing']).default('missing'),
});

export const ReleaseManifestSchema = z.object({
  release_id: z.string(),
  slug: z.string(),
  title: z.string(),
  artist: z.string().default('3000 Studios'),
  version: z.number().int().default(1),
  status: z.enum([
    'draft',
    'awaiting_song_approval',
    'in_progress',
    'blocked',
    'awaiting_publish_approval',
    'published',
    'failed',
  ]),
  created_at: z.string(),
  updated_at: z.string(),
  audio: z.object({
    original: FileRefSchema.optional(),
    master: FileRefSchema.optional(),
    checksum: z.string().optional(),
    duration: z.number().optional(),
    sample_rate: z.number().optional(),
    bit_depth: z.number().optional(),
    loudness: z.number().optional(),
    qc_status: z.enum(['pending', 'pass', 'fail', 'skipped']).default('pending'),
  }).default({ qc_status: 'pending' }),
  metadata: z.object({
    title: z.string().optional(),
    artist: z.string().optional(),
    writers: z.array(z.string()).default([]),
    producers: z.array(z.string()).default([]),
    explicit: z.boolean().default(false),
    genre: z.string().optional(),
    subgenre: z.string().optional(),
    release_date: z.string().optional(),
    copyright: z.string().optional(),
    publishing: z.string().optional(),
    isrc: z.string().optional(),
    upc: z.string().optional(),
  }).default({ writers: [], producers: [], explicit: false }),
  artwork: z.object({
    status: z.enum(['pending', 'complete', 'failed']).default('pending'),
    source: FileRefSchema.optional(),
    final: FileRefSchema.optional(),
    dimensions: z.string().optional(),
    qc_status: z.enum(['pending', 'pass', 'fail', 'skipped']).default('pending'),
  }).default({ status: 'pending', qc_status: 'pending' }),
  lyrics: z.object({
    status: z.enum(['pending', 'complete', 'failed']).default('pending'),
    final: z.string().optional(),
  }).default({ status: 'pending' }),
  video: z.object({
    full_video: FileRefSchema.optional(),
    lyric_video: FileRefSchema.optional(),
    visualizer: FileRefSchema.optional(),
    canvas: FileRefSchema.optional(),
    vertical: FileRefSchema.optional(),
  }).default({}),
  promotion: z.object({
    youtube: z.record(z.string(), z.unknown()).optional(),
    instagram: z.record(z.string(), z.unknown()).optional(),
    facebook: z.record(z.string(), z.unknown()).optional(),
    tiktok: z.record(z.string(), z.unknown()).optional(),
    shorts: z.record(z.string(), z.unknown()).optional(),
    reels: z.record(z.string(), z.unknown()).optional(),
    captions: z.record(z.string(), z.unknown()).optional(),
    thumbnails: z.record(z.string(), z.unknown()).optional(),
  }).default({}),
  distribution: z.object({
    status: z.enum(['not_started', 'prepared', 'submitted', 'live']).default('not_started'),
    distributor: z.string().default('DistroKid'),
    submission_status: z.string().optional(),
    platform_links: z.record(z.string(), z.string()).default({}),
  }).default({ status: 'not_started', distributor: 'DistroKid', platform_links: {} }),
  website: z.object({
    release_page: z.string().optional(),
    artwork: z.string().optional(),
    player: z.string().optional(),
    metadata: z.string().optional(),
    seo: z.string().optional(),
    deployment_status: z.enum(['not_started', 'prepared', 'deployed']).default('not_started'),
  }).default({ deployment_status: 'not_started' }),
  analytics: z.object({
    streams: z.number().optional(),
    views: z.number().optional(),
    engagement: z.number().optional(),
    campaign_metrics: z.record(z.string(), z.unknown()).default({}),
  }).default({ campaign_metrics: {} }),
  workflow: z.object({
    current_stage: z.string().default('ingest_master'),
    completed_tasks: z.array(z.string()).default([]),
    failed_tasks: z.array(z.string()).default([]),
    queued_tasks: z.array(z.string()).default([]),
    retries: z.record(z.string(), z.number()).default({}),
  }),
});

export type ReleaseManifest = z.infer<typeof ReleaseManifestSchema>;
export type FileRef = z.infer<typeof FileRefSchema>;

export function emptyManifest(input: {
  release_id: string;
  slug: string;
  title: string;
  artist?: string;
}): ReleaseManifest {
  const now = new Date().toISOString();
  return ReleaseManifestSchema.parse({
    release_id: input.release_id,
    slug: input.slug,
    title: input.title,
    artist: input.artist ?? '3000 Studios',
    version: 1,
    status: 'draft',
    created_at: now,
    updated_at: now,
    workflow: {
      current_stage: 'ingest_master',
      completed_tasks: [],
      failed_tasks: [],
      queued_tasks: [],
      retries: {},
    },
  });
}
