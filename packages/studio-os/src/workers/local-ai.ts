import type { StudioOsConfig } from '../config.js';
import { probeOllama } from './probe.js';

export async function ollamaGenerate(
  config: StudioOsConfig,
  prompt: string,
): Promise<{ ok: boolean; text?: string; error?: string }> {
  const up = await probeOllama(config.ollamaHost);
  if (!up) return { ok: false, error: 'ollama unavailable' };
  try {
    const res = await fetch(`${config.ollamaHost.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: config.ollamaModel, prompt, stream: false }),
    });
    if (!res.ok) return { ok: false, error: `ollama http ${res.status}` };
    const json = (await res.json()) as { response?: string };
    return { ok: true, text: json.response ?? '' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
