"use client";

// Full lighting rig for Scene 0.
// Per-monitor screen-cast point lights live inside <CrtMonitor>.

export function SceneLighting() {
  return (
    <>
      {/* Sky/ground ambient — gives the room a base indigo wash */}
      <hemisphereLight color="#4f46e5" groundColor="#0f172a" intensity={0.3} />

      {/* Key light — slightly warm white from above-front-left */}
      <directionalLight
        position={[-4, 5, 3]}
        intensity={0.4}
        color="#fff5e6"
      />

      {/* Rim light — cool, from behind, picks out silhouette edges */}
      <directionalLight
        position={[0, 2.5, -6]}
        intensity={0.6}
        color="#b8d4ff"
      />

      {/* Desk spotlight — warm overhead lamp painting the workspace.
       *  Default target sits at origin, so this cone shoots from above-front
       *  down through the monitors onto the desk. */}
      <spotLight
        position={[0, 8, 2]}
        color="#fff0d0"
        intensity={0.8}
        angle={Math.PI / 4}
        penumbra={0.5}
        decay={1}
        distance={20}
      />
    </>
  );
}
