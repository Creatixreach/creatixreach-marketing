"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const SLOT_COUNT = 8;

function makeRackTexture(): THREE.CanvasTexture {
  // a column of "server slot" LEDs + labels, drawn once and reused
  const w = 128;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#020a13";
  ctx.fillRect(0, 0, w, h);

  const slotH = h / SLOT_COUNT;
  for (let i = 0; i < SLOT_COUNT; i++) {
    const y = i * slotH;
    // slot bg
    ctx.fillStyle = i % 2 === 0 ? "#04141f" : "#06182a";
    ctx.fillRect(0, y, w, slotH);
    // separator
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, y + slotH - 1, w, 1);

    // led row (cyan + amber + green)
    const leds = ["#22d3ee", "#22d3ee", "#22d3ee", "#fbbf24", "#34d399"];
    leds.forEach((c, j) => {
      ctx.fillStyle = c;
      ctx.fillRect(10 + j * 9, y + 8, 5, 5);
    });

    // label strip
    ctx.fillStyle = "rgba(125, 211, 252, 0.85)";
    ctx.font = "9px ui-monospace, Menlo, monospace";
    ctx.textBaseline = "middle";
    ctx.fillText(`U${SLOT_COUNT - i}  api-${(i + 1).toString().padStart(2, "0")}`, 8, y + slotH / 2 + 6);

    // bar graph
    ctx.fillStyle = "rgba(34,211,238,0.25)";
    for (let b = 0; b < 14; b++) {
      const barH = 4 + Math.random() * 14;
      ctx.fillRect(58 + b * 5, y + slotH - 8 - barH, 3, barH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export function ServerRack({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const ledRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const texture = useMemo(() => makeRackTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ledRef.current) {
      ledRef.current.emissiveIntensity = 1.6 + 0.4 * Math.sin(t * 4 + position[0]);
    }
  });

  const W = 1.0;
  const H = 3.6;
  const D = 0.5;

  return (
    <group position={position} rotation={rotation}>
      {/* outer chassis */}
      <RoundedBox args={[W, H, D]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#0a0f17" roughness={0.5} metalness={0.4} />
      </RoundedBox>
      {/* front face — emissive slot texture */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <planeGeometry args={[W - 0.05, H - 0.05]} />
        <meshStandardMaterial
          ref={ledRef}
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color("#22d3ee")}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* spill light into the corridor */}
      <pointLight position={[0, 0, D / 2 + 0.6]} color="#22d3ee" intensity={0.9} distance={4.5} decay={2} />
    </group>
  );
}
