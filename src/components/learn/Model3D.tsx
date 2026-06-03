import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Torus, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Boxes } from 'lucide-react';

export type ModelKind = 'atom' | 'cell' | 'solar' | 'molecule' | 'dna' | null;

export function pickModel(...texts: (string | undefined)[]): ModelKind {
  const t = texts.filter(Boolean).join(' ').toLowerCase();
  if (/\b(atom|electron|proton|neutron|nucleus|bohr)\b/.test(t)) return 'atom';
  if (/\b(cell|organelle|mitochond|tissue|membrane)\b/.test(t)) return 'cell';
  if (/\b(solar system|planet|orbit|gravitation|universe)\b/.test(t)) return 'solar';
  if (/\b(molecule|chemical bond|compound|h2o|co2)\b/.test(t)) return 'molecule';
  if (/\b(dna|gene|chromosome|heredity|double helix)\b/.test(t)) return 'dna';
  return null;
}

function Spin({ speed = 0.4, children }: { speed?: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (ref.current) ref.current.rotation.y += d * speed; });
  return <group ref={ref}>{children}</group>;
}

function ElectronOrbit({ radius, offset }: { radius: number; offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime * 1.5 + offset;
    if (ref.current) ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <Sphere ref={ref} args={[0.12, 16, 16]}>
      <meshStandardMaterial color="#1D9E75" emissive="#1D9E75" emissiveIntensity={0.6} />
    </Sphere>
  );
}

function Atom() {
  const tilts = [0, Math.PI / 3, -Math.PI / 3];
  return (
    <Spin speed={0.3}>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#534AB7" emissive="#534AB7" emissiveIntensity={0.4} />
      </Sphere>
      {tilts.map((tilt, i) => (
        <group key={i} rotation={[tilt, i * 0.6, tilt / 2]}>
          <Torus args={[1.5, 0.02, 16, 80]}>
            <meshStandardMaterial color="#D85A30" />
          </Torus>
          <ElectronOrbit radius={1.5} offset={i * 2} />
        </group>
      ))}
    </Spin>
  );
}

function Cell() {
  const organelles = useMemo(
    () => Array.from({ length: 7 }, () => ({
      pos: [(Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6] as [number, number, number],
      r: 0.12 + Math.random() * 0.12,
      c: ['#D85A30', '#1D9E75', '#534AB7'][Math.floor(Math.random() * 3)],
    })),
    []
  );
  return (
    <Spin speed={0.25}>
      <Sphere args={[1.6, 48, 48]}>
        <meshStandardMaterial color="#9bd9c2" transparent opacity={0.18} />
      </Sphere>
      <Sphere args={[0.55, 32, 32]}>
        <meshStandardMaterial color="#534AB7" emissive="#534AB7" emissiveIntensity={0.3} />
      </Sphere>
      {organelles.map((o, i) => (
        <Sphere key={i} args={[o.r, 16, 16]} position={o.pos}>
          <meshStandardMaterial color={o.c} />
        </Sphere>
      ))}
    </Spin>
  );
}

function Planet({ radius, size, color, speed }: { radius: number; size: number; color: string; speed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    const t = s.clock.elapsedTime * speed;
    if (ref.current) ref.current.position.set(Math.cos(t) * radius, 0, Math.sin(t) * radius);
  });
  return (
    <>
      <Torus args={[radius, 0.005, 8, 80]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#888" />
      </Torus>
      <Sphere ref={ref} args={[size, 24, 24]}>
        <meshStandardMaterial color={color} />
      </Sphere>
    </>
  );
}

function Solar() {
  return (
    <group>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial color="#f5a623" emissive="#f5a623" emissiveIntensity={0.8} />
      </Sphere>
      <Planet radius={1.1} size={0.12} color="#D85A30" speed={1.2} />
      <Planet radius={1.7} size={0.18} color="#534AB7" speed={0.8} />
      <Planet radius={2.4} size={0.15} color="#1D9E75" speed={0.5} />
    </group>
  );
}

function Molecule() {
  return (
    <Spin speed={0.4}>
      <Sphere args={[0.45, 32, 32]}>
        <meshStandardMaterial color="#D85A30" />
      </Sphere>
      {[[-0.9, 0.6, 0], [0.9, 0.6, 0]].map((p, i) => (
        <group key={i}>
          <Sphere args={[0.28, 24, 24]} position={p as [number, number, number]}>
            <meshStandardMaterial color="#534AB7" />
          </Sphere>
          <mesh position={[p[0] / 2, p[1] / 2, 0]} rotation={[0, 0, i === 0 ? 0.6 : -0.6]}>
            <cylinderGeometry args={[0.05, 0.05, 1.05, 12]} />
            <meshStandardMaterial color="#aaa" />
          </mesh>
        </group>
      ))}
    </Spin>
  );
}

function DNA() {
  const pairs = useMemo(() => Array.from({ length: 16 }, (_, i) => i), []);
  return (
    <Spin speed={0.6}>
      {pairs.map((i) => {
        const t = i * 0.5;
        const y = i * 0.22 - 1.7;
        const x = Math.cos(t) * 0.7;
        const z = Math.sin(t) * 0.7;
        return (
          <group key={i}>
            <Sphere args={[0.1, 12, 12]} position={[x, y, z]}>
              <meshStandardMaterial color="#534AB7" />
            </Sphere>
            <Sphere args={[0.1, 12, 12]} position={[-x, y, -z]}>
              <meshStandardMaterial color="#D85A30" />
            </Sphere>
            <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, t]}>
              <cylinderGeometry args={[0.025, 0.025, 1.4, 8]} />
              <meshStandardMaterial color="#1D9E75" />
            </mesh>
          </group>
        );
      })}
    </Spin>
  );
}

const SCENES: Record<NonNullable<ModelKind>, () => JSX.Element> = {
  atom: Atom, cell: Cell, solar: Solar, molecule: Molecule, dna: DNA,
};
const LABELS: Record<NonNullable<ModelKind>, string> = {
  atom: 'Atom structure', cell: 'Cell structure', solar: 'Solar system',
  molecule: 'Molecule', dna: 'DNA double helix',
};

export function Model3D({ kind }: { kind: NonNullable<ModelKind> }) {
  const Scene = SCENES[kind];
  return (
    <div className="rounded-xl overflow-hidden border bg-card/40 mt-4 not-prose">
      <div className="px-4 py-2 text-sm font-medium flex items-center gap-2 border-b">
        <Boxes className="w-4 h-4 text-primary" /> Interactive 3D: {LABELS[kind]}
        <span className="ml-auto text-xs text-muted-foreground">drag to rotate</span>
      </div>
      <div className="h-72">
        <Canvas camera={{ position: [0, 1.5, 5], fov: 50 }} dpr={[1, 1.5]}>
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={1.2} />
          <pointLight position={[-5, -3, -5]} intensity={0.5} color="#534AB7" />
          <Suspense fallback={<Html center><span className="text-xs text-muted-foreground">Loading 3D…</span></Html>}>
            <Scene />
          </Suspense>
          <OrbitControls enablePan={false} minDistance={3} maxDistance={9} />
        </Canvas>
      </div>
    </div>
  );
}
