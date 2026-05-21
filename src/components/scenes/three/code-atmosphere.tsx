"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A single large back-plane textured with falling binary characters.
// The UV offset is animated in useFrame so it reads as a slow rain of
// digits dissolving into the fog. One mesh, one draw call — cheap.

function makeBinaryTexture(): THREE.CanvasTexture {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // transparent base (so background fog/night shows through)
  ctx.clearRect(0, 0, w, h);

  ctx.font = '18px ui-monospace, "SF Mono", Menlo, monospace';
  ctx.textBaseline = "top";

  const colW = 14;
  const rowH = 22;
  const cols = Math.floor(w / colW);
  const rows = Math.floor(h / rowH);

  for (let c = 0; c < cols; c++) {
    // each column has a head that fades upward
    const headRow = Math.floor(Math.random() * rows);
    const trail = 8 + Math.floor(Math.random() * 14);
    const isIndigo = Math.random() < 0.55;
    for (let r = 0; r < rows; r++) {
      const d = ((r - headRow) % rows + rows) % rows;
      if (d > trail) continue;
      const t = 1 - d / trail;
      const ch = Math.random() < 0.5 ? "0" : "1";
      const alpha = (0.05 + 0.7 * t) * 0.55; // overall ~30% opacity
      ctx.fillStyle = isIndigo
        ? `rgba(165, 180, 252, ${alpha})`
        : `rgba(255, 255, 255, ${alpha * 0.7})`;
      ctx.fillText(ch, c * colW + 2, r * rowH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 2);
  return tex;
}

export function CodeAtmosphere() {
  const matRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const tex = useMemo(() => makeBinaryTexture(), []);

  useEffect(() => {
    return () => tex.dispose();
  }, [tex]);

  useFrame((_, delta) => {
    // slow downward fall — texture offset Y increases (UV V coord moves up,
    // visible texels appear to fall)
    tex.offset.y -= delta * 0.04;
  });

  return (
    <mesh position={[0, 0, -7]}>
      <planeGeometry args={[28, 16]} />
      <meshBasicMaterial
        ref={matRef}
        map={tex}
        transparent
        opacity={0.35}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
