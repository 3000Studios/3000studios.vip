import { useState, useEffect, type FormEvent } from 'react';
import { ChatCircleText, PaperPlaneTilt } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';

type StoredMessage = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export function CommunityPage() {
  const [messages, setMessages] = useState<StoredMessage[]>(() => {
    try {
      const raw = localStorage.getItem('3000studios-chat-v1');
      return raw ? (JSON.parse(raw) as StoredMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('3000studios-chat-v1', JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setMessages((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim() || 'VIP Member',
        message: message.trim().slice(0, 280),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setMessage('');
  }

  return (
    <PublicLayoutV2 wallpaper="particles">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 960 }}>
          <Reveal>
            <span className="v2-kicker">VIP Lounge</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Community <span className="v2-grad-text">Chat Room</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 540 }}>
              Talk music, production, upcoming video drops, and connect with 3000 Studios
              fans worldwide.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="v2-card" style={{ padding: 'clamp(20px, 4vw, 32px)', marginTop: 32 }}>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input
                  className="v2-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your display name"
                  maxLength={42}
                  aria-label="Your display name"
                />
                <textarea
                  className="v2-input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message to the community..."
                  maxLength={280}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  aria-label="Your message"
                />
                <button type="submit" className="v2-btn" style={{ alignSelf: 'flex-start', minWidth: 180 }}>
                  <PaperPlaneTilt size={18} weight="fill" />
                  Post Message
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 960 }}>
          <div className="v2-sec-head">
            <h2 className="v2-sec-title">
              <ChatCircleText size={26} weight="duotone" style={{ verticalAlign: '-4px', color: 'var(--v2-neon)' }} />{' '}
              Recent Discussions
            </h2>
            <span className="v2-chip">{messages.length} messages</span>
          </div>
          <RevealGroup>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <RevealItem>
                <div className="v2-card" style={{ padding: 24, textAlign: 'center', color: 'var(--v2-muted)' }}>
                  No messages yet. Be the first to start the conversation!
                </div>
              </RevealItem>
            ) : null}
            {messages.map((item) => (
              <RevealItem key={item.id}>
                <article className="v2-card" style={{ padding: '16px 20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                      gap: 12,
                    }}
                  >
                    <strong style={{ color: 'var(--v2-neon)', fontSize: 15 }}>{item.name}</strong>
                    <span style={{ color: 'var(--v2-faint)', fontSize: 12 }}>
                      {new Intl.DateTimeFormat('en', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(new Date(item.createdAt))}
                    </span>
                  </div>
                  <p style={{ color: 'var(--v2-text)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>
                    {item.message}
                  </p>
                </article>
              </RevealItem>
            ))}
            </div>
          </RevealGroup>
        </div>
      </section>
    </PublicLayoutV2>
  );
}
