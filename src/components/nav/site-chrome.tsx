"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { WhatsappButton } from "@/components/ui/whatsapp-button";
import { useScene } from "@/components/scenes/scene-controller";
import { isMuted, toggleMuted } from "@/lib/audio";
import { whatsappUrl, type CtaTopic } from "@/lib/cta-messages";
import { cn } from "@/lib/utils";

const SCENE_TOPIC: CtaTopic[] = [
  "general",       // 0 hero
  "web-social",    // 1
  "systems",       // 2
  "dialer",        // 3
  "cold-calling",  // 4
  "general",       // 5 final
];

function formatIndex(n: number) {
  return n.toString().padStart(2, "0");
}

export function SiteChrome() {
  const { currentScene, totalScenes, goTo } = useScene();
  const [muted, setMuted] = useState(false);
  const [isCoarse, setIsCoarse] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
    const mql = window.matchMedia("(pointer: coarse)");
    setIsCoarse(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsCoarse(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  function onToggleMute() {
    const newVal = toggleMuted();
    setMuted(newVal);
  }

  const topic = SCENE_TOPIC[currentScene] ?? "general";
  const waHref = whatsappUrl(topic);

  return (
    <>
      {/* Top-left: logo */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-40 flex items-start justify-between px-6 pt-5 sm:px-10 sm:pt-7">
        <a
          href="/"
          className="pointer-events-auto inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
          aria-label="CreatixReach home"
        >
          <Logo size="sm" />
        </a>

        {/* Top-right: send brief + mute */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <a
            href="/contact"
            className="inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:text-sm"
          >
            Send Brief
          </a>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            aria-pressed={muted}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Bottom-center: scene index + caption */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex flex-col items-center gap-3">
        <div className="pointer-events-auto text-xs uppercase tracking-[0.3em] text-brand-muted-dark">
          <span className="text-white">{formatIndex(currentScene + 1)}</span>
          <span className="mx-2 text-white/40">/</span>
          <span>{formatIndex(totalScenes)}</span>
        </div>
        <div className="pointer-events-auto text-[10px] uppercase tracking-[0.25em] text-brand-muted-dark sm:text-[11px]">
          {isCoarse ? "Swipe to navigate" : "Use arrow keys to navigate"}
        </div>

        {/* Progress dots */}
        <div className="pointer-events-auto flex items-center gap-2">
          {Array.from({ length: totalScenes }).map((_, i) => {
            const active = i === currentScene;
            return (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to scene ${i + 1} of ${totalScenes}`}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
                  active
                    ? "scale-110 bg-brand-indigo ring-brand-indigo"
                    : "bg-slate-500/40 hover:bg-slate-300/60 ring-white"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom-right: floating WhatsApp FAB */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        <div className="pointer-events-auto">
          <WhatsappButton href={waHref} />
        </div>
      </div>
    </>
  );
}
