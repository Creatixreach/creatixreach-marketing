"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { CorridorFallback } from "@/components/scenes/fallbacks/corridor-fallback";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";

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

      <div className="relative z-20 flex h-full items-end justify-center px-6 pb-32 sm:items-center sm:justify-end sm:pb-0 sm:pr-16 lg:pr-24">
        <SceneCopyPanel
          index={2}
          title="Systems, APIs, Automations, Integrations"
          sub="The plumbing professional companies actually need."
          bullets={BULLETS}
          topic="systems"
          accent="bg-cyan-400"
        />
      </div>
    </section>
  );
}
