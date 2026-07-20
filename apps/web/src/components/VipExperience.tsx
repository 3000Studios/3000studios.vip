import { useEffect, useRef, useState, type FormEvent } from 'react';

type VipEntry = { name: string; score: number; completedAt: string };
type Particle = { x: number; y: number; z: number; vx: number; vy: number; hue: number };

const LEADERBOARD_KEY = '3000studios-vip-leaderboard-v1';
const SCORE_KEY = '3000studios-vip-score-v1';
const MAX_NAME_LENGTH = 24;

function getEntries(): VipEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) ?? '[]') as VipEntry[];
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry.name === 'string' && Number.isFinite(entry.score)).slice(0, 10) : [];
  } catch {
    return [];
  }
}

function getScore() {
  const score = Number(localStorage.getItem(SCORE_KEY));
  return Number.isFinite(score) && score > 0 ? Math.floor(score) : 0;
}

export function VipExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ x: -1000, y: -1000, active: false });
  const scoreRef = useRef(0);
  const lastCollectRef = useRef(0);
  const [score, setScore] = useState(getScore);
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const [name, setName] = useState('');
  const [entries, setEntries] = useState<VipEntry[]>(getEntries);

  const level = Math.min(10, Math.floor(score / 100) + 1);
  const remaining = 100 - (score % 100);

  useEffect(() => {
    document.documentElement.style.setProperty('--vip-level', String(level));
  }, [level]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    document.documentElement.dataset.vipEffects = effectsEnabled ? 'on' : 'off';
  }, [effectsEnabled]);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, active: true };
      document.documentElement.style.setProperty('--vip-pointer-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--vip-pointer-y', `${event.clientY}px`);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !effectsEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) return;
    const lowPower = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
    const count = Math.min(level === 1 ? 100 : 100 * 2 ** (level - 1), lowPower ? 180 : 500);
    let particles: Particle[] = [];
    let frame = 0;
    let lastTime = 0;
    let active = !document.hidden;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * ratio);
      canvas.height = Math.floor(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: 0.35 + Math.random() * 0.9,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        hue: [44, 144, 350][Math.floor(Math.random() * 3)],
      }));
    };
    const visibility = () => { active = !document.hidden; };
    const collect = () => {
      const now = performance.now();
      if (now - lastCollectRef.current < 180 || !pointerRef.current.active) return;
      const particle = particles.find((item) => Math.hypot(item.x - pointerRef.current.x, item.y - pointerRef.current.y) < 36 * item.z);
      if (!particle) return;
      lastCollectRef.current = now;
      particle.x = Math.random() * window.innerWidth;
      particle.y = Math.random() * window.innerHeight;
      const next = scoreRef.current + 1;
      scoreRef.current = next;
      localStorage.setItem(SCORE_KEY, String(next));
      setScore(next);
      if (next >= 900) setShowCompletion(true);
    };
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (!active || time - lastTime < 32) return;
      lastTime = time;
      const beat = Math.min(1, Math.max(0, Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--beat')) || 0.12));
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const particle of particles) {
        const pointer = pointerRef.current;
        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < 160) {
            particle.vx += (dx / distance) * 0.018 * particle.z;
            particle.vy += (dy / distance) * 0.018 * particle.z;
          }
        }
        particle.x = (particle.x + particle.vx + window.innerWidth) % window.innerWidth;
        particle.y = (particle.y + particle.vy + window.innerHeight) % window.innerHeight;
        particle.vx *= 0.992;
        particle.vy *= 0.992;
        const radius = (1 + beat * 1.8 + (level > 1 ? 0.6 : 0)) * particle.z;
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 94%, 66%, ${0.26 + particle.z * 0.48})`;
        context.shadowBlur = 7 + beat * 16;
        context.shadowColor = context.fillStyle;
        context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        context.fill();
      }
      context.shadowBlur = 0;
      collect();
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [effectsEnabled, level]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const cleanName = name.trim().replace(/[^a-zA-Z0-9 ._'-]/g, '').slice(0, MAX_NAME_LENGTH);
    if (cleanName.length < 2) return;
    const nextEntries = [...entries.filter((entry) => entry.name.toLowerCase() !== cleanName.toLowerCase()), { name: cleanName, score, completedAt: new Date().toISOString() }]
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 10);
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(nextEntries));
    window.dispatchEvent(new Event('vip-leaderboard-updated'));
    setEntries(nextEntries);
    setShowCompletion(false);
  };

  return (
    <>
      <canvas ref={canvasRef} className="vipParticles" aria-hidden="true" />
      <div className={`vipAura level-${level}`} aria-hidden="true" />
      <aside className="vipProgress" aria-label={`VIP level ${level}, score ${score}`}>
        <span>VIP // {level}</span><strong>{score.toLocaleString()}</strong><small>{level === 10 ? 'Board unlocked' : `${remaining} sparks to level ${level + 1}`}</small>
        <button type="button" onClick={() => setEffectsEnabled((value) => !value)} aria-pressed={effectsEnabled}>{effectsEnabled ? 'Effects on' : 'Effects off'}</button>
      </aside>
      {showCompletion && (
        <div className="vipCompletion" role="dialog" aria-modal="true" aria-labelledby="vip-completion-title">
          <div className="vipCompletionCard">
            <span>LEVEL 10 // UNLOCKED</span>
            <h2 id="vip-completion-title">Congratulations — You Made It to the VIP Board.</h2>
            <p>Save a display name to this device’s private, local-only VIP leaderboard.</p>
            <form onSubmit={submit}>
              <label htmlFor="vip-display-name">Display name</label>
              <input id="vip-display-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={MAX_NAME_LENGTH} autoComplete="nickname" required />
              <button type="submit">Claim VIP rank</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function VipLeaderboard() {
  const [entries, setEntries] = useState<VipEntry[]>(getEntries);
  useEffect(() => {
    const refresh = () => setEntries(getEntries());
    window.addEventListener('vip-leaderboard-updated', refresh);
    return () => window.removeEventListener('vip-leaderboard-updated', refresh);
  }, []);
  return <section className="vipLeaderboard" aria-labelledby="top-vips-title"><div><span className="vipKicker">Top VIPs</span><h2 id="top-vips-title">The local VIP board</h2><p>Saved only on this device until a server leaderboard is connected.</p></div><ol>{entries.length ? entries.map((entry, index) => <li key={`${entry.name}-${entry.score}`}><b>#{index + 1}</b><span>{entry.name}</span><strong>{entry.score.toLocaleString()}</strong><time dateTime={entry.completedAt}>{new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(entry.completedAt))}</time></li>) : <li className="vipEmpty">Collect sparks to begin the board.</li>}</ol></section>;
}
