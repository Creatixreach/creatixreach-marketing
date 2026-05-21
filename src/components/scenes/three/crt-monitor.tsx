"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

export type MonitorLine = { text: string; color: string };

export type MonitorContent = {
  title: string;
  lines: MonitorLine[];
};

function makeScreenTexture(content: MonitorContent): THREE.CanvasTexture {
  const w = 512;
  const h = 384;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // base screen — pure black for max emissive contrast
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  // title bar
  const pad = 14;
  ctx.fillStyle = "rgba(99,102,241,0.22)";
  ctx.fillRect(pad, pad, w - pad * 2, 28);
  ctx.fillStyle = "#a5b4fc";
  ctx.font = '14px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textBaseline = "middle";
  ctx.fillText(content.title, pad + 12, pad + 14);

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

  // CRT scanlines — drawn last so they darken text + bg uniformly.
  // 1px dark line every 3px at ~8% opacity reads as period authenticity
  // without crushing legibility.
  ctx.fillStyle = "rgba(0,0,0,0.08)";
  for (let y = 0; y < h; y += 3) {
    ctx.fillRect(0, y, w, 1);
  }

  // inner vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, h / 3, w / 2, h / 2, h);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

const CASE_COLOR = "#1b2230";
const PLASTIC = { roughness: 0.7, metalness: 0.05 } as const;

type CrtMonitorProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  content: MonitorContent;
  glowColor: string;
  glowIntensity?: number;
  floatPhase?: number;
};

export function CrtMonitor({
  position,
  rotation = [0, 0, 0],
  content,
  glowColor,
  glowIntensity = 1.3,
  floatPhase = 0,
}: CrtMonitorProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const ledRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  const screenTex = useMemo(() => makeScreenTexture(content), [content]);

  useEffect(() => {
    return () => {
      screenTex.dispose();
    };
  }, [screenTex]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    // tiny vertical bob (desk-bound, not free float)
    const g = groupRef.current;
    if (g) {
      g.position.y = position[1] + Math.sin(t * 0.9 + floatPhase) * 0.02;
    }
    // led + light flicker
    const flicker = 0.95 + 0.05 * Math.sin(t * 8 + floatPhase);
    if (ledRef.current) {
      ledRef.current.emissiveIntensity = 1.4 * flicker;
    }
    if (lightRef.current) {
      lightRef.current.intensity = glowIntensity * flicker;
    }
  });

  // Geometry constants (units ~= meters in our scene scale)
  const screenW = 1.9;
  const screenH = 1.4;
  const caseDepth = 0.55;
  const bezel = 0.12;
  const caseW = screenW + bezel * 2;
  const caseH = screenH + bezel * 2;

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Case shell */}
      <RoundedBox
        args={[caseW, caseH, caseDepth]}
        radius={0.05}
        smoothness={4}
        position={[0, 0, -caseDepth / 2 + 0.001]}
      >
        <meshStandardMaterial color={CASE_COLOR} {...PLASTIC} />
      </RoundedBox>

      {/* Screen plane sits just in front of the case face */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[screenW, screenH, 20, 20]} />
        <meshStandardMaterial
          map={screenTex}
          emissiveMap={screenTex}
          emissive={new THREE.Color(glowColor)}
          emissiveIntensity={2.6}
          toneMapped={false}
          roughness={0.35}
          metalness={0}
        />
      </mesh>

      {/* Inner bezel border (slight inset shadow) */}
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[screenW + bezel * 1.6, screenH + bezel * 1.6]} />
        <meshStandardMaterial
          color="#0a0d14"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Power LED — bottom-right of bezel */}
      <mesh position={[caseW / 2 - 0.09, -caseH / 2 + 0.06, 0.02]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial
          ref={ledRef}
          color={glowColor}
          emissive={new THREE.Color(glowColor)}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* Vent slits along the back top */}
      <group position={[0, caseH / 2 - 0.05, -caseDepth + 0.02]}>
        {[-0.45, -0.225, 0, 0.225, 0.45].map((x) => (
          <mesh key={x} position={[x, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <boxGeometry args={[0.16, 0.012, 0.018]} />
            <meshStandardMaterial color="#070a12" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Stand neck */}
      <mesh position={[0, -caseH / 2 - 0.12, -0.12]}>
        <cylinderGeometry args={[0.05, 0.07, 0.22, 16]} />
        <meshStandardMaterial color={CASE_COLOR} {...PLASTIC} />
      </mesh>

      {/* Stand base */}
      <mesh position={[0, -caseH / 2 - 0.25, -0.12]}>
        <cylinderGeometry args={[0.32, 0.32, 0.025, 32]} />
        <meshStandardMaterial color={CASE_COLOR} {...PLASTIC} />
      </mesh>

      {/* Colored screen-cast point light (this monitor's light spill) */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0.6]}
        color={glowColor}
        intensity={glowIntensity}
        distance={8}
        decay={2}
      />
    </group>
  );
}
