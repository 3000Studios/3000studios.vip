import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { featureSong, getSongBySrc, getSongByTitle, rolloutSongs, type CatalogSong } from '../data/music';

type MusicApi = {
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  activeIndex: number;
  activeSong: CatalogSong;
  activeTitle: string;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  playTrack: (src: string, title: string) => void;
  playIndex: (i: number) => void;
};

const MusicContext = createContext<MusicApi | null>(null);

export function useGlobalMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useGlobalMusic requires GlobalMusicProvider');
  return ctx;
}

function applySongTheme(song?: CatalogSong | null) {
  if (!song) return;
  const root = document.documentElement;
  root.style.setProperty('--theme-a', song.palette.a);
  root.style.setProperty('--theme-b', song.palette.b);
  root.style.setProperty('--theme-c', song.palette.c);
  root.style.setProperty('--theme-gold', song.palette.gold);
  root.dataset.songWallpaper = song.wallpaper;
  root.dataset.songSlug = song.slug;
  window.dispatchEvent(
    new CustomEvent('3000-song-theme', {
      detail: {
        slug: song.slug,
        title: song.title,
        cover: song.cover,
        palette: song.palette,
        wallpaper: song.wallpaper,
        src: song.src,
      },
    }),
  );
}

function shuffleIndex(max: number, avoid?: number) {
  if (max <= 1) return 0;
  let i = Math.floor(Math.random() * max);
  if (avoid !== undefined && i === avoid) i = (i + 1) % max;
  return i;
}

/**
 * Persistent site-wide music — mounted once at app root so route changes never reset playback.
 */
export function GlobalMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const startIndex = useMemo(() => shuffleIndex(rolloutSongs.length), []);
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  const activeSong = rolloutSongs[activeIndex] ?? rolloutSongs[0];
  const activeTitle = activeSong?.title ?? featureSong.title;

  const connectAnalyzer = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;
    const source = ctx.createMediaElementSource(audio);
    sourceRef.current = source;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    analyserRef.current = analyser;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, value) => sum + value, 0) / data.length / 255;
      document.documentElement.style.setProperty('--beat', Math.max(0.04, avg).toFixed(3));
      document.documentElement.style.setProperty('--player-beat', avg.toFixed(3));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const playIndex = useCallback(
    (i: number, opts?: { autoplay?: boolean }) => {
      const song = rolloutSongs[((i % rolloutSongs.length) + rolloutSongs.length) % rolloutSongs.length];
      if (!song) return;
      const audio = audioRef.current;
      if (!audio) return;
      const nextSrc = song.src;
      const current = audio.getAttribute('src') || audio.src;
      if (!current.endsWith(nextSrc)) {
        audio.src = nextSrc;
      }
      setActiveIndex(rolloutSongs.findIndex((s) => s.src === song.src));
      applySongTheme(song);
      audio.volume = volume;
      audio.muted = muted;
      connectAnalyzer();
      void ctxRef.current?.resume();
      if (opts?.autoplay !== false) {
        void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    },
    [volume, muted, connectAnalyzer],
  );

  const playTrack = useCallback(
    (src: string, title: string) => {
      const song = getSongBySrc(src) || getSongByTitle(title);
      if (song) {
        const idx = rolloutSongs.findIndex((s) => s.slug === song.slug || s.src === song.src);
        playIndex(idx >= 0 ? idx : 0);
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      if (!audio.src.endsWith(src)) audio.src = src;
      connectAnalyzer();
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    },
    [playIndex, connectAnalyzer],
  );

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    connectAnalyzer();
    void ctxRef.current?.resume();
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [connectAnalyzer]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) pause();
    else play();
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    playIndex(activeIndex + 1);
  }, [activeIndex, playIndex]);

  const prev = useCallback(() => {
    playIndex(activeIndex - 1);
  }, [activeIndex, playIndex]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    setVolumeState(clamped);
    if (audioRef.current) audioRef.current.volume = clamped;
    if (clamped > 0) setMutedState(false);
  }, []);

  const setMuted = useCallback((m: boolean) => {
    setMutedState(m);
    if (audioRef.current) audioRef.current.muted = m;
  }, []);

  // Initial load — start random track once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    playIndex(startIndex);
    const unlock = () => {
      void ctxRef.current?.resume();
      void audio.play().then(() => setIsPlaying(true)).catch(() => undefined);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onEnded = () => playIndex(activeIndex + 1);
    const audio = audioRef.current;
    audio?.addEventListener('ended', onEnded);
    return () => audio?.removeEventListener('ended', onEnded);
  }, [activeIndex, playIndex]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { src: string; title: string };
      if (!detail?.src) return;
      playTrack(detail.src, detail.title);
    };
    window.addEventListener('3000-play-track', handler as EventListener);
    return () => window.removeEventListener('3000-play-track', handler as EventListener);
  }, [playTrack]);

  // Pause global music while WHIP/live host is broadcasting from this browser (optional quiet)
  useEffect(() => {
    const onLive = (e: Event) => {
      const live = Boolean((e as CustomEvent).detail?.live);
      if (live) pause();
    };
    window.addEventListener('3000-host-live', onLive);
    return () => window.removeEventListener('3000-host-live', onLive);
  }, [pause]);

  const api = useMemo<MusicApi>(
    () => ({
      isPlaying,
      muted,
      volume,
      activeIndex,
      activeSong,
      activeTitle,
      play,
      pause,
      toggle,
      next,
      prev,
      setVolume,
      setMuted,
      playTrack,
      playIndex,
    }),
    [
      isPlaying,
      muted,
      volume,
      activeIndex,
      activeSong,
      activeTitle,
      play,
      pause,
      toggle,
      next,
      prev,
      setVolume,
      setMuted,
      playTrack,
      playIndex,
    ],
  );

  return (
    <MusicContext.Provider value={api}>
      <audio ref={audioRef} preload="auto" playsInline crossOrigin="anonymous" />
      {children}
      <GlobalMusicBar />
    </MusicContext.Provider>
  );
}

function GlobalMusicBar() {
  const m = useGlobalMusic();
  const cover = m.activeSong?.cover || '/favicon.svg';

  return (
    <div className="globalPlayer globalPlayer--pro" aria-label="Site music player">
      <div className="globalPlayerLiveBg" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <img className="globalPlayerCover" src={cover} alt="" width={44} height={44} />
      <div className="globalPlayerMeta">
        <span>Now playing</span>
        <strong className="shimmerText">{m.activeTitle}</strong>
      </div>
      <div className="globalPlayerControls">
        <button type="button" className="gpBtn" onClick={m.prev} aria-label="Previous song">
          ‹‹
        </button>
        <button type="button" className="gpBtn gpPlay" onClick={m.toggle} aria-label={m.isPlaying ? 'Pause' : 'Play'}>
          {m.isPlaying ? '❚❚' : '▶'}
        </button>
        <button type="button" className="gpBtn" onClick={m.next} aria-label="Next song">
          ››
        </button>
      </div>
      <label className="gpVolume">
        <span className="srOnly">Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={m.muted ? 0 : m.volume}
          onChange={(e) => m.setVolume(Number(e.target.value))}
          aria-label="Volume"
        />
      </label>
      <button type="button" className="gpBtn gpMute" onClick={() => m.setMuted(!m.muted)} aria-label={m.muted ? 'Unmute' : 'Mute'}>
        {m.muted || m.volume === 0 ? 'Muted' : 'Mute'}
      </button>
    </div>
  );
}
