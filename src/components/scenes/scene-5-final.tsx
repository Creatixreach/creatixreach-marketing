"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Globe, Layers, MessageSquare, PhoneCall, Sparkles } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { ContactForm } from "@/components/contact/contact-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useScene } from "@/components/scenes/scene-controller";
import { FinalFallback } from "@/components/scenes/fallbacks/final-fallback";
import { isUnlocked, playSound, stopSound } from "@/lib/audio";
import { usePrefersReducedMotion } from "@/lib/device-tier";

const FinalVoidScene = dynamic(
  () => import("@/components/scenes/three/final-void-scene").then((m) => m.FinalVoidScene),
  { ssr: false }
);

type Recap = {
  scene: number;
  icon: typeof Globe;
  title: string;
  blurb: string;
  accent: string;
  ring: string;
};

const RECAP: Recap[] = [
  {
    scene: 1,
    icon: Globe,
    title: "Web & Social",
    blurb: "Sites that ship, content that compounds.",
    accent: "text-pink-300",
    ring: "shadow-[0_0_30px_rgba(236,72,153,0.25)] hover:shadow-[0_0_45px_rgba(236,72,153,0.45)]",
  },
  {
    scene: 2,
    icon: Layers,
    title: "Systems & APIs",
    blurb: "The plumbing pro companies actually need.",
    accent: "text-cyan-300",
    ring: "shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:shadow-[0_0_45px_rgba(34,211,238,0.45)]",
  },
  {
    scene: 3,
    icon: PhoneCall,
    title: "Dialer & Call Center",
    blurb: "We set up the floor, you start dialing.",
    accent: "text-amber-300",
    ring: "shadow-[0_0_30px_rgba(251,191,36,0.25)] hover:shadow-[0_0_45px_rgba(251,191,36,0.45)]",
  },
  {
    scene: 4,
    icon: Sparkles,
    title: "Cold Calling & Leads",
    blurb: "Pay for results, not effort.",
    accent: "text-purple-300",
    ring: "shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]",
  },
];

export function Scene5Final() {
  const reduced = usePrefersReducedMotion();
  const { goTo } = useScene();

  useEffect(() => {
    let cancelled = false;
    function tryStart() {
      if (cancelled) return false;
      if (!isUnlocked()) return false;
      playSound("synth-pad", { fadeIn: 1000, volume: 0.22 });
      return true;
    }
    if (!tryStart()) {
      const interval = window.setInterval(() => {
        if (tryStart()) window.clearInterval(interval);
      }, 600);
      return () => {
        cancelled = true;
        window.clearInterval(interval);
        stopSound("synth-pad", 500);
      };
    }
    return () => {
      cancelled = true;
      stopSound("synth-pad", 500);
    };
  }, []);

  return (
    <section className="relative h-full w-full overflow-hidden bg-[#040414] text-brand-text-dark">
      {/* 3D backdrop — fixed behind the scrollable foreground */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {reduced ? (
          <FinalFallback className="h-full w-full" />
        ) : (
          <FinalVoidScene className="h-full w-full" />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,rgba(124,131,255,0.06)_0%,rgba(4,4,20,0.7)_55%,rgba(4,4,20,0.97)_100%)]"
      />

      {/* Scrollable foreground container — scroll inside the scene without
       *  triggering scene navigation (data-scene-no-nav). */}
      <div
        data-scene-no-nav
        className="relative z-20 h-full w-full overflow-y-auto"
        style={{ overscrollBehavior: "contain" }}
      >
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-6 pb-40 pt-24 sm:px-10 sm:pt-28">
          {/* Headline + recap cards */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-brand-muted-dark"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-brand-indigo" />
              06 / 06 · final
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-balance font-serif text-5xl font-normal tracking-tight sm:text-6xl"
            >
              Pick a room, or just message us.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="mx-auto mt-3 max-w-xl text-balance text-base text-brand-muted-dark sm:text-lg"
            >
              Four rooms, one team. Tap a service to revisit it, or send a brief
              right here.
            </motion.p>
          </div>

          {/* Recap card grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RECAP.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.button
                  key={r.scene}
                  type="button"
                  onClick={() => goTo(r.scene)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                  className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/25 ${r.ring} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy`}
                >
                  <Icon className={`h-5 w-5 ${r.accent}`} />
                  <div className="mt-3 text-sm font-semibold text-white">
                    {r.title}
                  </div>
                  <div className="mt-1 text-xs text-brand-muted-dark">
                    {r.blurb}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-white/70 transition-colors group-hover:text-white">
                    Visit room <ArrowRight className="h-3 w-3" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Embedded contact form */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: "easeOut" }}
            className="mt-14"
          >
            <GlassPanel className="w-full p-6 sm:p-10">
              <div className="mb-6 flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-indigo/20 text-brand-indigo">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-3xl font-normal tracking-tight">
                    Send a brief.
                  </h3>
                  <p className="mt-1 text-sm text-brand-muted-dark">
                    Tell us what you need. Real humans reply within one business
                    day.
                  </p>
                </div>
              </div>
              <ContactForm initialTopic="general" />
            </GlassPanel>
          </motion.div>

          {/* Footer */}
          <footer className="mt-16 border-t border-white/10 pt-8 pb-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Logo size="sm" />
                <span className="text-xs text-brand-muted-dark">
                  © 2026 CreatixReach
                </span>
              </div>
              <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-brand-muted-dark">
                <a
                  href="/privacy"
                  className="transition-colors hover:text-white"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="transition-colors hover:text-white"
                >
                  Terms
                </a>
                <a
                  href="/contact"
                  className="transition-colors hover:text-white"
                >
                  Contact
                </a>
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
