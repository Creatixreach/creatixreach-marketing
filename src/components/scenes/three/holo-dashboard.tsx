"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const HISTORY = 60;

function drawDashboard(history: number[][], t: number): HTMLCanvasElement {
  const w = 640;
  const h = 400;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // base (translucent navy — emissive on top will tint it)
  ctx.fillStyle = "rgba(2, 8, 23, 0.85)";
  ctx.fillRect(0, 0, w, h);

  // grid
  ctx.strokeStyle = "rgba(34, 211, 238, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // title bar
  ctx.fillStyle = "#7dd3fc";
  ctx.font = "bold 16px ui-monospace, Menlo, monospace";
  ctx.textBaseline = "top";
  ctx.fillText("API Operations  /  realtime", 24, 20);
  ctx.fillStyle = "rgba(125, 211, 252, 0.55)";
  ctx.font = "11px ui-monospace, Menlo, monospace";
  ctx.fillText("region: iad1 · workers: 12 · uptime 99.98%", 24, 44);

  // stat tiles
  const stats = [
    { label: "REQ/S", value: Math.floor(220 + Math.sin(t * 0.7) * 30 + Math.random() * 20).toString(), color: "#22d3ee" },
    { label: "p95 LATENCY", value: Math.floor(60 + Math.sin(t * 0.5) * 6 + Math.random() * 4) + "ms", color: "#a5f3fc" },
    { label: "QUEUE", value: Math.floor(2 + Math.random() * 5).toString(), color: "#fbbf24" },
    { label: "ERROR", value: "0.02%", color: "#34d399" },
  ];
  stats.forEach((s, i) => {
    const x = 24 + i * 150;
    const y = 80;
    ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
    ctx.fillRect(x, y, 130, 64);
    ctx.fillStyle = "rgba(125, 211, 252, 0.6)";
    ctx.font = "10px ui-monospace, Menlo, monospace";
    ctx.fillText(s.label, x + 12, y + 10);
    ctx.fillStyle = s.color;
    ctx.font = "bold 22px ui-monospace, Menlo, monospace";
    ctx.fillText(s.value, x + 12, y + 28);
  });

  // sparkline panel
  const panelX = 24;
  const panelY = 168;
  const panelW = w - 48;
  const panelH = 130;
  ctx.fillStyle = "rgba(34, 211, 238, 0.05)";
  ctx.fillRect(panelX, panelY, panelW, panelH);
  ctx.strokeStyle = "rgba(34, 211, 238, 0.25)";
  ctx.strokeRect(panelX, panelY, panelW, panelH);
  ctx.fillStyle = "rgba(125, 211, 252, 0.7)";
  ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.fillText("REQUESTS / SECOND (last 60s)", panelX + 12, panelY + 10);

  // draw the three series
  const colors = ["#22d3ee", "#a855f7", "#34d399"];
  for (let s = 0; s < history.length; s++) {
    ctx.strokeStyle = colors[s];
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < HISTORY; i++) {
      const v = history[s][i];
      const x = panelX + 12 + (i * (panelW - 24)) / (HISTORY - 1);
      const y = panelY + panelH - 14 - v * (panelH - 30);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // log lines
  const logY = panelY + panelH + 16;
  ctx.fillStyle = "rgba(125, 211, 252, 0.55)";
  ctx.font = "10px ui-monospace, Menlo, monospace";
  const logs = [
    "[ok]  POST /v1/leads        201 · 38ms",
    "[ok]  GET  /v1/contacts      200 · 12ms",
    "[ok]  POST /v1/webhook/stripe 200 · 64ms",
    "[ok]  GET  /v1/agents/active 200 ·  8ms",
  ];
  logs.forEach((l, i) => {
    ctx.fillStyle = "rgba(34, 211, 238, 0.55)";
    ctx.fillText(l, 24, logY + i * 14);
  });

  return canvas;
}

export function HoloDashboard({
  position = [0, 0.7, 0] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  // Three rolling histories for the sparklines.
  const history = useMemo(() => {
    return [0, 1, 2].map((s) =>
      Array.from({ length: HISTORY }, (_, i) =>
        0.5 + 0.3 * Math.sin(i * 0.2 + s * 0.7)
      )
    );
  }, []);

  const canvas = useMemo(() => drawDashboard(history, 0), [history]);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  const lastDraw = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (t - lastDraw.current > 0.1) {
      // shift histories
      for (let s = 0; s < history.length; s++) {
        history[s].shift();
        const base = 0.5 + Math.sin(t * 0.4 + s * 1.1) * 0.18;
        history[s].push(Math.max(0, Math.min(1, base + (Math.random() - 0.5) * 0.18)));
      }
      const fresh = drawDashboard(history, t);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fresh, 0, 0);
      texture.needsUpdate = true;
      lastDraw.current = t;
    }

    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.04;
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* glass surface */}
      <mesh>
        <planeGeometry args={[3.6, 2.25]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color("#22d3ee")}
          emissiveIntensity={1.2}
          transparent
          opacity={0.92}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* faint frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.8, 2.45]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.07} />
      </mesh>
      {/* halo */}
      <pointLight color="#22d3ee" intensity={2.0} distance={6} decay={2} position={[0, 0, 0.6]} />
    </group>
  );
}
