import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, RoundedBox, Sparkles } from '@react-three/drei';

// Floating "code window" that orbits the core
function CodeWindow({ radius, speed, offset, color, y, dark }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + offset;
    ref.current.position.set(Math.cos(t) * radius, y + Math.sin(t * 1.5) * 0.25, Math.sin(t) * radius);
    ref.current.rotation.y = -t + Math.PI / 2;
  });
  return (
    <group ref={ref}>
      <RoundedBox args={[1.5, 1, 0.08]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color={dark ? '#17122e' : '#ffffff'} metalness={dark ? 0.6 : 0.1} roughness={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.38, 0.05]}><boxGeometry args={[1.4, 0.12, 0.02]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} /></mesh>
      {[0.15, -0.05, -0.25].map((yy, i) => (
        <mesh key={i} position={[-0.7 + (0.5 + i * 0.25) / 2 + 0.1, yy, 0.05]}>
          <boxGeometry args={[0.5 + i * 0.25, 0.06, 0.02]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ dark, small }) {
  const rig = useRef(), core = useRef();
  useFrame(({ pointer, clock }) => {
    rig.current.rotation.y += (pointer.x * 0.5 - rig.current.rotation.y) * 0.04;
    rig.current.rotation.x += (-pointer.y * 0.25 - rig.current.rotation.x) * 0.04;
    core.current.rotation.x = clock.elapsedTime * 0.2;
    core.current.rotation.z = clock.elapsedTime * 0.15;
  });
  const aqua = dark ? '#22d3ee' : '#0891b2', amber = dark ? '#ffb547' : '#f59e0b', mint = dark ? '#34d399' : '#059669';
  return (
    <group ref={rig} scale={small ? 0.78 : 1}>
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1}>
        <mesh ref={core} scale={1.25}>
          <icosahedronGeometry args={[1, 3]} />
          <MeshDistortMaterial color={dark ? '#7c5cff' : '#6a49f2'} emissive={dark ? '#3a1fb8' : '#4c2fd0'} emissiveIntensity={dark ? 0.6 : 0.25} distort={0.45} speed={2} roughness={0.15} metalness={0.7} />
        </mesh>
      </Float>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}><torusGeometry args={[2.1, 0.012, 16, 120]} /><meshBasicMaterial color={aqua} /></mesh>
      <CodeWindow radius={2.6} speed={0.45} offset={0} color={aqua} y={0.3} dark={dark} />
      <CodeWindow radius={2.6} speed={0.45} offset={2.1} color={amber} y={-0.3} dark={dark} />
      <CodeWindow radius={2.6} speed={0.45} offset={4.2} color={mint} y={0.6} dark={dark} />
      <Sparkles count={small ? 30 : 70} scale={9} size={2.5} speed={0.4} color={dark ? '#a99bff' : '#6a49f2'} />
    </group>
  );
}

export default function Hero3D({ dark = true }) {
  const small = typeof window !== 'undefined' && window.innerWidth < 700;
  return (
    <Canvas camera={{ position: [0, 0.4, 7], fov: small ? 55 : 45 }} dpr={[1, small ? 1.4 : 1.8]}>
      <ambientLight intensity={dark ? 0.5 : 1.1} />
      <pointLight position={[5, 5, 5]} intensity={dark ? 60 : 90} color={dark ? '#22d3ee' : '#ffffff'} />
      <pointLight position={[-5, -3, 3]} intensity={dark ? 50 : 60} color="#ff5ca8" />
      <Scene dark={dark} small={small} />
    </Canvas>
  );
}
