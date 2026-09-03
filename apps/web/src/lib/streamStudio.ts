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
  | 'ticker';

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

export const PREMADE_OVERLAYS: { id: OverlayId; label: string; hint: string }[] = [
  { id: 'liveBadge', label: 'LIVE badge', hint: 'Red pill top-left' },
  { id: 'watermark', label: '3000 watermark', hint: 'Bottom-right logo text' },
  { id: 'lowerThird', label: 'Lower third', hint: 'Name plate across bottom' },
  { id: 'goldFrame', label: 'Gold frame', hint: 'Premium border' },
  { id: 'vipCorner', label: 'VIP corner', hint: 'Top-right tag' },
  { id: 'ticker', label: 'Ticker bar', hint: 'Scrolling bottom strip' },
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
  private outStream: MediaStream | null = null;
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

  getOutputStream(fps = 30, forceNew = false): MediaStream {
    if (forceNew && this.outStream) {
      this.outStream.getTracks().forEach((t) => {
        if (t.kind === 'audio') t.stop();
      });
      this.outStream = null;
    }
    if (!this.outStream) {
      const drawn = this.canvas.captureStream(fps);
      const audio = this.camStream?.getAudioTracks() ?? [];
      this.outStream = new MediaStream([
        ...drawn.getVideoTracks(),
        ...audio.map((t) => t.clone()),
      ]);
    } else {
      const existingAudio = this.outStream.getAudioTracks();
      const liveAudio = this.camStream?.getAudioTracks() ?? [];
      if (liveAudio.length && (!existingAudio.length || existingAudio[0].id !== liveAudio[0].id)) {
        existingAudio.forEach((t) => {
          this.outStream!.removeTrack(t);
          t.stop();
        });
        liveAudio.forEach((t) => this.outStream!.addTrack(t.clone()));
      }
    }
    return this.outStream;
  }

  async openCamera(deviceId?: string, facingMode: 'user' | 'environment' = 'user') {
    this.camStream?.getTracks().forEach((t) => t.stop());
    this.camStream = null;

    const attempts: MediaStreamConstraints[] = [];
    if (deviceId) {
      attempts.push({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: { deviceId: { exact: deviceId } },
      });
      attempts.push({ audio: true, video: { deviceId: { ideal: deviceId } } });
      attempts.push({ audio: false, video: { deviceId: { ideal: deviceId } } });
    }
    attempts.push({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    attempts.push({ audio: true, video: { facingMode } });
    attempts.push({ audio: false, video: { facingMode } });
    attempts.push({ audio: false, video: true });

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

    if (this.outStream) {
      this.outStream.getTracks().forEach((t) => t.stop());
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
    this.outStream?.getTracks().forEach((t) => t.stop());
    this.outStream = null;
    this.video.srcObject = null;
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
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices.filter((d) => d.kind === 'videoinput');
}
