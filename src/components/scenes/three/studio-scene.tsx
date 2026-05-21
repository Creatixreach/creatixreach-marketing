"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { BrowserWindow } from "./browser-window";
import { PhoneMockup } from "./phone-mockup";
import { SyncStrands } from "./sync-strands";
import { StudioParticles } from "./studio-particles";
import { PostFx } from "./post-fx";
import { useDeviceTier } from "@/lib/device-tier";

// Anchors used by both the meshes and the strands between them.
const PHONE_POS: [number, number, number] = [0, 0.05, 0.6];
const B1: [number, number, number] = [-3.0, 0.3, -0.6];
const B2: [number, number, number] = [-0.4, 1.1, -1.4];
const B3: [number, number, number] = [3.0, 0.4, -0.6];

const STRANDS = [
  { start: new THREE.Vector3(...B1), end: new THREE.Vector3(...PHONE_POS), color: "#ec4899" },
  { start: new THREE.Vector3(...B2), end: new THREE.Vector3(...PHONE_POS), color: "#a855f7" },
  { start: new THREE.Vector3(...B3), end: new THREE.Vector3(...PHONE_POS), color: "#22d3ee" },
];

function CameraRig() {
  const { camera, pointer } = useThree();
  const ptr = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    const lerpK = 1 - Math.pow(1 - 0.02, delta * 60);
    ptr.current.x += (pointer.x - ptr.current.x) * lerpK;
    ptr.current.y += (pointer.y - ptr.current.y) * lerpK;
    const orbit = Math.sin(t * 0.05) * 0.16;
    const r = 6.2;
    camera.position.set(
      Math.sin(orbit) * r + ptr.current.x * 0.4,
      0.4 + ptr.current.y * -0.25 + Math.sin(t * 0.7) * 0.04,
      Math.cos(orbit) * r
    );
    camera.lookAt(0, 0.2, 0);
  });
  return null;
}

function StudioLighting() {
  return (
    <>
      <hemisphereLight color="#a855f7" groundColor="#0a0816" intensity={0.35} />
      {/* magenta keep-it-vivid key */}
      <directionalLight position={[-5, 3, 4]} intensity={0.5} color="#ec4899" />
      {/* cool cyan rim */}
      <directionalLight position={[5, 2, -4]} intensity={0.8} color="#22d3ee" />
      {/* faint top wash */}
      <spotLight
        position={[0, 7, 1]}
        intensity={0.5}
        angle={Math.PI / 3}
        penumbra={0.7}
        color="#f0abfc"
        distance={20}
      />
    </>
  );
}

function StudioWorld({ effectsEnabled }: { effectsEnabled: boolean }) {
  return (
    <>
      <fogExp2 attach="fog" args={["#15081f", 0.12]} />

      <CameraRig />
      <StudioLighting />

      <StudioParticles count={140} color="#c084fc" />

      {/* floor — receives the RGB spill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0814" roughness={0.85} metalness={0.15} />
      </mesh>

      <SyncStrands strands={STRANDS} />

      <BrowserWindow position={B1} rotation={[0, 0.45, 0]} title="creatixreach.io" glow="#ec4899" phase={0} />
      <BrowserWindow position={B2} rotation={[0, 0, 0]} title="dashboard.app" glow="#a855f7" phase={2.4} scale={0.9} />
      <BrowserWindow position={B3} rotation={[0, -0.45, 0]} title="shop.store" glow="#22d3ee" phase={4.8} />

      <PhoneMockup position={PHONE_POS} glow="#ec4899" />

      <PostFx
        enabled={effectsEnabled}
        bloomIntensity={1.3}
        bloomThreshold={0.22}
        vignetteOffset={0.28}
        vignetteDarkness={0.85}
        chromaticOffset={0.0009}
      />
    </>
  );
}

export function StudioScene({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.4, 6.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <StudioWorld effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
