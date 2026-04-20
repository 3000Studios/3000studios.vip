import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

function CoreMesh() {
  const geom = useMemo(() => new THREE.IcosahedronGeometry(1.2, 2), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#b9f6ff'),
        wireframe: true,
        transparent: true,
        opacity: 0.85,
      }),
    [],
  );
  return (
    <mesh geometry={geom} material={mat} rotation={[0.6, 0.2, 0]}>
      <pointLight intensity={2} position={[2, 2, 2]} />
    </mesh>
  );
}

export function CitadelCore() {
  return (
    <div style={{ width: 180, height: 64 }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [2.8, 1.2, 2.8], fov: 50 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.35} />
        <CoreMesh />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.6}
          autoRotate
          autoRotateSpeed={1.35}
        />
      </Canvas>
    </div>
  );
}

