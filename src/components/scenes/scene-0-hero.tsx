"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { CtaButton } from "@/components/ui/cta-button";
import { WhatsappIcon } from "@/components/ui/whatsapp-icon";
import { MonitorsFallback } from "@/components/scenes/monitors-fallback";
import { SceneNavHint } from "@/components/scenes/scene-nav-hint";
import { isMuted, isUnlocked } from "@/lib/audio";
import { playKeyboardClick } from "@/lib/audio-music";
import { whatsappUrl } from "@/lib/cta-messages";
import { usePrefersReducedMotion } from "@/lib/device-tier";

const FloatingMonitors = dynamic(
  () =>
    import("@/components/scenes/floating-monitors").then((m) => m.FloatingMonitors),
  { ssr: false }
);

const BULLETS = [
  "Websites and social that do not look like everyone else's",
  "APIs, automations, integrations - the boring plumbing that scales",
  "Predictive dialers + cold-calling campaigns we actually run",
];

export function Scene0Hero() {
  const reduced = usePrefersReducedMotion();

  // Scene 0 only: fire occasional keyboard clicks via Tone.js so it feels
  // like someone is typing in the coding room. The continuous music started
  // by the audio gate keeps playing across scene transitions.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reduced) return;

    let cancelled = false;
    let timeoutId: number | null = null;

    function schedule() {
      if (cancelled) return;
      // Random 800-2000ms gap between key presses.
      const delay = 800 + Math.random() * 1200;
      timeoutId = window.setTimeout(() => {
        if (!cancelled && isUnlocked() && !isMuted()) {
          playKeyboardClick();
        }
        schedule();
      }, delay);
    }
    schedule();

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
    };
  }, [reduced]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-brand-navy text-brand-text-dark md:h-full md:min-h-0">
      {/* 3D scene: dim coding room. Fixed full-viewport on mobile so it sits
       *  behind scroll content; absolutely-positioned inside the scene on
       *  desktop where SceneStage already locks the viewport. */}
      <div className="pointer-events-none fixed inset-0 z-0 md:absolute md:inset-0">
        {reduced ? (
          <MonitorsFallback className="h-full w-full" />
        ) : (
          <FloatingMonitors className="h-full w-full" />
        )}
      </div>

      {/* Desktop-only vignette — mobile uses the SceneStage navy/30 overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none hidden bg-[radial-gradient(ellipse_at_center,rgba(11,18,36,0)_0%,rgba(11,18,36,0.55)_65%,rgba(11,18,36,0.95)_100%)] md:absolute md:inset-0 md:z-[1] md:block"
      />

      {/* Copy panel — Scene 0 has no scrollable content, so on mobile we
       *  pin it to the vertical center of the viewport while the coding-room
       *  background animates behind it. Desktop keeps the existing flex
       *  centered layout inside the scene section. */}
      <div className="fixed left-4 right-4 top-1/2 z-30 -translate-y-1/2 px-0 md:relative md:left-auto md:right-auto md:top-auto md:z-20 md:flex md:h-full md:translate-y-0 md:items-center md:justify-center md:px-6">
        <GlassPanel className="mx-auto w-full max-w-[520px] p-6 sm:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-brand-muted-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-indigo" />
            01 / 06
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            We run the whole stack.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-balance text-base text-brand-muted-dark sm:text-lg"
          >
            Digital solutions, built end-to-end. Websites. Systems. Call centers. Leads.
          </motion.p>

          <ul className="mt-6 space-y-2.5">
            {BULLETS.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.35 + i * 0.18,
                  ease: "easeOut",
                }}
                className="flex items-start gap-3 text-sm text-white/90 sm:text-base"
              >
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-indigo" />
                <span>{b}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.0, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <CtaButton
              variant="whatsapp"
              href={whatsappUrl("general")}
              external
            >
              <WhatsappIcon className="h-4 w-4" />
              WhatsApp Now
            </CtaButton>
            <CtaButton variant="primary" href="/contact">
              Send Brief
              <ArrowRight className="h-4 w-4" />
            </CtaButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.25, ease: "easeOut" }}
            className="mt-5 hidden md:block"
          >
            <SceneNavHint />
          </motion.div>
        </GlassPanel>
      </div>
    </section>
  );
}
