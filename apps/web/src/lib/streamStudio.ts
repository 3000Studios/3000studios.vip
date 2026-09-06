/** Canvas compositor for phone Go Live: camera + lens filters + premade overlays. */

export type LensFilterId =
  | 'none'
  | 'cinematic'
  | 'noir'
  | 'warmGold'
  | 'coolBlue'
  | 'vintage'
  | 'vivid'
  | 'soft'
  | 'beauty'
  | 'smooth'
  | 'glowUp'
  | 'doggo'
  | 'sparkle'
  | 'neon'
  | 'heat'
  | 'icy'
  | 'popArt'
  | 'vhs'
  | 'chrome'
  | 'blush'
  | 'greenScreen';

export type OverlayId =
  | 'liveBadge'
  | 'watermark'
  | 'lowerThird'
  | 'goldFrame'
  | 'vipCorner'
  | 'ticker'
  | 'neonFrame'
  | 'cinemaBars'
  | 'scanlines'
  | 'cornerBrackets'
  | 'holographic'
  | 'broadcastSafe'
  | 'pulseRing'
  | 'dualGold'
  | 'goldVIP'
  | 'cyberNeon'
  | 'diamondLuxury'
  | 'electroPulse'
  | 'spotlightStudio';

export const LENS_FILTERS: { id: LensFilterId; label: string; css: string; group?: string }[] = [
  { id: 'none', label: 'Clean', css: 'none', group: 'base' },
  { id: 'beauty', label: 'Beauty', css: 'contrast(1.05) saturate(1.08) brightness(1.06) blur(0.35px)', group: 'face' },
  { id: 'smooth', label: 'Smooth skin', css: 'contrast(0.98) brightness(1.08) saturate(1.05) blur(0.55px)', group: 'face' },
  { id: 'glowUp', label: 'Glow up', css: 'brightness(1.12) contrast(1.08) saturate(1.2) blur(0.25px)', group: 'face' },
  { id: 'blush', label: 'Blush', css: 'sepia(0.15) saturate(1.25) hue-rotate(-8deg) brightness(1.05)', group: 'face' },
  { id: 'cinematic', label: 'Cinematic', css: 'contrast(1.15) saturate(0.9) brightness(0.96)', group: 'look' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.25) brightness(0.95)', group: 'look' },
  { id: 'warmGold', label: 'Warm Gold', css: 'sepia(0.35) saturate(1.2) contrast(1.05)', group: 'look' },
  { id: 'coolBlue', label: 'Cool Blue', css: 'saturate(0.85) hue-rotate(15deg) brightness(1.02)', group: 'look' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.45) contrast(1.1) brightness(0.98)', group: 'look' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.45) contrast(1.12)', group: 'look' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.05) contrast(0.92) saturate(1.05)', group: 'look' },
  { id: 'neon', label: 'Neon', css: 'contrast(1.25) saturate(1.6) hue-rotate(280deg) brightness(1.05)', group: 'fun' },
  { id: 'heat', label: 'Heat map', css: 'hue-rotate(300deg) saturate(2) contrast(1.3)', group: 'fun' },
  { id: 'icy', label: 'Icy', css: 'hue-rotate(180deg) saturate(0.85) brightness(1.1) contrast(1.1)', group: 'fun' },
  { id: 'popArt', label: 'Pop art', css: 'contrast(1.5) saturate(2) hue-rotate(40deg)', group: 'fun' },
  { id: 'vhs', label: 'VHS', css: 'contrast(1.2) saturate(0.7) sepia(0.2) blur(0.4px)', group: 'fun' },
  { id: 'chrome', label: 'Chrome', css: 'grayscale(0.3) contrast(1.4) brightness(1.1) saturate(0.5)', group: 'fun' },
  { id: 'doggo', label: 'Doggo tint', css: 'sepia(0.25) hue-rotate(25deg) saturate(1.3) contrast(1.05)', group: 'fun' },
  { id: 'sparkle', label: 'Sparkle', css: 'brightness(1.15) contrast(1.1) saturate(1.35)', group: 'fun' },
  { id: 'greenScreen', label: 'Chroma key', css: 'none', group: 'fx' },
];

export const PREMADE_OVERLAYS: { id: OverlayId; label: string; hint: string; group: string }[] = [
  { id: 'liveBadge', label: 'LIVE badge', hint: 'Red pill top-left', group: 'info' },
  { id: 'watermark', label: '3000 watermark', hint: 'Bottom-right logo text', group: 'info' },
  { id: 'lowerThird', label: 'Lower third', hint: 'Name plate across bottom', group: 'info' },
  { id: 'vipCorner', label: 'VIP corner', hint: 'Top-right tag', group: 'info' },
  { id: 'ticker', label: 'Ticker bar', hint: 'Scrolling bottom strip', group: 'info' },
  { id: 'goldFrame', label: 'Gold frame', hint: 'Classic premium border', group: 'frame' },
  { id: 'dualGold', label: 'Double gold', hint: 'Inner + outer gold rails', group: 'frame' },
  { id: 'goldVIP', label: 'Gold VIP', hint: 'Embossed gold rails & VIP stars', group: 'frame' },
  { id: 'cyberNeon', label: 'Cyber neon', hint: 'Animated cyan/magenta matrix edge', group: 'frame' },
  { id: 'neonFrame', label: 'Neon frame', hint: 'Cyan/magenta broadcast edge', group: 'frame' },
  { id: 'diamondLuxury', label: 'Diamond luxury', hint: 'Shimmering prism border', group: 'frame' },
  { id: 'electroPulse', label: 'Electro pulse', hint: 'Audio-reactive perimeter glow', group: 'frame' },
  { id: 'spotlightStudio', label: 'Studio spotlight', hint: 'Vignette & stage light glow', group: 'frame' },
  { id: 'cornerBrackets', label: 'HUD brackets', hint: 'Tactical corner marks', group: 'frame' },
  { id: 'cinemaBars', label: 'Cinema bars', hint: 'Letterbox 2.35 look', group: 'frame' },
  { id: 'holographic', label: 'Holographic', hint: 'Iridescent edge wash', group: 'frame' },
  { id: 'pulseRing', label: 'Pulse ring', hint: 'Animated live halo', group: 'frame' },
  { id: 'scanlines', label: 'Scanlines', hint: 'CRT overlay', group: 'fx' },
  { id: 'broadcastSafe', label: 'Safe title', hint: 'Action-safe guides', group: 'fx' },
];

export type CameraRotation = 0 | 90 | 180 | 270;

export type StreamStudioOptions = {
  width?: number;
  height?: number;
  filter?: LensFilterId;
  overlays?: OverlayId[];
  lowerThirdTitle?: string;
  lowerThirdSub?: string;
  tickerText?: string;
  rotation?: CameraRotation;
  flipH?: boolean;
  flipV?: boolean;
  zoom?: number;
  panX?: number;
  panY?: number;
};

export class StreamStudio {
  private video = document.createElement('video');
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D;
  private camStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;
  private outStream: MediaStream | null = null;
  private micDeviceId?: string;
  private micMuted = false;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioSourceNode: MediaStreamAudioSourceNode | null = null;
  private audioLevelSubs = new Set<(level: number) => void>();
  private audioLevelTimer = 0;
  private onAudioTrackChange?: (track: MediaStreamTrack) => void;
  private raf = 0;
  private tick = 0;
  private running = false;

  filter: LensFilterId = 'none';
  overlays: Set<OverlayId> = new Set(['liveBadge', 'watermark']);
  lowerThirdTitle = '3000 Studios';
  lowerThirdSub = 'Live · VIP broadcast';
  tickerText = '3000 STUDIOS LIVE · STREAMING NOW · 3000STUDIOS.VIP · ';
  rotation: CameraRotation = 0;
  flipH = false;
  flipV = false;
  zoom = 1;
  panX = 0;
  panY = 0;
  chromaKey = 0.55;
  chromaSmooth = true;

  constructor(opts: StreamStudioOptions = {}) {
    const w = opts.width ?? 1280;
    const h = opts.height ?? 720;
    this.canvas.width = w;
    this.canvas.height = h;
    const ctx = this.canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.setAttribute('playsinline', 'true');
    this.video.setAttribute('webkit-playsinline', 'true');
    this.video.autoplay = true;
    if (opts.filter) this.filter = opts.filter;
    if (opts.overlays) this.overlays = new Set(opts.overlays);
    if (opts.lowerThirdTitle) this.lowerThirdTitle = opts.lowerThirdTitle;
    if (opts.lowerThirdSub) this.lowerThirdSub = opts.lowerThirdSub;
    if (opts.tickerText) this.tickerText = opts.tickerText;
    if (opts.rotation !== undefined) this.rotation = opts.rotation;
    if (opts.flipH !== undefined) this.flipH = opts.flipH;
    if (opts.flipV !== undefined) this.flipV = opts.flipV;
    if (opts.zoom !== undefined) this.zoom = opts.zoom;
    if (opts.panX !== undefined) this.panX = opts.panX;
    if (opts.panY !== undefined) this.panY = opts.panY;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  private setupAudioMeter(stream: MediaStream) {
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      if (this.audioSourceNode) {
        try {
          this.audioSourceNode.disconnect();
        } catch {
          /* ignore */
        }
      }
      this.audioSourceNode = this.audioCtx.createMediaStreamSource(stream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.4;
      this.audioSourceNode.connect(this.analyser);

      if (!this.audioLevelTimer) {
        const data = new Uint8Array(this.analyser.frequencyBinCount);
        const update = () => {
          if (!this.analyser || this.audioLevelSubs.size === 0) {
            this.audioLevelTimer = 0;
            return;
          }
          this.analyser.getByteFrequencyData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            sum += data[i];
          }
          const avg = sum / data.length;
          // Scale from 0-128 average to 0-100%
          const level = this.micMuted ? 0 : Math.min(100, Math.round((avg / 128) * 100));
          this.audioLevelSubs.forEach((cb) => cb(level));
          this.audioLevelTimer = requestAnimationFrame(update);
        };
        this.audioLevelTimer = requestAnimationFrame(update);
      }
    } catch (e) {
      console.warn('Audio meter setup failed:', e);
    }
  }

  subscribeAudioLevel(cb: (level: number) => void): () => void {
    this.audioLevelSubs.add(cb);
    if (this.audioCtx?.state === 'suspended') {
      void this.audioCtx.resume();
    }
    if (!this.audioLevelTimer && this.analyser) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      const update = () => {
        if (!this.analyser || this.audioLevelSubs.size === 0) {
          this.audioLevelTimer = 0;
          return;
        }
        this.analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          sum += data[i];
        }
        const avg = sum / data.length;
        const level = this.micMuted ? 0 : Math.min(100, Math.round((avg / 128) * 100));
        this.audioLevelSubs.forEach((fn) => fn(level));
        this.audioLevelTimer = requestAnimationFrame(update);
      };
      this.audioLevelTimer = requestAnimationFrame(update);
    }
    return () => {
      this.audioLevelSubs.delete(cb);
    };
  }

  async openMicrophone(deviceId?: string): Promise<MediaStreamTrack | null> {
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    this.micDeviceId = deviceId;

    const attempts: MediaTrackConstraints[] = [];
    if (deviceId) {
      attempts.push({
        deviceId: { exact: deviceId },
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      });
      attempts.push({ deviceId: { ideal: deviceId } });
    }
    attempts.push({
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    });
    attempts.push({});

    let lastError: unknown = null;
    for (const audioConstraint of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: Object.keys(audioConstraint).length ? audioConstraint : true,
        });
        if (stream.getAudioTracks().length > 0) {
          this.micStream = stream;
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!this.micStream) {
      const msg = lastError instanceof Error ? lastError.message : 'Microphone access failed';
      throw new Error(`Microphone error: ${msg}. Please allow microphone in your browser.`);
    }

    const track = this.micStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !this.micMuted;
      this.setupAudioMeter(this.micStream);
      this.syncAudioTrackToOutput(track);
    }
    return track || null;
  }

  private syncAudioTrackToOutput(track: MediaStreamTrack) {
    if (!this.outStream) return;
    const existing = this.outStream.getAudioTracks();
    existing.forEach((t) => {
      this.outStream!.removeTrack(t);
      if (t !== track) t.stop();
    });
    this.outStream.addTrack(track);
    this.onAudioTrackChange?.(track);
  }

  setMicrophoneEnabled(enabled: boolean) {
    this.micMuted = !enabled;
    const tracks = this.micStream?.getAudioTracks() ?? [];
    tracks.forEach((t) => {
      t.enabled = enabled;
    });
    if (!enabled) {
      this.audioLevelSubs.forEach((cb) => cb(0));
    }
  }

  isMicrophoneEnabled(): boolean {
    return !this.micMuted;
  }

  hasAudioTrack(): boolean {
    const tracks = this.micStream?.getAudioTracks() ?? [];
    return tracks.some((t) => t.readyState === 'live');
  }

  getActiveMicrophoneTrack(): MediaStreamTrack | null {
    return this.micStream?.getAudioTracks()[0] ?? null;
  }

  setOnAudioTrackChange(cb?: (track: MediaStreamTrack) => void) {
    this.onAudioTrackChange = cb;
  }

  getOutputStream(fps = 30, forceNew = false): MediaStream {
    const activeAudioTrack = this.micStream?.getAudioTracks()[0] || this.camStream?.getAudioTracks()[0];

    if (forceNew && this.outStream) {
      // Don't stop the microphone track, just reset the video container
      this.outStream = null;
    }

    if (!this.outStream) {
      const drawn = this.canvas.captureStream(fps);
      this.outStream = new MediaStream([
        ...drawn.getVideoTracks(),
        ...(activeAudioTrack ? [activeAudioTrack] : []),
      ]);
    } else {
      const existingAudio = this.outStream.getAudioTracks();
      if (activeAudioTrack && (!existingAudio.length || existingAudio[0] !== activeAudioTrack)) {
        existingAudio.forEach((t) => {
          this.outStream!.removeTrack(t);
          if (t !== activeAudioTrack) t.stop();
        });
        this.outStream.addTrack(activeAudioTrack);
      }
    }
    return this.outStream;
  }

  async openCamera(deviceId?: string, facingMode: 'user' | 'environment' = 'user', audioDeviceId?: string) {
    this.camStream?.getTracks().forEach((t) => t.stop());
    this.camStream = null;

    const attempts: MediaStreamConstraints[] = [];
    if (deviceId) {
      attempts.push({ video: { deviceId: { exact: deviceId } } });
      attempts.push({ video: { deviceId: { ideal: deviceId } } });
    }
    attempts.push({
      video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    attempts.push({ video: { facingMode } });
    attempts.push({ video: true });

    let lastError: unknown = null;
    for (const constraints of attempts) {
      try {
        this.camStream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!this.camStream) throw lastError || new Error('Camera did not start');

    this.video.srcObject = this.camStream;
    await this.video.play().catch(() => undefined);

    // Acquire microphone independently so camera constraints never break sound
    if (!this.micStream || this.micStream.getAudioTracks().length === 0 || audioDeviceId !== undefined) {
      try {
        await this.openMicrophone(audioDeviceId || this.micDeviceId);
      } catch (err) {
        console.warn('Microphone initialization warning:', err);
      }
    }

    if (this.outStream) {
      this.outStream = null;
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.drawFrame();
      this.tick += 1;
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.camStream?.getTracks().forEach((t) => t.stop());
    this.camStream = null;
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.micStream = null;
    this.outStream?.getTracks().forEach((t) => t.stop());
    this.outStream = null;
    this.video.srcObject = null;
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.disconnect();
      } catch {
        /* ignore */
      }
      this.audioSourceNode = null;
    }
    if (this.audioCtx) {
      try {
        void this.audioCtx.close();
      } catch {
        /* ignore */
      }
      this.audioCtx = null;
    }
  }

  setFilter(id: LensFilterId) {
    this.filter = id;
  }

  setCameraFraming(opts: {
    rotation?: CameraRotation;
    flipH?: boolean;
    flipV?: boolean;
    zoom?: number;
    panX?: number;
    panY?: number;
  }) {
    if (opts.rotation !== undefined) this.rotation = opts.rotation;
    if (opts.flipH !== undefined) this.flipH = opts.flipH;
    if (opts.flipV !== undefined) this.flipV = opts.flipV;
    if (opts.zoom !== undefined) this.zoom = Math.min(3, Math.max(1, opts.zoom));
    if (opts.panX !== undefined) this.panX = Math.min(1, Math.max(-1, opts.panX));
    if (opts.panY !== undefined) this.panY = Math.min(1, Math.max(-1, opts.panY));
  }

  toggleOverlay(id: OverlayId, on?: boolean) {
    const next = on ?? !this.overlays.has(id);
    if (next) this.overlays.add(id);
    else this.overlays.delete(id);
  }

  private drawCameraFrame() {
    const { ctx, canvas, video } = this;
    if (video.readyState < 2) return;
    const w = canvas.width;
    const h = canvas.height;
    const vw = video.videoWidth || w;
    const vh = video.videoHeight || h;
    const rad = (this.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const boundW = vw * cos + vh * sin;
    const boundH = vw * sin + vh * cos;
    const scale = Math.max(w / boundW, h / boundH) * this.zoom;
    const dw = vw * scale;
    const dh = vh * scale;
    const maxPanX = Math.max(0, (boundW * scale - w) / 2);
    const maxPanY = Math.max(0, (boundH * scale - h) / 2);
    const ox = this.panX * maxPanX;
    const oy = this.panY * maxPanY;
    const useChroma = this.filter === 'greenScreen';
    const filterCss = useChroma ? 'none' : LENS_FILTERS.find((f) => f.id === this.filter)?.css ?? 'none';
    ctx.save();
    ctx.translate(w / 2 + ox, h / 2 + oy);
    ctx.rotate(rad);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.filter = filterCss;
    ctx.drawImage(video, -dw / 2, -dh / 2, dw, dh);
    ctx.filter = 'none';
    ctx.restore();
    if (useChroma) this.applyChromaKey();
  }

  private applyChromaKey() {
    const { ctx, canvas } = this;
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data;
    const thr = 0.35 + this.chromaKey * 0.45;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i] / 255;
      const g = d[i + 1] / 255;
      const b = d[i + 2] / 255;
      const greenish = g > r + 0.12 && g > b + 0.12 && g > thr * 0.55;
      if (greenish) {
        const edge = this.chromaSmooth ? Math.min(1, (g - Math.max(r, b)) * 3) : 1;
        d[i + 3] = Math.max(0, Math.floor(d[i + 3] * (1 - edge)));
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  private drawFrame() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    this.drawCameraFrame();
    if (this.filter !== 'none') {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    if (this.overlays.has('goldFrame')) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, w - 28, h - 28);
    }

    if (this.overlays.has('dualGold')) {
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      ctx.strokeStyle = 'rgba(255, 236, 160, 0.55)';
      ctx.lineWidth = 10;
      ctx.strokeRect(28, 28, w - 56, h - 56);
    }

    if (this.overlays.has('goldVIP')) {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ffd700');
      grad.addColorStop(0.5, '#fff5be');
      grad.addColorStop(1, '#cca000');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, w - 32, h - 32);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    }

    if (this.overlays.has('cyberNeon')) {
      const shift = (this.tick * 3) % 360;
      ctx.strokeStyle = `hsla(${shift}, 100%, 65%, 0.85)`;
      ctx.lineWidth = 6;
      ctx.shadowColor = `hsla(${shift}, 100%, 65%, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.strokeStyle = `hsla(${(shift + 180) % 360}, 100%, 65%, 0.5)`;
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.shadowBlur = 0;
    }

    if (this.overlays.has('neonFrame')) {
      ctx.strokeStyle = 'rgba(111, 244, 255, 0.85)';
      ctx.lineWidth = 4;
      ctx.shadowColor = 'rgba(111, 244, 255, 0.7)';
      ctx.shadowBlur = 18;
      ctx.strokeRect(12, 12, w - 24, h - 24);
      ctx.strokeStyle = 'rgba(255, 77, 196, 0.55)';
      ctx.shadowColor = 'rgba(255, 77, 196, 0.5)';
      ctx.strokeRect(22, 22, w - 44, h - 44);
      ctx.shadowBlur = 0;
    }

    if (this.overlays.has('diamondLuxury')) {
      const dGrad = ctx.createLinearGradient(0, 0, w, 0);
      const phase = (this.tick * 0.02) % 1;
      dGrad.addColorStop((0 + phase) % 1, '#ffffff');
      dGrad.addColorStop((0.3 + phase) % 1, '#70d6ff');
      dGrad.addColorStop((0.6 + phase) % 1, '#ff70a6');
      dGrad.addColorStop((0.9 + phase) % 1, '#ffd670');
      ctx.strokeStyle = dGrad;
      ctx.lineWidth = 5;
      ctx.strokeRect(14, 14, w - 28, h - 28);
    }

    if (this.overlays.has('electroPulse')) {
      const beats = 0.5 + Math.sin(this.tick * 0.15) * 0.5;
      ctx.strokeStyle = `rgba(255, 215, 0, ${0.4 + beats * 0.5})`;
      ctx.lineWidth = 4 + beats * 8;
      ctx.strokeRect(10, 10, w - 20, h - 20);
    }

    if (this.overlays.has('spotlightStudio')) {
      const spotLeft = ctx.createRadialGradient(0, 0, 10, 0, 0, w * 0.5);
      spotLeft.addColorStop(0, 'rgba(255, 245, 215, 0.25)');
      spotLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotLeft;
      ctx.fillRect(0, 0, w, h);

      const spotRight = ctx.createRadialGradient(w, 0, 10, w, 0, w * 0.5);
      spotRight.addColorStop(0, 'rgba(111, 244, 255, 0.2)');
      spotRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = spotRight;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.overlays.has('cornerBrackets')) {
      const arm = Math.min(w, h) * 0.08;
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.9)';
      ctx.lineWidth = 4;
      const corners: [number, number][] = [
        [24, 24],
        [w - 24, 24],
        [24, h - 24],
        [w - 24, h - 24],
      ];
      corners.forEach(([cx, cy], i) => {
        const sx = i % 2 === 0 ? 1 : -1;
        const sy = i < 2 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * arm);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * arm, cy);
        ctx.stroke();
      });
    }

    if (this.overlays.has('cinemaBars')) {
      const bar = Math.round(h * 0.12);
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, bar);
      ctx.fillRect(0, h - bar, w, bar);
    }

    if (this.overlays.has('holographic')) {
      const hg = ctx.createLinearGradient(0, 0, w, h);
      hg.addColorStop(0, 'rgba(111, 244, 255, 0.12)');
      hg.addColorStop(0.5, 'rgba(255, 215, 0, 0.08)');
      hg.addColorStop(1, 'rgba(255, 77, 196, 0.12)');
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(18, 18, w - 36, h - 36);
    }

    if (this.overlays.has('pulseRing')) {
      const pulse = 0.5 + Math.sin(this.tick / 18) * 0.5;
      ctx.strokeStyle = `rgba(255, 60, 60, ${0.35 + pulse * 0.45})`;
      ctx.lineWidth = 8 + pulse * 6;
      ctx.strokeRect(8, 8, w - 16, h - 16);
    }

    if (this.overlays.has('scanlines')) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
    }

    if (this.overlays.has('broadcastSafe')) {
      ctx.strokeStyle = 'rgba(30, 240, 120, 0.45)';
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(w * 0.05, h * 0.05, w * 0.9, h * 0.9);
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8);
      ctx.setLineDash([]);
    }

    if (this.overlays.has('liveBadge')) {
      const label = '● LIVE';
      ctx.font = 'bold 28px Inter, Arial, sans-serif';
      const tw = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
      roundRect(ctx, 28, 28, tw + 28, 42, 21);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, 42, 50);
    }
    if (this.overlays.has('vipCorner')) {
      ctx.font = 'bold 22px Inter, Arial, sans-serif';
      const tw = ctx.measureText('VIP').width;
      const bx = w - tw - 52;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, bx, 28, tw + 28, 36, 10);
      ctx.fill();
      ctx.fillStyle = '#ffd700';
      ctx.textBaseline = 'middle';
      ctx.fillText('VIP', bx + 14, 47);
    }
    if (this.overlays.has('watermark')) {
      ctx.font = 'bold 26px Inter, Arial, sans-serif';
      ctx.fillStyle = 'rgba(255, 215, 0, 0.55)';
      ctx.textAlign = 'right';
      ctx.fillText('3000 STUDIOS', w - 28, h - 28);
      ctx.textAlign = 'left';
    }
    if (this.overlays.has('lowerThird')) {
      const barH = 110;
      const gy = h - barH - 24;
      ctx.fillStyle = 'rgba(0,0,0,0.78)';
      ctx.fillRect(0, gy, w, barH + 24);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(28, gy + 36, 6, 48);
      ctx.font = 'bold 36px Inter, Arial, sans-serif';
      ctx.fillStyle = '#f6e7b0';
      ctx.fillText(this.lowerThirdTitle, 48, gy + 58);
      ctx.font = '22px Inter, Arial, sans-serif';
      ctx.fillStyle = 'rgba(244,239,231,0.8)';
      ctx.fillText(this.lowerThirdSub, 48, gy + 88);
    }
    if (this.overlays.has('ticker')) {
      ctx.fillStyle = 'rgba(20, 10, 0, 0.92)';
      ctx.fillRect(0, h - 40, w, 40);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 18px Inter, Arial, sans-serif';
      const offset = (this.tick * 1.6) % 800;
      ctx.fillText((this.tickerText + this.tickerText).repeat(2), 20 - offset, h - 14);
    }
    ctx.restore();
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export async function listCameras(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'videoinput');
  } catch {
    return [];
  }
}

export async function listMicrophones(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices?.enumerateDevices) return [];
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter((d) => d.kind === 'audioinput');
  } catch {
    return [];
  }
}

