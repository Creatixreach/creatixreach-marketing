"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { SimpleIconStrip, LucideStrip } from "@/components/scenes/detail-strip";
import { StudioFallback } from "@/components/scenes/fallbacks/studio-fallback";
import { useSceneScroll } from "@/components/scenes/scene-scroll-context";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";
import { SCENE_1_STACKS, SCENE_1_SITES } from "@/lib/scene-content";

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
  const contentRef = useSceneScroll();

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
    <section className="relative w-full overflow-hidden bg-[#0a0814] text-brand-text-dark md:h-full">
      {/* 3D backdrop — fixed full-viewport on mobile, absolute fill on desktop */}
      <div className="pointer-events-none fixed inset-0 z-0 md:absolute md:inset-0">
        {reduced ? (
          <StudioFallback className="h-full w-full" />
        ) : (
          <StudioScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06)_0%,rgba(10,8,20,0.5)_50%,rgba(10,8,20,0.95)_100%)] md:absolute md:inset-0 md:z-[1] md:block"
      />

      {/* Split layout: stacked on mobile, copy left / content right on desktop */}
      <div className="relative z-20 flex flex-col md:h-full md:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center px-6 py-10 md:w-[42%] md:max-w-[520px] md:px-12 md:py-0">
          <SceneCopyPanel
            index={1}
            title="Web Creation and Social Media"
            sub="Sites that ship, content that compounds."
            bullets={BULLETS}
            topic="web-social"
            accent="bg-pink-400"
          />
        </div>

        <div
          ref={contentRef}
          data-scene-no-nav
          className="w-full px-6 pb-32 pt-2 md:flex-1 md:overflow-y-auto md:border-l md:border-white/5 md:px-10 md:pb-16 md:pt-16"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="space-y-8">
            <SimpleIconStrip {...SCENE_1_STACKS} rowDelay={0} />
            <LucideStrip {...SCENE_1_SITES} rowDelay={0.15} />
          </div>
        </div>
      </div>
    </section>
  );
}
