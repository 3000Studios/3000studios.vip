/**
 * Cloudflare Stream WebRTC helpers (WHIP publish + WHEP playback).
 * Phone / browser can go live without OBS.
 *
 * WHIP publish URL shape (from Cloudflare live input → webRTC.url):
 *   https://customer-<CODE>.cloudflarestream.com/<SECRET>/webRTC/publish
 * Note: <SECRET> is the broadcast key embedded in the path — NOT the live input UID.
 * WHEP playback:
 *   https://customer-<CODE>.cloudflarestream.com/<INPUT_UID>/webRTC/play
 *
 * Beta: WHIP + WHEP must be used together (not WHIP → HLS).
 */

export type WhipValidation =
  | { ok: true; endpoint: string; hint?: string }
  | { ok: false; reason: string; code: 'empty' | 'format' | 'play_url' | 'rtmp' | 'input_id' | 'missing_secret' };

const LIVE_INPUT_ID_HINT = '654382980fc1896d6e16b1e66a299bd6';

export function normalizeWhipUrl(raw: string): string {
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

/** Validate + normalize a Cloudflare WHIP publish URL before POSTing the SDP offer. */
export function validateWhipUrl(raw: string, liveInputId = LIVE_INPUT_ID_HINT): WhipValidation {
  const endpoint = normalizeWhipUrl(raw);
  if (!endpoint) {
    return {
      ok: false,
      code: 'empty',
      reason: 'Paste the WebRTC publish (WHIP) URL from Cloudflare Live Inputs first.',
    };
  }
  if (/^rtmps?:\/\//i.test(endpoint) || endpoint.includes('live.cloudflare.com')) {
    return {
      ok: false,
      code: 'rtmp',
      reason: 'That is an RTMPS URL for OBS. Phone studio needs the WebRTC WHIP publish URL ending in /webRTC/publish.',
    };
  }
  if (/\/webRTC\/play\/?$/i.test(endpoint)) {
    return {
      ok: false,
      code: 'play_url',
      reason: 'That is the WHEP playback URL (for viewers). You need the publish URL ending in /webRTC/publish.',
    };
  }
  if (!/cloudflarestream\.com/i.test(endpoint)) {
    return {
      ok: false,
      code: 'format',
      reason: 'WHIP URL should be on customer-….cloudflarestream.com',
    };
  }
  if (!/\/webRTC\/publish\/?$/i.test(endpoint)) {
    return {
      ok: false,
      code: 'format',
      reason: 'WHIP URL must end with /webRTC/publish (copy webRTC.url from the live input).',
    };
  }

  let path = '';
  try {
    path = new URL(endpoint).pathname.replace(/\/+$/, '');
  } catch {
    return { ok: false, code: 'format', reason: 'WHIP URL is not a valid URL.' };
  }

  // Expected: /<SECRET>/webRTC/publish  (secret is long; not the public live input id alone)
  const parts = path.split('/').filter(Boolean);
  // parts: [secret, 'webRTC', 'publish'] ideally
  const secret = parts.length >= 3 ? parts[0] : '';
  if (!secret || secret.length < 20) {
    return {
      ok: false,
      code: 'missing_secret',
      reason:
        'WHIP URL is missing the secret path segment. Open Cloudflare → Live Inputs → your input → copy the full WebRTC publish URL (includes a long secret, not just the input id).',
    };
  }
  // Common mistake: …/<inputId>/webRTC/publish (secret must come from webRTC.url, not the public UID)
  if (secret === liveInputId) {
    return {
      ok: false,
      code: 'input_id',
      reason:
        'You pasted a URL that uses the live input ID. Cloudflare WHIP needs the secret publish path: …/<SECRET>/webRTC/publish from the dashboard (webRTC.url). Using the input ID alone causes 401/405.',
    };
  }

  return {
    ok: true,
    endpoint: endpoint.replace(/\/+$/, ''),
    hint: 'WHIP URL looks valid. Click Go Live with looks to POST the WebRTC offer.',
  };
}

export function describeWhipHttpError(status: number, body: string): string {
  const snippet = (body || '').replace(/\s+/g, ' ').trim().slice(0, 180);
  if (status === 405) {
    return (
      '405 Method Not Allowed — the WHIP endpoint rejected POST. ' +
      'Almost always a wrong URL: use the full webRTC publish URL (…/<SECRET>/webRTC/publish), not the live input id, not /webRTC/play, not the iframe link. ' +
      'Re-copy from Cloudflare Live Inputs. ' +
      (snippet ? `Server: ${snippet}` : '')
    );
  }
  if (status === 401 || status === 403) {
    return (
      `${status} Unauthorized — WHIP secret is wrong or revoked. ` +
      'Open Cloudflare Live Inputs, copy a fresh WebRTC publish URL (or rotate keys), paste it again, then Go Live. ' +
      (snippet ? `Server: ${snippet}` : '')
    );
  }
  if (status === 404) {
    return '404 — WHIP URL not found. Check customer code and secret path in the publish URL.';
  }
  if (status === 429) {
    return '429 — rate limited by Cloudflare Stream. Wait a moment and try again.';
  }
  return snippet || `WHIP/WHEP negotiate failed (${status})`;
}

async function waitForIceGathering(pc: RTCPeerConnection, timeoutMs = 4000): Promise<RTCSessionDescriptionInit | null> {
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

async function postSdpOffer(
  endpoint: string,
  sdp: string,
  authHeader?: string,
): Promise<{ status: number; body: string; location: string | null }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/sdp',
    Accept: 'application/sdp',
  };
  if (authHeader) headers.Authorization = authHeader;

  const res = await fetch(endpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers,
    body: sdp,
  });
  const body = await res.text();
  return { status: res.status, body, location: res.headers.get('Location') };
}

async function negotiateOffer(pc: RTCPeerConnection, endpoint: string, authHeader?: string): Promise<string | null> {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const local = await waitForIceGathering(pc);
  if (!local?.sdp) throw new Error('Failed to gather ICE candidates — check network / VPN and retry.');

  const { status, body, location } = await postSdpOffer(endpoint, local.sdp, authHeader);
  if (status === 201 || status === 200) {
    await pc.setRemoteDescription({ type: 'answer', sdp: body });
    return location;
  }
  throw new Error(describeWhipHttpError(status, body));
}

export type PublishState = 'idle' | 'requesting' | 'live' | 'error';

export class WhipPublisher {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private resourceUrl: string | null = null;
  private endpoint: string;
  private authHeader?: string;
  private ownsTracks = true;

  constructor(endpoint: string, authHeader?: string) {
    this.endpoint = normalizeWhipUrl(endpoint);
    this.authHeader = authHeader;
  }

  /** Publish a pre-built stream (e.g. StreamStudio canvas + mic). */
  async startWithStream(stream: MediaStream, previewEl?: HTMLVideoElement | HTMLCanvasElement): Promise<void> {
    const check = validateWhipUrl(this.endpoint);
    if (!check.ok) throw new Error(check.reason);

    await this.stop();
    this.ownsTracks = false;

    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();
    if (videoTracks.length === 0) {
      throw new Error('No video track to publish. Allow camera access and start the studio preview first.');
    }

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
      bundlePolicy: 'max-bundle',
    });

    this.localStream = stream;
    for (const track of stream.getTracks()) {
      this.pc.addTransceiver(track, { direction: 'sendonly' });
    }

    if (previewEl && 'srcObject' in previewEl) {
      (previewEl as HTMLVideoElement).srcObject = stream;
      (previewEl as HTMLVideoElement).muted = true;
      (previewEl as HTMLVideoElement).playsInline = true;
      await (previewEl as HTMLVideoElement).play().catch(() => undefined);
    }

    this.resourceUrl = await negotiateOffer(this.pc, check.endpoint, this.authHeader);

    // Keep a soft reference so we can report track liveness
    void audioTracks;
  }

  async start(videoEl: HTMLVideoElement, facingMode: 'user' | 'environment' = 'user'): Promise<void> {
    const check = validateWhipUrl(this.endpoint);
    if (!check.ok) throw new Error(check.reason);

    await this.stop();
    this.ownsTracks = true;

    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
      bundlePolicy: 'max-bundle',
    });

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
    } catch (err) {
      throw new Error(describeCameraError(err));
    }
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

    this.resourceUrl = await negotiateOffer(this.pc, check.endpoint, this.authHeader);
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
        : null;
      if (delUrl) {
        await fetch(delUrl, { method: 'DELETE', mode: 'cors', credentials: 'omit' }).catch(() => undefined);
      }
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
    this.endpoint = normalizeWhipUrl(endpoint);
  }

  async start(videoEl: HTMLVideoElement): Promise<void> {
    await this.stop();

    this.stream = new MediaStream();
    this.pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
      ],
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

export function describeCameraError(err: unknown): string {
  const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
  const message = err instanceof Error ? err.message : 'Camera failed';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera permission blocked. Click the lock icon in the address bar → allow Camera + Microphone for 3000studios.vip, then Refresh preview.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'No camera found. Plug in your Logi C615 (or enable the Integrated Camera) and try again.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Camera is busy (another app/tab is using it). Close Zoom/Teams/OBS preview and retry.';
  }
  if (name === 'OverconstrainedError') {
    return 'That camera mode is not supported. Pick another camera from the list or use Default camera.';
  }
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
    return 'Camera requires HTTPS. Open https://3000studios.vip/admin';
  }
  return message;
}

export const WHIP_URL_STORAGE_KEY = '3000-stream-whip-url-v1';
export const STREAM_MODE_KEY = '3000-stream-mode-v1'; // 'webrtc' | 'rtmp'
