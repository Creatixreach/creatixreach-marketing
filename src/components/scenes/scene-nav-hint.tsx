"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Small dual-axis nav hint shown under each scene's copy panel.
 *  Desktop: ← → switch scene · ↑ ↓ explore
 *  Mobile (coarse pointer): swipe ← → switch scene · scroll ↑ ↓ explore
 */
export function SceneNavHint({ className }: { className?: string }) {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(pointer: coarse)");
    setCoarse(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  const sep = (
    <span aria-hidden="true" className="mx-2 text-white/30">
      ·
    </span>
  );

  return (
    <div
      className={cn(
        "inline-flex flex-wrap items-center gap-y-1 text-[10px] font-medium uppercase tracking-[0.2em] text-brand-muted-dark",
        className
      )}
    >
      {coarse ? (
        <>
          <span>
            <span className="font-mono text-white/80">swipe ← →</span> switch scene
          </span>
          {sep}
          <span>
            <span className="font-mono text-white/80">scroll ↑ ↓</span> explore
          </span>
        </>
      ) : (
        <>
          <span>
            <span className="font-mono text-white/80">← →</span> switch scene
          </span>
          {sep}
          <span>
            <span className="font-mono text-white/80">↑ ↓</span> explore
          </span>
        </>
      )}
    </div>
  );
}
