import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Play, ArrowRight } from '@phosphor-icons/react';
import { MagneticButton } from '../components/MagneticButton';
import { usePrefersReducedMotion } from '../lib/mediaQuery';

const mouse = { x: 0, y: 0 };

function Knot() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.12;
    ref.current.rotation.y = t * 0.18;
    ref.current.position.x += (mouse.x * 1.2 - ref.current.position.x) * 0.04;
    ref.current.position.y += (-mouse.y * 0.8 - ref.current.position.y) * 0.04;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.9}>
      <mesh ref={ref}>
        <torusKnotGeometry args={[3.4, 0.85, 220, 36]} />
        <meshBasicMaterial color="#f1b74e" wireframe transparent opacity={0.42} />
      </mesh>
    </Float>
  );
}

function Particles({ count = 900 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 44;
    return arr;
  }, [count]);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
    ref.current.position.x += (mouse.x * 2 - ref.current.position.x) * 0.03;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#6ff4ff" size={0.07} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function Rig() {
  useFrame((state) => {
    state.camera.position.x += (mouse.x * 2.4 - state.camera.position.x) * 0.045;
    state.camera.position.y += (-mouse.y * 1.6 - state.camera.position.y) * 0.045;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 6, 8]} intensity={30} color="#6ff4ff" />
      <pointLight position={[-7, -3, 5]} intensity={22} color="#f1b74e" />
      <Knot />
      <Particles />
      <Rig />
    </>
  );
}

function Word({ children, index, gold }: { children: string; index: number; gold?: boolean }) {
  return (
    <span className={`v3-w${gold ? ' v3-gold' : ''}`}>
      <motion.span
        initial={{ y: '110%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay: 0.55 + index * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.span>
    </span>
  );
}

export function Hero3D({ live }: { live: boolean }) {
  const reduce = usePrefersReducedMotion();
  const [beat, setBeat] = useState(false);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* 128 BPM headline pulse */
  useEffect(() => {
    if (reduce) return;
    const iv = window.setInterval(() => setBeat((b) => !b), 234);
    return () => window.clearInterval(iv);
  }, [reduce]);

  const words: Array<{ t: string; gold?: boolean }> = [
    { t: 'SOUND' },
    { t: 'YOU' },
    { t: 'CAN' },
    { t: 'SEE.', gold: true },
  ];

  return (
    <header className="v3-hero">
      <div className="v3-hero-canvas" aria-hidden="true">
        {reduce ? null : (
          <Canvas camera={{ position: [0, 0, 15], fov: 58 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
            <Suspense fallback={null}>
              <Scene />
            </Suspense>
          </Canvas>
        )}
      </div>
      <div className="v3-hero-shade" aria-hidden="true" />

      <div className="v3-hero-inner">
        <motion.span
          className="v3-kicker"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
        >
          {live && <span className="v3-live-dot" aria-hidden="true" />}
          {live ? 'On air now' : 'Independent label · Acworth, Georgia'}
        </motion.span>

        <motion.h1
          className="v3-display v3-beat"
          animate={reduce ? undefined : { scale: beat ? 1.022 : 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {words.map((w, i) => (
            <span key={w.t}>
              <Word index={i} gold={w.gold}>
                {w.t}
              </Word>{' '}
            </span>
          ))}
        </motion.h1>

        <motion.p
          className="v3-lede"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05 }}
        >
          Original music, cinematic videos, and live broadcasts — produced in-house,
          released worldwide. This is the whole universe on one page.
        </motion.p>

        <motion.div
          className="v3-cta-row"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25 }}
        >
          <MagneticButton href="#music" className="v3-btn v3-btn--gold">
            <Play size={17} weight="fill" /> Listen now
          </MagneticButton>
          <MagneticButton href="#videos" className="v3-btn v3-btn--ghost">
            Watch videos <ArrowRight size={16} />
          </MagneticButton>
        </motion.div>
      </div>

      <a href="#statement" className="v3-scroll-cue">
        Scroll
      </a>
    </header>
  );
}
