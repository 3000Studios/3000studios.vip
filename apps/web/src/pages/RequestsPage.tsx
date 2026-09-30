import { useState, useEffect, type FormEvent } from 'react';
import { PublicLayout } from './Home';
import '../styles/vip-luxury.css';

type RequestIdea = {
  id: string;
  name: string;
  idea: string;
  mood: string;
  votes: number;
  createdAt: string;
};

export function RequestsPage() {
  const [ideas, setIdeas] = useState<RequestIdea[]>(() => {
    try {
      const raw = localStorage.getItem('3000studios-requests-v1');
      return raw ? (JSON.parse(raw) as RequestIdea[]) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [mood, setMood] = useState('cinematic');
  const [idea, setIdea] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('3000studios-requests-v1', JSON.stringify(ideas));
    } catch {
      /* ignore */
    }
  }, [ideas]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!idea.trim()) return;
    setIdeas((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim() || 'VIP Producer',
        mood,
        idea: idea.trim().slice(0, 360),
        votes: 1,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setIdea('');
  }

  function handleVote(id: string) {
    setIdeas((current) =>
      current.map((item) => (item.id === id ? { ...item, votes: item.votes + 1 } : item))
    );
  }

  return (
    <PublicLayout variant="goldwave" compact>
      <main style={{ minHeight: '100vh', padding: '28px 16px 80px', maxWidth: 960, margin: '0 auto' }}>
        <section className="vip-glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            Studio Lab
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 48px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Song Request & Concept Board
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 540, margin: '0 auto', fontSize: 16 }}>
            Pitch your ideas for the next 3000 Studios track. Upvote concepts you want to hear produced and mastered.
          </p>
        </section>

        <section className="vip-glass-card" style={{ padding: '24px', marginBottom: 28 }}>
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name or producer tag"
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
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                style={{
                  background: 'rgba(10, 13, 22, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  color: '#fff',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontSize: 15,
                  outline: 'none',
                }}
              >
                <option value="cinematic">Cinematic Epic</option>
                <option value="street">Heavy Street Anthem</option>
                <option value="club">Club & EDM Energy</option>
                <option value="soul">Soul & Spiritual</option>
                <option value="story">Deep Storytelling</option>
              </select>
            </div>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="What theme, melody, or style should the next song have?"
              maxLength={360}
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
              Submit Concept ✦
            </button>
          </form>
        </section>

        <section>
          <h2 className="vip-gold-text" style={{ fontSize: 22, marginBottom: 16 }}>
            Top Requested Concepts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {ideas.length === 0 ? (
              <div className="vip-glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--vip-text-muted)' }}>
                No song requests submitted yet. Submit the first concept above!
              </div>
            ) : null}
            {ideas.map((item) => (
              <article key={item.id} className="vip-glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#ffd700', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                      {item.mood}
                    </span>
                    <strong style={{ color: '#fff', fontSize: 14 }}>{item.name}</strong>
                  </div>
                  <p style={{ color: '#f8f6f0', fontSize: 15, margin: '4px 0 0', lineHeight: 1.5 }}>
                    {item.idea}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleVote(item.id)}
                  className="vip-btn-obsidian"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', fontSize: 14 }}
                >
                  <span>🔥</span>
                  <strong>{item.votes} Votes</strong>
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}
