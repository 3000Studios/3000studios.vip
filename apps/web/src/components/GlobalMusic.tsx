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
import {
  featureSong,
  getSongBySrc,
  getSongByTitle,
  rolloutSongs,
  type CatalogSong,
} from '../data/music';
import { publishAnalyser } from '../lib/audioAnalyserBus';
import { previewSourceForSong } from '../lib/previews';

const MUSIC_ON_KEY = '3000-music-on';

type MusicApi = {
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  progress: number;
  duration: number;
  activeIndex: number;
  activeSong: CatalogSong;
  activeTitle: string;
  /** True when the loaded source is a preview (the on-site model since
   *  2026-10-27 — full tracks live on the streaming platforms). */
  isPreview: boolean;
  playbackError: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (t: number) => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  seekTo: (seconds: number) => void;
  playTrack: (src: string, title: string) => void;
  playIndex: (i: number, opts?: { autoplay?: boolean }) => void;
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
  const [isPreview, setIsPreview] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [volume, setVolumeState] = useState(0.42);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const activeSong = rolloutSongs[activeIndex] ?? rolloutSongs[0];
  const activeTitle = activeSong?.title ?? featureSong.title;

  const connectAnalyzer = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (!analyserRef.current) {
      try {
        const source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
        publishAnalyser(analyser);
      } catch {
        // Already connected or CORS/autoplay policy blocked setup.
        return;
      }
    }
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
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
      const song =
        rolloutSongs[((i % rolloutSongs.length) + rolloutSongs.length) % rolloutSongs.length];
      if (!song) return;
      const audio = audioRef.current;
      if (!audio) return;
      setPlaybackError(null);
      if (!song.src) {
        setIsPlaying(false);
        setPlaybackError('No preview for this title yet.');
        return;
      }
      // Gesture gate (VIP-1000X fix #1): without autoplay intent this is a
      // "cue" — update the selection/theme only. Do NOT assign audio.src
      // (that fetches the mp3 and Chrome aborts it), do NOT create/resume
      // an AudioContext, and do NOT call play() before the visitor's first
      // interaction. play()/playTrack()/toggle() all pass autoplay: true
      // from real click handlers; 'ended'-advance reuses an already
      // gesture-authorised context.
      if (opts?.autoplay !== true) {
        setActiveIndex(rolloutSongs.findIndex((s) => s.src === song.src));
        applySongTheme(song);
        audio.pause();
        setIsPlaying(false);
        return;
      }
      // Music model flip (2026-10-27): the player only ever loads a
      // PREVIEW source — the produced 1-minute preview video's audio or
      // the label's Apple preview clip. Full-track masters are no longer
      // public, so a song without a preview fails honestly here instead
      // of streaming the master.
      const preview = previewSourceForSong(song);
      if (!preview) {
        setIsPlaying(false);
        setPlaybackError(
          'Preview coming soon — the full song is free on the streaming platforms.',
        );
        return;
      }
      const nextSrc = preview.src;
      setIsPreview(true);
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
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [volume, muted, connectAnalyzer],
  );

  const playTrack = useCallback(
    (src: string, title: string) => {
      const song = getSongBySrc(src) || getSongByTitle(title);
      if (song) {
        const idx = rolloutSongs.findIndex((s) => s.slug === song.slug || s.src === song.src);
        playIndex(idx >= 0 ? idx : 0, { autoplay: true });
        return;
      }
      const audio = audioRef.current;
      if (!audio) return;
      // Unknown-source fallback: never stream a full-track master path —
      // on-site playback is previews only (music model flip, 2026-10-27).
      if (src.includes('/media/') && !src.includes('/media/previews/')) {
        setPlaybackError(
          'Full tracks play on the streaming platforms — previews only on this site.',
        );
        return;
      }
      if (!audio.src.endsWith(src)) audio.src = src;
      connectAnalyzer();
      void audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    },
    [playIndex, connectAnalyzer],
  );

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // First gesture: the audio element intentionally has no src yet
    // (preload gate) — load the cued track through playIndex, which is
    // also where the AudioContext is created/resumed.
    if (!audio.getAttribute('src')) {
      playIndex(activeIndex, { autoplay: true });
      return;
    }
    connectAnalyzer();
    void ctxRef.current?.resume();
    void audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [connectAnalyzer, playIndex, activeIndex]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
      localStorage.setItem(MUSIC_ON_KEY, '0');
    } else {
      play();
      localStorage.setItem(MUSIC_ON_KEY, '1');
    }
  }, [isPlaying, play, pause]);

  const next = useCallback(() => {
    playIndex(activeIndex + 1, { autoplay: isPlaying });
  }, [activeIndex, isPlaying, playIndex]);

  const prev = useCallback(() => {
    playIndex(activeIndex - 1, { autoplay: isPlaying });
  }, [activeIndex, isPlaying, playIndex]);

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

  const seek = seekTo;

  // NO autoplay on load (VIP-1000X fix #1): creating an AudioContext or
  // fetching/playing audio before the visitor's first gesture is blocked
  // by Chrome and produced the aborted i-always-feel-like.mp3 request.
  // Cue the opening track only — no src assignment, no context, no fetch.
  // Playback starts from the visitor's first tap on any play control.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    playIndex(startIndex);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try {
        sourceRef.current?.disconnect();
        analyserRef.current?.disconnect();
        void ctxRef.current?.close();
      } catch {
        /* ignore */
      }
      ctxRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };
    const onError = () => {
      setIsPlaying(false);
      setPlaybackError('Playback failed — try Apple Music / Spotify, or wait for the master upload.');
    };
    audio.addEventListener('error', onError);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onTime);
    return () => {
      audio.removeEventListener('error', onError);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onTime);
    };
  }, []);

  useEffect(() => {
    const onEnded = () => playIndex(activeIndex + 1, { autoplay: true });
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
      progress: currentTime,
      duration,
      activeIndex,
      activeSong,
      activeTitle,
      isPreview,
      playbackError,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
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
      isPreview,
      playbackError,
      play,
      pause,
      toggle,
      next,
      prev,
      seek,
      setVolume,
      setMuted,
      seekTo,
      playTrack,
      playIndex,
    ],
  );

  return (
    <MusicContext.Provider value={api}>
      {/* preload="none" + no autoPlay + no src until first gesture:
          zero audio network requests on page load (VIP-1000X fix #1). */}
      <audio ref={audioRef} preload="none" playsInline crossOrigin="anonymous" />
      {children}
    </MusicContext.Provider>
  );
}

/** Site-wide music on/off control. */
export function GlobalMusicToggle({ className = '' }: { className?: string }) {
  const { isPlaying, toggle, activeTitle } = useGlobalMusic();
  return (
    <button
      type="button"
      className={`globalMusicToggle ${isPlaying ? 'is-on' : 'is-off'} ${className}`.trim()}
      onClick={toggle}
      aria-pressed={isPlaying}
      aria-label={isPlaying ? 'Turn music off' : 'Turn music on'}
      title={isPlaying ? `Music on · ${activeTitle}` : 'Music off'}
    >
      <span className="globalMusicToggleIcon" aria-hidden="true">
        {isPlaying ? '♪' : '⊘'}
      </span>
      <span className="globalMusicToggleLabel">{isPlaying ? 'Music on' : 'Music off'}</span>
    </button>
  );
}

export function GlobalMusicBar() {
  return <GlobalMusicToggle />;
}
