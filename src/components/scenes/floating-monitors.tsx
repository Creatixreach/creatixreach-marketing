"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type MonitorContent = {
  title: string;
  lines: { text: string; color: string }[];
};

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

function makeMonitorTexture(content: MonitorContent): THREE.CanvasTexture {
  const w = 512;
  const h = 384;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  // bezel
  ctx.fillStyle = "#0b1224";
  ctx.fillRect(0, 0, w, h);
  // screen
  const pad = 14;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(pad, pad, w - pad * 2, h - pad * 2);
  // subtle scanlines
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let y = pad; y < h - pad; y += 4) {
    ctx.fillRect(pad, y, w - pad * 2, 1);
  }
  // title bar
  ctx.fillStyle = "rgba(99,102,241,0.18)";
  ctx.fillRect(pad, pad, w - pad * 2, 28);
  ctx.fillStyle = "#a5b4fc";
  ctx.font = '14px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textBaseline = "middle";
  ctx.fillText(content.title, pad + 12, pad + 14);
  // window dots
  const dotY = pad + 14;
  ["#ef4444", "#f59e0b", "#22c55e"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(w - pad - 16 - i * 16, dotY, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  // content lines
  ctx.font = '15px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textBaseline = "top";
  let y = pad + 44;
  for (const line of content.lines) {
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, pad + 14, y);
    y += 22;
    if (y > h - pad - 16) break;
  }
  // soft inner glow
  const grad = ctx.createRadialGradient(w / 2, h / 2, h / 4, w / 2, h / 2, h);
  grad.addColorStop(0, "rgba(99,102,241,0.07)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

type MonitorProps = {
  textureIndex: number;
  position: [number, number, number];
  rotation: [number, number, number];
  floatPhase: number;
};

function Monitor({ textureIndex, position, rotation, floatPhase }: MonitorProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const texture = useMemo(
    () => makeMonitorTexture(MONITORS[textureIndex % MONITORS.length]),
    [textureIndex]
  );

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  const { pointer } = useThree();

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;
    const t = clock.getElapsedTime();
    // gentle float + parallax based on pointer (-1..1)
    g.position.x = position[0] + pointer.x * 0.3;
    g.position.y =
      position[1] + Math.sin(t * 0.7 + floatPhase) * 0.12 + pointer.y * -0.2;
    g.rotation.y = rotation[1] + Math.sin(t * 0.4 + floatPhase) * 0.06 + pointer.x * 0.15;
    g.rotation.x = rotation[0] + Math.cos(t * 0.5 + floatPhase) * 0.04 + pointer.y * 0.1;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <mesh>
        <planeGeometry args={[2.4, 1.8]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0.96}
          toneMapped={false}
        />
      </mesh>
      {/* soft glow plane behind */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.7, 2.1]} />
        <meshBasicMaterial
          color={0x4f46e5}
          transparent
          opacity={0.07}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function MonitorsScene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <Monitor
        textureIndex={0}
        position={[-2.6, 0.4, -0.5]}
        rotation={[0.05, 0.35, -0.06]}
        floatPhase={0}
      />
      <Monitor
        textureIndex={1}
        position={[0, -0.1, 0.2]}
        rotation={[-0.02, 0, 0.02]}
        floatPhase={1.7}
      />
      <Monitor
        textureIndex={2}
        position={[2.6, 0.5, -0.4]}
        rotation={[0.04, -0.35, 0.05]}
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
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <MonitorsScene />
      </Canvas>
    </div>
  );
}
