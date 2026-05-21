"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SceneCopyPanel } from "@/components/scenes/scene-copy-panel";
import { SkylineFallback } from "@/components/scenes/fallbacks/skyline-fallback";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
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

const LEAD_CAP = 4327;

function useLeadCounter() {
  const [count, setCount] = useState(2841);

  useEffect(() => {
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      setCount((prev) => {
        if (prev >= LEAD_CAP) return prev;
        // jittered increment so it feels live
        const step = Math.random() < 0.3 ? 0 : 1 + Math.floor(Math.random() * 3);
        return Math.min(prev + step, LEAD_CAP);
      });
    }
    const id = window.setInterval(tick, 200);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return count;
}

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
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {SCENE_4_STATS.map((s, i) => (
        <motion.div
          key={s.caption}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 + i * 0.08, ease: "easeOut" }}
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm"
        >
          <div className="text-3xl font-bold leading-none tracking-tight text-white sm:text-4xl">
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
  const leadCount = useLeadCounter();

  useEffect(() => {
    let cancelled = false;
    function tryStart() {
      if (cancelled) return false;
      if (!isUnlocked()) return false;
      playSound("city-night", { fadeIn: 800, volume: 0.28 });
      return true;
    }
    if (!tryStart()) {
      const interval = window.setInterval(() => {
        if (tryStart()) window.clearInterval(interval);
      }, 600);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
        stopSound("city-night", 400);
      };
    }
    return () => {
      cancelled = true;
      stopSound("city-night", 400);
    };
  }, []);

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#050813] text-brand-text-dark">
      <div className="pointer-events-none absolute inset-0 z-0">
        {reduced ? (
          <SkylineFallback className="h-full w-full" />
        ) : (
          <SkylineScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.07)_0%,rgba(5,8,19,0.55)_55%,rgba(5,8,19,0.95)_100%)]"
      />

      {/* Live leads counter — top-right of the scene area */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        className="pointer-events-auto absolute right-4 top-20 z-30 hidden rounded-xl border border-amber-400/30 bg-black/30 px-4 py-3 text-right shadow-[0_0_30px_rgba(251,191,36,0.2)] backdrop-blur-sm sm:right-8 sm:top-24 sm:block"
      >
        <div className="text-[10px] font-medium uppercase tracking-[0.25em] text-amber-300/80">
          Leads captured · today
        </div>
        <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-amber-300">
          {leadCount.toLocaleString()}
        </div>
        <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] text-amber-200/70">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-300" />
          </span>
          live · last 24h
        </div>
      </motion.div>

      <div
        data-scene-no-nav
        className="relative z-20 h-full w-full overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col gap-10 px-6 pb-40 pt-24 sm:px-10 sm:pt-24">
          <div className="flex justify-center sm:justify-start sm:pl-2 lg:pl-8">
            <SceneCopyPanel
              index={4}
              title="Cold Calling and Lead Generation"
              sub="We don't just hand you a dialer. We run the campaigns."
              bullets={BULLETS}
              topic="cold-calling"
              accent="bg-amber-400"
            />
          </div>

          <PricingAnchor />
          <AchievementStats />
        </div>
      </div>
    </section>
  );
}
