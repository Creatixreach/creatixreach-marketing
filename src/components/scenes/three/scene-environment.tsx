"use client";

import { Environment } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { Vector2 } from "three";

type SceneEnvironmentProps = {
  /** When false, no post-processing or HDR environment is added. Used on
   *  low-tier devices and when prefers-reduced-motion is on. */
  enabled?: boolean;
};

export function SceneEnvironment({ enabled = true }: SceneEnvironmentProps) {
  if (!enabled) return null;

  return (
    <>
      {/* HDR sky for subtle reflections on plastic/metal monitor parts. */}
      <Environment preset="city" />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <ChromaticAberration
          offset={new Vector2(0.0008, 0.0008)}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette eskil={false} offset={0.3} darkness={0.6} />
        <Noise opacity={0.04} premultiply />
      </EffectComposer>
    </>
  );
}
