#!/usr/bin/env node
/**
 * Audit publishedSongs.generated.json src paths against apps/web/public/media.
 * Usage: node apps/web/scripts/audit-catalog-paths.mjs [--json out.json]
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const mediaDir = join(webRoot, 'public/media');
const catalogPath = join(webRoot, 'src/data/publishedSongs.generated.json');

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const mp3s = readdirSync(mediaDir).filter((f) => f.toLowerCase().endsWith('.mp3'));

const rows = catalog.map((row) => {
  const rel = String(row.src || '').replace(/^\//, '');
  const file = rel.startsWith('media/') ? rel.slice('media/'.length) : rel;
  // decode in case src was stored encoded
  let decoded = file;
  try { decoded = decodeURIComponent(file); } catch { /* keep */ }
  const exists = Boolean(decoded) && (existsSync(join(mediaDir, decoded)) || existsSync(join(mediaDir, file)));
  return {
    slug: row.slug,
    title: row.title,
    src: row.src,
    exists,
    hasPreview: Boolean(row.preview),
  };
});

const present = rows.filter((r) => r.exists);
const missing = rows.filter((r) => !r.exists);

const report = {
  audited_at: new Date().toISOString(),
  mode: 'remap-to-existing-files',
  catalog_count: catalog.length,
  media_mp3_count: mp3s.length,
  present_count: present.length,
  missing_count: missing.length,
  before_exact_slug_missing_estimate: 47,
  present: present.map((r) => ({ slug: r.slug, src: r.src })),
  missing: missing.map((r) => ({
    slug: r.slug,
    title: r.title,
    src: r.src,
    hasPreview: r.hasPreview,
    todo: 'No matching MP3 on disk under public/media — do not invent; sync from DistroKid masters or keep Apple preview fallback in music.ts',
  })),
};

const jsonFlag = process.argv.indexOf('--json');
const outPath =
  jsonFlag >= 0 && process.argv[jsonFlag + 1]
    ? resolve(process.argv[jsonFlag + 1])
    : resolve(webRoot, '../../../catalog_path_audit.json');

writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n');
console.log(
  `Catalog audit: ${present.length}/${catalog.length} present, ${missing.length} missing → ${outPath}`,
);
