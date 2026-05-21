"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { CodeAtmosphere } from "./code-atmosphere";
import { PostFx } from "./post-fx";
import { useDeviceTier } from "@/lib/device-tier";

const SERVICE_CUBES = [
  { color: "#ec4899", angle: 0 }, // web/social
  { color: "#22d3ee", angle: Math.PI / 2 }, // systems
  { color: "#fbbf24", angle: Math.PI }, // dialer
  { color: "#a855f7", angle: -Math.PI / 2 }, // cold calling
];

function ServiceCube({
  color,
  baseAngle,
}: {
  color: string;
  baseAngle: number;
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const angle = baseAngle + t * 0.12;
      const r = 3.0;
      groupRef.current.position.x = Math.cos(angle) * r;
      groupRef.current.position.z = Math.sin(angle) * r * 0.55;
      groupRef.current.position.y = Math.sin(t * 0.6 + baseAngle * 2) * 0.25;
      groupRef.current.rotation.x = t * 0.3;
      groupRef.current.rotation.y = t * 0.4 + baseAngle;
    }
  });

  return (
    <group ref={groupRef}>
      <RoundedBox args={[0.42, 0.42, 0.42]} radius={0.04} smoothness={3}>
        <meshStandardMaterial
          color={color}
          emissive={new THREE.Color(color)}
          emissiveIntensity={1.6}
          toneMapped={false}
          roughness={0.4}
          metalness={0.3}
        />
      </RoundedBox>
      <pointLight color={color} intensity={0.7} distance={3} decay={2} />
    </group>
  );
}

function CenterLogoMark() {
  const ref = useRef<THREE.Mesh | null>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.2;
      const pulse = 1 + Math.sin(t * 2.2) * 0.05;
      ref.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group>
      {/* glowing diamond core */}
      <mesh ref={ref}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color="#a5b4fc"
          emissive={new THREE.Color("#6366f1")}
          emissiveIntensity={2.4}
          toneMapped={false}
          roughness={0.2}
          metalness={0.4}
        />
      </mesh>
      {/* wireframe halo */}
      <mesh>
        <icosahedronGeometry args={[0.95, 1]} />
        <meshBasicMaterial color="#7c83ff" wireframe transparent opacity={0.25} />
      </mesh>
      <pointLight color="#7c83ff" intensity={1.6} distance={5} decay={2} />
    </group>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();
  const ptr = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const lerpK = 1 - Math.pow(1 - 0.02, delta * 60);
    ptr.current.x += (pointer.x - ptr.current.x) * lerpK;
    ptr.current.y += (pointer.y - ptr.current.y) * lerpK;
    const t = performance.now() * 0.001;
    camera.position.set(
      Math.sin(t * 0.08) * 0.4 + ptr.current.x * 0.4,
      0.6 + ptr.current.y * -0.2,
      6.2
    );
    camera.lookAt(0, 0.05, 0);
  });
  return null;
}

function FinalWorld({ effectsEnabled }: { effectsEnabled: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={["#070718", 0.13]} />

      <CameraRig />
      <hemisphereLight color="#312e81" groundColor="#020202" intensity={0.3} />
      <directionalLight position={[3, 4, 4]} intensity={0.5} color="#e0e7ff" />
      <directionalLight position={[-3, 1, -4]} intensity={0.4} color="#a855f7" />

      <CodeAtmosphere />
      <CenterLogoMark />

      {SERVICE_CUBES.map((c, i) => (
        <ServiceCube key={i} color={c.color} baseAngle={c.angle} />
      ))}

      <PostFx
        enabled={effectsEnabled}
        bloomIntensity={1.5}
        bloomThreshold={0.2}
        vignetteOffset={0.28}
        vignetteDarkness={0.95}
      />
    </>
  );
}

export function FinalVoidScene({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.6, 6.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <FinalWorld effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
