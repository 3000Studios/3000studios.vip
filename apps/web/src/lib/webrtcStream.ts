/**
 * Cloudflare Stream WebRTC helpers (WHIP publish + WHEP playback).
 * Phone / browser can go live without OBS.
 * Note: Cloudflare requires WHIP + WHEP together (not WHIP → HLS) while WebRTC is in beta.
 */

async function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 1500): Promise<RTCSessionDescriptionInit | null> {
  if (pc.iceGatheringState === 'complete') return pc.localDescription;
  return new Promise((resolve) => {
    const done = () => resolve(pc.localDescription);
    const t = window.setTimeout(done, timeoutMs);
    pc.addEventListener(
      'icegatheringstatechange',
      () => {
        if (pc.iceGatheringState === 'complete') {
          window.clearTimeout(t);
          done();
        }
      },
      { once: true },
    );
  });
}

async function postSdpOffer(endpoint: string, sdp: string): Promise<{ status: number; body: string; location: string | null }> {
  const res = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'application/sdp' },
    body: sdp,
  });
  const body = await res.text();
  return { status: res.status, body, location: res.headers.get('Location') };
}

async function negotiateOffer(pc: RTCPeerConnection, endpoint: string): Promise<string | null> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const local = await waitForIceGathering(pc);
  if (!local?.sdp) throw new Error('Failed to gather ICE candidates');

  const { status, body, location } = await postSdpOffer(endpoint, local.sdp);
  if (status === 201 || status === 200) {
    await pc.setRemoteDescription({ type: 'answer', sdp: body });
    return location;
  }
  throw new Error(body || `WHIP/WHEP negotiate failed (${status})`);
}

export type PublishState = 'idle' | 'requesting' | 'live' | 'error';

export class WhipPublisher {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private resourceUrl: string | null = null;
  private endpoint: string;
  private ownsTracks = true;

  constructor(endpoint: string) {
    this.endpoint = endpoint.trim();
  }

  /** Publish a pre-built stream (e.g. StreamStudio canvas + mic). */
  async startWithStream(stream: MediaStream, previewEl?: HTMLVideoElement | HTMLCanvasElement): Promise<void> {
    await this.stop();
    this.ownsTracks = false;

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      bundlePolicy: 'max-bundle',
    });

    this.localStream = stream;
    stream.getTracks().forEach((track) => {
      this.pc!.addTransceiver(track, { direction: 'sendonly' });
    });

    if (previewEl && 'srcObject' in previewEl) {
      (previewEl as HTMLVideoElement).srcObject = stream;
      (previewEl as HTMLVideoElement).muted = true;
      (previewEl as HTMLVideoElement).playsInline = true;
      await (previewEl as HTMLVideoElement).play().catch(() => undefined);
    }

    this.resourceUrl = await negotiateOffer(this.pc, this.endpoint);
  }

  async start(videoEl: HTMLVideoElement, facingMode: 'user' | 'environment' = 'user'): Promise<void> {
    await this.stop();
    this.ownsTracks = true;

    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      bundlePolicy: 'max-bundle',
    });

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    this.localStream = stream;

    stream.getTracks().forEach((track) => {
      const transceiver = this.pc!.addTransceiver(track, { direction: 'sendonly' });
      if (track.kind === 'video' && transceiver.sender.track) {
        void transceiver.sender.track.applyConstraints({ width: 1280, height: 720 }).catch(() => undefined);
      }
    });

    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;
    await videoEl.play().catch(() => undefined);

    this.resourceUrl = await negotiateOffer(this.pc, this.endpoint);
  }

  async replaceVideoTrack(track: MediaStreamTrack): Promise<void> {
    const sender = this.pc?.getSenders().find((s) => s.track?.kind === 'video');
    if (sender) await sender.replaceTrack(track);
  }

  async stop(): Promise<void> {
    try {
      const delUrl = this.resourceUrl
        ? this.resourceUrl.startsWith('http')
          ? this.resourceUrl
          : new URL(this.resourceUrl, this.endpoint).toString()
        : this.endpoint;
      await fetch(delUrl, { method: 'DELETE', mode: 'cors' }).catch(() => undefined);
    } catch {
      /* ignore */
    }
    this.pc?.close();
    this.pc = null;
    if (this.ownsTracks) {
      this.localStream?.getTracks().forEach((t) => t.stop());
    }
    this.localStream = null;
    this.resourceUrl = null;
  }

  getMediaStream(): MediaStream | null {
    return this.localStream;
  }
}

export class WhepPlayer {
  private pc: RTCPeerConnection | null = null;
  private stream: MediaStream = new MediaStream();
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint.trim();
  }

  async start(videoEl: HTMLVideoElement): Promise<void> {
    await this.stop();

    this.stream = new MediaStream();
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.cloudflare.com:3478' }],
      bundlePolicy: 'max-bundle',
    });

    this.pc.addTransceiver('video', { direction: 'recvonly' });
    this.pc.addTransceiver('audio', { direction: 'recvonly' });

    this.pc.ontrack = (event) => {
      const track = event.track;
      const hasKind = this.stream.getTracks().some((t) => t.kind === track.kind);
      if (!hasKind) this.stream.addTrack(track);
      if (!videoEl.srcObject) {
        videoEl.srcObject = this.stream;
        void videoEl.play().catch(() => undefined);
      }
    };

    await negotiateOffer(this.pc, this.endpoint);
    videoEl.srcObject = this.stream;
    videoEl.playsInline = true;
    await videoEl.play().catch(() => undefined);
  }

  async stop(): Promise<void> {
    this.pc?.close();
    this.pc = null;
    this.stream.getTracks().forEach((t) => t.stop());
    this.stream = new MediaStream();
  }
}

export function buildWhepUrl(customerCode: string, liveInputId: string): string {
  return `https://customer-${customerCode}.cloudflarestream.com/${liveInputId}/webRTC/play`;
}

export const WHIP_URL_STORAGE_KEY = '3000-stream-whip-url-v1';
export const STREAM_MODE_KEY = '3000-stream-mode-v1'; // 'webrtc' | 'rtmp'
