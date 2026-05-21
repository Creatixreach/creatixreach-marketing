"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { SkylineFallback } from "@/components/scenes/fallbacks/skyline-fallback";
import { useSceneScroll } from "@/components/scenes/scene-scroll-context";
import { usePrefersReducedMotion } from "@/lib/device-tier";
import { SCENE_4_PRICING, SCENE_4_STATS } from "@/lib/scene-content";

const SkylineScene = dynamic(
  () => import("@/components/scenes/three/skyline-scene").then((m) => m.SkylineScene),
  { ssr: false }
);

const BULLETS = [
  "Targeted cold-calling campaigns we manage end-to-end",
  "Lead lists, scripts, agent management",
  "Pay for results, not effort",
];

function PricingAnchor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent p-6 sm:p-8"
    >
      {/* thin indigo top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-indigo to-transparent" />
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-baseline sm:gap-6">
        <div className="text-5xl font-extrabold leading-none tracking-tight text-white sm:text-6xl">
          {SCENE_4_PRICING.amount}
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-base font-medium text-white sm:text-lg">
            {SCENE_4_PRICING.unit}
          </div>
          <p className="max-w-md text-sm leading-relaxed text-brand-muted-dark">
            {SCENE_4_PRICING.detail}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
      className="grid grid-cols-2 gap-4"
    >
      {SCENE_4_STATS.map((s, i) => (
        <motion.div
          key={s.caption}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 + i * 0.08, ease: "easeOut" }}
          className="rounded-2xl border border-white/10 border-l-2 border-l-brand-indigo/50 bg-white/[0.03] p-5 backdrop-blur-sm"
        >
          <div className="text-3xl font-bold leading-none tracking-tight text-brand-text-dark sm:text-4xl">
            {s.display}
          </div>
          <div className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-brand-muted-dark">
            {s.caption}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function Scene4ColdCalling() {
  const reduced = usePrefersReducedMotion();
  const contentRef = useSceneScroll();

  return (
    <section className="relative w-full overflow-hidden bg-[#050813] text-brand-text-dark md:h-full">
      <div className="pointer-events-none fixed inset-0 z-0 md:absolute md:inset-0">
        {reduced ? (
          <SkylineFallback className="h-full w-full" />
        ) : (
          <SkylineScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.07)_0%,rgba(5,8,19,0.55)_55%,rgba(5,8,19,0.95)_100%)] md:absolute md:inset-0 md:z-[1] md:block"
      />

      <div className="relative z-20 flex flex-col md:h-full md:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center px-6 pb-10 pt-24 md:w-[42%] md:max-w-[520px] md:px-12 md:py-0">
          <SceneCopyPanel
            index={4}
            title="Cold Calling and Lead Generation"
            sub="We don't just hand you a dialer. We run the campaigns."
            bullets={BULLETS}
            topic="cold-calling"
            accent="bg-amber-400"
          />
        </div>

        <div
          ref={contentRef}
          data-scene-no-nav
          className="w-full px-6 pb-32 pt-2 md:flex-1 md:overflow-y-auto md:border-l md:border-white/5 md:px-10 md:pb-16 md:pt-16"
          style={{ overscrollBehavior: "contain" }}
        >
          <div className="space-y-6">
            <PricingAnchor />
            <AchievementStats />
          </div>
        </div>
      </div>
    </section>
  );
}
