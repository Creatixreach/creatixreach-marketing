"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { WhatsappButton } from "@/components/ui/whatsapp-button";
import { useScene } from "@/components/scenes/scene-controller";
import { SceneNavHint } from "@/components/scenes/scene-nav-hint";
import { isMuted, toggleMuted } from "@/lib/audio";
import { setMusicMuted } from "@/lib/audio-music";
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

  useEffect(() => {
    const initial = isMuted();
    setMuted(initial);
    // Apply the persisted mute preference to the Tone.js destination too,
    // so the procedural music respects it from the first frame.
    setMusicMuted(initial);
  }, []);

  function onToggleMute() {
    const newVal = toggleMuted();
    setMuted(newVal);
    setMusicMuted(newVal);
  }

  const topic = SCENE_TOPIC[currentScene] ?? "general";
  const waHref = whatsappUrl(topic);

  return (
    <>
      {/* Top-left: logo */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex items-start justify-between px-6 pt-5 sm:px-10 sm:pt-7">
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

      {/* Bottom-center: scene index + progress dots. On mobile a subtle
       *  blurred bg keeps it readable as the page scrolls; on desktop it's
       *  a transparent overlay over the fixed scene. The dual-axis nav hint
       *  lives in the copy panel on desktop and here on mobile so it stays
       *  visible while the user scrolls within a scene. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 bg-gradient-to-t from-brand-navy/85 via-brand-navy/55 to-transparent px-4 pb-5 pt-6 backdrop-blur-sm md:bg-none md:px-0 md:pb-6 md:pt-0 md:backdrop-blur-0">
        <div className="pointer-events-auto text-xs uppercase tracking-[0.3em] text-brand-muted-dark">
          <span className="text-white">{formatIndex(currentScene + 1)}</span>
          <span className="mx-2 text-white/40">/</span>
          <span>{formatIndex(totalScenes)}</span>
        </div>

        {/* Mobile-only nav hint — stays visible while the page scrolls */}
        <div className="pointer-events-auto md:hidden">
          <SceneNavHint />
        </div>

        {/* Progress dots — active scene is a wider pill, others round */}
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
                  "h-1 rounded-full transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
                  active
                    ? "w-4 bg-brand-indigo shadow-[0_0_8px_rgba(124,131,255,0.7)]"
                    : "w-1 bg-slate-500/50 hover:bg-slate-300/70"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Bottom-right: floating WhatsApp FAB */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
        <div className="pointer-events-auto">
          <WhatsappButton href={waHref} />
        </div>
      </div>
    </>
  );
}
