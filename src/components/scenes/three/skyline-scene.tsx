"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CitySkyline, SignalArcs } from "./city-skyline";
import { LeadVault } from "./lead-vault";
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
    // very slow pan
    const sway = Math.sin(t * 0.04) * 0.25;
    camera.position.set(
      sway + ptr.current.x * 0.4,
      1.6 + ptr.current.y * -0.2 + Math.sin(t * 0.7) * 0.03,
      5.5
    );
    camera.lookAt(0, 1, -2);
  });
  return null;
}

function NightLighting() {
  return (
    <>
      <hemisphereLight color="#312e81" groundColor="#020617" intensity={0.35} />
      {/* moonlight rim */}
      <directionalLight position={[-3, 6, 3]} intensity={0.4} color="#dbeafe" />
      {/* warm vault key */}
      <directionalLight position={[0, 3, 5]} intensity={0.45} color="#fcd34d" />
    </>
  );
}

function SkylineWorld({ effectsEnabled }: { effectsEnabled: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={["#070b1f", 0.075]} />

      <CameraRig />
      <NightLighting />

      {/* deep sky band — purple-to-navy gradient via a backplane */}
      <mesh position={[0, 4, -16]}>
        <planeGeometry args={[60, 18]} />
        <meshBasicMaterial color="#1a103a" toneMapped={false} />
      </mesh>
      {/* horizon glow */}
      <mesh position={[0, -0.4, -12]}>
        <planeGeometry args={[60, 1.6]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive={new THREE.Color("#a855f7")}
          emissiveIntensity={0.55}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, -2]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#050810" roughness={0.7} metalness={0.2} />
      </mesh>

      <CitySkyline />
      <SignalArcs count={6} />
      <LeadVault />

      <PostFx
        enabled={effectsEnabled}
        bloomIntensity={1.55}
        bloomThreshold={0.22}
        vignetteOffset={0.26}
        vignetteDarkness={1.0}
        chromaticOffset={0.0008}
      />
    </>
  );
}

export function SkylineScene({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.6, 5.5], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <SkylineWorld effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
