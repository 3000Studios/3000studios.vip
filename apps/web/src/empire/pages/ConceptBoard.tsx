import { useEffect, useState, type FormEvent } from 'react';
import { ArrowFatUp } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head } from '../kit';
import { swatch } from '../swatch';

type Idea = { id: string; name: string; idea: string; mood: string; votes: number; createdAt: string };

const KEY = '3000studios-requests-v1';
const MOODS = [
  { value: 'cinematic', label: 'Cinematic Epic' },
  { value: 'street', label: 'Heavy Street Anthem' },
  { value: 'club', label: 'Club & EDM Energy' },
  { value: 'soul', label: 'Soul & Spiritual' },
  { value: 'story', label: 'Deep Storytelling' },
];
const moodLabel = (v: string) => MOODS.find((m) => m.value === v)?.label ?? v;

function load(): Idea[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Idea[]) : [];
  } catch {
    return [];
  }
}

export function ConceptBoard() {
  const [ideas, setIdeas] = useState<Idea[]>(load);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mood, setMood] = useState('cinematic');
  const [idea, setIdea] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'saved'>('idle');

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(ideas));
    } catch {
      /* private mode: the board lives in memory only */
    }
  }, [ideas]);

  function submit(e: FormEvent) {
    e.preventDefault();
    const text = idea.trim();
    if (!text || state === 'sending') return;
    const entry: Idea = {
      id: crypto.randomUUID(),
      name: name.trim() || 'VIP Producer',
      mood,
      idea: text.slice(0, 360),
      votes: 1,
      createdAt: new Date().toISOString(),
    };
    setIdeas((cur) => [entry, ...cur]);
    setIdea('');
    setState('sending');
    // Deliver to the studio inbox; the board below is the visitor's own copy.
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind: 'request', name: entry.name, email: email.trim(), mood, body: entry.idea }),
    })
      .then((res) => setState(res.ok ? 'sent' : 'saved'))
      .catch(() => setState('saved'));
  }

  const vote = (id: string) => setIdeas((cur) => cur.map((x) => (x.id === id ? { ...x, votes: x.votes + 1 } : x)));
  const sorted = [...ideas].sort((a, b) => b.votes - a.votes);

  return (
    <EmpirePage>
      <PageHero
        eyebrow="Concept board"
        title={
          <>
            Commission
            <br />a track
          </>
        }
        lead="Pick a mood, tell the studio the idea, and it lands on the concept board."
        orb="rgba(155,107,255,.42)"
      />
      <section className="ep-sec" style={{ paddingTop: 0 }}>
        <div className="em-wrap ep-grid ep-g2" style={{ alignItems: 'start' }}>
          <div className="ep-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 170px), 1fr))' }}>
            {MOODS.map((m, i) => (
              <button
                key={m.value}
                type="button"
                className="ep-glass ep-door ep-lift ep-sheen"
                style={{ background: swatch(i + 2) }}
                aria-pressed={mood === m.value}
                onClick={() => setMood(m.value)}
              >
                <b>{m.label}</b>
              </button>
            ))}
          </div>
          <form className="ep-glass ep-gilt ep-card ep-form" onSubmit={submit}>
            <span className="em-kicker">Your request</span>
            <label>
              Mood
              <select value={mood} onChange={(e) => setMood(e.target.value)}>
                {MOODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="row">
              <label>
                Your name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VIP Producer" autoComplete="name" />
              </label>
              <label>
                Email (optional)
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </label>
            </div>
            <label>
              The idea
              <textarea rows={4} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={360} placeholder="What should the song be about?" required />
            </label>
            <button className="em-btn" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending' : 'Send to the studio'}
            </button>
            {state === 'sent' && <p className="ep-note">Sent. The studio has your idea.</p>}
            {state === 'saved' && <p className="ep-note is-err">Saved on the board here, but it did not reach the studio. Try again in a moment.</p>}
          </form>
        </div>
      </section>
      {sorted.length > 0 && (
        <section className="ep-sec">
          <div className="em-wrap">
            <Head eyebrow="Your board" title={<>On the <span className="ep-metal">board</span></>} />
            <div className="ep-glass ep-tracks">
              {sorted.map((x) => (
                <div key={x.id} className="ep-trk" style={{ gridTemplateColumns: '48px minmax(0,1fr) auto' }}>
                  <button type="button" className="ep-mini" onClick={() => vote(x.id)} aria-label={`Upvote, ${x.votes} votes`}>
                    <ArrowFatUp size={16} weight="fill" />
                  </button>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block' }}>{x.idea}</b>
                    <span className="ep-dim" style={{ fontSize: 12 }}>
                      {x.name} · {moodLabel(x.mood)}
                    </span>
                  </span>
                  <span className="pv" style={{ display: 'block' }}>
                    {x.votes}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </EmpirePage>
  );
}
