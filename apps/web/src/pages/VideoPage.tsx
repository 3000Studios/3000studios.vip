import { useState, useRef } from 'react';
import { PublicLayout, AdSenseUnit } from './Home';
import {
  officialReleaseVideos,
  youtubeArtworkUrl,
  youtubeEmbedUrl,
  youtubeWatchUrl,
} from '../data/officialReleases';
import { ADSENSE_VIDEO_SLOT } from '../lib/adsense';
import '../styles/vip-luxury.css';
import '../styles/million-dollar.css';

export function VideoPage() {
  const [selectedVideo, setSelectedVideo] = useState(officialReleaseVideos[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const theaterRef = useRef<HTMLDivElement | null>(null);

  const filteredVideos = officialReleaseVideos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.release.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVideo = (video: typeof officialReleaseVideos[0]) => {
    setSelectedVideo(video);
    theaterRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PublicLayout variant="electric" compact>
      <main className="md-scope" style={{ minHeight: '100vh', padding: '24px 16px 80px', maxWidth: 1320, margin: '0 auto' }}>
        {/* Header Section */}
        <section className="vip-glass-card" style={{ padding: '32px 24px', textAlign: 'center', marginBottom: 28 }}>
          <span className="vip-live-pill" style={{ background: 'rgba(255, 215, 0, 0.1)', color: '#ffd700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
            Official Cinema Theater
          </span>
          <h1 className="vip-gold-text" style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 6vw, 56px)', margin: '12px 0 8px', fontWeight: 800 }}>
            Official Music Videos
          </h1>
          <p style={{ color: 'var(--vip-text-muted)', maxWidth: 620, margin: '0 auto 20px', fontSize: 16 }}>
            Browse and stream all 47 official music videos from 3000 Studios. Direct links to YouTube and DistroKid distribution.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
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
              Watch on YouTube
            </a>
          </div>
        </section>

        {/* Featured Video Theater */}
        <section ref={theaterRef} className="vip-glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
            <iframe
              key={selectedVideo.videoId}
              src={`${youtubeEmbedUrl(selectedVideo.videoId)}&autoplay=1&rel=0`}
              title={`${selectedVideo.title} official video`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={{ color: '#ffd700', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Now Screening
              </span>
              <h2 style={{ color: '#fff', fontSize: 'clamp(20px, 3.5vw, 28px)', margin: '4px 0 2px' }}>
                {selectedVideo.title}
              </h2>
              <span style={{ color: 'var(--vip-text-muted)', fontSize: 14 }}>
                3000 Studios · {selectedVideo.release} · {selectedVideo.duration}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <a
                className="vip-btn-gold"
                href="https://distrokid.com/hyperfollow/3000studios"
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                HyperFollow
              </a>
              <a
                className="vip-btn-obsidian"
                href={youtubeWatchUrl(selectedVideo.videoId)}
                target="_blank"
                rel="noreferrer"
                style={{ padding: '10px 18px', fontSize: 13 }}
              >
                Open in YouTube ↗
              </a>
            </div>
          </div>
        </section>

        {/* Video Catalog Browser */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
            <div>
              <h2 className="vip-gold-text" style={{ fontSize: 24, margin: 0 }}>
                Full Catalog ({officialReleaseVideos.length} Releases)
              </h2>
              <p style={{ color: 'var(--vip-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
                Select any video to play directly in the theater above
              </p>
            </div>
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'rgba(10, 13, 22, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: 999,
                fontSize: 14,
                outline: 'none',
                minWidth: 220,
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 20,
            }}
          >
            {filteredVideos.map((video) => {
              const isCurrent = video.videoId === selectedVideo.videoId;
              return (
                <article
                  key={video.videoId}
                  className="vip-glass-card"
                  onClick={() => handleSelectVideo(video)}
                  style={{
                    cursor: 'pointer',
                    borderColor: isCurrent ? 'rgba(255, 215, 0, 0.8)' : undefined,
                    boxShadow: isCurrent ? '0 0 25px rgba(255, 215, 0, 0.35)' : undefined,
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                    <img
                      src={youtubeArtworkUrl(video.videoId)}
                      alt={video.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {isCurrent && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          background: 'rgba(255, 215, 0, 0.9)',
                          color: '#05060a',
                          padding: '3px 8px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 800,
                          letterSpacing: '0.05em',
                        }}
                      >
                        PLAYING
                      </div>
                    )}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        padding: '2px 6px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {video.duration}
                    </span>
                  </div>
                  <div style={{ padding: '14px 16px' }}>
                    <h3 style={{ color: '#fff', fontSize: 16, margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {video.title}
                    </h3>
                    <span style={{ color: 'var(--vip-text-muted)', fontSize: 13 }}>
                      {video.release} · 3000 Studios
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* AdSense Unit */}
        <section style={{ margin: '40px auto 0' }}>
          <AdSenseUnit slot={ADSENSE_VIDEO_SLOT} />
        </section>
      </main>
    </PublicLayout>
  );
}
