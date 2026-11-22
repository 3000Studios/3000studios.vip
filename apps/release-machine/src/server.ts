import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, runReleaseJob } from 'studio-os';

const dir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(dir, '..', 'public');

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end(fs.readFileSync(path.join(publicDir, 'index.html')));
    return;
  }
  if (req.method === 'POST' && req.url === '/api/run') {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as {
      title?: string;
      master?: string;
      cover?: string;
      youtube?: string;
      approved?: boolean;
    };
    const config = loadConfig();
    const master = body.master
      ? path.isAbsolute(body.master)
        ? body.master
        : path.join(config.repoRoot, body.master)
      : undefined;
    const job = await runReleaseJob(config, {
      title: body.title || 'Untitled',
      slug: 'not-giving-up-tonight',
      master_path: master,
      artwork_path: body.cover,
      approved: Boolean(body.approved),
      web_src: '/media/not-giving-up-tonight.mp3',
      web_cover: body.cover || '/media/covers/not-giving-up-tonight.jpg',
      youtube_id: body.youtube || 'tIY1WU9N_RU',
    } as Parameters<typeof runReleaseJob>[1] & Record<string, unknown>);
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(job, null, 2));
    return;
  }
  res.writeHead(404);
  res.end('not found');
});

server.listen(8787, '127.0.0.1', () => {
  console.log('release-machine UI http://127.0.0.1:8787');
});
