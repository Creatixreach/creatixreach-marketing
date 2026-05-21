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
  type RefObject,
} from "react";

/**
 * SceneScrollContext lets each scene expose its scrollable content panel to
 * the global scene controller, so:
 *  - ArrowUp / ArrowDown can scroll the active scene's content panel
 *  - Mouse wheel events outside the content panel switch scenes (existing
 *    behavior); inside the panel they pass through to native scroll
 *
 * Each service scene calls `useSceneScroll()` to receive a ref and assigns
 * it to its content wrapper. The provider (mounted next to SceneController)
 * stores the current ref so it can be consumed by the input handlers.
 */

type ScrollRefSetter = (el: HTMLDivElement | null) => void;

type SceneScrollContextValue = {
  /** Currently-mounted scene's content scroll element, or null. */
  getActiveScrollEl: () => HTMLDivElement | null;
  /** Internal — used by useSceneScroll to register/unregister. */
  register: ScrollRefSetter;
};

const SceneScrollContext = createContext<SceneScrollContextValue | null>(null);

export function SceneScrollProvider({ children }: { children: ReactNode }) {
  const activeRef = useRef<HTMLDivElement | null>(null);
  // We don't need to rerender consumers when the ref flips, but expose a
  // stable getter so input handlers can read the latest at event time.
  const [, setVersion] = useState(0);

  const register = useCallback<ScrollRefSetter>((el) => {
    activeRef.current = el;
    // bump version so any effect that depends on presence can react if needed
    setVersion((v) => v + 1);
  }, []);

  const getActiveScrollEl = useCallback(() => activeRef.current, []);

  const value = useMemo<SceneScrollContextValue>(
    () => ({ getActiveScrollEl, register }),
    [getActiveScrollEl, register]
  );

  return (
    <SceneScrollContext.Provider value={value}>
      {children}
    </SceneScrollContext.Provider>
  );
}

/** Hook a scene uses to register its scrollable content wrapper.
 *  Returns a ref to attach to the wrapper div. */
export function useSceneScroll(): RefObject<HTMLDivElement> {
  const ctx = useContext(SceneScrollContext);
  const localRef = useRef<HTMLDivElement | null>(null);

  // Re-register on every mount / unmount so the active scene is always the
  // one whose ref is exposed to the controller.
  useEffect(() => {
    if (!ctx) return;
    ctx.register(localRef.current);
    return () => {
      ctx.register(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, localRef.current]);

  return localRef;
}

/** Used by the scene controller to read the current scrollable element. */
export function useActiveSceneScroll(): () => HTMLDivElement | null {
  const ctx = useContext(SceneScrollContext);
  if (!ctx) {
    // Outside the provider — fall back to a no-op getter so this is safe to
    // call without crashing during early tests.
    return () => null;
  }
  return ctx.getActiveScrollEl;
}
