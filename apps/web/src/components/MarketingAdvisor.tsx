import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

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
    if (/\b(edit|change|update|redesign|fix)\b.*\b(page|site|website|header|footer|admin|stream)/i.test(message)) {
      localStorage.setItem('3000-agent-prefill', message);
    }
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
        <div>
          <span className="adminEyebrow">MARKETING + SITE EDIT DESK</span>
          <h2>Advisor</h2>
        </div>
        <span className="cSpacer" />
        <Link className="cBtn sm ghost" to="/agent">Open trusted edit agent</Link>
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
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={busy ? 'Thinking…' : 'Ask about marketing or describe a page update…'} disabled={busy} />
          <button className="cBtn primary" type="submit" disabled={busy}>Send</button>
        </form>
        <p className="cMuted advisorSafety">Page-edit requests are drafted here and handed to the trusted edit agent for review, testing, and deployment. The advisor never silently publishes code.</p>
      </div>
    </section>
  );
}
