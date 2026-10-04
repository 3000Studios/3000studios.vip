export interface StudioApp {
  id: string;
  name: string;
  category: 'Audio Tool' | 'Game' | 'AI Engine' | 'Web Platform' | 'Creative';
  platform: string;
  status: 'Production Live' | 'Active Beta' | 'In Development';
  version: string;
  tagline: string;
  description: string;
  highlights: string[];
  techStack: string[];
  actionLabel: string;
  actionUrl: string;
  icon: string;
  badgeColor: string;
}

export const STUDIO_APPS: StudioApp[] = [
  {
    id: 'amped-ear-3000',
    name: 'Amped Ear 3000',
    category: 'Audio Tool',
    platform: 'Android & Web Audio',
    status: 'Production Live',
    version: 'v2.4.0',
    tagline: 'High-Precision Realtime Audio Analyzer & Ear Trainer',
    description: 'Professional-grade acoustic analysis and ear training software featuring sub-millisecond FFT spectral visualization, harmonic frequency detection, and responsive tactile DSP controls.',
    highlights: [
      'Sub-millisecond Web Audio / OpenSL low-latency DSP engine',
      'Realtime 4096-band FFT spectral waterfall graph',
      'Tactile parametric EQ & harmonic tone generator',
      'Mobile-optimized touch interface with zero frame drops',
    ],
    techStack: ['TypeScript', 'Web Audio API', 'Canvas 2D/WebGL', 'Android Kotlin NDK'],
    actionLabel: 'Launch Amped Ear',
    actionUrl: '/apps#amped-ear',
    icon: '⚡',
    badgeColor: '#ffd700',
  },
  {
    id: 'thunder-dome-engine',
    name: 'Thunder Dome 24',
    category: 'Game',
    platform: 'Cross-Platform WebGL & Mobile',
    status: 'Production Live',
    version: 'v3.1.2',
    tagline: '24-Level Arcade Space Combat Simulator',
    description: 'High-octane arcade bullet-hell flight combat simulator built with high-performance 60fps canvas rendering, responsive virtual dual-stick touch controls, 24 distinct boss phases, and dynamic soundtrack synchronization.',
    highlights: [
      '60 FPS bullet-hell collision engine capable of 5,000+ simultaneous particles',
      '24 hand-crafted environments and multi-phase boss fight algorithms',
      'Dynamic beat-reactive soundtrack integration',
      'Instant mobile touch response with zero lag',
    ],
    techStack: ['HTML5 Canvas', 'TypeScript', 'Web Audio API', 'Gamepad API'],
    actionLabel: 'Play Thunder Dome',
    actionUrl: '/thunder-dome',
    icon: '🛸',
    badgeColor: '#00f0ff',
  },
  {
    id: 'velvet-engine',
    name: 'Velvet Sound Engine',
    category: 'AI Engine',
    platform: 'Web & Cloudflare Workers',
    status: 'Production Live',
    version: 'v1.8.0',
    tagline: 'Sub-Second Audio-Reactive Canvas & Visual FX',
    description: 'A proprietary web visualizer framework combining real-time frequency analysis with GLSL shader effects, creating synchronized obsidian and molten-gold visualizers for live streams and album releases.',
    highlights: [
      'Zero-latency browser audio context frequency bus',
      'Smooth 60fps GPU-accelerated canvas particle waves',
      'Dynamic color palette morphing based on active album artwork',
    ],
    techStack: ['TypeScript', 'WebGL', 'Web Audio API', 'Vite'],
    actionLabel: 'Experience Velvet',
    actionUrl: '/music',
    icon: '✦',
    badgeColor: '#a855f7',
  },
  {
    id: 'live-webrtc-studio',
    name: 'Cloudflare WHIP/WHEP Broadcast Hub',
    category: 'Web Platform',
    platform: 'Cloudflare Stream & Edge',
    status: 'Production Live',
    version: 'v4.0.0',
    tagline: 'Sub-Second Glass-to-Glass Live Streaming Matrix',
    description: 'Custom WebRTC WHIP broadcast ingress and WHEP egress client running on Cloudflare Stream, enabling sub-second latency video broadcasting from mobile phones and studio hardware directly to viewers globally.',
    highlights: [
      'Sub-500ms glass-to-glass global video transmission',
      'Automatic bitrate negotiation and hardware HEVC/H.264 encoding',
      'Integrated real-time live host controls and interactive audience chat',
    ],
    techStack: ['WebRTC (WHIP/WHEP)', 'Cloudflare Stream', 'React', 'TypeScript'],
    actionLabel: 'Enter Live Stage',
    actionUrl: '/live',
    icon: '●',
    badgeColor: '#ff0055',
  },
];
