import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Variant = 'vault' | 'legal';

function WireOrbs({ variant }: { variant: Variant }) {
  const group = useRef<THREE.Group>(null);
  const meshes = useMemo(
    () =>
      Array.from({ length: variant === 'vault' ? 9 : 6 }, (_, index) => ({
        position: [
          ((index % 3) - 1) * 2.8,
          (Math.floor(index / 3) - 1) * 1.6,
          (index % 2 === 0 ? -1 : 1) * 1.2,
        ] as [number, number, number],
        scale: 0.45 + (index % 4) * 0.18,
        speed: 0.3 + index * 0.03,
      })),
    [variant],
  );

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.05;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.08;
  });

  return (
    <group ref={group}>
      {meshes.map((mesh, index) => (
        <Float key={index} speed={mesh.speed} rotationIntensity={0.8} floatIntensity={1.4}>
          <mesh position={mesh.position} scale={mesh.scale}>
            {index % 2 === 0 ? (
              <torusKnotGeometry args={[1, 0.18, 96, 12]} />
            ) : (
              <icosahedronGeometry args={[1, 1]} />
            )}
            <meshBasicMaterial
              color={index % 2 === 0 ? '#6ff4ff' : '#f1b74e'}
              transparent
              opacity={0.35}
              wireframe
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export function LiveBackdrop({ variant = 'vault' }: { variant?: Variant }) {
  return (
    <div className={`sceneBackdrop sceneBackdrop-${variant}`} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[4, 5, 6]} intensity={8} color="#6ff4ff" />
        <pointLight position={[-6, -2, 4]} intensity={6} color="#f1b74e" />
        <WireOrbs variant={variant} />
      </Canvas>
    </div>
  );
}
