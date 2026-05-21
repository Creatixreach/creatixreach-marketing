"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Building = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  windowsTex: THREE.CanvasTexture;
};

function makeWindowsTexture(w: number, h: number): THREE.CanvasTexture {
  const tw = 128;
  const th = 256;
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#040714";
  ctx.fillRect(0, 0, tw, th);

  // window grid — lit randomly
  const cols = 6;
  const rows = 18;
  const cw = tw / cols;
  const ch = th / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const lit = Math.random() < 0.35;
      ctx.fillStyle = lit ? `rgba(${230 + Math.random() * 25}, ${180 + Math.random() * 50}, ${100 + Math.random() * 80}, 0.9)` : "rgba(255,255,255,0.04)";
      const x = c * cw + cw * 0.25;
      const y = r * ch + ch * 0.25;
      ctx.fillRect(x, y, cw * 0.5, ch * 0.5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  // suppress unused vars
  void w;
  void h;
  return tex;
}

export function CitySkyline() {
  // Deterministic-ish seed via hashed indices so each build looks consistent
  const buildings = useMemo<Building[]>(() => {
    const arr: Building[] = [];
    const COUNT = 38;
    for (let i = 0; i < COUNT; i++) {
      // distribute along a wide horizontal band, behind the camera focal plane
      const x = (i / COUNT) * 28 - 14 + (Math.sin(i * 7.13) * 1.4);
      const z = -8 - Math.abs(Math.sin(i * 3.2)) * 4 - Math.random() * 2;
      const w = 0.8 + Math.random() * 1.4;
      const d = 0.8 + Math.random() * 1.4;
      const h = 1.5 + Math.random() * 4.5;
      arr.push({ x, z, w, d, h, windowsTex: makeWindowsTexture(w, h) });
    }
    return arr;
  }, []);

  useEffect(() => {
    return () => {
      for (const b of buildings) b.windowsTex.dispose();
    };
  }, [buildings]);

  return (
    <group>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, -0.7 + b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial
            map={b.windowsTex}
            emissiveMap={b.windowsTex}
            emissive={new THREE.Color("#fef3c7")}
            emissiveIntensity={1.2}
            color="#080a18"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Phone signal arcs between random building tops. */
export function SignalArcs({ count = 5 }: { count?: number }) {
  const linesRef = useRef<THREE.Line[]>([]);

  const lines = useMemo(() => {
    const arr: THREE.Line[] = [];
    for (let i = 0; i < count; i++) {
      const a = new THREE.Vector3(
        Math.random() * 24 - 12,
        Math.random() * 3 + 1.5,
        -8 - Math.random() * 3
      );
      const b = new THREE.Vector3(
        Math.random() * 24 - 12,
        Math.random() * 3 + 1.5,
        -8 - Math.random() * 3
      );
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.y += 1.8 + Math.random() * 0.8;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const pts = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color("#fcd34d"),
        transparent: true,
        opacity: 0,
        toneMapped: false,
      });
      const line = new THREE.Line(geom, mat);
      arr.push(line);
    }
    return arr;
  }, [count]);

  useEffect(() => {
    return () => {
      for (const l of lines) {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }
    };
  }, [lines]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    lines.forEach((l, i) => {
      const phase = (t + i * 1.3) * 0.5;
      const cycle = (phase % 3) / 3; // 0..1 every 3s, then repeats
      let alpha = 0;
      if (cycle < 0.25) alpha = cycle / 0.25;
      else if (cycle < 0.6) alpha = 1;
      else alpha = 1 - (cycle - 0.6) / 0.4;
      (l.material as THREE.LineBasicMaterial).opacity = alpha * 0.85;
    });
  });

  return (
    <group>
      {lines.map((l, i) => {
        linesRef.current[i] = l;
        return <primitive key={i} object={l} />;
      })}
    </group>
  );
}
