export interface StudioProject {
  id: string;
  title: string;
  category: string;
  status: string;
  summary: string;
  story: string;
  techStack: string[];
  metrics: { label: string; value: string }[];
  actionLabel: string;
  actionUrl: string;
  image: string;
}

export const STUDIO_PROJECTS: StudioProject[] = [
  {
    id: 'thunder-dome-combat-system',
    title: 'Thunder Dome 24: High-Performance Canvas Combat Architecture',
    category: 'Game Engine Engineering',
    status: 'Shipped & Live',
    summary: 'A 60fps arcade flight fighter engineered entirely in TypeScript and Canvas 2D/WebGL without heavy game engine bloat.',
    story: 'Designed to deliver arcade-speed responsive dogfights directly in mobile mobile web browsers, Thunder Dome employs spatial partition collision detection, custom particle emitters, and sub-frame input sampling to achieve zero touch latency on smartphones and desktop browsers alike.',
    techStack: ['TypeScript', 'HTML5 Canvas', 'Spatial Grid Partitioning', 'Web Audio API'],
    metrics: [
      { label: 'Target Frame Rate', value: '60 FPS Lock' },
      { label: 'Active Bosses', value: '24 Phases' },
      { label: 'Bundle Size', value: '< 45 KB Gzip' },
    ],
    actionLabel: 'Play Thunder Dome',
    actionUrl: '/thunder-dome',
    image: '/media/official-3000-studios-profile.png',
  },
  {
    id: 'amped-ear-dsp-system',
    title: 'Amped Ear 3000: High-Precision Spectral Audio Analyzer',
    category: 'Audio DSP Software',
    status: 'Production Live',
    summary: 'Real-time acoustic analysis and frequency recognition system built for professional music producers and audio engineers.',
    story: 'Amped Ear provides ultra-sharp 4096-bin Fast Fourier Transform spectral decomposition, harmonic frequency detection, and intuitive touch-driven EQ training modules, helping audio creators master ear training and pinpoint harsh resonant spikes instantly.',
    techStack: ['Web Audio DSP', 'TypeScript', 'GLSL Shaders', 'AudioWorklet API'],
    metrics: [
      { label: 'FFT Resolution', value: '4096 Bins' },
      { label: 'Latency', value: '< 5ms' },
      { label: 'Platform Support', value: 'Web & Android' },
    ],
    actionLabel: 'Explore Apps',
    actionUrl: '/apps',
    image: '/media/official-3000-studios-profile.png',
  },
  {
    id: '3000studios-vip-platform',
    title: '3000Studios.vip: Cloudflare Edge-First Architecture',
    category: 'Full-Stack Web Architecture',
    status: 'Production Live',
    summary: 'Edge-rendered digital entertainment platform integrating 47-song streaming, WebRTC live broadcasts, and multi-tier VIP commerce.',
    story: 'Built from the ground up for sub-second global performance on Cloudflare Pages and Workers, this platform leverages zero-runtime CSS tokens, WebRTC WHIP/WHEP sub-second video pipes, and native Stripe & Cash App checkout integrations.',
    techStack: ['React', 'TypeScript', 'Vite', 'Cloudflare Pages', 'Cloudflare Stream'],
    metrics: [
      { label: 'Catalog Size', value: '47 Master Releases' },
      { label: 'Edge Latency', value: '< 25ms Global' },
      { label: 'Lighthouse Target', value: '100% Mobile Ready' },
    ],
    actionLabel: 'View Music Catalog',
    actionUrl: '/music',
    image: '/media/official-3000-studios-profile.png',
  },
];
