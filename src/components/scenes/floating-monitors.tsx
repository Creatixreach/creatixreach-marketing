"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CrtMonitor, type MonitorContent } from "@/components/scenes/three/crt-monitor";
import { DeskAndFloor } from "@/components/scenes/three/desk-and-floor";
import { CodeAtmosphere } from "@/components/scenes/three/code-atmosphere";

const MONITORS: MonitorContent[] = [
  {
    title: "~/creatixreach $",
    lines: [
      { text: "$ pnpm build", color: "#a5b4fc" },
      { text: "Compiled successfully", color: "#34d399" },
      { text: "Route /             10.2 kB", color: "#cbd5e1" },
      { text: "Route /contact       8.1 kB", color: "#cbd5e1" },
      { text: "Deployed to vercel ok", color: "#34d399" },
      { text: "  edge regions: iad1", color: "#94a3b8" },
      { text: "$ tail -f dialer.log", color: "#a5b4fc" },
      { text: "[ok] 412 calls /1h", color: "#cbd5e1" },
      { text: "[ok] 38 leads captured", color: "#fbbf24" },
      { text: "$ █", color: "#a5b4fc" },
    ],
  },
  {
    title: "Hero.tsx",
    lines: [
      { text: "export function Hero() {", color: "#a5b4fc" },
      { text: "  return (", color: "#cbd5e1" },
      { text: "    <Scene>", color: "#cbd5e1" },
      { text: "      <Headline>", color: "#fbbf24" },
      { text: "        We run the whole", color: "#f8fafc" },
      { text: "        stack.", color: "#f8fafc" },
      { text: "      </Headline>", color: "#fbbf24" },
      { text: "      <CtaRow primary />", color: "#34d399" },
      { text: "    </Scene>", color: "#cbd5e1" },
      { text: "  );", color: "#cbd5e1" },
      { text: "}", color: "#a5b4fc" },
    ],
  },
  {
    title: "call-flow.txt",
    lines: [
      { text: "         CALL FLOW", color: "#a5b4fc" },
      { text: "  ┌────────────┐", color: "#94a3b8" },
      { text: "  │  Dialer    │", color: "#f8fafc" },
      { text: "  └─────┬──────┘", color: "#94a3b8" },
      { text: "        │", color: "#94a3b8" },
      { text: "  ┌─────▼──────┐", color: "#94a3b8" },
      { text: "  │   Agent    │", color: "#f8fafc" },
      { text: "  └─────┬──────┘", color: "#94a3b8" },
      { text: "        │ qualified", color: "#34d399" },
      { text: "  ┌─────▼──────┐", color: "#94a3b8" },
      { text: "  │   Lead     │", color: "#fbbf24" },
      { text: "  └────────────┘", color: "#94a3b8" },
    ],
  },
];

// Glow color per monitor — matches its content vibe.
// 0: terminal (warm amber), 1: JSX code (brand indigo), 2: call-flow (cool cyan)
const GLOW_COLORS = ["#ffb070", "#7c83ff", "#70ddff"];
const GLOW_INTENSITIES = [1.2, 1.5, 1.3];

function MonitorsScene() {
  return (
    <>
      {/* Brand-navy fog so distant geometry dissolves into the room */}
      <fogExp2 attach="fog" args={["#0b1224", 0.08]} />

      <ambientLight intensity={0.35} />

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
    </>
  );
}

export function FloatingMonitors({ className }: { className?: string }) {
  // r3f Canvas already uses requestAnimationFrame; reduced-motion users will
  // get the static fallback rendered by the parent instead of this component.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.6, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <MonitorsScene />
      </Canvas>
    </div>
  );
}
