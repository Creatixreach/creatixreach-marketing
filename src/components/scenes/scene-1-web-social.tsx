"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { StudioFallback } from "@/components/scenes/fallbacks/studio-fallback";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";

const StudioScene = dynamic(
  () => import("@/components/scenes/three/studio-scene").then((m) => m.StudioScene),
  { ssr: false }
);

const BULLETS = [
  "Custom Next.js, WordPress, Shopify builds",
  "Social media management — Instagram, TikTok, Facebook, LinkedIn",
  "Content calendars, ad creatives, post scheduling",
];

export function Scene1WebSocial() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    let cancelled = false;
    function tryStart() {
      if (cancelled) return false;
      if (!isUnlocked()) return false;
      playSound("synth-pad", { fadeIn: 800, volume: 0.22 });
      return true;
    }
    if (!tryStart()) {
      const interval = window.setInterval(() => {
        if (tryStart()) window.clearInterval(interval);
      }, 600);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
        stopSound("synth-pad", 400);
      };
    }
    return () => {
      cancelled = true;
      stopSound("synth-pad", 400);
    };
  }, []);

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#0a0814] text-brand-text-dark">
      <div className="pointer-events-none absolute inset-0 z-0">
        {reduced ? (
          <StudioFallback className="h-full w-full" />
        ) : (
          <StudioScene className="h-full w-full" />
        )}
      </div>

      {/* deep gradient backdrop so the magenta/cyan glow reads */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06)_0%,rgba(10,8,20,0.5)_50%,rgba(10,8,20,0.95)_100%)]"
      />

      <div className="relative z-20 flex h-full items-end justify-center px-6 pb-32 sm:items-center sm:justify-start sm:pb-0 sm:pl-16 lg:pl-24">
        <SceneCopyPanel
          index={1}
          title="Web Creation and Social Media"
          sub="Sites that ship, content that compounds."
          bullets={BULLETS}
          topic="web-social"
          accent="bg-pink-400"
        />
      </div>
    </section>
  );
}
