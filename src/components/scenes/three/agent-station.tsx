"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

/** One agent station: a small monitor + headset arch sitting on a curved row. */
export function AgentStation({
  position,
  rotation = [0, 0, 0],
  phase = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  phase?: number;
}) {
  const haloRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (haloRef.current) {
      const breath = 0.7 + 0.3 * Math.sin(t * 2.4 + phase);
      haloRef.current.emissiveIntensity = breath * 1.6;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* desk slab */}
      <mesh position={[0, -0.55, 0]}>
        <boxGeometry args={[0.8, 0.04, 0.5]} />
        <meshStandardMaterial color="#19132b" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* small monitor */}
      <RoundedBox args={[0.5, 0.34, 0.05]} radius={0.02} smoothness={3} position={[0, -0.32, 0]}>
        <meshStandardMaterial color="#0a0816" roughness={0.5} metalness={0.3} />
      </RoundedBox>
      {/* screen face */}
      <mesh position={[0, -0.32, 0.027]}>
        <planeGeometry args={[0.46, 0.3]} />
        <meshStandardMaterial
          ref={haloRef}
          color="#fbbf24"
          emissive={new THREE.Color("#fbbf24")}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* monitor stand */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.05, 0.06, 8]} />
        <meshStandardMaterial color="#19132b" />
      </mesh>

      {/* headset arch — torus rotated to look like a band */}
      <mesh position={[0, 0.05, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.16, 0.018, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#0d0a1c" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* ear cup */}
      <mesh position={[0.16, -0.08, 0.08]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#0d0a1c" roughness={0.4} metalness={0.5} />
      </mesh>
      <mesh position={[-0.16, -0.08, 0.08]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#0d0a1c" roughness={0.4} metalness={0.5} />
      </mesh>

      {/* warm ambient spill */}
      <pointLight color="#fbbf24" intensity={0.35} distance={1.4} decay={2} position={[0, -0.2, 0.3]} />
    </group>
  );
}
