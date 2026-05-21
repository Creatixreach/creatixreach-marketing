"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  SceneScrollProvider,
  useActiveSceneScroll,
} from "@/components/scenes/scene-scroll-context";

const TOTAL_SCENES = 6;
const SCROLL_DEBOUNCE_MS = 400;
const SWIPE_THRESHOLD_PX = 60;
const CONTENT_SCROLL_STEP_PX = 120;

type SceneContextValue = {
  currentScene: number;
  totalScenes: number;
  next: () => void;
  prev: () => void;
  goTo: (n: number) => void;
};

const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene(): SceneContextValue {
  const ctx = useContext(SceneContext);
  if (!ctx) {
    throw new Error("useScene must be used within a SceneController");
  }
  return ctx;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  // Scenes with embedded scrollable content (e.g. Scene 5's form + footer,
  // Scene 1-4 right-panel content) mark their scroll wrapper with
  // data-scene-no-nav so wheel/swipe inside it doesn't trigger scene nav.
  if (target.closest("[data-scene-no-nav]")) return true;
  return false;
}

/** Inputs live inside SceneScrollProvider so they can read the active
 *  scene's content scroll element. */
function SceneInputs({ next, prev }: { next: () => void; prev: () => void }) {
  const getActiveScrollEl = useActiveSceneScroll();

  // Keyboard: Left/Right switch scenes, Up/Down scroll the active content.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (isInteractiveTarget(e.target)) return;
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          next();
          return;
        case "ArrowLeft":
          e.preventDefault();
          prev();
          return;
        case "ArrowDown":
        case "ArrowUp": {
          const el = getActiveScrollEl();
          if (!el) return; // scene has no scrollable content panel
          e.preventDefault();
          const sign = e.key === "ArrowDown" ? 1 : -1;
          el.scrollBy({ top: sign * CONTENT_SCROLL_STEP_PX, behavior: "smooth" });
          return;
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, getActiveScrollEl]);

  // Wheel: outside the content panel switches scenes (debounced); inside the
  // panel falls through to native scroll because isInteractiveTarget catches
  // data-scene-no-nav.
  useEffect(() => {
    let lastFire = 0;
    function onWheel(e: WheelEvent) {
      if (isInteractiveTarget(e.target)) return;
      const now = Date.now();
      if (now - lastFire < SCROLL_DEBOUNCE_MS) return;
      if (Math.abs(e.deltaY) < 10) return;
      lastFire = now;
      if (e.deltaY > 0) next();
      else if (e.deltaY < 0) prev();
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [next, prev]);

  // Touch / pointer swipe (horizontal). Vertical inside the content panel is
  // skipped by isInteractiveTarget, so the native scroller handles it.
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse") return;
      if (isInteractiveTarget(e.target)) return;
      startX = e.clientX;
      startY = e.clientY;
      tracking = true;
    }
    function onUp(e: PointerEvent) {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(dy) > Math.abs(dx)) return; // mostly vertical
      if (dx < 0) next();
      else prev();
    }
    function onCancel() {
      tracking = false;
    }

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [next, prev]);

  return null;
}

export function SceneController({ children }: { children: ReactNode }) {
  const [currentScene, setCurrentScene] = useState(0);
  const currentSceneRef = useRef(0);

  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  const goTo = useCallback((n: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_SCENES - 1, Math.floor(n)));
    setCurrentScene(clamped);
  }, []);

  const next = useCallback(() => {
    setCurrentScene((s) => (s < TOTAL_SCENES - 1 ? s + 1 : s));
  }, []);

  const prev = useCallback(() => {
    setCurrentScene((s) => (s > 0 ? s - 1 : s));
  }, []);

  const value = useMemo<SceneContextValue>(
    () => ({
      currentScene,
      totalScenes: TOTAL_SCENES,
      next,
      prev,
      goTo,
    }),
    [currentScene, next, prev, goTo]
  );

  return (
    <SceneContext.Provider value={value}>
      <SceneScrollProvider>
        <SceneInputs next={next} prev={prev} />
        {children}
      </SceneScrollProvider>
    </SceneContext.Provider>
  );
}

export { TOTAL_SCENES };
