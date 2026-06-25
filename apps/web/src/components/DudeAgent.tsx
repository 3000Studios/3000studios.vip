import { useMemo, useState } from 'react';
import { sendDudeChat, type DudeChatMessage } from '../lib/api';

type DudeAgentProps = {
  ownerEmail: string;
};

const STARTER: DudeChatMessage = {
  role: 'assistant',
  content: 'DUDE cloud link ready. Owner-only mode is active.',
};

export function DudeAgent({ ownerEmail }: DudeAgentProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<DudeChatMessage[]>([STARTER]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transcript = useMemo(() => messages.filter((message) => message !== STARTER), [messages]);

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || busy) return;

    setInput('');
    setBusy(true);
    setError(null);
    const nextMessages = [...messages, { role: 'user' as const, content: message }];
    setMessages(nextMessages);

    try {
      const result = await sendDudeChat({
        ownerEmail,
        message,
        history: transcript,
      });
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
    } catch (err) {
      const reason = err instanceof Error ? err.message : 'dude_chat_failed';
      setError(reason);
      setMessages([...nextMessages, { role: 'assistant', content: 'Cloud DUDE is blocked. Check API auth and Workers AI binding.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`dudeAgent ${open ? 'open' : ''}`}>
      {open ? (
        <section className="dudePanel" aria-label="DUDE owner chat agent">
          <div className="dudeHead">
            <div>
              <strong>DUDE</strong>
              <span>Owner-only cloud agent</span>
            </div>
            <button type="button" className="dudeIconBtn" aria-label="Close DUDE agent" onClick={() => setOpen(false)}>
              x
            </button>
          </div>
          <div className="dudeMessages">
            {messages.map((message, index) => (
              <div className={`dudeMsg ${message.role}`} key={`${message.role}-${index}`}>
                {message.content}
              </div>
            ))}
            {error ? <div className="dudeError">{error}</div> : null}
          </div>
          <form className="dudeForm" onSubmit={handleSubmit}>
            <label className="srOnly" htmlFor="dude-message">Message DUDE</label>
            <textarea
              id="dude-message"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              rows={2}
            />
            <button type="submit" aria-label="Send message" disabled={busy || input.trim().length === 0}>
              {busy ? '...' : 'Send'}
            </button>
          </form>
        </section>
      ) : null}
      <button type="button" className="dudeFab" aria-label="Open DUDE agent" onClick={() => setOpen(true)}>
        D
      </button>
    </div>
  );
}
