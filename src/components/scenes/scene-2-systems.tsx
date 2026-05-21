"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { SimpleIconStrip, LucideStrip } from "@/components/scenes/detail-strip";
import { CorridorFallback } from "@/components/scenes/fallbacks/corridor-fallback";
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
    <section className="relative h-full w-full overflow-hidden bg-[#020a13] text-brand-text-dark">
      <div className="pointer-events-none absolute inset-0 z-0">
        {reduced ? (
          <CorridorFallback className="h-full w-full" />
        ) : (
          <CorridorScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.04)_0%,rgba(3,16,24,0.65)_60%,rgba(3,16,24,0.95)_100%)]"
      />

      <div
        data-scene-no-nav
        className="relative z-20 h-full w-full overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-12 px-6 pb-40 pt-24 sm:px-10 sm:pt-24">
          {/* Copy panel — right-aligned on desktop, centered on mobile */}
          <div className="flex justify-center sm:justify-end sm:pr-2 lg:pr-8">
            <SceneCopyPanel
              index={2}
              title="Systems, APIs, Automations, Integrations"
              sub="The plumbing professional companies actually need."
              bullets={BULLETS}
              topic="systems"
              accent="bg-cyan-400"
            />
          </div>

          <div className="space-y-8">
            <SimpleIconStrip {...SCENE_2_PLATFORMS} rowDelay={0} />
            <LucideStrip {...SCENE_2_VERTICALS} rowDelay={0.15} />
          </div>
        </div>
      </div>
    </section>
  );
}
