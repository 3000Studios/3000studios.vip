import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type FormEvent,
} from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout, AdSenseUnit } from '../pages/Home';
import { publishedSongs } from '../data/publishedSongs';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { MERCH_ITEMS } from '../data/merch';
import { detectIsLive } from '../lib/streamLiveDetect';
import { ADSENSE_HOME_SLOT } from '../lib/adsense';
import { CASH_APP_URL, cashAppTipUrl } from '../lib/liveRoom';
import { STREAM_PLAYER_EMBED_SRC } from '../lib/streamConfig';
import { useGlobalMusic } from './GlobalMusic';
import '../styles/vip-luxury.css';
import '../styles/million-dollar.css';

const OWNER_EMAIL = 'mr.jwswain@gmail.com';
const TIP_PRESETS = [5, 10, 25, 50, 100];

export function SwipeHome() {
  const [isLive, setIsLive] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(officialReleaseVideos[0]);
  const [musicSearch, setMusicSearch] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const [customTip, setCustomTip] = useState('');
  const music = useGlobalMusic();
  const theaterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const checkLive = async () => {
      const state = await detectIsLive();
      if (!cancelled) setIsLive(state.live);
    };
    void checkLive();
    const interval = window.setInterval(checkLive, 10000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const filteredSongs = useMemo(() => {
    return publishedSongs.filter((s) =>
      s.title.toLowerCase().includes(musicSearch.toLowerCase())
    );
  }, [musicSearch]);

  const handlePlaySong = (song: typeof publishedSongs[0]) => {
    const src = song.preview || song.src;
    if (src) {
      window.dispatchEvent(
        new CustomEvent('3000-play-track', {
          detail: { src, title: song.title, slug: song.slug },
        })
      );
    }
  };

  const handleOpenTip = (amount?: number) => {
    const parsed = amount ?? Number(customTip);
    window.open(
      cashAppTipUrl(Number.isFinite(parsed) && parsed > 0 ? parsed : undefined),
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <PublicLayout variant="spiral" compact>
      <div className="md-scope" style={{ minHeight: '100vh', paddingBottom: '90px' }}>
        
        {/* =========================================================================
            1. HERO HUB: OBSIDIAN & MOLTEN GOLD VIP HEADQUARTERS
            ========================================================================= */}
        <section className="vip-hero-hub">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="md-kicker">✦ OFFICIAL ARTIST PLATFORM</span>
            <Link
              to="/live"
              className={isLive ? 'vip-live-pill' : 'md-kicker'}
              style={{ textDecoration: 'none' }}
            >
              <span className={isLive ? 'vip-live-dot' : ''} />
              {isLive ? '● ON AIR NOW — ENTER STAGE' : '○ LIVE BROADCAST STAGE'}
            </Link>
          </div>

          <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="vip-gold-text">3000 STUDIOS VIP</span>
            <span className="vip-eq-wave" aria-hidden="true">
              <span className="vip-eq-bar" />
              <span className="vip-eq-bar" />
              <span className="vip-eq-bar" />
              <span className="vip-eq-bar" />
              <span className="vip-eq-bar" />
            </span>
          </h1>

          <p>
            Original AI-driven music production by Jeremy Swain. 47 official releases, full-length catalog streaming free, live stream broadcast stage, and VIP ownership drops.
          </p>

          <div className="vip-badge-row">
            <Link className="vip-btn-gold" to="/live">
              ● Watch Live Stage
            </Link>
            <a className="vip-btn-obsidian" href="#music-catalog">
              ♪ 47 Song Catalog
            </a>
            <a className="vip-btn-obsidian" href="#video-theater">
              ▶ Official Videos
            </a>
            <Link className="vip-btn-obsidian" to="/shop">
              ▣ Shop VIP Drops
            </Link>
            <a
              className="vip-btn-obsidian"
              href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
              target="_blank"
              rel="noreferrer"
            >
              Subscribe @3000Studio
            </a>
          </div>
        </section>

        {/* =========================================================================
            2. LIVE BROADCAST STAGE PREVIEW & CASH APP TIP JAR
            ========================================================================= */}
        <section style={{ maxWidth: 1240, margin: '0 auto 48px', padding: '0 16px' }}>
          <div className="vip-glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
              <div>
                <span className={isLive ? 'vip-live-pill' : 'md-kicker'} style={{ marginBottom: 6, display: 'inline-block' }}>
                  {isLive ? '● LIVE BROADCAST ACTIVE' : '○ LIVE STREAM STAGE'}
                </span>
                <h2 className="vip-gold-text" style={{ fontSize: 'clamp(22px, 4vw, 32px)', margin: 0, fontWeight: 800 }}>
                  3000 Studios Live Experience
                </h2>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link to="/live" className="vip-btn-gold" style={{ padding: '8px 18px', fontSize: 13 }}>
                  Full Screen Stage ↗
                </Link>
                <a
                  href={CASH_APP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="vip-btn-obsidian"
                  style={{ padding: '8px 18px', fontSize: 13, borderColor: 'rgba(0, 214, 50, 0.4)', color: '#00d632' }}
                >
                  $ Tip $addcashGift
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, alignItems: 'start' }}>
              {/* Stream Frame */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', background: '#000', border: '1px solid rgba(255, 215, 0, 0.25)' }}>
                <iframe
                  title="3000 Studios Live Stage"
                  src={`${STREAM_PLAYER_EMBED_SRC}&autoplay=true&muted=${isMuted ? 'true' : 'false'}&primaryColor=ffd700`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
                <button
                  type="button"
                  onClick={() => setIsMuted((v) => !v)}
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    background: 'rgba(5, 6, 10, 0.85)',
                    border: '1px solid rgba(255, 215, 0, 0.5)',
                    color: '#ffd700',
                    padding: '6px 12px',
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span>{isMuted ? '🔇' : '🔊'}</span>
                  <span>{isMuted ? 'TAP FOR SOUND' : 'MUTE'}</span>
                </button>
              </div>

              {/* Tip Jar & Interaction Quick Box */}
              <div className="vip-tip-jar">
                <span style={{ color: '#00d632', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Direct Artist Boost
                </span>
                <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>
                  Cash App Tip Jar
                </h3>
                <p style={{ color: 'var(--vip-text-muted)', fontSize: 13, margin: '0 0 14px' }}>
                  Support independent production directly to <strong style={{ color: '#00d632' }}>$addcashGift</strong>
                </p>

                <div className="vip-tip-chips">
                  {TIP_PRESETS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="vip-tip-chip"
                      onClick={() => handleOpenTip(amt)}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>

                <form
                  onSubmit={(e: FormEvent) => {
                    e.preventDefault();
                    handleOpenTip();
                  }}
                  style={{ display: 'flex', gap: 8, justifyContent: 'center' }}
                >
                  <input
                    type="number"
                    min="1"
                    placeholder="Custom $"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    style={{
                      background: 'rgba(10, 13, 22, 0.9)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      color: '#fff',
                      padding: '8px 14px',
                      borderRadius: 999,
                      fontSize: 14,
                      width: 110,
                      textAlign: 'center',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    className="vip-btn-gold"
                    style={{ padding: '8px 18px', fontSize: 13, background: 'linear-gradient(135deg, #00d632, #009922)', color: '#fff' }}
                  >
                    Send Tip ↗
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. 47-TRACK OFFICIAL MUSIC CATALOG
            ========================================================================= */}
        <section id="music-catalog" style={{ maxWidth: 1280, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
            <div>
              <span className="md-kicker" style={{ marginBottom: 6, display: 'inline-block' }}>
                Full Discography
              </span>
              <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 38px)', margin: 0, fontWeight: 800 }}>
                47 Official Releases — All Free
              </h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
                Every track streams in full. Click any song to preview instantly.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search 47 songs..."
              value={musicSearch}
              onChange={(e) => setMusicSearch(e.target.value)}
              style={{
                background: 'rgba(10, 13, 22, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: 14,
                outline: 'none',
                minWidth: 240,
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 20,
            }}
          >
            {filteredSongs.map((s, idx) => {
              const isCurrentPlaying = music.activeSong.title === s.title && music.isPlaying;
              return (
                <article
                  key={s.slug || s.title}
                  className="vip-glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderColor: isCurrentPlaying ? 'rgba(255, 215, 0, 0.8)' : undefined,
                    boxShadow: isCurrentPlaying ? '0 0 25px rgba(255, 215, 0, 0.35)' : undefined,
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}>
                    <img
                      src={s.cover || `/media/covers/${s.slug}.jpg`}
                      alt={s.title}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/media/official-3000-studios-profile.png';
                      }}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                      type="button"
                      onClick={() => handlePlaySong(s)}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: 'none',
                        color: '#fff',
                        fontSize: 36,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isCurrentPlaying ? 1 : 0.85,
                        transition: 'all 0.2s ease',
                      }}
                      aria-label={`Play ${s.title}`}
                    >
                      <span
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          background: 'rgba(255, 215, 0, 0.95)',
                          color: '#05060a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 22,
                          paddingLeft: isCurrentPlaying ? 0 : 3,
                          boxShadow: '0 0 20px rgba(255, 215, 0, 0.6)',
                        }}
                      >
                        {isCurrentPlaying ? '❚❚' : '▶'}
                      </span>
                    </button>
                    <span
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: 'rgba(5, 6, 10, 0.8)',
                        color: '#ffd700',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      #{String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ color: '#fff', fontSize: 16, margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {s.title}
                    </h3>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 13, marginBottom: 12 }}>
                      3000 Studios · Official Drop
                    </span>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                      <Link
                        to={`/song/${s.slug}`}
                        className="vip-btn-obsidian"
                        style={{ padding: '6px 12px', fontSize: 12, flex: 1, textAlign: 'center' }}
                      >
                        Details
                      </Link>
                      <a
                        href={s.buy || 'https://distrokid.com/hyperfollow/3000studios'}
                        target="_blank"
                        rel="noreferrer"
                        className="vip-btn-gold"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                      >
                        Stream / Own
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            4. OFFICIAL VIDEO CINEMA THEATER
            ========================================================================= */}
        <section id="video-theater" style={{ maxWidth: 1280, margin: '0 auto 56px', padding: '0 16px' }}>
          <div className="vip-glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <span className="md-kicker" style={{ marginBottom: 6, display: 'inline-block' }}>
                  Visual Experience
                </span>
                <h2 className="vip-gold-text" style={{ fontSize: 'clamp(24px, 4.5vw, 36px)', margin: 0, fontWeight: 800 }}>
                  Official Music Video Spotlight
                </h2>
              </div>
              <Link to="/video" className="vip-btn-gold" style={{ padding: '8px 18px', fontSize: 13 }}>
                View All 47 Videos ↗
              </Link>
            </div>

            <div ref={theaterRef} style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', background: '#000', marginBottom: 20 }}>
              <iframe
                key={selectedVideo.videoId}
                src={`${youtubeEmbedUrl(selectedVideo.videoId)}&autoplay=0&rel=0`}
                title={`${selectedVideo.title} music video`}
                style={{ width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: 20, margin: '0 0 4px' }}>
                  {selectedVideo.title}
                </h3>
                <span style={{ color: 'var(--vip-text-muted)', fontSize: 14 }}>
                  {selectedVideo.release} · {selectedVideo.duration} · 3000 Studios
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                  className="vip-btn-gold"
                  href="https://www.youtube.com/@3000Studio?sub_confirmation=1"
                  target="_blank"
                  rel="noreferrer"
                >
                  Subscribe @3000Studio
                </a>
                <a
                  className="vip-btn-obsidian"
                  href={youtubeWatchUrl(selectedVideo.videoId)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on YouTube ↗
                </a>
              </div>
            </div>

            {/* Video Quick Selector Horizontal Bar */}
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '16px 0 4px', marginTop: 16 }}>
              {officialReleaseVideos.slice(0, 10).map((v) => (
                <button
                  key={v.videoId}
                  type="button"
                  onClick={() => setSelectedVideo(v)}
                  style={{
                    flex: '0 0 160px',
                    background: 'none',
                    border: v.videoId === selectedVideo.videoId ? '2px solid #ffd700' : '1px solid rgba(255, 215, 0, 0.2)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img
                    src={youtubeArtworkUrl(v.videoId)}
                    alt={v.title}
                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '6px 8px', background: 'rgba(10, 13, 22, 0.9)', color: '#fff', fontSize: 11, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {v.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. VIP MONETIZATION TIERS & COMMERCE STORE
            ========================================================================= */}
        <section style={{ maxWidth: 1280, margin: '0 auto 56px', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span className="md-kicker" style={{ marginBottom: 8, display: 'inline-block' }}>
              Fuel The Empire
            </span>
            <h2 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 44px)', margin: 0, fontWeight: 800 }}>
              VIP Ownership & Access Passes
            </h2>
            <p style={{ color: 'var(--vip-text-muted)', maxWidth: 640, margin: '8px auto 0', fontSize: 16 }}>
              Music streams free forever. Monetization comes from high-res downloads, stem packs, sponsor packages, sync licenses, and merch.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 24,
            }}
          >
            {/* 99c Track */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                99¢ Single
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Own Any Track</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Lossless studio master audio download + personal license. Yours to keep forever.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$0.99</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'track')?.stripe ?? '#'}>
                Buy Track
              </a>
            </article>

            {/* Monthly VIP */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#00f0ff', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                VIP Monthly
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Vault Pass</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Full vault access, unreleased stems, exclusive drops, and priority live stream badge for 31 days.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00f0ff', marginBottom: 16 }}>$3.99 / mo</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'monthly')?.stripe ?? '#'}>
                Go VIP Monthly
              </a>
            </article>

            {/* Annual VIP */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column', borderColor: 'rgba(255, 215, 0, 0.7)', boxShadow: '0 0 30px rgba(255, 215, 0, 0.25)' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ★ Best Value
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Vault All-Access</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Full year VIP access with 2 months free. Every stem, high-res catalog archive, and Discord role.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$19.99 / yr</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'yearly')?.stripe ?? '#'}>
                Go VIP Yearly
              </a>
            </article>

            {/* Sync Licensing */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#a855f7', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sync License
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Film & Commercial</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Worldwide sync clearance for YouTube creators, films, video games, ads, and TV broadcasts.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#a855f7', marginBottom: 16 }}>Custom</div>
              <a
                className="vip-btn-obsidian"
                href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent('Sync License Request — 3000 Studios')}`}
              >
                Request Sync
              </a>
            </article>

            {/* Brand Sponsor */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#ffd700', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sponsor Tier
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Brand Placement</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Prominent brand placement on 3000studios.vip and live stream tickers for 30 days.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#ffd700', marginBottom: 16 }}>$99 / mo</div>
              <a className="vip-btn-gold" href={MERCH_ITEMS.find((m) => m.id === 'sponsor')?.stripe ?? '#'}>
                Sponsor Now
              </a>
            </article>

            {/* Cash App Boost */}
            <article className="vip-glass-card" style={{ padding: '28px 22px', display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#00d632', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Direct Tip
              </span>
              <h3 style={{ color: '#fff', fontSize: 20, margin: '6px 0 2px' }}>Cash App Tip</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '0 0 16px', flex: 1 }}>
                Direct 1-tap artist tip to $addcashGift. Instant drop power and sound session support.
              </p>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#00d632', marginBottom: 16 }}>Any $</div>
              <a
                className="vip-btn-gold"
                href={CASH_APP_URL}
                target="_blank"
                rel="noreferrer"
                style={{ background: 'linear-gradient(135deg, #00d632, #009922)', color: '#fff' }}
              >
                Tip $addcashGift
              </a>
            </article>
          </div>
        </section>

        {/* =========================================================================
            6. GOOGLE ADSENSE MONETIZATION PLACEMENT
            ========================================================================= */}
        <section style={{ maxWidth: 1200, margin: '0 auto 48px', padding: '0 16px' }}>
          <AdSenseUnit slot={ADSENSE_HOME_SLOT} />
        </section>

        {/* =========================================================================
            7. COMMUNITY & SONG REQUEST PREVIEW ROW
            ========================================================================= */}
        <section style={{ maxWidth: 1280, margin: '0 auto 48px', padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            <div className="vip-glass-card" style={{ padding: '28px' }}>
              <span className="md-kicker" style={{ marginBottom: 8, display: 'inline-block' }}>
                Community Lounge
              </span>
              <h3 style={{ color: '#fff', fontSize: 22, margin: '0 0 8px' }}>Join the VIP Chat</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.5, margin: '0 0 18px' }}>
                Connect with listeners, give feedback on beats, and discuss upcoming music drops.
              </p>
              <Link to="/community" className="vip-btn-gold">
                Enter Community Chat ↗
              </Link>
            </div>

            <div className="vip-glass-card" style={{ padding: '28px' }}>
              <span className="md-kicker" style={{ marginBottom: 8, display: 'inline-block' }}>
                Song Pitch Board
              </span>
              <h3 style={{ color: '#fff', fontSize: 22, margin: '0 0 8px' }}>Submit Song Ideas</h3>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, lineHeight: 1.5, margin: '0 0 18px' }}>
                Pitch themes, styles, or concepts for the next 3000 Studios master release and vote on community ideas.
              </p>
              <Link to="/requests" className="vip-btn-gold">
                Submit & Vote ↗
              </Link>
            </div>
          </div>
        </section>

      </div>
    </PublicLayout>
  );
}
