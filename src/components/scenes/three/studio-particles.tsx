"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Sparse drifting RGB dust — gives the design studio "smoke in the air" feel. */
export function StudioParticles({ count = 120, color = "#a855f7" }: { count?: number; color?: string }) {
  const pointsRef = useRef<THREE.Points | null>(null);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      speeds[i] = 0.2 + Math.random() * 0.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("speed", new THREE.BufferAttribute(speeds, 1));
    const m = new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry: g, material: m };
  }, [count, color]);

  useFrame((_, delta) => {
    const g = geometry;
    const pos = g.attributes.position as THREE.BufferAttribute;
    const speed = g.attributes.speed as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i);
      y += speed.getX(i) * delta * 0.3;
      if (y > 4) y = -4;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  );
}
