import { useState, useEffect, type FormEvent } from 'react';
import { Fire, Sparkle } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';

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
    <PublicLayoutV2 wallpaper="waves">
      <section className="v2-section">
        <div className="v2-wrap" style={{ maxWidth: 960 }}>
          <Reveal>
            <span className="v2-kicker">Studio Lab</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="v2-display">
              Song Request & <span className="v2-grad-text">Concept Board</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="v2-lede" style={{ marginTop: 16, maxWidth: 540 }}>
              Pitch your ideas for the next 3000 Studios track. Upvote concepts you want
              to hear produced and mastered.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="v2-card" style={{ padding: 'clamp(20px, 4vw, 32px)', marginTop: 32 }}>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="v2-grid-2">
                  <input
                    className="v2-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name or producer tag"
                    maxLength={42}
                    aria-label="Your name or producer tag"
                  />
                  <select
                    className="v2-input"
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    aria-label="Song mood"
                  >
                    <option value="cinematic">Cinematic Epic</option>
                    <option value="street">Heavy Street Anthem</option>
                    <option value="club">Club & EDM Energy</option>
                    <option value="soul">Soul & Spiritual</option>
                    <option value="story">Deep Storytelling</option>
                  </select>
                </div>
                <textarea
                  className="v2-input"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="What theme, melody, or style should the next song have?"
                  maxLength={360}
                  rows={3}
                  style={{ resize: 'vertical' }}
                  aria-label="Your song concept"
                />
                <button type="submit" className="v2-btn" style={{ alignSelf: 'flex-start', minWidth: 200 }}>
                  <Sparkle size={18} weight="fill" />
                  Submit Concept
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
              <Fire size={26} weight="duotone" style={{ verticalAlign: '-4px', color: 'var(--v2-neon)' }} />{' '}
              Top Requested Concepts
            </h2>
            <span className="v2-chip">{ideas.length} ideas</span>
          </div>
          <RevealGroup>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ideas.length === 0 ? (
                <RevealItem>
                  <div className="v2-card" style={{ padding: 24, textAlign: 'center', color: 'var(--v2-muted)' }}>
                    No song requests submitted yet. Submit the first concept above!
                  </div>
                </RevealItem>
              ) : null}
              {ideas.map((item) => (
                <RevealItem key={item.id}>
                  <article
                    className="v2-card v2-card--lift"
                    style={{
                      padding: 20,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                        <span className="v2-chip">{item.mood}</span>
                        <strong style={{ color: 'var(--v2-text)', fontSize: 14 }}>{item.name}</strong>
                      </div>
                      <p style={{ color: 'var(--v2-text)', fontSize: 15, margin: '4px 0 0', lineHeight: 1.5 }}>
                        {item.idea}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVote(item.id)}
                      className="v2-btn v2-btn--ghost v2-btn--sm"
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Fire size={18} weight="fill" />
                      <strong>{item.votes} Votes</strong>
                    </button>
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
