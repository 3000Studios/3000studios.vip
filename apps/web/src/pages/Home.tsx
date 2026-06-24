import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { songs } from '../data/songs';
import { motion, AnimatePresence } from 'framer-motion';

// Daily unlock logic (one random locked song per day, persists for that day)
function getDailyUnlockedSlugs(): string[] {
  const today = new Date().toISOString().split('T')[0];
  const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0);
  const locked = songs.filter(s => s.unlockType === 'daily');
  if (locked.length === 0) return [];
  const index = seed % locked.length;
  const unlockedToday = locked[index].slug;

  const key = `vip_daily_unlocks_${today}`;
  let stored: string[] = JSON.parse(localStorage.getItem(key) || '[]');
  if (!stored.includes(unlockedToday)) {
    stored = [...stored, unlockedToday];
    localStorage.setItem(key, JSON.stringify(stored));
  }
  return stored;
}

function SongCarousel({ onSongClick }: { onSongClick: (slug: string) => void }) {
  const [dailyUnlocked] = useState(getDailyUnlockedSlugs());
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [hearted, setHearted] = useState<Record<string, boolean>>({});

  const handleLike = (slug: string, e: React.MouseEvent) => { e.stopPropagation(); setLikes(p => ({...p, [slug]: (p[slug]||124)+1})); };
  const handleHeart = (slug: string, e: React.MouseEvent) => { e.stopPropagation(); setHearted(p => ({...p, [slug]: !p[slug]})); };

  return (
    <section className="songCarouselSection">
      <div className="sectionHeader">
        <h2>The 3000 Collection</h2>
        <p>Premium tracks. One unlocks randomly every day. 10-second previews for all.</p>
      </div>

      <div className="carousel">
        <AnimatePresence>
          {songs.map((song, i) => {
            const isUnlocked = song.unlockType === 'unlocked' || dailyUnlocked.includes(song.slug);
            return (
              <motion.div
                key={song.id}
                className={`songCard ${isUnlocked ? 'unlocked' : 'locked'}`}
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => onSongClick(song.slug)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="cardMedia">
                  <div className="coverArt" style={{ background: 'linear-gradient(145deg, #0a0a0f 0%, #1a1428 100%)' }}>
                    <div className="mediaContent">
                      <div className="genrePill">{song.genre}</div>
                      {!isUnlocked && <div className="previewBadge">10s PREVIEW • DAILY UNLOCK</div>}
                    </div>
                  </div>
                  <button className="playFab" onClick={(e) => { e.stopPropagation(); onSongClick(song.slug); }}>▶</button>
                </div>

                <div className="cardBody">
                  <div>
                    <h3>{song.title}</h3>
                    <p className="artistLine">{song.artist} • {song.duration}</p>
                  </div>
                  <div className="vibeLine">{song.vibe}</div>

                  <div className="actions">
                    <button onClick={(e) => handleLike(song.slug, e)} className="actionBtn">♥ {likes[song.slug] || 124}</button>
                    <button onClick={(e) => handleHeart(song.slug, e)} className={`actionBtn heart ${hearted[song.slug] ? 'active' : ''}`}>{hearted[song.slug] ? '❤️' : '♡'}</button>
                    <button onClick={(e) => { e.stopPropagation(); alert('Comments open in full app'); }} className="actionBtn">💬</button>
                  </div>

                  { !isUnlocked && <div className="unlockStatus">Unlocks randomly tomorrow</div> }
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { login, ownerUsername } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [introState, setIntroState] = useState<'pending' | 'playing' | 'done'>('pending');
  const [needsGesture, setNeedsGesture] = useState(false);
  const [muted, setMuted] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');

  // Make opening video automatically fit any viewport
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = 0.7;
    v.muted = muted;
    v.play().then(() => setIntroState('playing')).catch(() => setNeedsGesture(true));
  }, [muted]);

  const startIntro = () => videoRef.current?.play().then(() => { setIntroState('playing'); setNeedsGesture(false); });
  const revealHome = () => setIntroState('done');
  const toggleMute = () => setMuted(m => !m);

  const goToSong = (slug: string) => navigate(`/song/${slug}`);

  // Secret admin (© 10 taps)
  const sealTaps = useRef(0);
  const handleSealTap = () => {
    sealTaps.current += 1;
    if (sealTaps.current >= 10) {
      sealTaps.current = 0;
      setAdminOpen(true);
    }
  };

  const handleAdminUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (adminCode.trim() !== '5555') return setAdminError('Invalid VIP code');
    const ok = login(ownerUsername, '55555555', 'z');
    if (ok) navigate('/vault');
    else setAdminError('Owner credentials not configured');
  };

  return (
    <main className="premiumHome">
      {/* Full-viewport auto-fitting intro video */}
      {introState !== 'done' && (
        <div className="heroVideoWrap">
          <video ref={videoRef} src={INTRO_VIDEO} className="heroVideo" playsInline muted={muted} onEnded={revealHome} />
          <div className="heroShade" />
          {needsGesture && <button className="bigEnter" onClick={startIntro}>TAP TO ENTER VIP</button>}
          <button className="muteFloating" onClick={toggleMute}>{muted ? 'UNMUTE' : 'MUTE'}</button>
        </div>
      )}

      <header className="topNav">
        <div className="logo" onClick={handleSealTap}>3000 STUDIOS</div>
        <nav>
          <button onClick={() => window.scrollTo({top: 820, behavior:'smooth'})}>Collection</button>
          <button onClick={() => navigate('/about')}>About</button>
        </nav>
      </header>

      <section className="heroContent">
        <div className="heroInner">
          <div className="kicker">EXCLUSIVE • LIMITED</div>
          <h1>The future of music<br />starts here.</h1>
          <p>Premium sounds. Daily unlocks. Built for creators who move different.</p>
          <div className="heroCtas">
            <button className="ctaPrimary" onClick={() => window.scrollTo({top: 820, behavior:'smooth'})}>Explore the Collection</button>
            <button className="ctaGhost" onClick={() => goToSong('always-feel-like')}>Play Signature Track</button>
          </div>
        </div>
      </section>

      <SongCarousel onSongClick={goToSong} />

      <section className="miniGameSection">
        <h2>Interactive Experience</h2>
        <p>Tap the notes. Feel the rollout.</p>
        {/* MusicNoteGame component can be imported here if desired */}
      </section>

      <footer className="siteFooter">
        <button className="secret" onClick={handleSealTap}>©</button>
        <a href="mailto:Mr.jwswain@gmail.com">Mr.jwswain@gmail.com</a>
      </footer>

      {adminOpen && (
        <div className="adminModal">
          <form onSubmit={handleAdminUnlock}>
            <h3>VIP Private Entrance</h3>
            <input value={adminCode} onChange={e => setAdminCode(e.target.value)} placeholder="Enter code" />
            {adminError && <p className="error">{adminError}</p>}
            <button type="submit">Unlock Dashboard</button>
          </form>
        </div>
      )}
    </main>
  );
}
