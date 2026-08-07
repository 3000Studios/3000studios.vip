/** Canvas compositor for phone Go Live: camera + lens filters + premade overlays. */

export type LensFilterId =
  | 'none'
  | 'cinematic'
  | 'noir'
  | 'warmGold'
  | 'coolBlue'
  | 'vintage'
  | 'vivid'
  | 'soft';

export type OverlayId =
  | 'liveBadge'
  | 'watermark'
  | 'lowerThird'
  | 'goldFrame'
  | 'vipCorner'
  | 'ticker';

export const LENS_FILTERS: { id: LensFilterId; label: string; css: string }[] = [
  { id: 'none', label: 'Clean', css: 'none' },
  { id: 'cinematic', label: 'Cinematic', css: 'contrast(1.15) saturate(0.9) brightness(0.96)' },
  { id: 'noir', label: 'Noir', css: 'grayscale(1) contrast(1.25) brightness(0.95)' },
  { id: 'warmGold', label: 'Warm Gold', css: 'sepia(0.35) saturate(1.2) contrast(1.05)' },
  { id: 'coolBlue', label: 'Cool Blue', css: 'saturate(0.85) hue-rotate(15deg) brightness(1.02)' },
  { id: 'vintage', label: 'Vintage', css: 'sepia(0.45) contrast(1.1) brightness(0.98)' },
  { id: 'vivid', label: 'Vivid', css: 'saturate(1.45) contrast(1.12)' },
  { id: 'soft', label: 'Soft', css: 'brightness(1.05) contrast(0.92) saturate(1.05)' },
];

export const PREMADE_OVERLAYS: { id: OverlayId; label: string; hint: string }[] = [
  { id: 'liveBadge', label: 'LIVE badge', hint: 'Red pill top-left' },
  { id: 'watermark', label: '3000 watermark', hint: 'Bottom-right logo text' },
  { id: 'lowerThird', label: 'Lower third', hint: 'Name plate across bottom' },
  { id: 'goldFrame', label: 'Gold frame', hint: 'Premium border' },
  { id: 'vipCorner', label: 'VIP corner', hint: 'Top-right tag' },
  { id: 'ticker', label: 'Ticker bar', hint: 'Scrolling bottom strip' },
];

/** Degrees clockwise */
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
  /** 1 = cover fit, up to ~3 = tight crop */
  zoom?: number;
  /** -1..1 pan after zoom (crop position) */
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

  /** Always rebuild so audio follows the current camera and canvas is capturing. */
  getOutputStream(fps = 30, forceNew = false): MediaStream {
    if (forceNew && this.outStream) {
      this.outStream.getTracks().forEach((t) => {
        // Do not stop canvas capture track until replaced — stop old clones only
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
      // Refresh audio clones if camera changed
      const existingAudio = this.outStream.getAudioTracks();
      const liveAudio = this.camStream?.getAudioTracks() ?? [];
      if (liveAudio.length && (!existingAudio.length || existingAudio[0].id !== liveAudio[0].id && existingAudio[0].label !== liveAudio[0].label)) {
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

    const videoConstraint: MediaTrackConstraints = deviceId
      ? { deviceId: { ideal: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
      : { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } };

    try {
      this.camStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: videoConstraint,
      });
    } catch (first) {
      // Fallback: video-only, then retry without exact device
      try {
        this.camStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: deviceId ? { deviceId: { ideal: deviceId } } : true,
        });
      } catch {
        throw first;
      }
    }
    this.video.srcObject = this.camStream;
    await this.video.play().catch(() => undefined);

    // Rebuild output so audio tracks stay in sync after camera switch
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
    // Axis-aligned bounds of the rotated video
    const boundW = vw * cos + vh * sin;
    const boundH = vw * sin + vh * cos;
    const zoom = this.zoom;
    const scale = Math.max(w / boundW, h / boundH) * zoom;
    const dw = vw * scale;
    const dh = vh * scale;
    const maxPanX = Math.max(0, (boundW * scale - w) / 2);
    const maxPanY = Math.max(0, (boundH * scale - h) / 2);
    const ox = this.panX * maxPanX;
    const oy = this.panY * maxPanY;

    ctx.save();
    ctx.translate(w / 2 + ox, h / 2 + oy);
    ctx.rotate(rad);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.drawImage(video, -dw / 2, -dh / 2, dw, dh);
    ctx.restore();
  }

  private drawFrame() {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const filterCss = LENS_FILTERS.find((f) => f.id === this.filter)?.css ?? 'none';
    ctx.filter = filterCss;
    this.drawCameraFrame();
    ctx.filter = 'none';

    // Soft vignette for most non-clean looks
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
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.25)';
      ctx.lineWidth = 2;
      ctx.strokeRect(22, 22, w - 44, h - 44);
    }

    if (this.overlays.has('liveBadge')) {
      const label = '● LIVE';
      ctx.font = 'bold 28px Inter, Arial, sans-serif';
      const tw = ctx.measureText(label).width;
      const bx = 28;
      const by = 28;
      const bw = tw + 28;
      const bh = 42;
      ctx.fillStyle = 'rgba(220, 38, 38, 0.92)';
      roundRect(ctx, bx, by, bw, bh, 21);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, bx + 14, by + bh / 2 + 1);
    }

    if (this.overlays.has('vipCorner')) {
      const label = 'VIP';
      ctx.font = 'bold 22px Inter, Arial, sans-serif';
      const tw = ctx.measureText(label).width;
      const bx = w - tw - 52;
      const by = 28;
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      roundRect(ctx, bx, by, tw + 28, 36, 10);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,0,0.7)';
      ctx.lineWidth = 1.5;
      roundRect(ctx, bx, by, tw + 28, 36, 10);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, bx + 14, by + 19);
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
      const grad = ctx.createLinearGradient(0, gy, 0, gy + barH);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.35, 'rgba(0,0,0,0.72)');
      grad.addColorStop(1, 'rgba(0,0,0,0.88)');
      ctx.fillStyle = grad;
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
      const th = 40;
      ctx.fillStyle = 'rgba(20, 10, 0, 0.92)';
      ctx.fillRect(0, h - th, w, th);
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 18px Inter, Arial, sans-serif';
      const text = (this.tickerText + this.tickerText).repeat(2);
      const offset = (this.tick * 1.6) % 800;
      ctx.fillText(text, 20 - offset, h - 14);
    }

    ctx.restore();
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
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
