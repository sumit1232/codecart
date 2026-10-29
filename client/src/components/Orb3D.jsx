import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';

function Orb({ dark }) {
  const ref = useRef();
  useFrame(({ pointer }) => {
    ref.current.rotation.y += (pointer.x * 0.8 - ref.current.rotation.y) * 0.05;
    ref.current.rotation.x += (-pointer.y * 0.5 - ref.current.rotation.x) * 0.05;
  });
  return (
    <group ref={ref}>
      <Float speed={2.2} floatIntensity={1.2}>
        <mesh><torusKnotGeometry args={[1, 0.34, 220, 32]} />
          <MeshDistortMaterial color={dark ? '#7c5cff' : '#6a49f2'} distort={0.25} speed={1.6} roughness={0.12} metalness={0.8} emissive="#3a1fb8" emissiveIntensity={dark ? 0.5 : 0.2} />
        </mesh>
      </Float>
      <Sparkles count={40} scale={6} size={2.5} speed={0.4} color={dark ? '#22d3ee' : '#6a49f2'} />
    </group>
  );
}

export default function Orb3D({ dark = true }) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.6]}>
      <ambientLight intensity={dark ? 0.5 : 1} />
      <pointLight position={[4, 4, 4]} intensity={dark ? 60 : 90} color={dark ? '#22d3ee' : '#ffffff'} />
      <pointLight position={[-4, -3, 2]} intensity={50} color="#ff5ca8" />
      <Orb dark={dark} />
    </Canvas>
  );
}
