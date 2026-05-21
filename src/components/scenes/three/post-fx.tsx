"use client";

import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { Vector2 } from "three";

export type PostFxProps = {
  enabled?: boolean;
  bloomIntensity?: number;
  bloomThreshold?: number;
  bloomSmoothing?: number;
  chromaticOffset?: number;
  vignetteOffset?: number;
  vignetteDarkness?: number;
  noiseOpacity?: number;
};

/** Shared cinematic post-processing chain used across Scenes 0-4.
 *  Defaults match the Phase 2.6 Scene 0 tune. Pass overrides per scene to
 *  shift the mood (e.g. softer bloom on the data corridor, stronger vignette
 *  on the city skyline). */
export function PostFx({
  enabled = true,
  bloomIntensity = 1.4,
  bloomThreshold = 0.2,
  bloomSmoothing = 0.85,
  chromaticOffset = 0.0008,
  vignetteOffset = 0.25,
  vignetteDarkness = 0.95,
  noiseOpacity = 0.04,
}: PostFxProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        mipmapBlur
      />
      <ChromaticAberration
        offset={new Vector2(chromaticOffset, chromaticOffset)}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={vignetteOffset} darkness={vignetteDarkness} />
      <Noise opacity={noiseOpacity} premultiply />
    </EffectComposer>
  );
}
