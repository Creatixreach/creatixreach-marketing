"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { unlockAudio } from "@/lib/audio";
import { registerSceneAudio } from "@/lib/scene-audio";

const SEEN_KEY = "cr-marketing-audio-gate-seen";

export function AudioGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem(SEEN_KEY);
      if (!seen) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
  }

  function onEnter() {
    registerSceneAudio();
    unlockAudio();
    dismiss();
  }

  function onSkip() {
    dismiss();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="audio-gate"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-brand-navy/80 px-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 8, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="mb-2 text-xs uppercase tracking-[0.3em] text-brand-muted-dark">
              CreatixReach
            </div>
            <h2 className="mb-3 text-2xl font-semibold text-white">
              Enter the room.
            </h2>
            <p className="mb-8 text-sm text-brand-muted-dark">
              This is a cinematic walkthrough with light ambient sound. Best with
              audio on — but optional.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={onEnter}
                className="inline-flex w-full items-center justify-center rounded-md bg-brand-indigo px-6 py-3 text-sm font-medium text-white shadow-lg transition-colors hover:bg-brand-indigo/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                Enter the room
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="text-sm text-brand-muted-dark underline-offset-4 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:underline"
              >
                Skip audio
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
