"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Node = { pos: THREE.Vector3; label?: string; color: string };
type Edge = { from: number; to: number; color: string };

/** Spatial Zapier-style API graph: glowing cubes connected by bezier curves
 *  with a pulse traveling along each edge. */
export function ApiGraph() {
  const groupRef = useRef<THREE.Group | null>(null);
  const pulseRefs = useRef<THREE.Mesh[]>([]);

  const { nodes, edges, edgeCurves } = useMemo(() => {
    const nodes: Node[] = [
      { pos: new THREE.Vector3(-4.4, 0.6, -0.2), color: "#22d3ee" },
      { pos: new THREE.Vector3(-3.0, -0.4, 0.8), color: "#34d399" },
      { pos: new THREE.Vector3(-3.5, 1.6, 0.6), color: "#a5f3fc" },
      { pos: new THREE.Vector3(4.4, 0.5, -0.2), color: "#a855f7" },
      { pos: new THREE.Vector3(3.0, -0.4, 0.8), color: "#22d3ee" },
      { pos: new THREE.Vector3(3.5, 1.6, 0.6), color: "#fbbf24" },
    ];
    const edges: Edge[] = [
      { from: 0, to: 3, color: "#22d3ee" },
      { from: 1, to: 4, color: "#34d399" },
      { from: 2, to: 5, color: "#a5f3fc" },
      { from: 0, to: 5, color: "#a855f7" },
      { from: 1, to: 3, color: "#22d3ee" },
    ];
    const edgeCurves = edges.map((e) => {
      const a = nodes[e.from].pos;
      const b = nodes[e.to].pos;
      const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
      mid.y += 0.5;
      mid.z -= 1.2;
      return new THREE.QuadraticBezierCurve3(a, mid, b);
    });
    return { nodes, edges, edgeCurves };
  }, []);

  // Static line meshes (one geometry per edge).
  const lines = useMemo(() => {
    return edgeCurves.map((curve, i) => {
      const pts = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({
        color: new THREE.Color(edges[i].color),
        transparent: true,
        opacity: 0.35,
        toneMapped: false,
      });
      return new THREE.Line(geom, mat);
    });
  }, [edgeCurves, edges]);

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
    // Each pulse mesh travels its assigned edge at a different phase.
    pulseRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const curve = edgeCurves[i % edgeCurves.length];
      const u = ((t * 0.35 + i * 0.2) % 1 + 1) % 1;
      const p = curve.getPoint(u);
      mesh.position.copy(p);
      const scale = 0.06 + 0.04 * Math.sin(t * 8 + i);
      mesh.scale.setScalar(scale);
    });
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.08) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* nodes */}
      {nodes.map((n, i) => (
        <group key={i} position={n.pos}>
          <mesh>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial
              color={n.color}
              emissive={new THREE.Color(n.color)}
              emissiveIntensity={1.8}
              toneMapped={false}
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          <pointLight color={n.color} intensity={0.6} distance={2.2} decay={2} />
        </group>
      ))}

      {/* edges */}
      {lines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      {/* pulses along edges */}
      {edges.map((e, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el: THREE.Mesh | null) => {
            if (el) pulseRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color={e.color}
            emissive={new THREE.Color(e.color)}
            emissiveIntensity={3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
