import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { StudioOsConfig } from '../config.js';
import { ffprobeJson } from './ffmpeg.js';

export type ProbeResult = {
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
  codec?: string;
  checksum: string;
};

export function checksumFile(file: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

export function probeAudio(config: StudioOsConfig, file: string): ProbeResult | null {
  if (!fs.existsSync(file)) return null;
  const checksum = checksumFile(file);
  const json = ffprobeJson(config, file);
  if (!json) {
    return { checksum };
  }
  const format = json.format as { duration?: string; bit_rate?: string } | undefined;
  const streams = json.streams as Array<{ codec_type?: string; sample_rate?: string; channels?: number; codec_name?: string }> | undefined;
  const audio = streams?.find((s) => s.codec_type === 'audio');
  return {
    checksum,
    duration: format?.duration ? Number(format.duration) : undefined,
    sampleRate: audio?.sample_rate ? Number(audio.sample_rate) : undefined,
    channels: audio?.channels,
    bitRate: format?.bit_rate ? Number(format.bit_rate) : undefined,
    codec: audio?.codec_name,
  };
}

export function loudnessSummary(config: StudioOsConfig, file: string): number | null {
  if (!fs.existsSync(file)) return null;
  const r = spawnSync(
    config.ffmpegBin,
    ['-hide_banner', '-i', file, '-af', 'loudnorm=I=-14:TP=-1.0:print_format=json', '-f', 'null', '-'],
    { encoding: 'utf8', timeout: 120000 },
  );
  const blob = `${r.stderr || ''}${r.stdout || ''}`;
  const start = blob.lastIndexOf('{');
  const end = blob.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    const j = JSON.parse(blob.slice(start, end + 1)) as { input_i?: string };
    return j.input_i ? Number(j.input_i) : null;
  } catch {
    return null;
  }
}

export function waveformPeaks(config: StudioOsConfig, file: string, buckets = 64): number[] | null {
  if (!fs.existsSync(file)) return null;
  const tmp = path.join(config.dataDir, 'tmp', `${path.basename(file)}.peak.raw`);
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  const r = spawnSync(
    config.ffmpegBin,
    ['-y', '-hide_banner', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', '8000', '-f', 's16le', tmp],
    { encoding: 'utf8', timeout: 60000 },
  );
  if (r.status !== 0 || !fs.existsSync(tmp)) return null;
  const buf = fs.readFileSync(tmp);
  const samples = buf.length / 2;
  if (samples < 8) return null;
  const peaks: number[] = [];
  const step = Math.max(1, Math.floor(samples / buckets));
  for (let i = 0; i < buckets; i++) {
    let max = 0;
    const start = i * step;
    for (let s = start; s < Math.min(start + step, samples); s++) {
      const v = Math.abs(buf.readInt16LE(s * 2)) / 32768;
      if (v > max) max = v;
    }
    peaks.push(Number(max.toFixed(4)));
  }
  fs.rmSync(tmp, { force: true });
  return peaks;
}

export function skipIfChecksumMatch(outFile: string, checksum: string): boolean {
  const side = `${outFile}.sha256`;
  if (!fs.existsSync(outFile) || !fs.existsSync(side)) return false;
  return fs.readFileSync(side, 'utf8').trim() === checksum;
}

export function writeChecksum(outFile: string, checksum: string) {
  fs.writeFileSync(`${outFile}.sha256`, `${checksum}\n`);
}
