import path from 'node:path';
import { loadConfig } from './config.js';
import { auditWebsiteLocal } from './audits/website.js';
import { runReleaseJob } from './orchestrator.js';
import { draftSongPackage, loadSongwritingCanon } from './songwriting.js';
import { prepareSunoJob } from './integrations/suno.js';
import { probeAudio, loudnessSummary, waveformPeaks } from './workers/ffmpeg-tasks.js';

const [cmd, ...rest] = process.argv.slice(2);
const config = loadConfig();

if (cmd === 'audit-site') {
  const report = auditWebsiteLocal(config);
  const failed = report.checks.filter((c) => !c.ok);
  console.log(`audit ${report.siteUrl} checks=${report.checks.length} failed=${failed.length}`);
  process.exit(failed.length ? 1 : 0);
}

if (cmd === 'song') {
  const brief = rest.join(' ') || 'funny Southern funk song about a wifi fridge';
  const canon = loadSongwritingCanon(config.repoRoot);
  const pkg = draftSongPackage(brief, canon);
  const suno = prepareSunoJob(pkg, `${config.mediaStoreRoot}\\01-Incoming-Suno-Raws`);
  console.log(JSON.stringify({ title: pkg.title, style_of_music: pkg.style_of_music, avoid: pkg.avoid, adapter: suno.mode }, null, 2));
  process.exit(0);
}

if (cmd === 'release') {
  const title = rest[0] || 'Untitled';
  const job = await runReleaseJob(config, { title, master_path: rest[1] });
  console.log(JSON.stringify({ job_id: job.job_id, status: job.status, tasks: Object.keys(job.tasks) }, null, 2));
  process.exit(job.status === 'failed' ? 1 : 0);
}

if (cmd === 'ngut') {
  const master = path.join(config.repoRoot, 'apps', 'web', 'public', 'media', 'not-giving-up-tonight.mp3');
  const probe = probeAudio(config, master);
  const lufs = loudnessSummary(config, master);
  const peaks = waveformPeaks(config, master);
  const job = await runReleaseJob(config, {
    title: 'Not Giving Up Tonight',
    slug: 'not-giving-up-tonight',
    master_path: master,
    artwork_path: path.join(config.repoRoot, 'apps', 'web', 'public', 'media', 'covers', 'not-giving-up-tonight.jpg'),
    web_src: '/media/not-giving-up-tonight.mp3',
    web_cover: '/media/covers/not-giving-up-tonight.jpg',
    youtube_id: 'tIY1WU9N_RU',
    approved: rest.includes('--approve'),
  });
  console.log(JSON.stringify({ job_id: job.job_id, status: job.status, probe, lufs, peaks: peaks?.length }, null, 2));
  process.exit(job.status === 'failed' ? 1 : 0);
}

console.log('studio-os cli: audit-site | song <brief> | release <title> [master_path] | ngut [--approve]');
process.exit(0);
