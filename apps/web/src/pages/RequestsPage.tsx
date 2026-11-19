import { useState, useEffect, type FormEvent } from 'react';
import { Sparkle } from '@phosphor-icons/react';
import { PublicLayoutV2, LiveLine } from '../v2/PublicLayoutV2';
import { Reveal, RevealGroup, RevealItem } from '../v2/Reveal';
import '../styles/commerce.css';

type RequestIdea = {
  id: string;
  name: string;
  idea: string;
  mood: string;
  createdAt: string;
};

const MOODS = [
  { value: 'cinematic', label: 'Cinematic Epic' },
  { value: 'street', label: 'Heavy Street Anthem' },
  { value: 'club', label: 'Club & EDM Energy' },
  { value: 'soul', label: 'Soul & Spiritual' },
  { value: 'story', label: 'Deep Storytelling' },
] as const;

const STORAGE_KEY = '3000studios-requests-v1';

/**
 * /requests — Concept board, mockup section 14.
 * Pick a mood tile, describe the idea, send it to the studio.
 * Front-end only: submissions persist in this browser's localStorage and
 * land on the concept board below. No backend endpoint is wired yet —
 * coordinator to connect the send path (see NOTES.md).
 */
export function RequestsPage() {
  const [ideas, setIdeas] = useState<RequestIdea[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as RequestIdea[]) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [mood, setMood] = useState<string>('cinematic');
  const [idea, setIdea] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas));
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
        mood: MOODS.find((m) => m.value === mood)?.label ?? mood,
        idea: idea.trim().slice(0, 360),
        createdAt: new Date().toISOString(),
      },
      ...current,
    ]);
    setIdea('');
    setSent(true);
  }

  return (
    <PublicLayoutV2 wallpaper="waves">
      <section className="v2-section commerce-hero">
        <div className="v2-wrap" style={{ maxWidth: 960 }}>
          <Reveal>
            <span className="commerce-kicker">Concept Board</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="commerce-title">
              Commission <span className="commerce-gold">a track</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="commerce-lede">
              Pick a mood, tell the studio the idea, and it lands on the concept board.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="commerce-moods" role="group" aria-label="Pick a mood">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className="commerce-mood"
                  aria-pressed={mood === m.value}
                  onClick={() => setMood(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="v2-card" style={{ padding: 'clamp(20px, 4vw, 32px)', marginTop: 28, textAlign: 'left' }}>
              <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="v2-grid-2">
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--v2-text)', fontSize: 14, fontWeight: 700 }}>
                    Mood
                    <select
                      className="v2-input"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      aria-label="Mood"
                    >
                      {MOODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--v2-text)', fontSize: 14, fontWeight: 700 }}>
                    Your name
                    <input
                      className="v2-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={80}
                      aria-label="Your name"
                    />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--v2-text)', fontSize: 14, fontWeight: 700 }}>
                  The idea
                  <textarea
                    className="v2-input"
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="What should the track sound like?"
                    maxLength={360}
                    rows={4}
                    style={{ resize: 'vertical' }}
                    aria-label="The idea"
                    required
                  />
                </label>
                <button type="submit" className="v2-btn" style={{ alignSelf: 'flex-start', minWidth: 200 }}>
                  <Sparkle size={18} weight="fill" />
                  Send to the studio
                </button>
                {sent && (
                  <p style={{ color: 'var(--v2-muted)', fontSize: 14, margin: 0 }} role="status">
                    Sent — your idea is on the concept board below.
                  </p>
                )}
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      <LiveLine />

      <section className="v2-section" style={{ paddingTop: 0 }}>
        <div className="v2-wrap" style={{ maxWidth: 960 }}>
          <div className="v2-sec-head">
            <h2 className="v2-sec-title">The Concept Board</h2>
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
                    style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="v2-chip">{item.mood}</span>
                      <strong style={{ color: 'var(--v2-text)', fontSize: 14 }}>{item.name}</strong>
                    </div>
                    <p style={{ color: 'var(--v2-text)', fontSize: 15, margin: '4px 0 0', lineHeight: 1.5 }}>
                      {item.idea}
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
