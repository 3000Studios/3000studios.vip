import fs from 'node:fs';
import path from 'node:path';
import { slugify } from './workers/deterministic.js';
import type { SunoPackage } from './integrations/suno.js';

export function loadSongwritingCanon(repoRoot: string): string {
  const file = path.join(repoRoot, 'SONGWRITING.md');
  if (!fs.existsSync(file)) {
    throw new Error('SONGWRITING.md missing — Record Architect cannot run');
  }
  return fs.readFileSync(file, 'utf8');
}

export function draftSongPackage(brief: string, canon: string): SunoPackage {
  const topic = brief.replace(/^.*\babout\s+/i, '').trim() || brief.trim();
  const title = topic
    .split(/\s+/)
    .slice(0, 6)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/[^\w\s'-]/g, '')
    .slice(0, 60) || 'Untitled 3000';

  const southern = /southern|funk|comedy|funny|country/i.test(brief + canon.slice(0, 200));
  const style = southern
    ? 'Southern funk, live bass, clap-heavy drums, talk-sung comedy vocals, 3000 Studios original, radio-ready mix'
    : '3000 Studios original, distinctive groove, radio-ready mix';

  const lyrics = [
    `[Verse 1]`,
    `Well I heard about ${topic}, now the whole block talking`,
    `3000 Studios in the cut, funny bone walking`,
    `[Chorus]`,
    `${title}, don't you lie to me`,
    `Southern funk in the trunk, let the porch light see`,
    `[Verse 2]`,
    `Keep it original, keep it loud, keep it clean enough to ship`,
    `If the joke hits home then the bass got to grip`,
    `[Bridge]`,
    `No copycat hooks, no borrowed fame`,
    `Just a 3000 record with a legal last name`,
    `[Chorus]`,
    `${title}, don't you lie to me`,
  ].join('\n');

  return {
    title,
    lyrics,
    style_of_music: style,
    avoid: 'generic AI slop, celebrity impersonation, copied hooks, brand logos that are not 3000 Studios, explicit hate',
  };
}

export function packageSlug(title: string): string {
  return slugify(title);
}
