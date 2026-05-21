"use client";

import { useMemo } from "react";
import * as THREE from "three";

function makeDeskTexture(): THREE.CanvasTexture {
  // Procedural wood-grain noise — cheap, no asset dependency.
  const w = 512;
  const h = 256;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // base dark wood tone (HSL ~25, 15%, 12%)
  ctx.fillStyle = "#23170f";
  ctx.fillRect(0, 0, w, h);

  // long grain streaks
  for (let i = 0; i < 240; i++) {
    const y = Math.random() * h;
    const len = 80 + Math.random() * 300;
    const x = Math.random() * w;
    const alpha = 0.04 + Math.random() * 0.06;
    ctx.strokeStyle = `rgba(${30 + Math.random() * 25},${20 + Math.random() * 18},${12 + Math.random() * 10},${alpha})`;
    ctx.lineWidth = 1 + Math.random() * 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
      x + len * 0.33,
      y + (Math.random() - 0.5) * 4,
      x + len * 0.66,
      y + (Math.random() - 0.5) * 4,
      x + len,
      y + (Math.random() - 0.5) * 2
    );
    ctx.stroke();
  }

  // subtle dark knots
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 8 + Math.random() * 16;
    const g = ctx.createRadialGradient(x, y, 1, x, y, r);
    g.addColorStop(0, "rgba(8,4,2,0.45)");
    g.addColorStop(1, "rgba(8,4,2,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 4;
  return tex;
}

export function DeskAndFloor() {
  const deskTex = useMemo(() => makeDeskTexture(), []);

  return (
    <group>
      {/* Floor — receives colored light spill */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.55, 0]}
        receiveShadow={false}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial
          color="#0a0e1a"
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>

      {/* Desk — monitors rest on this */}
      <mesh position={[0, -1.0, -0.2]}>
        <boxGeometry args={[6, 0.1, 3]} />
        <meshStandardMaterial
          map={deskTex}
          color="#2a1c12"
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Desk edge front lip — slightly darker for definition */}
      <mesh position={[0, -1.05, 1.3]}>
        <boxGeometry args={[6.02, 0.02, 0.06]} />
        <meshStandardMaterial color="#15100a" roughness={0.85} />
      </mesh>
    </group>
  );
}
