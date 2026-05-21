"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const POSTS = [
  { handle: "@creatixreach", text: "New case study: 312% lift", color: "#ec4899" },
  { handle: "@creatixreach", text: "Behind the build →", color: "#a855f7" },
  { handle: "@creatixreach", text: "Posting on a schedule", color: "#22d3ee" },
  { handle: "@creatixreach", text: "Ship + share, repeat", color: "#f59e0b" },
];

function drawPhoneTexture(t: number): HTMLCanvasElement {
  const w = 256;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;

  // bg
  ctx.fillStyle = "#06080f";
  ctx.fillRect(0, 0, w, h);

  // status bar
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 11px system-ui";
  ctx.textBaseline = "middle";
  ctx.fillText("9:41", 14, 14);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText("●●●●●", w - 38, 14);

  // app bar
  ctx.fillStyle = "#ec4899";
  ctx.fillRect(0, 28, w, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px system-ui";
  ctx.fillText("creatix.social", 14, 46);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "10px ui-monospace, Menlo, monospace";
  ctx.fillText("FEED", w - 50, 46);

  // posts scroll - shift by t
  const offset = ((t * 25) % 130);
  for (let i = -1; i < 5; i++) {
    const p = POSTS[((i % POSTS.length) + POSTS.length) % POSTS.length];
    const y = 76 + i * 130 - offset;
    if (y < 60 || y > h - 20) continue;

    // card
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.fillRect(10, y, w - 20, 110);
    // avatar
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(28, y + 22, 12, 0, Math.PI * 2);
    ctx.fill();
    // handle
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px system-ui";
    ctx.fillText(p.handle, 48, y + 22);
    // text
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "11px system-ui";
    ctx.fillText(p.text, 14, y + 50);

    // media slab
    const g = ctx.createLinearGradient(14, y + 60, w - 14, y + 100);
    g.addColorStop(0, p.color);
    g.addColorStop(1, "rgba(99,102,241,0.6)");
    ctx.fillStyle = g;
    ctx.fillRect(14, y + 60, w - 28, 36);

    // engagement
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText("♥ 1.2k    ↻ 84    💬 21", 14, y + 100);
  }

  // tab bar
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(0, h - 40, w, 40);
  ["Feed", "Search", "Post", "Notif", "Me"].forEach((label, i) => {
    ctx.fillStyle = i === 0 ? "#ffffff" : "rgba(255,255,255,0.4)";
    ctx.font = "9px system-ui";
    ctx.fillText(label, 12 + i * 50, h - 20);
  });

  return canvas;
}

export function PhoneMockup({
  position,
  glow = "#ec4899",
}: {
  position: [number, number, number];
  glow?: string;
}) {
  const groupRef = useRef<THREE.Group | null>(null);

  const canvas = useMemo(() => drawPhoneTexture(0), []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  const lastRedraw = useRef(0);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (t - lastRedraw.current > 0.08) {
      const fresh = drawPhoneTexture(t);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(fresh, 0, 0);
      texture.needsUpdate = true;
      lastRedraw.current = t;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.35;
      groupRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.05;
    }
  });

  // phone dimensions
  const pw = 0.7;
  const ph = 1.4;
  const pd = 0.06;

  return (
    <group ref={groupRef} position={position}>
      {/* body */}
      <RoundedBox args={[pw, ph, pd]} radius={0.06} smoothness={4}>
        <meshStandardMaterial color="#0d0f15" roughness={0.4} metalness={0.6} />
      </RoundedBox>
      {/* screen */}
      <mesh position={[0, 0, pd / 2 + 0.001]}>
        <planeGeometry args={[pw - 0.06, ph - 0.08]} />
        <meshStandardMaterial
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color(glow)}
          emissiveIntensity={1.4}
          toneMapped={false}
          roughness={0.3}
        />
      </mesh>
      {/* notch */}
      <mesh position={[0, ph / 2 - 0.06, pd / 2 + 0.002]}>
        <planeGeometry args={[0.22, 0.04]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* halo */}
      <pointLight position={[0, 0, 0.4]} color={glow} intensity={1.2} distance={4} decay={2} />
    </group>
  );
}
