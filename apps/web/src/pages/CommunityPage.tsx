import { useState, useEffect, type FormEvent } from 'react';
import { PublicLayout } from './Home';
import '../styles/vip-luxury.css';

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
    <PublicLayout variant="pulse" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 960, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(0, 240, 255, 0.1)', color: '#00f0ff', borderColor: 'rgba(0, 240, 255, 0.3)' }}>
            VIP Lounge
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Community Chat Room
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 540, margin: '0 auto', fontSize: 16 }}>
            Talk music, production, upcoming video drops, and connect with 3000 Studios fans worldwide.
          </p>
        </section>

        <section className="vip-glass-card" style={{ padding: '24px', marginBottom: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your display name"
              maxLength={42}
              style={{
                background: 'rgba(10, 13, 22, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
              }}
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to the community..."
              maxLength={280}
              rows={3}
              style={{
                background: 'rgba(10, 13, 22, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                color: '#fff',
                padding: '12px 18px',
                borderRadius: 12,
                fontSize: 15,
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <button type="submit" className="vip-btn-gold" style={{ alignSelf: 'flex-start', minWidth: 160 }}>
              Post Message
            </button>
          </form>
        </section>

        <section>
          <h2 className="vip-gold-text" style={{ fontSize: 22, marginBottom: 16 }}>
            Recent Discussions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.length === 0 ? (
              <div className="vip-glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--vip-text-muted)' }}>
                No messages yet. Be the first to start the conversation!
              </div>
            ) : null}
            {messages.map((item) => (
              <article key={item.id} className="vip-glass-card" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <strong style={{ color: '#ffd700', fontSize: 15 }}>{item.name}</strong>
                  <span style={{ color: 'var(--vip-text-muted)', fontSize: 12 }}>
                    {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(item.createdAt))}
                  </span>
                </div>
                <p style={{ color: '#f8f6f0', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
