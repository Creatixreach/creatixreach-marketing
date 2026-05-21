"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

type Stage = "wireframe" | "mockup" | "live";

function drawChrome(ctx: CanvasRenderingContext2D, w: number, h: number, title: string) {
  // chrome bar
  ctx.fillStyle = "#0e1119";
  ctx.fillRect(0, 0, w, 28);
  // traffic lights
  ["#ff5f56", "#ffbd2e", "#27c93f"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(14 + i * 14, 14, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  // url bar
  ctx.fillStyle = "#1a1f2e";
  ctx.fillRect(64, 6, w - 80, 16);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "middle";
  ctx.fillText(title, 72, 14);
}

function drawWireframe(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  ctx.fillStyle = "#0a0e1a";
  ctx.fillRect(0, 28, w, h - 28);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;

  // header block
  ctx.strokeRect(20, 44, w - 40, 36);
  // hero
  ctx.strokeRect(20, 92, w - 40, 80);
  // nav strokes
  for (let i = 0; i < 4; i++) {
    ctx.strokeRect(w - 240 + i * 56, 54, 48, 16);
  }
  // 3-col cards
  const cardW = (w - 40 - 24) / 3;
  for (let i = 0; i < 3; i++) {
    ctx.strokeRect(20 + i * (cardW + 12), 188, cardW, 90);
  }
  // diagonal hatch on hero (changing per t to suggest in-progress)
  ctx.save();
  ctx.beginPath();
  ctx.rect(20, 92, w - 40, 80);
  ctx.clip();
  ctx.strokeStyle = "rgba(99,102,241,0.35)";
  const offset = (t * 30) % 16;
  for (let x = -h + offset; x < w + h; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMockup(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // base
  ctx.fillStyle = "#0c1322";
  ctx.fillRect(0, 28, w, h - 28);

  // nav
  ctx.fillStyle = "#7c83ff";
  ctx.fillRect(20, 50, 90, 20);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  for (let i = 0; i < 4; i++) ctx.fillRect(w - 230 + i * 50, 56, 40, 8);

  // hero gradient
  const g = ctx.createLinearGradient(20, 90, w - 20, 170);
  g.addColorStop(0, "#ec4899");
  g.addColorStop(0.5, "#a855f7");
  g.addColorStop(1, "#22d3ee");
  ctx.fillStyle = g;
  ctx.fillRect(20, 90, w - 40, 80);

  // headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("Ship faster.", 36, 108);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.fillText("A site that converts.", 36, 132);

  // CTA pill
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(36, 148, 70, 16);
  ctx.fillStyle = "#ffffff";
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.fillText("Get a quote →", 42, 152);

  // cards
  const cardW = (w - 40 - 24) / 3;
  ["#ec4899", "#a855f7", "#22d3ee"].forEach((c, i) => {
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(20 + i * (cardW + 12), 188, cardW, 90);
    ctx.fillStyle = c;
    ctx.fillRect(20 + i * (cardW + 12) + 10, 198, 22, 22);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fillRect(20 + i * (cardW + 12) + 10, 230, cardW - 20, 8);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(20 + i * (cardW + 12) + 10, 244, cardW - 40, 6);
    ctx.fillRect(20 + i * (cardW + 12) + 10, 256, cardW - 30, 6);
  });
}

function drawLive(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  drawMockup(ctx, w, h);

  // live status pulse
  const pulse = 0.5 + 0.5 * Math.sin(t * 4);
  ctx.fillStyle = `rgba(74, 222, 128, ${0.7 + pulse * 0.3})`;
  ctx.beginPath();
  ctx.arc(w - 18, 14, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(74,222,128,0.95)";
  ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "middle";
  ctx.fillText("LIVE", w - 60, 14);

  // analytics overlay
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fillRect(20, h - 60, w - 40, 36);
  ctx.fillStyle = "#22d3ee";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillText("CVR 4.8%", 30, h - 48);
  ctx.fillStyle = "#ec4899";
  ctx.fillText("RPS 312", 110, h - 48);
  ctx.fillStyle = "#a5b4fc";
  ctx.fillText("p95 84ms", 190, h - 48);

  // sparkline
  ctx.strokeStyle = "#7dd3fc";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let i = 0; i < 30; i++) {
    const x = w - 140 + i * 4;
    const y = h - 40 + Math.sin(i * 0.6 + t * 2) * 4;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function makeBrowserTexture(stage: Stage, t: number, title: string): HTMLCanvasElement {
  const w = 512;
  const h = 320;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  if (stage === "wireframe") drawWireframe(ctx, w, h, t);
  else if (stage === "mockup") drawMockup(ctx, w, h);
  else drawLive(ctx, w, h, t);

  drawChrome(ctx, w, h, title);

  return canvas;
}

type BrowserWindowProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  /** seconds per stage, in order wireframe -> mockup -> live */
  cycleSec?: number;
  /** offset within the cycle (so windows desync) */
  phase?: number;
  title: string;
  glow: string;
  scale?: number;
};

const STAGES: Stage[] = ["wireframe", "mockup", "live"];

export function BrowserWindow({
  position,
  rotation = [0, 0, 0],
  cycleSec = 4,
  phase = 0,
  title,
  glow,
  scale = 1,
}: BrowserWindowProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const lastStageRef = useRef<Stage>("wireframe");
  const lastRedrawRef = useRef(0);

  const canvas = useMemo(() => makeBrowserTexture("wireframe", 0, title), [title]);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    texRef.current = t;
    return t;
  }, [canvas]);

  useEffect(() => {
    return () => texture.dispose();
  }, [texture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const tot = cycleSec * STAGES.length;
    const u = ((t + phase) % tot) / cycleSec;
    const idx = Math.floor(u);
    const stage = STAGES[idx % STAGES.length];

    // redraw at ~12fps for the dynamic stages (wireframe + live)
    const shouldAnimate = stage !== "mockup";
    const interval = shouldAnimate ? 0.08 : 0.25;
    if (stage !== lastStageRef.current || t - lastRedrawRef.current > interval) {
      const fresh = makeBrowserTexture(stage, t, title);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fresh, 0, 0);
      texture.needsUpdate = true;
      lastStageRef.current = stage;
      lastRedrawRef.current = t;
    }

    const g = groupRef.current;
    if (g) {
      g.position.y = position[1] + Math.sin(t * 0.7 + phase) * 0.08;
      g.rotation.y = rotation[1] + Math.sin(t * 0.3 + phase) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* back-of-window shell */}
      <RoundedBox args={[2.5, 1.6, 0.08]} radius={0.04} smoothness={4} position={[0, 0, -0.04]}>
        <meshStandardMaterial color="#10131c" roughness={0.55} metalness={0.1} />
      </RoundedBox>
      {/* screen face */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[2.4, 1.5]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color(glow)}
          emissiveIntensity={1.6}
          toneMapped={false}
          roughness={0.35}
        />
      </mesh>
      {/* halo light */}
      <pointLight position={[0, 0, 0.4]} color={glow} intensity={1.4} distance={5} decay={2} />
    </group>
  );
}
