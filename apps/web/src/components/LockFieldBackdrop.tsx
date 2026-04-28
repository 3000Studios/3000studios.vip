import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type PointerTarget = { x: number; y: number };

function LockCluster({ pointer }: { pointer: PointerTarget }) {
  const root = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.Group[]>([]);
  const initial = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        x: ((index % 5) - 2) * 1.9,
        y: (Math.floor(index / 5) - 0.5) * 2.2,
        z: -index * 0.2,
        speed: 0.5 + index * 0.08,
      })),
    [],
  );

  useFrame((state) => {
    root.current?.rotation.set(pointer.y * 0.08, pointer.x * 0.14, 0);
    nodes.current.forEach((node, index) => {
      if (!node) return;
      const seed = initial[index];
      node.position.x = seed.x + Math.sin(state.clock.elapsedTime * seed.speed + index) * 0.35 + pointer.x * 0.5;
      node.position.y = seed.y + Math.cos(state.clock.elapsedTime * (seed.speed + 0.2) + index) * 0.28 + pointer.y * 0.35;
      node.rotation.z += 0.003 + index * 0.0004;
      node.rotation.y += 0.0025 + index * 0.0005;
    });
  });

  return (
    <group ref={root}>
      {initial.map((seed, index) => (
        <group
          key={index}
          ref={(node) => {
            if (node) {
              nodes.current[index] = node;
            }
          }}
          position={[seed.x, seed.y, seed.z]}
        >
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[0.38, 0.08, 16, 64, Math.PI]} />
            <meshStandardMaterial color="#f1b74e" metalness={0.65} roughness={0.25} />
          </mesh>
          <mesh position={[0, -0.42, 0]}>
            <boxGeometry args={[0.72, 0.78, 0.28]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#6ff4ff' : '#f4efe7'} metalness={0.3} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.42, 0.18]}>
            <boxGeometry args={[0.18, 0.18, 0.08]} />
            <meshStandardMaterial color="#060914" emissive="#ff6a3d" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function LockFieldBackdrop() {
  const [pointer, setPointer] = useState<PointerTarget>({ x: 0, y: 0 });

  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      setPointer({
        x: (clientX / window.innerWidth) * 2 - 1,
        y: -((clientY / window.innerHeight) * 2 - 1),
      });
    };

    const onMove = (event: PointerEvent) => update(event.clientX, event.clientY);
    const onTouch = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) update(touch.clientX, touch.clientY);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <div className="lockFieldBackdrop" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 46 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[5, 4, 7]} intensity={18} color="#6ff4ff" />
        <pointLight position={[-4, -3, 5]} intensity={15} color="#f1b74e" />
        <LockCluster pointer={pointer} />
      </Canvas>
    </div>
  );
}
