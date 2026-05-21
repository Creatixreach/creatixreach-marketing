"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { RadialPortalShowcase } from "@/components/scenes/radial-portal-showcase";
import { CallFloorFallback } from "@/components/scenes/fallbacks/call-floor-fallback";
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

      <div
        data-scene-no-nav
        className="relative z-20 h-full w-full overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-12 px-6 pb-40 pt-24 sm:px-10 sm:pt-24">
          {/* Copy panel — left-aligned on desktop, centered on mobile.
           *  Note: the "Go to the dialer portal" link is intentionally kept in
           *  the panel as redundant emphasis — the showcase below carries the
           *  same call to action, but a CTA in the headline area never hurts. */}
          <div className="flex justify-center sm:justify-start sm:pl-2 lg:pl-8">
            <SceneCopyPanel
              index={3}
              flag="Our flagship product · CreatixReach Dialer"
              title="Telemarketing and Call Center Setup"
              sub="We set up the floor, you start dialing."
              bullets={BULLETS}
              topic="dialer"
              accent="bg-amber-400"
              extraLink={{
                label: "Already a customer? Go to the dialer portal",
                href: "https://app.creatixreach.io",
                external: true,
              }}
            />
          </div>

          {/* Portal feature showcase */}
          <RadialPortalShowcase />
        </div>
      </div>
    </section>
  );
}
