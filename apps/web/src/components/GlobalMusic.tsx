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
  currentTime: number;
  duration: number;
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
  seekTo: (seconds: number) => void;
  playTrack: (src: string, title: string) => void;
  playIndex: (i: number) => void;
};

const MusicContext = createContext<MusicApi | null>(null);

// Shared hook lives with the provider so playback state stays centralized.
// eslint-disable-next-line react-refresh/only-export-components
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

/**
 * Persistent site-wide music — mounted once at app root so route changes never reset playback.
 */
export function GlobalMusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // The public player opens on the evidence-backed DistroKid release instead
  // of a random local-vault item.
  const startIndex = 0;
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.min(audio.duration || 0, Math.max(0, seconds));
    setCurrentTime(audio.currentTime);
  }, []);

  // Load metadata only. Playback must always come from an explicit music control.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    playIndex(startIndex);
    return () => {
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
    const audio = audioRef.current;
    if (!audio) return;
    const sync = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('durationchange', sync);
    return () => {
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('loadedmetadata', sync);
      audio.removeEventListener('durationchange', sync);
    };
  }, []);

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
      currentTime,
      duration,
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
      seekTo,
      playTrack,
      playIndex,
    }),
    [
      isPlaying,
      muted,
      volume,
      currentTime,
      duration,
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
      seekTo,
      playTrack,
      playIndex,
    ],
  );

  return (
    <MusicContext.Provider value={api}>
      <audio ref={audioRef} preload="metadata" playsInline crossOrigin="anonymous" />
      {children}
    </MusicContext.Provider>
  );
}

/** Now-playing bar removed — playback lives on /music. */
export function GlobalMusicBar() {
  return null;
}
