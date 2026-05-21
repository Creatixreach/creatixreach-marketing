"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ServerRack } from "./server-rack";
import { HoloDashboard } from "./holo-dashboard";
import { ApiGraph } from "./api-graph";
import { PostFx } from "./post-fx";
import { useDeviceTier } from "@/lib/device-tier";

function CameraRig() {
  const { camera, pointer } = useThree();
  const ptr = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    const lerpK = 1 - Math.pow(1 - 0.02, delta * 60);
    ptr.current.x += (pointer.x - ptr.current.x) * lerpK;
    ptr.current.y += (pointer.y - ptr.current.y) * lerpK;

    // slow forward push then back — feels like floating down the corridor
    const z = 5.5 + Math.sin(t * 0.18) * 0.5;
    camera.position.set(
      ptr.current.x * 0.35 + Math.sin(t * 0.08) * 0.1,
      0.8 + ptr.current.y * -0.18,
      z
    );
    camera.lookAt(0, 0.6, 0);
  });
  return null;
}

function CorridorLighting() {
  return (
    <>
      <hemisphereLight color="#155e75" groundColor="#02141d" intensity={0.4} />
      <directionalLight position={[0, 5, 4]} intensity={0.45} color="#cffafe" />
      <directionalLight position={[0, 3, -5]} intensity={0.4} color="#22d3ee" />
    </>
  );
}

function CorridorWorld({ effectsEnabled }: { effectsEnabled: boolean }) {
  // racks on both sides at z-fading positions
  const rackPositions: { pos: [number, number, number]; rot: [number, number, number] }[] = [];
  const leftX = -5.5;
  const rightX = 5.5;
  for (let i = 0; i < 5; i++) {
    const z = -i * 2.4;
    rackPositions.push({ pos: [leftX, 0.2, z], rot: [0, Math.PI / 2 + 0.05, 0] });
    rackPositions.push({ pos: [rightX, 0.2, z], rot: [0, -Math.PI / 2 - 0.05, 0] });
  }

  return (
    <>
      <fogExp2 attach="fog" args={["#031018", 0.11]} />

      <CameraRig />
      <CorridorLighting />

      {/* floor — long reflective corridor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, -4]}>
        <planeGeometry args={[40, 60]} />
        <meshStandardMaterial color="#040b13" roughness={0.55} metalness={0.5} />
      </mesh>
      {/* ceiling glow strip */}
      <mesh position={[0, 3.4, -4]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.2, 22]} />
        <meshStandardMaterial
          color="#22d3ee"
          emissive={new THREE.Color("#22d3ee")}
          emissiveIntensity={0.6}
          toneMapped={false}
          transparent
          opacity={0.4}
        />
      </mesh>

      {rackPositions.map((r, i) => (
        <ServerRack key={i} position={r.pos} rotation={r.rot} />
      ))}

      <HoloDashboard position={[0, 0.7, 0]} />
      <ApiGraph />

      <PostFx
        enabled={effectsEnabled}
        bloomIntensity={1.5}
        bloomThreshold={0.18}
        chromaticOffset={0.0006}
        vignetteOffset={0.28}
        vignetteDarkness={0.9}
      />
    </>
  );
}

export function CorridorScene({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.8, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <CorridorWorld effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
