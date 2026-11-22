import { Canvas, useFrame } from '@react-three/fiber';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { qualitySettings, type QualityTier } from './quality';
import { medallionRuntime, setFracturePhase, setMedallionArtwork } from './runtime';
import { createFractureGate, resetFractureGate, shouldFireFracture } from './trigger';

const FractureField = lazy(() => import('./FractureField').then((m) => ({ default: m.FractureField })));
const fractureGate = createFractureGate();

function goldMaterial(physical: boolean) {
  if (physical) {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#c9a227'),
      metalness: 0.92,
      roughness: 0.28,
      reflectivity: 0.55,
      clearcoat: 0.18,
      clearcoatRoughness: 0.4,
      emissive: new THREE.Color('#3a2a08'),
      emissiveIntensity: 0.12,
    });
  }
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#c9a227'),
    metalness: 0.85,
    roughness: 0.38,
    emissive: new THREE.Color('#2a1e06'),
    emissiveIntensity: 0.08,
  });
}

function MedallionMesh({ physical }: { physical: boolean }) {
  const group = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const mat = useMemo(() => goldMaterial(physical), [physical]);
  const ring = useMemo(() => new THREE.TorusGeometry(1.05, 0.16, 16, 64), []);
  const hub = useMemo(() => new THREE.CylinderGeometry(0.62, 0.62, 0.18, 48), []);
  const gem = useMemo(() => new THREE.IcosahedronGeometry(0.28, 1), []);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const { pointerX, pointerY, scroll, playing, audio, enhanced } = medallionRuntime;
    const idle = enhanced ? 0.18 : 0.08;
    g.rotation.y += dt * idle;
    const targetX = pointerY * 0.22 + scroll * 0.12;
    const targetY = pointerX * 0.35 + scroll * 1.15;
    g.rotation.x += (targetX - g.rotation.x) * 0.08;
    g.rotation.y += (targetY - g.rotation.y) * 0.04;
    const pulse = playing ? audio.energy * 0.035 + audio.beat * 0.02 : 0;
    const frac = medallionRuntime.fracture;
    if (frac === 'art') {
      g.visible = false;
    } else {
      g.visible = true;
      const s = frac === 'burst' ? 0.28 : frac === 'reform' ? 0.08 : 1 + pulse;
      g.scale.setScalar(s);
    }
    if (key.current) {
      key.current.intensity = 1.15 + (playing ? audio.treble * 0.55 : 0);
    }
    if (rim.current) {
      rim.current.intensity = 0.55 + (playing ? audio.bass * 0.7 : 0);
    }
  });

  return (
    <group ref={group}>
      <mesh geometry={ring} material={mat} rotation={[Math.PI / 2, 0, 0]} />
      <mesh geometry={hub} material={mat} />
      <mesh geometry={gem} position={[0, 0.22, 0]}>
        <meshStandardMaterial color="#f6e7a2" metalness={0.4} roughness={0.2} />
      </mesh>
      <directionalLight ref={key} position={[2.4, 3.2, 2.1]} color="#ffe6a8" intensity={1.2} />
      <pointLight ref={rim} position={[-2.2, 0.4, -2.4]} color="#8ab4ff" intensity={0.55} />
    </group>
  );
}

function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const n = Math.sin(i * 12.9898) * 43758.5453;
      const f = n - Math.floor(n);
      pos[i * 3] = (f - 0.5) * 6;
      pos[i * 3 + 1] = (Math.sin(i * 78.233) - 0.5) * 2;
      pos[i * 3 + 2] = (Math.cos(i * 39.137) - 0.5) * 4;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    pts.rotation.y += dt * 0.03;
    const s = 1 + medallionRuntime.audio.energy * 0.08;
    pts.scale.setScalar(s);
  });

  if (count <= 0) return null;
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color="#d4af37" size={0.018} transparent opacity={0.35} depthWrite={false} />
    </points>
  );
}

function CoverPlane({ url }: { url: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => {
    if (!url) return;
    let dead = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (t) => {
        if (dead) return;
        t.colorSpace = THREE.SRGBColorSpace;
        setTex(t);
        setMedallionArtwork(url, true);
      },
      undefined,
      () => {
        if (dead) return;
        setTex(null);
        setMedallionArtwork(url, false);
      },
    );
    return () => {
      dead = true;
    };
  }, [url]);
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const frac = medallionRuntime.fracture;
    const scrollShow = Math.max(0, Math.min(1, (medallionRuntime.scroll - 0.42) / 0.35));
    const artShow = frac === 'art' || frac === 'reform' ? 1 : scrollShow;
    const show = tex ? artShow : 0;
    m.position.z = -0.2 + show * 0.55;
    const mat = m.material as THREE.MeshBasicMaterial;
    mat.opacity = show * 0.92;
    m.visible = Boolean(tex) && show > 0.02;
  });
  if (!tex) return null;
  return (
    <mesh ref={mesh} position={[0, 0, -0.2]}>
      <planeGeometry args={[1.55, 1.55]} />
      <meshBasicMaterial map={tex} transparent opacity={0} />
    </mesh>
  );
}

function Rig() {
  useFrame(({ camera }) => {
    const t = medallionRuntime.scroll;
    const art = medallionRuntime.fracture === 'art' ? 0.2 : 0;
    const z = 4.35 - t * 1.65 - art;
    const y = 0.12 + t * 0.28;
    camera.position.z += (z - camera.position.z) * 0.08;
    camera.position.y += (y - camera.position.y) * 0.08;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function FractureDirector({ dissolve }: { dissolve: boolean }) {
  const elapsed = useRef(0);
  const last = useRef(medallionRuntime.fracture);
  useFrame((_, dt) => {
    const { audio, playing, enhanced, artworkReady, fracture } = medallionRuntime;
    if (last.current !== fracture) {
      elapsed.current = 0;
      last.current = fracture;
    }
    if (fracture === 'idle' && medallionRuntime.forceFracture) {
      medallionRuntime.forceFracture = false;
      resetFractureGate(fractureGate);
      fractureGate.fired = true;
      fractureGate.lastFireAt = performance.now();
      setFracturePhase(dissolve ? 'reform' : 'burst');
      return;
    }
    if (
      fracture === 'idle' &&
      shouldFireFracture(fractureGate, {
        energy: audio.energy,
        beat: audio.beat,
        playing,
        enhanced,
        now: performance.now(),
      })
    ) {
      setFracturePhase(dissolve ? 'reform' : 'burst');
      return;
    }
    elapsed.current += dt;
    if (fracture === 'burst' && elapsed.current > 1.15) setFracturePhase('reform');
    if (fracture === 'reform' && elapsed.current > (dissolve ? 0.9 : 1.55)) {
      setFracturePhase(artworkReady ? 'art' : 'idle');
    }
  });
  return null;
}

export default function MedallionScene({
  tier,
  coverUrl,
}: {
  tier: QualityTier;
  coverUrl: string;
}) {
  const q = qualitySettings(tier);
  return (
    <Canvas
      className="medallionCanvas"
      dpr={[1, q.dpr]}
      camera={{ position: [0, 0.12, 4.35], fov: 32, near: 0.1, far: 40 }}
      gl={{
        alpha: true,
        antialias: tier !== 'LOW',
        powerPreference: tier === 'LOW' ? 'low-power' : 'default',
        failIfMajorPerformanceCaveat: true,
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.18} color="#1a2230" />
      <hemisphereLight args={['#4a3a18', '#05060a', 0.35]} />
      <MedallionMesh physical={q.physical} />
      <CoverPlane key={coverUrl || 'none'} url={coverUrl} />
      <Dust count={q.particles} />
      <FractureDirector dissolve={q.dissolve} />
      {q.fragments > 0 ? (
        <Suspense fallback={null}>
          <FractureField count={q.fragments} />
        </Suspense>
      ) : null}
      <Rig />
    </Canvas>
  );
}
