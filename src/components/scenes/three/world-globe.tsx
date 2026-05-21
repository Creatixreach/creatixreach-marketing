"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RADIUS = 1.6;
const ARC_COUNT = 7;
const POINT_COUNT = 30;

type Arc = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  curve: THREE.QuadraticBezierCurve3;
  phase: number;
  color: string;
};

function randomPointOnSphere(r: number): THREE.Vector3 {
  // bias towards mid-latitudes so points don't pile on poles
  const lat = (Math.random() - 0.5) * Math.PI * 0.85;
  const lon = Math.random() * Math.PI * 2;
  return new THREE.Vector3(
    Math.cos(lat) * Math.cos(lon) * r,
    Math.sin(lat) * r,
    Math.cos(lat) * Math.sin(lon) * r
  );
}

function makeArc(): Arc {
  const a = randomPointOnSphere(RADIUS);
  const b = randomPointOnSphere(RADIUS);
  // mid lifted outward from the sphere surface
  const mid = new THREE.Vector3()
    .addVectors(a, b)
    .multiplyScalar(0.5)
    .normalize()
    .multiplyScalar(RADIUS * 1.55);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const palette = ["#fbbf24", "#22d3ee", "#a855f7", "#34d399", "#7c83ff"];
  return {
    from: a,
    to: b,
    curve,
    phase: Math.random() * 4,
    color: palette[Math.floor(Math.random() * palette.length)],
  };
}

export function WorldGlobe({
  position = [0, 0.4, -0.8] as [number, number, number],
}: {
  position?: [number, number, number];
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const arcsRef = useRef<Arc[]>([]);
  const ageRef = useRef<number[]>([]);

  const cityPositions = useMemo(() => {
    return Array.from({ length: POINT_COUNT }, () => randomPointOnSphere(RADIUS));
  }, []);

  // Initial arcs.
  useMemo(() => {
    arcsRef.current = Array.from({ length: ARC_COUNT }, () => makeArc());
    ageRef.current = arcsRef.current.map(() => Math.random() * 4);
    return null;
  }, []);

  // Build the line meshes once; we'll rewrite their geometries when arcs replace.
  const arcLines = useMemo(() => {
    return arcsRef.current.map((arc) => {
      const pts = arc.curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(arc.color),
        transparent: true,
        opacity: 0,
        toneMapped: false,
      });
      return new THREE.Line(geom, mat);
    });
  }, []);

  useEffect(() => {
    return () => {
      for (const l of arcLines) {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }
    };
  }, [arcLines]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }

    for (let i = 0; i < arcLines.length; i++) {
      ageRef.current[i] += delta;
      const age = ageRef.current[i];
      const lifeSpan = 3.2;
      const u = Math.min(age / lifeSpan, 1);
      const mat = arcLines[i].material as THREE.LineBasicMaterial;

      // ease-in-out fade: build, hold, fade
      let alpha = 0;
      if (u < 0.3) alpha = u / 0.3;
      else if (u < 0.7) alpha = 1;
      else alpha = 1 - (u - 0.7) / 0.3;
      mat.opacity = alpha * 0.95;

      // arc reached end of life — recycle
      if (u >= 1) {
        const fresh = makeArc();
        arcsRef.current[i] = fresh;
        const pts = fresh.curve.getPoints(40);
        const geom = new THREE.BufferGeometry().setFromPoints(pts);
        arcLines[i].geometry.dispose();
        arcLines[i].geometry = geom;
        mat.color.set(fresh.color);
        ageRef.current[i] = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* wireframe sphere — inverted backface gives a hollow feel */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 2]} />
        <meshBasicMaterial
          color="#7c83ff"
          wireframe
          transparent
          opacity={0.32}
          toneMapped={false}
        />
      </mesh>
      {/* faint inner glow */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.99, 32, 32]} />
        <meshBasicMaterial color="#1e1b4b" transparent opacity={0.5} />
      </mesh>

      {/* city points */}
      {cityPositions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive={new THREE.Color("#fbbf24")}
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* live arcs */}
      {arcLines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}
    </group>
  );
}
