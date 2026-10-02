import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useLocation } from 'react-router-dom';

// 1. Audio Analyzer Hookup
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let dataArray: any = null;

function setupAudioAnalysis(audioElement: HTMLAudioElement) {
  if (audioContext) return;
  // Note: For cross-browser compatibility, we cast to any for webkitAudioContext
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  audioContext = new AudioCtx();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 128;
  const source = audioContext.createMediaElementSource(audioElement);
  source.connect(analyser);
  analyser.connect(audioContext.destination);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
}

export function ThreeReactiveBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 2. Three.js Canvas Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100vw';
    renderer.domElement.style.height = '100vh';
    renderer.domElement.style.zIndex = '0';
    renderer.domElement.style.pointerEvents = 'none';
    
    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 25;

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Try to find the audio element to connect
    const attachAudio = () => {
      const audioEl = document.querySelector('audio');
      if (audioEl) {
        // Need user interaction for audio context usually, but we attach if it exists
        // Might throw if cross-origin isn't set, but we try:
        try {
          setupAudioAnalysis(audioEl as HTMLAudioElement);
        } catch (e) {
          console.warn('Audio connection failed:', e);
        }
      }
    };
    attachAudio();
    // Re-check periodically or listen to DOM changes if needed, but a simple interval or click listener works best
    window.addEventListener('click', attachAudio, { once: true });

    // 4. Reactive Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      let bassFactor = 0;
      if (analyser && dataArray) {
        (analyser as any).getByteFrequencyData(dataArray);
        // Low frequency average for bass response
        bassFactor = (dataArray[1] + dataArray[2] + dataArray[3]) / 3 / 255;
      }

      if (meshRef.current) {
        meshRef.current.rotation.x += 0.004;
        meshRef.current.rotation.y += 0.007;

        // React to bass pulse
        const targetScale = 1 + bassFactor * 0.45;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('click', attachAudio);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // 3. Tab-to-3D Geometry Mappings (reactive to route changes)
  useEffect(() => {
    if (!sceneRef.current) return;

    const path = location.pathname.toLowerCase();
    let tabKey = 'home';
    if (path.includes('music')) tabKey = 'music';
    else if (path.includes('live')) tabKey = 'live';
    else if (path.includes('thunder')) tabKey = 'thunderDome';

    const tabVisuals: Record<string, () => THREE.BufferGeometry> = {
      home: () => new THREE.TorusKnotGeometry(8, 2.2, 100, 16),
      music: () => new THREE.IcosahedronGeometry(10, 3),
      live: () => new THREE.CylinderGeometry(6, 6, 12, 32, 8, true),
      thunderDome: () => new THREE.OctahedronGeometry(9, 2)
    };

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      (meshRef.current.material as THREE.Material).dispose();
    }

    const getGeo = tabVisuals[tabKey] || tabVisuals.home;
    const geometry = getGeo();
    const material = new THREE.MeshStandardMaterial({
      color: 0x9a9a9c,
      wireframe: true,
      emissive: 0x221100,
      roughness: 0.2,
      metalness: 0.9
    });

    meshRef.current = new THREE.Mesh(geometry, material);
    sceneRef.current.add(meshRef.current);

  }, [location.pathname]);

  return <div ref={mountRef} className="three-reactive-bg" aria-hidden="true" />;
}
