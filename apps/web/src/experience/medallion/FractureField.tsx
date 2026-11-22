import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { medallionRuntime } from './runtime';

const dummy = new THREE.Object3D();

function seed(i: number) {
  const n = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return n - Math.floor(n);
}

export function FractureField({ count }: { count: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const phaseT = useRef(0);
  const lastPhase = useRef(medallionRuntime.fracture);
  const origins = useMemo(() => {
    const out: THREE.Vector3[] = [];
    for (let i = 0; i < count; i += 1) {
      const a = (i / Math.max(1, count)) * Math.PI * 2;
      const r = 0.35 + seed(i) * 0.7;
      out.push(new THREE.Vector3(Math.cos(a) * r, (seed(i + 3) - 0.5) * 0.35, Math.sin(a) * r));
    }
    return out;
  }, [count]);
  const targets = useMemo(() => {
    const out: THREE.Vector3[] = [];
    const cols = Math.ceil(Math.sqrt(count));
    for (let i = 0; i < count; i += 1) {
      const x = (i % cols) / Math.max(1, cols - 1) - 0.5;
      const y = Math.floor(i / cols) / Math.max(1, cols - 1) - 0.5;
      out.push(new THREE.Vector3(x * 1.45, -y * 1.45, 0.35));
    }
    return out;
  }, [count]);
  const velocities = useMemo(
    () => origins.map((o, i) => o.clone().normalize().multiplyScalar(1.6 + seed(i + 9) * 1.4).setY(o.y + 0.4)),
    [origins],
  );

  useFrame((_, dt) => {
    const inst = mesh.current;
    if (!inst || count <= 0) return;
    const phase = medallionRuntime.fracture;
    if (lastPhase.current !== phase) {
      phaseT.current = 0;
      lastPhase.current = phase;
    }
    if (phase === 'idle' || phase === 'art') {
      inst.visible = false;
      return;
    }
    inst.visible = true;
    phaseT.current += dt;
    const burstT = Math.min(1, phaseT.current / 1.15);
    const reformT = Math.min(1, phaseT.current / 1.55);
    for (let i = 0; i < count; i += 1) {
      const o = origins[i];
      const v = velocities[i];
      const dest = targets[i];
      if (phase === 'burst') {
        dummy.position.set(o.x + v.x * burstT, o.y + v.y * burstT * 0.7, o.z + v.z * burstT);
        dummy.rotation.set(burstT * 2.2, burstT * 1.4 + i * 0.05, burstT);
        dummy.scale.setScalar(1 - burstT * 0.15);
      } else {
        const bx = o.x + v.x;
        const by = o.y + v.y * 0.7;
        const bz = o.z + v.z;
        dummy.position.set(
          bx + (dest.x - bx) * reformT,
          by + (dest.y - by) * reformT,
          bz + (dest.z - bz) * reformT,
        );
        dummy.rotation.set((1 - reformT) * 1.2, (1 - reformT) * 0.8, 0);
        dummy.scale.setScalar(0.85 + reformT * 0.2);
      }
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  if (count <= 0) return null;
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} frustumCulled={false}>
      <boxGeometry args={[0.09, 0.09, 0.045]} />
      <meshStandardMaterial color="#d4af37" metalness={0.7} roughness={0.35} />
    </instancedMesh>
  );
}
