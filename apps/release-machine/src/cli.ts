import { loadConfig, runReleaseJob, draftSongPackage, loadSongwritingCanon, prepareSunoJob } from 'studio-os';

const [cmd, ...rest] = process.argv.slice(2);
const config = loadConfig();

if (cmd === 'ingest') {
  const title = rest[0];
  const master = rest[1];
  if (!title) {
    console.error('usage: ingest <title> [master_path]');
    process.exit(2);
  }
  const job = await runReleaseJob(config, { title, master_path: master });
  console.log(JSON.stringify({ job_id: job.job_id, status: job.status }, null, 2));
  process.exit(job.status === 'failed' ? 1 : 0);
}

if (cmd === 'approve') {
  const jobId = rest[0];
  const title = rest[1] || 'release';
  const slug = rest[2];
  if (!jobId) {
    console.error('usage: approve <job_id> <title> [slug]');
    process.exit(2);
  }
  const job = await runReleaseJob(config, { title, slug, resume_job_id: jobId, approved: true });
  console.log(JSON.stringify({ job_id: job.job_id, status: job.status }, null, 2));
  process.exit(0);
}

if (cmd === 'write') {
  const brief = rest.join(' ');
  const pkg = draftSongPackage(brief, loadSongwritingCanon(config.repoRoot));
  const adapter = prepareSunoJob(pkg, `${config.mediaStoreRoot}\\01-Incoming-Suno-Raws`);
  console.log(JSON.stringify({ ...pkg, suno: adapter.mode, drop: adapter.drop_folder }, null, 2));
  process.exit(0);
}

console.log(`3000 Studios release-machine
  write <brief>              Record Architect package (SONGWRITING.md)
  ingest <title> [master]    Run pipeline until approval gate
  approve <job_id> <title>   Resume and pass publish approval
Production website remains apps/web. DistroKid submit is never automatic.`);
