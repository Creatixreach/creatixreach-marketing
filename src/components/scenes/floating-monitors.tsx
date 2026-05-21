"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CrtMonitor, type MonitorContent } from "@/components/scenes/three/crt-monitor";
import { DeskAndFloor } from "@/components/scenes/three/desk-and-floor";
import { CodeAtmosphere } from "@/components/scenes/three/code-atmosphere";
import { SceneLighting } from "@/components/scenes/three/scene-lighting";
import { SceneEnvironment } from "@/components/scenes/three/scene-environment";
import { useDeviceTier } from "@/lib/device-tier";

const MONITORS: MonitorContent[] = [
  {
    title: "~/creatixreach $",
    lines: [
      { text: "$ pnpm build", color: "#ffb070" },
      { text: "Compiled successfully", color: "#4ade80" },
      { text: "Route /             10.2 kB", color: "#fed7aa" },
      { text: "Route /contact       8.1 kB", color: "#fed7aa" },
      { text: "Deployed to vercel ok", color: "#4ade80" },
      { text: "  edge regions: iad1", color: "#fdba74" },
      { text: "$ tail -f dialer.log", color: "#ffb070" },
      { text: "[ok] 412 calls /1h", color: "#fed7aa" },
      { text: "[ok] 38 leads captured", color: "#fcd34d" },
      { text: "$ █", color: "#ffb070" },
    ],
  },
  {
    title: "Hero.tsx",
    lines: [
      { text: "export function Hero() {", color: "#6366f1" },
      { text: "  return (", color: "#e0e7ff" },
      { text: "    <Scene>", color: "#e0e7ff" },
      { text: "      <Headline>", color: "#a5b4fc" },
      { text: "        We run the whole", color: "#ffffff" },
      { text: "        stack.", color: "#ffffff" },
      { text: "      </Headline>", color: "#a5b4fc" },
      { text: "      <CtaRow primary />", color: "#818cf8" },
      { text: "    </Scene>", color: "#e0e7ff" },
      { text: "  );", color: "#e0e7ff" },
      { text: "}", color: "#6366f1" },
    ],
  },
  {
    title: "call-flow.txt",
    lines: [
      { text: "         CALL FLOW", color: "#7dd3fc" },
      { text: "  ┌────────────┐", color: "#67e8f9" },
      { text: "  │  Dialer    │", color: "#ffffff" },
      { text: "  └─────┬──────┘", color: "#67e8f9" },
      { text: "        │", color: "#67e8f9" },
      { text: "  ┌─────▼──────┐", color: "#67e8f9" },
      { text: "  │   Agent    │", color: "#ffffff" },
      { text: "  └─────┬──────┘", color: "#67e8f9" },
      { text: "        │ qualified", color: "#7dd3fc" },
      { text: "  ┌─────▼──────┐", color: "#67e8f9" },
      { text: "  │   Lead     │", color: "#ffffff" },
      { text: "  └────────────┘", color: "#67e8f9" },
    ],
  },
];

// Glow color per monitor — matches its content vibe.
// 0: terminal (warm amber), 1: JSX code (brand indigo), 2: call-flow (cool cyan)
const GLOW_COLORS = ["#ffb070", "#7c83ff", "#70ddff"];
const GLOW_INTENSITIES = [2.0, 2.5, 2.2];

// 1D value-noise (no external lib) — used for handheld camera shake.
// Hash + smoothstep interpolation, stable per integer input.
function hash1(n: number): number {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}
function noise1(x: number): number {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return hash1(i) * (1 - u) + hash1(i + 1) * u;
}

const BASE_CAM = new THREE.Vector3(0, 0.9, 5.2);
const LOOK_AT = new THREE.Vector3(0, 0.05, 0.2);

function CameraRig() {
  const { camera, pointer } = useThree();
  const tmp = useRef(new THREE.Vector3());
  // Smoothed pointer offset
  const ptr = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;

    // 1. Slow orbit on Y (+/- 0.12 rad arc, 0.04 rad/sec rate)
    const orbit = Math.sin(t * 0.04) * 0.12;

    // 2. Lerp pointer offset (~0.02/frame at 60fps -> ~1.2/sec lerp factor)
    const lerpK = 1 - Math.pow(1 - 0.02, delta * 60);
    ptr.current.x += (pointer.x - ptr.current.x) * lerpK;
    ptr.current.y += (pointer.y - ptr.current.y) * lerpK;

    // 3. Handheld noise (tiny)
    const nx = (noise1(t * 0.7) - 0.5) * 0.03;
    const ny = (noise1(t * 0.6 + 13.1) - 0.5) * 0.03;

    // Compose camera position
    const radius = BASE_CAM.length();
    const baseX = Math.sin(orbit) * radius;
    const baseZ = Math.cos(orbit) * radius;

    tmp.current.set(
      baseX + ptr.current.x * 0.35 + nx,
      BASE_CAM.y + ptr.current.y * -0.2 + ny,
      baseZ
    );
    camera.position.copy(tmp.current);
    camera.lookAt(LOOK_AT);
  });

  return null;
}

function MonitorsScene({ effectsEnabled }: { effectsEnabled: boolean }) {
  return (
    <>
      {/* Brand-navy fog so distant geometry dissolves into the room */}
      <fogExp2 attach="fog" args={["#0f172a", 0.14]} />

      <CameraRig />
      <SceneLighting />

      <CodeAtmosphere />
      <DeskAndFloor />

      <CrtMonitor
        content={MONITORS[0]}
        position={[-2.4, 0.05, -0.4]}
        rotation={[0, 0.35, 0]}
        glowColor={GLOW_COLORS[0]}
        glowIntensity={GLOW_INTENSITIES[0]}
        floatPhase={0}
      />
      <CrtMonitor
        content={MONITORS[1]}
        position={[0, 0.1, 0.2]}
        rotation={[0, 0, 0]}
        glowColor={GLOW_COLORS[1]}
        glowIntensity={GLOW_INTENSITIES[1]}
        floatPhase={1.7}
      />
      <CrtMonitor
        content={MONITORS[2]}
        position={[2.4, 0.05, -0.4]}
        rotation={[0, -0.35, 0]}
        glowColor={GLOW_COLORS[2]}
        glowIntensity={GLOW_INTENSITIES[2]}
        floatPhase={3.2}
      />

      <SceneEnvironment enabled={effectsEnabled} />
    </>
  );
}

export function FloatingMonitors({ className }: { className?: string }) {
  // r3f Canvas already uses requestAnimationFrame; reduced-motion users will
  // get the static fallback rendered by the parent instead of this component.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const tier = useDeviceTier();
  if (!mounted) return null;

  // Disable HDR Environment + post-processing on low-tier (also caught by
  // prefers-reduced-motion via useDeviceTier).
  const effectsEnabled = tier === "high";

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.9, 5.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <MonitorsScene effectsEnabled={effectsEnabled} />
      </Canvas>
    </div>
  );
}
