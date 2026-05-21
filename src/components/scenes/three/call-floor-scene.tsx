"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AgentStation } from "./agent-station";
import { WorldGlobe } from "./world-globe";
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
    const sway = Math.sin(t * 0.05) * 0.35;
    camera.position.set(
      sway + ptr.current.x * 0.4,
      1.2 + ptr.current.y * -0.15 + Math.sin(t * 0.6) * 0.03,
      5.0
    );
    camera.lookAt(0, 0.6, -1);
  });
  return null;
}

function CallFloorLighting() {
  return (
    <>
      <hemisphereLight color="#7c3aed" groundColor="#0a0816" intensity={0.4} />
      {/* warm key from above-left */}
      <directionalLight position={[-5, 6, 4]} intensity={0.45} color="#fbbf24" />
      {/* cool rim from behind */}
      <directionalLight position={[3, 4, -6]} intensity={0.7} color="#6366f1" />
      {/* central globe spotlight */}
      <spotLight position={[0, 5, 1]} angle={Math.PI / 5} penumbra={0.6} intensity={0.8} color="#a5b4fc" distance={14} />
    </>
  );
}

/** Curved row of agent stations. Returns positions evenly spaced along an arc. */
function useAgentArcPositions(count: number, radius: number, archCenter: [number, number, number]) {
  return useMemo(() => {
    const arr: { pos: [number, number, number]; rot: [number, number, number]; phase: number }[] = [];
    const spread = Math.PI * 0.7; // 126° arc
    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.5 : i / (count - 1);
      const angle = -spread / 2 + spread * u;
      const x = archCenter[0] + Math.sin(angle) * radius;
      const z = archCenter[2] - Math.cos(angle) * radius;
      arr.push({
        pos: [x, archCenter[1], z],
        // each station faces the center of the arc
        rot: [0, angle, 0],
        phase: u * 6,
      });
    }
    return arr;
  }, [count, radius, archCenter]);
}

function CallFloorWorld({ effectsEnabled }: { effectsEnabled: boolean }) {
  const archCenter: [number, number, number] = [0, 0.4, -0.8];
  const stations = useAgentArcPositions(9, 3.4, archCenter);

  return (
    <>
      <fogExp2 attach="fog" args={["#160b27", 0.16]} />

      <CameraRig />
      <CallFloorLighting />

      {/* floor — receives warm + cool spill */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, -1]}>
        <planeGeometry args={[60, 40]} />
        <meshStandardMaterial color="#0d0820" roughness={0.7} metalness={0.25} />
      </mesh>

      {/* horizon glow strip — twilight band */}
      <mesh position={[0, 1.6, -10]}>
        <planeGeometry args={[40, 1.2]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive={new THREE.Color("#a855f7")}
          emissiveIntensity={0.7}
          transparent
          opacity={0.45}
          toneMapped={false}
        />
      </mesh>

      <WorldGlobe position={archCenter} />

      {stations.map((s, i) => (
        <AgentStation key={i} position={s.pos} rotation={s.rot} phase={s.phase} />
      ))}

      <PostFx
        enabled={effectsEnabled}
        bloomIntensity={1.6}
        bloomThreshold={0.2}
        vignetteOffset={0.24}
        vignetteDarkness={0.98}
        chromaticOffset={0.0007}
      />
    </>
  );
}

export function CallFloorScene({ className }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.2, 5.0], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <CallFloorWorld effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
