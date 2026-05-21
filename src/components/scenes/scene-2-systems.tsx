"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { SimpleIconStrip, LucideStrip } from "@/components/scenes/detail-strip";
import { CorridorFallback } from "@/components/scenes/fallbacks/corridor-fallback";
import { useSceneScroll } from "@/components/scenes/scene-scroll-context";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";
import { SCENE_2_PLATFORMS, SCENE_2_VERTICALS } from "@/lib/scene-content";

const CorridorScene = dynamic(
  () => import("@/components/scenes/three/corridor-scene").then((m) => m.CorridorScene),
  { ssr: false }
);

const BULLETS = [
  "Custom internal tools, dashboards, admin panels",
  "API integrations between the tools you already use",
  "Workflow automation — webhooks, scheduled jobs, CRM sync",
];

export function Scene2Systems() {
  const reduced = usePrefersReducedMotion();
  const contentRef = useSceneScroll();

  useEffect(() => {
    let cancelled = false;
    function tryStart() {
      if (cancelled) return false;
      if (!isUnlocked()) return false;
      playSound("server-hum", { fadeIn: 800, volume: 0.28 });
      return true;
    }
    if (!tryStart()) {
      const interval = window.setInterval(() => {
        if (tryStart()) window.clearInterval(interval);
      }, 600);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
        stopSound("server-hum", 400);
      };
    }
    return () => {
      cancelled = true;
      stopSound("server-hum", 400);
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#020a13] text-brand-text-dark md:h-full">
      <div className="pointer-events-none relative z-0 h-[45vh] w-full md:absolute md:inset-0 md:h-full">
        {reduced ? (
          <CorridorFallback className="h-full w-full" />
        ) : (
          <CorridorScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.04)_0%,rgba(3,16,24,0.65)_60%,rgba(3,16,24,0.95)_100%)] md:absolute md:inset-0 md:z-[1] md:block"
      />

      <div className="relative z-20 flex flex-col md:h-full md:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center px-6 py-10 md:w-[42%] md:max-w-[520px] md:px-12 md:py-0">
          <SceneCopyPanel
            index={2}
            title="Systems, APIs, Automations, Integrations"
            sub="The plumbing professional companies actually need."
            bullets={BULLETS}
            topic="systems"
            accent="bg-cyan-400"
          />
        </div>

        <div
          ref={contentRef}
          data-scene-no-nav
          className="w-full px-6 pb-32 pt-2 md:flex-1 md:overflow-y-auto md:border-l md:border-white/5 md:px-10 md:pb-16 md:pt-16"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="space-y-8">
            <SimpleIconStrip {...SCENE_2_PLATFORMS} rowDelay={0} />
            <LucideStrip {...SCENE_2_VERTICALS} rowDelay={0.15} />
          </div>
        </div>
      </div>
    </section>
  );
}
