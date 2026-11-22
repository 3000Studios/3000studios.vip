import fs from 'node:fs';
import path from 'node:path';
import type { ReleaseManifest } from '../schema/manifest.js';
import { toFileRef } from '../media-storage.js';

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function applyIngest(manifest: ReleaseManifest, masterPath?: string): ReleaseManifest {
  const next = structuredClone(manifest);
  next.metadata.title = next.metadata.title || next.title;
  next.metadata.artist = next.metadata.artist || next.artist;
  next.metadata.copyright = next.metadata.copyright || `© ${new Date().getFullYear()} 3000 Studios`;
  if (masterPath) {
    next.audio.master = toFileRef(masterPath);
    next.audio.checksum = next.audio.master?.checksum;
    next.audio.original = next.audio.original ?? next.audio.master;
  }
  next.status = 'in_progress';
  return next;
}

export function writeCampaign(dir: string, manifest: ReleaseManifest) {
  fs.mkdirSync(dir, { recursive: true });
  const base = {
    title: manifest.title,
    artist: manifest.artist,
    slug: manifest.slug,
    cta: 'Listen at https://3000studios.vip',
  };
  const platforms = {
    youtube: {
      ...base,
      title: `${manifest.title} | 3000 Studios (Official)`,
      description: `${manifest.title} by 3000 Studios.\nhttps://3000studios.vip\nhttps://www.youtube.com/@3000Studio`,
      tags: ['3000Studios', 'official', manifest.slug],
    },
    instagram: {
      ...base,
      caption: `${manifest.title} is live. Full listen on 3000studios.vip`,
      hashtags: ['#3000Studios', '#NewMusic'],
    },
    facebook: {
      ...base,
      caption: `New from 3000 Studios: ${manifest.title}. Stream on the official site.`,
    },
    tiktok: {
      ...base,
      caption: `${manifest.title} — official sound. Link in bio / 3000studios.vip`,
      hashtags: ['#3000Studios', '#fyp'],
    },
    spotify: { ...base, note: 'Canvas attach in Spotify for Artists after DistroKid live' },
    apple: { ...base, note: 'UPC does not attach video; art via DistroKid' },
    audiomack: { ...base, caption: `${manifest.title} — 3000 Studios` },
    site: { ...base, path: `/music#${manifest.slug}` },
  };
  fs.writeFileSync(path.join(dir, 'campaign.json'), `${JSON.stringify(platforms, null, 2)}\n`);
  return platforms;
}
