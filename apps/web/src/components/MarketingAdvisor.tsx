import { useState, type FormEvent } from 'react';

type Msg = { role: 'you' | 'advisor'; text: string };

export function MarketingAdvisor() {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: 'advisor',
      text: 'Marketing desk is on. Ask for a drop plan, Reels script, pricing test, or what to post today.',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput('');
    const next = [...msgs, { role: 'you' as const, text: message }];
    setMsgs(next);
    setBusy(true);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message,
          history: next.map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; text?: string; error?: string };
      setMsgs((cur) => [...cur, { role: 'advisor', text: data.text || data.error || 'Advisor offline.' }]);
    } catch {
      setMsgs((cur) => [...cur, { role: 'advisor', text: 'Network miss. Try again.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="cPanel advisorPanel">
      <div className="cPanelHead">
        <h2>Marketing advisor</h2>
        <span className="cSub">Private. Uses the studio Gemini key on the server. Never shown here.</span>
      </div>
      <div className="cPanelBody">
        <div className="advisorLog" aria-live="polite">
          {msgs.map((m, i) => (
            <p key={i} className={m.role === 'you' ? 'advisorYou' : 'advisorBot'}>
              <strong>{m.role === 'you' ? 'You' : 'Advisor'}</strong> {m.text}
            </p>
          ))}
        </div>
        <form className="advisorForm" onSubmit={send}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={busy ? 'Thinking…' : 'What should we push this week?'} disabled={busy} />
          <button className="cBtn primary" type="submit" disabled={busy}>Send</button>
        </form>
      </div>
    </section>
  );
}
