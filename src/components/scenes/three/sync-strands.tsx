"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Strand = {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
};

/** Thin curved light strands between two anchors. Used to suggest cross-platform
 *  sync between browser windows and the phone. */
export function SyncStrands({ strands }: { strands: Strand[] }) {
  const lineRefs = useRef<(THREE.LineSegments | null)[]>([]);

  const built = useMemo(() => {
    return strands.map((s) => {
      const mid = new THREE.Vector3()
        .addVectors(s.start, s.end)
        .multiplyScalar(0.5);
      mid.y += 0.6;
      const curve = new THREE.QuadraticBezierCurve3(s.start, mid, s.end);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(s.color),
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      });
      return { geom, mat };
    });
  }, [strands]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    built.forEach((b, i) => {
      // breath the opacity per strand at different phases
      const breath = 0.4 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 0.7));
      b.mat.opacity = breath;
    });
  });

  return (
    <group>
      {built.map((b, i) => (
        <primitive
          key={i}
          ref={(el: THREE.LineSegments | null) => {
            lineRefs.current[i] = el;
          }}
          object={new THREE.Line(b.geom, b.mat)}
        />
      ))}
    </group>
  );
}
