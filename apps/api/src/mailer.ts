import type { Env } from './env';

export async function sendOwnerEmail(
  env: Env,
  subject: string,
  text: string,
): Promise<{ ok: boolean; status: string }> {
  if (!env.OWNER_EMAIL) return { ok: false, status: 'missing_OWNER_EMAIL' };
  if (!env.ALERT_FROM_EMAIL) return { ok: false, status: 'missing_ALERT_FROM_EMAIL' };
  if (!env.MAILCHANNELS_API_KEY) return { ok: false, status: 'missing_MAILCHANNELS_API_KEY' };

  const payload = {
    personalizations: [{ to: [{ email: env.OWNER_EMAIL }] }],
    from: { email: env.ALERT_FROM_EMAIL, name: 'Apex Citadel' },
    subject,
    content: [{ type: 'text/plain', value: text }],
  };

  const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${env.MAILCHANNELS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  return res.ok ? { ok: true, status: 'sent' } : { ok: false, status: `send_failed:${res.status}` };
}

