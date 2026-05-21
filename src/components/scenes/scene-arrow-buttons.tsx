"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useScene } from "@/components/scenes/scene-controller";
import { cn } from "@/lib/utils";

/** Mobile-only prev / next navigation row.
 *  Rendered inside every scene's copy panel so the user always has a
 *  discoverable tap target alongside the swipe gesture. Hidden at md+ — the
 *  desktop layout has horizontal arrow keys and the bottom progress dots.
 */
export function SceneArrowButtons({ className }: { className?: string }) {
  const { currentScene, totalScenes, next, prev } = useScene();
  const atFirst = currentScene === 0;
  const atLast = currentScene === totalScenes - 1;

  return (
    <div
      className={cn(
        "mt-5 flex items-center justify-between gap-3 md:hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={prev}
        disabled={atFirst}
        aria-label="Previous scene"
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-brand-text-dark backdrop-blur-sm transition-colors",
          "active:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
          atFirst && "cursor-not-allowed opacity-30"
        )}
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-brand-muted-dark">
        {(currentScene + 1).toString().padStart(2, "0")}
        <span className="mx-1 text-white/30">/</span>
        {totalScenes.toString().padStart(2, "0")}
      </div>

      <button
        type="button"
        onClick={next}
        disabled={atLast}
        aria-label="Next scene"
        className={cn(
          "inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-brand-text-dark backdrop-blur-sm transition-colors",
          "active:bg-white/[0.15] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy",
          atLast && "cursor-not-allowed opacity-30"
        )}
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}
