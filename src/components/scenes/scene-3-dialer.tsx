"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { PortalFeatureGrid } from "@/components/scenes/portal-feature-grid";
import { CallFloorFallback } from "@/components/scenes/fallbacks/call-floor-fallback";
import { useSceneScroll } from "@/components/scenes/scene-scroll-context";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";

const CallFloorScene = dynamic(
  () => import("@/components/scenes/three/call-floor-scene").then((m) => m.CallFloorScene),
  { ssr: false }
);

const BULLETS = [
  "Predictive dialer-as-a-service (hosted, isolated per customer)",
  "SIP carrier + DIDs + agent training included",
  "Live VICIdial-based dialer, billed per minute",
];

export function Scene3Dialer() {
  const reduced = usePrefersReducedMotion();
  const contentRef = useSceneScroll();

  useEffect(() => {
    let cancelled = false;
    function tryStart() {
      if (cancelled) return false;
      if (!isUnlocked()) return false;
      playSound("call-center-ambience", { fadeIn: 800, volume: 0.28 });
      return true;
    }
    if (!tryStart()) {
      const interval = window.setInterval(() => {
        if (tryStart()) window.clearInterval(interval);
      }, 600);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
        stopSound("call-center-ambience", 400);
      };
    }
    return () => {
      cancelled = true;
      stopSound("call-center-ambience", 400);
    };
  }, []);

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#0d0820] text-brand-text-dark">
      <div className="pointer-events-none absolute inset-0 z-0">
        {reduced ? (
          <CallFloorFallback className="h-full w-full" />
        ) : (
          <CallFloorScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06)_0%,rgba(13,8,32,0.55)_55%,rgba(13,8,32,0.95)_100%)]"
      />

      <div className="relative z-20 flex h-full flex-col lg:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center px-6 pt-20 lg:w-[42%] lg:max-w-[520px] lg:px-12 lg:pt-0">
          <SceneCopyPanel
            index={3}
            flag="Our flagship product · CreatixReach Dialer"
            title="Telemarketing and Call Center Setup"
            sub="We set up the floor, you start dialing."
            bullets={BULLETS}
            topic="dialer"
            accent="bg-amber-400"
          />
        </div>

        <div
          ref={contentRef}
          data-scene-no-nav
          className="flex-1 overflow-y-auto px-6 pb-32 pt-6 lg:border-l lg:border-white/5 lg:px-10 lg:pb-16 lg:pt-16"
          style={{ overscrollBehavior: "contain" }}
        >
          <PortalFeatureGrid />
        </div>
      </div>
    </section>
  );
}
