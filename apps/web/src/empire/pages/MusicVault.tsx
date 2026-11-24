import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, SpotifyLogo, AppleLogo, YoutubeLogo } from '@phosphor-icons/react';
import { EmpirePage, PageHero, Head, Ext, Go } from '../kit';
import { SPOTIFY_ARTIST, APPLE_ARTIST, YOUTUBE_CHANNEL } from '../swatch';
import { publishedSongs, type PublishedSong } from '../../data/publishedSongs';
import { useGlobalMusic } from '../../components/GlobalMusic';

const SONGS: PublishedSong[] = Array.from(new Map(publishedSongs.map((s) => [s.slug, s])).values());
const FEATURED = SONGS.filter((s) => s.cover).slice(0, 10);
const FALLBACK_COVER = '/media/official-3000-studios-profile.webp';

function playSong(song: PublishedSong) {
  const src = song.preview || song.src;
  if (!src) return;
  window.dispatchEvent(new CustomEvent('3000-play-track', { detail: { src, title: song.title, slug: song.slug } }));
}

export function MusicVault() {
  const music = useGlobalMusic();
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? SONGS.filter((s) => s.title.toLowerCase().includes(needle)) : SONGS;
  }, [q]);
  const isOn = (s: PublishedSong) => music.isPlaying && music.activeTitle === s.title;
  const press = (s: PublishedSong) => (isOn(s) ? music.pause() : playSong(s));

  return (
    <EmpirePage>
      <PageHero
        eyebrow="Music vault"
        title={
          <>
            {SONGS.length} songs.
            <br />
            One vault.
          </>
        }
        lead="Every track previews free for one minute here. Full songs live on Spotify, Apple Music and every other platform."
        orb="rgba(155,107,255,.45)"
      >
        <div className="ep-ctas">
          <Ext href={SPOTIFY_ARTIST} gold>
            <SpotifyLogo size={18} weight="fill" /> Spotify
          </Ext>
          <Ext href={APPLE_ARTIST}>
            <AppleLogo size={18} weight="fill" /> Apple Music
          </Ext>
          <Ext href={YOUTUBE_CHANNEL}>
            <YoutubeLogo size={18} weight="fill" /> YouTube
          </Ext>
        </div>
      </PageHero>

      {FEATURED.length > 0 && (
        <section className="ep-sec" style={{ paddingTop: 0 }}>
          <div className="em-wrap ep-rail">
            {FEATURED.map((s) => (
              <div key={s.slug} className="ep-cover">
                <button type="button" className="sq" onClick={() => press(s)} aria-label={`${isOn(s) ? 'Pause' : 'Play'} ${s.title} preview`} style={{ padding: 0, cursor: 'pointer' }}>
                  <img src={s.cover || FALLBACK_COVER} alt="" loading="lazy" decoding="async" />
                  <span className="pl">{isOn(s) ? <Pause size={18} weight="fill" /> : <Play size={18} weight="fill" />}</span>
                </button>
                <Link className="meta" to={`/song/${s.slug}`} style={{ textDecoration: 'none' }}>
                  <b>{s.title}</b>
                  <span>Single</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="ep-sec">
        <div className="em-wrap">
          <Head eyebrow="The full catalog" title={<>All <span className="ep-metal">{SONGS.length}</span></>}>
            <label className="ep-search">
              Find a song
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a title" type="search" />
            </label>
          </Head>
          <div className="ep-glass ep-tracks">
            {list.map((s) => (
              <div key={s.slug} className={isOn(s) ? 'ep-trk is-on' : 'ep-trk'}>
                <span className="n">{String(SONGS.indexOf(s) + 1).padStart(2, '0')}</span>
                <Link className="t" to={`/song/${s.slug}`}>
                  {s.title}
                  {s.explicit ? <span className="e">E</span> : null}
                </Link>
                <span className="pv">1:00 preview</span>
                <button type="button" className="ep-mini" onClick={() => press(s)} aria-label={`${isOn(s) ? 'Pause' : 'Play'} ${s.title} preview`}>
                  {isOn(s) ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
                </button>
              </div>
            ))}
            {list.length === 0 && <p className="ep-dim" style={{ padding: 16 }}>No song matches that title.</p>}
          </div>
          <div className="ep-ctas" style={{ marginTop: 22 }}>
            <Go to="/video">Watch the music videos</Go>
            <Go to="/beats">License instrumentals</Go>
          </div>
        </div>
      </section>
    </EmpirePage>
  );
}
