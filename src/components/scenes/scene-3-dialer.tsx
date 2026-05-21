"use client";

import dynamic from "next/dynamic";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { PortalFeatureGrid } from "@/components/scenes/portal-feature-grid";
import { CallFloorFallback } from "@/components/scenes/fallbacks/call-floor-fallback";
import { useSceneScroll } from "@/components/scenes/scene-scroll-context";
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

  return (
    <section className="relative w-full overflow-hidden bg-[#0d0820] text-brand-text-dark md:h-full">
      <div className="pointer-events-none fixed inset-0 z-0 md:absolute md:inset-0">
        {reduced ? (
          <CallFloorFallback className="h-full w-full" />
        ) : (
          <CallFloorScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.06)_0%,rgba(13,8,32,0.55)_55%,rgba(13,8,32,0.95)_100%)] md:absolute md:inset-0 md:z-[1] md:block"
      />

      <div className="relative z-20 flex flex-col md:h-full md:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center px-6 pb-10 pt-24 md:w-[42%] md:max-w-[520px] md:px-12 md:py-0">
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
          className="w-full px-6 pb-32 pt-2 md:flex-1 md:overflow-y-auto md:border-l md:border-white/5 md:px-10 md:pb-16 md:pt-16"
          style={{ overscrollBehavior: "contain" }}
        >
          <PortalFeatureGrid />
        </div>
      </div>
    </section>
  );
}
