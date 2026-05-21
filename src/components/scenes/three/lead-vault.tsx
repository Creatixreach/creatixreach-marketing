"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const VAULT_POS = new THREE.Vector3(0, -0.2, 1.4);

type Crystal = {
  origin: THREE.Vector3;
  ctrl: THREE.Vector3;
  curve: THREE.QuadraticBezierCurve3;
  speed: number;
  age: number;
  mesh: THREE.Mesh | null;
};

function makeCrystal(): Crystal {
  // start somewhere far up and out, end at the vault
  const origin = new THREE.Vector3(
    (Math.random() - 0.5) * 14,
    1.5 + Math.random() * 2.5,
    -2 - Math.random() * 4
  );
  const ctrl = new THREE.Vector3(
    (origin.x + VAULT_POS.x) * 0.5 + (Math.random() - 0.5) * 1.2,
    Math.max(origin.y, VAULT_POS.y) + 0.8,
    (origin.z + VAULT_POS.z) * 0.5
  );
  const curve = new THREE.QuadraticBezierCurve3(origin, ctrl, VAULT_POS.clone());
  return {
    origin,
    ctrl,
    curve,
    speed: 0.18 + Math.random() * 0.25,
    age: Math.random() * 1.5,
    mesh: null,
  };
}

/** The vault that lead crystals fly into, and the crystals themselves. */
export function LeadVault() {
  const crystalsRef = useRef<Crystal[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);

  // Pre-allocate crystals.
  useMemo(() => {
    crystalsRef.current = Array.from({ length: 14 }, () => makeCrystal());
  }, []);

  // shared crystal geometry, per-crystal material (so opacity can fade out
  // independently when each one reaches the vault).
  const crystalGeom = useMemo(() => new THREE.OctahedronGeometry(0.07, 0), []);
  const crystalMats = useMemo(
    () =>
      crystalsRef.current.map(
        () =>
          new THREE.MeshStandardMaterial({
            color: "#fcd34d",
            emissive: new THREE.Color("#fbbf24"),
            emissiveIntensity: 2.8,
            toneMapped: false,
            transparent: true,
            opacity: 1,
            roughness: 0.3,
            metalness: 0.4,
          })
      ),
    []
  );

  useEffect(() => {
    return () => {
      crystalGeom.dispose();
      for (const m of crystalMats) m.dispose();
    };
  }, [crystalGeom, crystalMats]);

  useFrame((_, delta) => {
    crystalsRef.current.forEach((c, i) => {
      c.age += delta * c.speed;
      if (c.age >= 1) {
        // respawn
        const fresh = makeCrystal();
        c.origin = fresh.origin;
        c.ctrl = fresh.ctrl;
        c.curve = fresh.curve;
        c.speed = fresh.speed;
        c.age = 0;
      }
      if (c.mesh) {
        const p = c.curve.getPoint(c.age);
        c.mesh.position.copy(p);
        c.mesh.rotation.x += delta * 2;
        c.mesh.rotation.y += delta * 1.5;
        // fade out near vault arrival
        const opacity = c.age < 0.9 ? 1 : 1 - (c.age - 0.9) / 0.1;
        crystalMats[i].opacity = opacity;
      }
    });
    if (groupRef.current) {
      const t = performance.now() * 0.001;
      groupRef.current.children[0].rotation.y = Math.sin(t * 0.5) * 0.06;
    }
  });

  return (
    <group>
      {/* Vault body */}
      <group ref={groupRef}>
        <group position={VAULT_POS.toArray()}>
          {/* outer casing */}
          <RoundedBox args={[1.4, 1.0, 0.7]} radius={0.06} smoothness={4}>
            <meshStandardMaterial color="#1a1330" roughness={0.6} metalness={0.4} />
          </RoundedBox>
          {/* open face — emissive gold */}
          <mesh position={[0, 0, 0.36]}>
            <planeGeometry args={[1.1, 0.7]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive={new THREE.Color("#fbbf24")}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
          {/* door rim */}
          <mesh position={[0, 0, 0.355]}>
            <planeGeometry args={[1.18, 0.78]} />
            <meshBasicMaterial color="#a16207" />
          </mesh>
          {/* label strip */}
          <mesh position={[0, -0.62, 0.36]}>
            <planeGeometry args={[1.0, 0.16]} />
            <meshStandardMaterial color="#0a0816" />
          </mesh>
          {/* vault floodlight */}
          <pointLight color="#fbbf24" intensity={2.0} distance={4.5} decay={2} position={[0, 0, 0.5]} />
        </group>
      </group>

      {/* Crystals — refs assigned per-render so the useFrame loop can drive them */}
      {crystalsRef.current.map((c, i) => (
        <mesh
          key={i}
          geometry={crystalGeom}
          material={crystalMats[i]}
          ref={(el: THREE.Mesh | null) => {
            c.mesh = el;
          }}
        />
      ))}
    </group>
  );
}
