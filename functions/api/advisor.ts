const SYSTEM = `You are the 3000 Studios marketing advisor inside the password-protected /admin console.
Brand: velvet / gold, Atlanta independent studio, site https://3000studios.vip
Catalog: DistroKid official videos, 30-second samples free, $0.99 per track, vault $3.99/mo or $19.99/year.
Merch: hoodie $44, tee $24, cap $28, stickers $8. Sponsor homepage slot $99/30 days.
Live: /live Cloudflare Stream. Games: https://getnexa.space. YouTube: @3000Studio.
Give short, specific campaigns: hooks, post copy, CTAs, what to film tonight, pricing tests.
Never print API keys, tokens, passcodes, or env values. If asked for secrets, refuse.
Keep answers under 180 words unless asked for a calendar.`;

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const key = String(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '');
  const model = String(env.VITE_GEMINI_MODEL || 'gemini-2.0-flash');
  if (!key) {
    return new Response(JSON.stringify({ ok: false, error: 'advisor key missing on Pages' }), {
      status: 503,
      headers: { 'content-type': 'application/json' },
    });
  }
  let body: { message?: string; history?: { role: string; text: string }[] } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'bad json' }), { status: 400 });
  }
  const message = (body.message || '').slice(0, 2000);
  if (!message) return new Response(JSON.stringify({ ok: false, error: 'empty' }), { status: 400 });
  const contents = [
    ...((body.history || []).slice(-8).map((h) => ({ role: h.role === 'advisor' ? 'model' : 'user', parts: [{ text: h.text }] }))),
    { role: 'user', parts: [{ text: message }] },
  ];
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 },
      }),
    },
  );
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('\n').trim() || 'No reply.';
  return new Response(JSON.stringify({ ok: true, text }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
