import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { FileRef } from './schema/manifest.js';

const LARGE_EXT = new Set(['.wav', '.flac', '.mp4', '.mov', '.mkv', '.webm']);

export function checksumFile(file: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

export function toFileRef(file: string | undefined): FileRef | undefined {
  if (!file || !fs.existsSync(file)) {
    return { stored: 'missing', path: file };
  }
  const ext = path.extname(file).toLowerCase();
  const bytes = fs.statSync(file).size;
  return {
    path: file,
    checksum: checksumFile(file),
    bytes,
    stored: LARGE_EXT.has(ext) ? 'external' : 'git',
  };
}
