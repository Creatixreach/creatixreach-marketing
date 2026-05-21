"use client";

import { useEffect, useState } from "react";

export type DeviceTier = "high" | "low";

type NetInfo = {
  effectiveType?: string;
};

type NavigatorExt = Navigator & {
  deviceMemory?: number;
  connection?: NetInfo;
};

function detectTier(): DeviceTier {
  if (typeof window === "undefined") return "high";

  try {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return "low";
  } catch {
    // ignore
  }

  const nav = window.navigator as NavigatorExt;

  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency < 4) {
    return "low";
  }
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 4) {
    return "low";
  }
  const eff = nav.connection?.effectiveType;
  if (eff === "2g" || eff === "slow-2g") return "low";

  return "high";
}

export function useDeviceTier(): DeviceTier {
  // SSR-safe initial value, refines on the client after mount.
  const [tier, setTier] = useState<DeviceTier>("high");

  useEffect(() => {
    setTier(detectTier());

    let mql: MediaQueryList | null = null;
    function onMotion() {
      setTier(detectTier());
    }
    try {
      mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (mql.addEventListener) mql.addEventListener("change", onMotion);
      else mql.addListener(onMotion);
    } catch {
      mql = null;
    }
    return () => {
      if (!mql) return;
      if (mql.removeEventListener) mql.removeEventListener("change", onMotion);
      else mql.removeListener(onMotion);
    };
  }, []);

  return tier;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);
  return reduced;
}
