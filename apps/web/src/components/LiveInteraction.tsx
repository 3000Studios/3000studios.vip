/* eslint-disable react-refresh/only-export-components */
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  CASH_APP_CASHTAG,
  cashAppTipUrl,
  fetchLiveRoom,
  heartbeatLiveRoom,
  liveChatName,
  liveViewerId,
  sendLiveChat,
  setLiveChatName,
  type LiveChatMessage,
} from '../lib/liveRoom';

const TIP_PRESETS = [3, 5, 10, 20, 50];

export function useLiveRoom() {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [viewers, setViewers] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = liveViewerId();
    let cancelled = false;

    const tick = async () => {
      try {
        const room = await heartbeatLiveRoom(id);
        if (cancelled) return;
        setMessages(room.messages);
        setViewers(Math.max(1, room.viewers));
        setError(null);
      } catch {
        try {
          const room = await fetchLiveRoom();
          if (cancelled) return;
          setMessages(room.messages);
          setViewers(Math.max(1, room.viewers));
        } catch {
          if (!cancelled) setError('Chat reconnecting…');
        }
      }
    };

    void tick();
    const timer = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return { messages, viewers, error, setMessages, setViewers };
}

export function ViewerCount({ count }: { count: number }) {
  return (
    <div className="liveViewerCount" aria-live="polite">
      <span className="liveViewerDot" aria-hidden="true" />
      <strong>{count.toLocaleString()}</strong>
      <span>{count === 1 ? 'watching' : 'watching'}</span>
    </div>
  );
}

export function TipJar() {
  const [custom, setCustom] = useState('');
  const [status, setStatus] = useState<'idle' | 'open' | 'error'>('idle');

  function openTip(amount?: number) {
    const parsed = amount ?? Number(custom);
    if (amount == null && custom && (!Number.isFinite(parsed) || parsed <= 0)) {
      setStatus('error');
      return;
    }
    setStatus('open');
    window.open(cashAppTipUrl(Number.isFinite(parsed) && parsed > 0 ? parsed : undefined), '_blank', 'noopener,noreferrer');
  }

  return (
    <section className="tipJar" aria-label="Tip jar">
      <header className="tipJarHead">
        <span>Tip Jar</span>
        <strong>${CASH_APP_CASHTAG}</strong>
      </header>
      <div className="tipJarPresets">
        {TIP_PRESETS.map((amount) => (
          <button key={amount} type="button" className="tipJarBtn" onClick={() => openTip(amount)}>
            ${amount}
          </button>
        ))}
      </div>
      <form
        className="tipJarCustom"
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          openTip();
        }}
      >
        <label>
          <span className="srOnly">Custom tip amount</span>
          <input
            inputMode="decimal"
            min="1"
            step="1"
            placeholder="Custom $"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              setStatus('idle');
            }}
          />
        </label>
        <button type="submit">Send tip</button>
      </form>
      <p className={`tipJarStatus ${status}`} role="status">
        {status === 'open'
          ? 'Cash App opened. Complete the tip there.'
          : status === 'error'
            ? 'Enter a valid amount.'
            : 'Tips go directly to Cash App.'}
      </p>
    </section>
  );
}

export function LiveChatPanel({
  messages,
  onSent,
}: {
  messages: LiveChatMessage[];
  onSent: (messages: LiveChatMessage[]) => void;
}) {
  const [name, setName] = useState(() => liveChatName());
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim() || 'Guest';
    const nextText = text.trim();
    if (!nextText) return;
    setBusy(true);
    setError(null);
    try {
      setLiveChatName(nextName);
      const result = await sendLiveChat(nextName, nextText);
      onSent(result.messages);
      setText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="liveChat" aria-label="Live chat">
      <header className="liveChatHead">
        <strong>Live chat</strong>
        <span>Real-time with other viewers</span>
      </header>
      <div className="liveChatList" ref={listRef}>
        {messages.length === 0 ? (
          <p className="liveChatEmpty">Say hello. Chat updates for everyone watching.</p>
        ) : (
          messages.map((msg) => (
            <article key={msg.id} className="liveChatMsg">
              <strong>{msg.name}</strong>
              <p>{msg.text}</p>
            </article>
          ))
        )}
      </div>
      <form className="liveChatForm" onSubmit={submit}>
        <label>
          <span className="srOnly">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            maxLength={32}
            autoComplete="nickname"
          />
        </label>
        <label className="liveChatCompose">
          <span className="srOnly">Message</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Send a message"
            maxLength={280}
          />
        </label>
        <button type="submit" disabled={busy || !text.trim()}>
          {busy ? '…' : 'Send'}
        </button>
      </form>
      {error ? <p className="liveChatError">{error}</p> : null}
    </section>
  );
}
